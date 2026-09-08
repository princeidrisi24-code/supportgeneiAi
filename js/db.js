// ============================================================
// SupportGenie Database Module — Supabase tickets CRUD
// Depends on auth.js being loaded first (uses sb variable)
// ============================================================

const TicketDB = {

  // ── Local storage key (per-user fallback) ────────────────
  _localKey() {
    const u = Auth.getSession();
    return 'supportgenie_tickets_' + (u ? u.id : 'guest');
  },

  // ── SAVE a new ticket ────────────────────────────────────
  async save(ticketData) {
    /*  ticketData shape:
        { category, priority, sentiment, confidence,
          ticketText, draftResponse, timeSaved, tone,
          snippet, customerName, orderNumber, date }       */

    const user = Auth.getSession();

    // --- Supabase path ---
    if (sb && user) {
      try {
        const { data, error } = await sb.from('tickets').insert({
          user_id:        user.id,
          category:       ticketData.category,
          priority:       ticketData.priority,
          sentiment:      ticketData.sentiment,
          confidence:     ticketData.confidence,
          ticket_text:    ticketData.ticketText,
          draft_response: ticketData.draftResponse,
          time_saved:     ticketData.timeSaved || 5,
          tone:           ticketData.tone || 'friendly',
          snippet:        ticketData.snippet || '',
          customer_name:  ticketData.customerName || '',
          order_number:   ticketData.orderNumber || ''
        }).select().single();

        if (error) throw error;

        // Also keep a local mirror for instant dashboard reads
        this._saveLocal(ticketData);
        return { success: true, data };
      } catch (err) {
        console.warn('Supabase save failed, using local:', err.message);
      }
    }

    // --- Local fallback ---
    this._saveLocal(ticketData);
    return { success: true, data: ticketData };
  },

  _saveLocal(ticketData) {
    const key = this._localKey();
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const record = {
      id:            'ticket_' + Date.now(),
      category:      ticketData.category,
      priority:      ticketData.priority,
      sentiment:     ticketData.sentiment,
      confidence:    ticketData.confidence,
      ticketText:    ticketData.ticketText,
      draftResponse: ticketData.draftResponse,
      timeSaved:     ticketData.timeSaved || 5,
      tone:          ticketData.tone || 'friendly',
      snippet:       ticketData.snippet || '',
      customerName:  ticketData.customerName || '',
      orderNumber:   ticketData.orderNumber || '',
      date:          ticketData.date || new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' }),
      createdAt:     new Date().toISOString()
    };
    history.unshift(record);
    localStorage.setItem(key, JSON.stringify(history));
  },

  // ── LOAD all tickets for current user ────────────────────
  async loadAll() {
    const user = Auth.getSession();

    // --- Supabase path ---
    if (sb && user) {
      try {
        const { data, error } = await sb
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map DB columns → app-friendly camelCase
        return data.map(row => ({
          id:            row.id,
          category:      row.category,
          priority:      row.priority,
          sentiment:     row.sentiment,
          confidence:    row.confidence,
          ticketText:    row.ticket_text,
          draftResponse: row.draft_response,
          timeSaved:     row.time_saved,
          tone:          row.tone,
          snippet:       row.snippet,
          customerName:  row.customer_name,
          orderNumber:   row.order_number,
          date:          new Date(row.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
          createdAt:     row.created_at
        }));
      } catch (err) {
        console.warn('Supabase loadAll failed, using local:', err.message);
      }
    }

    // --- Local fallback ---
    const key = this._localKey();
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  // ── DELETE a ticket ──────────────────────────────────────
  async remove(ticketId) {
    if (sb) {
      try {
        const { error } = await sb.from('tickets').delete().eq('id', ticketId);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase delete failed:', err.message);
      }
    }

    // Also remove from local mirror
    const key = this._localKey();
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = history.filter(t => t.id !== ticketId);
    localStorage.setItem(key, JSON.stringify(filtered));
    return { success: true };
  },

  // ── CLEAR all tickets ────────────────────────────────────
  async clearAll() {
    const user = Auth.getSession();
    if (sb && user) {
      try {
        const { error } = await sb.from('tickets').delete().eq('user_id', user.id);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase clearAll failed:', err.message);
      }
    }
    localStorage.removeItem(this._localKey());
    return { success: true };
  },

  // ── STATS for dashboard ──────────────────────────────────
  async getStats() {
    const tickets = await this.loadAll();
    if (tickets.length === 0) {
      return { total: 0, timeSaved: 0, topCategory: '—', avgConfidence: 0, tickets: [] };
    }

    let totalTime = 0, confSum = 0;
    const catCounts = {};

    tickets.forEach(t => {
      totalTime += (t.timeSaved || 0);
      confSum   += (t.confidence || 0);
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    let topCat = '—', maxC = 0;
    for (const [cat, count] of Object.entries(catCounts)) {
      if (count > maxC) { maxC = count; topCat = cat; }
    }

    return {
      total:         tickets.length,
      timeSaved:     totalTime,
      topCategory:   topCat,
      avgConfidence: Math.round(confSum / tickets.length),
      catCounts,
      tickets
    };
  },

  // ── Pre-populate 5 demo tickets for instant testing ──────
  async loadDemoData() {
    const demos = [
      {
        category: 'Shipping',
        priority: 'High',
        sentiment: 'Angry 😠',
        confidence: 88,
        ticketText: "I ordered a jacket #4521 3 weeks ago and it hasn't arrived! Please help.",
        draftResponse: "Dear Michael,\n\nI sincerely apologize for the delay with Order #4521. I have escalated this with our courier team and issued priority tracking.\n\nBest regards,\nCustomer Support",
        timeSaved: 10,
        tone: 'empathetic',
        snippet: 'Order #4521 3 weeks ago, hasn\'t arrived...',
        customerName: 'Michael',
        orderNumber: '#4521',
        date: 'Today'
      },
      {
        category: 'Return/Refund',
        priority: 'Medium',
        sentiment: 'Frustrated 😤',
        confidence: 92,
        ticketText: "Received wrong size (Large instead of Medium) on order #7834.",
        draftResponse: "Hi Sarah,\n\nThanks for reaching out! I've initiated an exchange for Order #7834 to get a Medium sweater sent to you right away.\n\nBest,\nCustomer Care",
        timeSaved: 8,
        tone: 'friendly',
        snippet: 'Received wrong size (Large instead of Medium) #7834...',
        customerName: 'Sarah Jenkins',
        orderNumber: '#7834',
        date: 'Yesterday'
      },
      {
        category: 'Billing',
        priority: 'High',
        sentiment: 'Frustrated 😤',
        confidence: 95,
        ticketText: "Charged twice ($49.99) on order #2156.",
        draftResponse: "Hello Robert,\n\nI apologize for the duplicate charge on Order #2156. I have processed a full refund of $49.99 back to your payment card.\n\nWarm regards,\nBilling Support",
        timeSaved: 12,
        tone: 'professional',
        snippet: 'Charged twice ($49.99) on order #2156...',
        customerName: 'Robert Chen',
        orderNumber: '#2156',
        date: '2 days ago'
      },
      {
        category: 'Product Question',
        priority: 'Low',
        sentiment: 'Positive 😊',
        confidence: 90,
        ticketText: "Does the leather jacket come in brown? Is warranty included?",
        draftResponse: "Hi Alex,\n\nThanks for loving our jacket! Yes, the brown color will restock next week and all purchases include a 1-year full warranty.\n\nBest,\nProduct Team",
        timeSaved: 5,
        tone: 'friendly',
        snippet: 'Does the leather jacket come in brown?...',
        customerName: 'Alex',
        orderNumber: 'N/A',
        date: '3 days ago'
      },
      {
        category: 'Technical',
        priority: 'High',
        sentiment: 'Neutral 😐',
        confidence: 85,
        ticketText: "Can't log into my account. Password reset email is not arriving.",
        draftResponse: "Hi Mike,\n\nI have manually triggered a password reset link to your registered email address. Please check your inbox or click here to reset.\n\nBest,\nTech Support",
        timeSaved: 7,
        tone: 'professional',
        snippet: 'Can\'t log into my account. Password reset email...',
        customerName: 'Mike',
        orderNumber: 'N/A',
        date: '4 days ago'
      }
    ];

    for (const t of demos) {
      await this.save(t);
    }
    return { success: true, count: demos.length };
  }
};

window.TicketDB = TicketDB;
