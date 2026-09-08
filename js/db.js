// ============================================================
//  Database Module — Supabase tickets CRUD + Fallback
// Supports 10 Lifecycle States & Dynamic Multi-Filter Dashboard
// ============================================================

const TicketDB = {
  // ── Supported Lifecycle States ────────────────────────────
  VALID_STATUSES: [
    'New', 'Processing', 'AI Analyzed', 'Human Review Required',
    'Response Drafted', 'Sent', 'Waiting for Customer',
    'Resolved', 'Reopened', 'Failed'
  ],

  _localKey() {
    const u = Auth.getSession();
    return '_tickets_' + (u ? u.id : 'guest');
  },

  // ── SAVE / UPDATE a ticket record ────────────────────────
  async save(ticketData) {
    const user = Auth.getSession();
    const status = ticketData.status || (ticketData.needsReview ? 'Human Review Required' : 'AI Analyzed');

    const record = {
      id: ticketData.id || 'ticket_' + Date.now(),
      category: ticketData.category || 'Other',
      secondaryCategory: ticketData.secondaryCategory || null,
      priority: ticketData.priority || 'Low',
      priorityReason: ticketData.priorityReason || '',
      sentiment: ticketData.sentiment || 'Neutral',
      confidence: ticketData.confidence || 75,
      needsReview: ticketData.needsReview || ticketData.needsHumanReview || false,
      reviewReason: ticketData.reviewReason || '',
      status: status,
      ticketText: ticketData.ticketText || ticketData.rawText || '',
      draftResponse: ticketData.draftResponse || '',
      timeSaved: ticketData.timeSaved || 5,
      tone: ticketData.tone || 'friendly',
      snippet: ticketData.snippet || (ticketData.ticketText || '').substring(0, 80) + '...',
      customerName: ticketData.customerName || '',
      orderNumber: ticketData.orderNumber || '',
      date: ticketData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      createdAt: ticketData.createdAt || new Date().toISOString()
    };

    // Supabase path
    if (typeof sb !== 'undefined' && sb && user) {
      try {
        const { data, error } = await sb.from('tickets').upsert({
          id: record.id.startsWith('ticket_') ? undefined : record.id,
          user_id: user.id,
          category: record.category,
          priority: record.priority,
          sentiment: record.sentiment,
          confidence: record.confidence,
          ticket_text: record.ticketText,
          draft_response: record.draftResponse,
          time_saved: record.timeSaved,
          tone: record.tone,
          snippet: record.snippet,
          customer_name: record.customerName,
          order_number: record.orderNumber
        }).select().single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase save failed, fallback to local storage:', err.message);
      }
    }

    // Always mirror to LocalStorage
    this._saveLocal(record);
    return { success: true, data: record };
  },

  _saveLocal(record) {
    const key = this._localKey();
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const existingIndex = history.findIndex(t => t.id === record.id);
    if (existingIndex >= 0) {
      history[existingIndex] = { ...history[existingIndex], ...record };
    } else {
      history.unshift(record);
    }
    localStorage.setItem(key, JSON.stringify(history));
  },

  // ── UPDATE ticket lifecycle status ───────────────────────
  async updateStatus(ticketId, newStatus) {
    if (!this.VALID_STATUSES.includes(newStatus)) {
      return { success: false, error: 'Invalid ticket status.' };
    }

    const tickets = await this.loadAll();
    const target = tickets.find(t => t.id === ticketId);
    if (target) {
      target.status = newStatus;
      await this.save(target);
      return { success: true, ticket: target };
    }
    return { success: false, error: 'Ticket not found.' };
  },

  // ── REOPEN ticket ─────────────────────────────────────────
  async reopenTicket(ticketId) {
    return await this.updateStatus(ticketId, 'Reopened');
  },

  // ── LOAD all tickets for current user ────────────────────
  async loadAll() {
    const user = Auth.getSession();

    if (typeof sb !== 'undefined' && sb && user) {
      try {
        const { data, error } = await sb
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(row => ({
            id: row.id,
            category: row.category || 'Other',
            priority: row.priority || 'Low',
            sentiment: row.sentiment || 'Neutral',
            confidence: row.confidence || 75,
            ticketText: row.ticket_text || '',
            draftResponse: row.draft_response || '',
            timeSaved: row.time_saved || 5,
            tone: row.tone || 'friendly',
            snippet: row.snippet || '',
            customerName: row.customer_name || '',
            orderNumber: row.order_number || '',
            status: row.confidence < 70 || row.priority === 'Critical' ? 'Human Review Required' : 'AI Analyzed',
            date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            createdAt: row.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase loadAll failed, fallback to local storage:', err.message);
      }
    }

    const key = this._localKey();
    const localData = JSON.parse(localStorage.getItem(key) || '[]');
    return localData.map(t => ({
      ...t,
      status: t.status || (t.confidence < 70 || t.priority === 'Critical' ? 'Human Review Required' : 'AI Analyzed')
    }));
  },

  // ── REMOVE single ticket ─────────────────────────────────
  async remove(ticketId) {
    if (typeof sb !== 'undefined' && sb) {
      try {
        await sb.from('tickets').delete().eq('id', ticketId);
      } catch (err) {
        console.warn('Supabase delete failed:', err.message);
      }
    }

    const key = this._localKey();
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = history.filter(t => t.id !== ticketId);
    localStorage.setItem(key, JSON.stringify(filtered));
    return { success: true };
  },

  // ── CLEAR all tickets ────────────────────────────────────
  async clearAll() {
    const user = Auth.getSession();
    if (typeof sb !== 'undefined' && sb && user) {
      try {
        await sb.from('tickets').delete().eq('user_id', user.id);
      } catch (err) {
        console.warn('Supabase clearAll failed:', err.message);
      }
    }
    localStorage.removeItem(this._localKey());
    return { success: true };
  },

  // ── STATS with Dynamic Filter Engine ─────────────────────
  async getStats() {
    return await this.getFilteredStats({});
  },

  async getFilteredStats(filters = {}) {
    const allTickets = await this.loadAll();

    // Filter matching logic
    const filtered = allTickets.filter(t => {
      if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.priority && filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.sentiment && filters.sentiment !== 'all' && t.sentiment !== filters.sentiment) return false;
      if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;

      // Date range filtering
      if (filters.dateRange && filters.dateRange !== 'all') {
        const ticketDate = new Date(t.createdAt || Date.now());
        const now = new Date();
        if (filters.dateRange === 'today') {
          if (ticketDate.toDateString() !== now.toDateString()) return false;
        } else if (filters.dateRange === 'week') {
          const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
          if (ticketDate < sevenDaysAgo) return false;
        } else if (filters.dateRange === 'month') {
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
          if (ticketDate < thirtyDaysAgo) return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      return {
        total: 0,
        timeSaved: 0,
        topCategory: '—',
        avgConfidence: 0,
        catCounts: {},
        tickets: []
      };
    }

    let totalTime = 0, confSum = 0;
    const catCounts = {};

    filtered.forEach(t => {
      totalTime += (t.timeSaved || 0);
      confSum += (t.confidence || 0);
      const catKey = t.category || 'Other';
      catCounts[catKey] = (catCounts[catKey] || 0) + 1;
    });

    let topCat = '—', maxC = 0;
    for (const [cat, count] of Object.entries(catCounts)) {
      if (count > maxC) { maxC = count; topCat = cat; }
    }

    return {
      total: filtered.length,
      timeSaved: totalTime,
      topCategory: topCat,
      avgConfidence: Math.round(confSum / filtered.length),
      catCounts,
      tickets: filtered
    };
  },

  // ── Pre-populate 5 demo tickets for testing ──────────────
  async loadDemoData() {
    const demos = [
      {
        category: 'Shipping',
        priority: 'High',
        priorityReason: 'High — Immediate inquiry regarding delayed delivery window.',
        sentiment: 'Angry',
        confidence: 88,
        status: 'AI Analyzed',
        ticketText: "I ordered a jacket #4521 3 weeks ago and it hasn't arrived! Please help.",
        draftResponse: "Dear Michael,\n\nI apologize for the delay with Order #4521. Please verify your delivery address so an agent can check with our courier team.\n\nBest regards,\nCustomer Support",
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
        priorityReason: 'Medium — Standard size exchange request.',
        sentiment: 'Frustrated',
        confidence: 92,
        status: 'AI Analyzed',
        ticketText: "Received wrong size (Large instead of Medium) on order #7834.",
        draftResponse: "Hi Sarah,\n\nThanks for reaching out! Please reply with your current address to confirm your exchange for Order #7834.\n\nBest,\nCustomer Care",
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
        priorityReason: 'High — Duplicate billing charge affecting customer funds.',
        sentiment: 'Frustrated',
        confidence: 95,
        status: 'Human Review Required',
        ticketText: "Charged twice ($49.99) on order #2156.",
        draftResponse: "Hello Robert,\n\nThank you for reporting the billing question for Order #2156. An agent is reviewing the transaction details right now.\n\nWarm regards,\nBilling Support",
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
        priorityReason: 'Low urgency product catalog inquiry.',
        sentiment: 'Positive',
        confidence: 90,
        status: 'AI Analyzed',
        ticketText: "Does the leather jacket come in brown? Is warranty included?",
        draftResponse: "Hi Alex,\n\nThanks for asking! You can view full sizing, color options, and warranty specs on our product page.\n\nBest,\nProduct Team",
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
        priorityReason: 'High — Password reset and account access blocking issue.',
        sentiment: 'Neutral',
        confidence: 85,
        status: 'AI Analyzed',
        ticketText: "Can't log into my account. Password reset email is not arriving.",
        draftResponse: "Hi Mike,\n\nThank you for reporting the account access error. Please try requesting a password reset using a private window.\n\nBest,\nTech Support",
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

if (typeof window !== 'undefined') window.TicketDB = TicketDB;
if (typeof module !== 'undefined') module.exports = TicketDB;
