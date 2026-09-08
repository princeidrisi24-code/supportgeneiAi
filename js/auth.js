// ============================================================
// SupportGenie Auth Module — Supabase + localStorage fallback
// ============================================================

const SUPABASE_URL  = 'https://zbhvkailriqxmgnlnwog.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaHZrYWlscmlxeG1nbmxud29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjMyOTcsImV4cCI6MjEwNDMzOTI5N30.pKh4LXnsnl_ZPVkH2v2-7C3Bos3nknqGbwrWe_xTV34';

// Initialise Supabase client (SDK loaded via CDN in HTML)
let sb = null;
try {
  if (typeof supabase !== 'undefined') {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
} catch (_) {}

const Auth = {
  SESSION_KEY: 'supportgenie_session',
  STORAGE_KEY: 'supportgenie_users',  // fallback only

  // ── helpers ──────────────────────────────────────────────
  _sb()        { return sb; },
  getSession() { return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null'); },

  _saveSession(user) {
    const s = {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      storeName: user.storeName || 'My Store',
      loginAt:   Date.now()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(s));
    return s;
  },

  // ── signup ───────────────────────────────────────────────
  async signup(name, email, password, storeName) {
    if (!name.trim())       return { success: false, error: 'Please enter your name.' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    // --- Supabase path ---
    if (sb) {
      const { data, error } = await sb.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: { data: { name: name.trim(), store_name: storeName.trim() || 'My Store' } }
      });
      if (error) return { success: false, error: error.message };

      // Also insert a row in public.profiles so we can query it later
      const uid = data.user?.id;
      if (uid) {
        await sb.from('profiles').upsert({
          id: uid,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          store_name: storeName.trim() || 'My Store'
        }, { onConflict: 'id' }).select();
      }

      const user = { id: uid || 'user_' + Date.now(), name: name.trim(), email: email.toLowerCase().trim(), storeName: storeName.trim() || 'My Store' };
      this._saveSession(user);
      return { success: true, user };
    }

    // --- localStorage fallback ---
    const users = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    if (users.find(u => u.email === email.toLowerCase().trim()))
      return { success: false, error: 'An account with this email already exists.' };

    const user = { id: 'user_' + Date.now(), name: name.trim(), email: email.toLowerCase().trim(), password, storeName: storeName.trim() || 'My Store', createdAt: Date.now() };
    users.push(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    this._saveSession(user);
    return { success: true, user };
  },

  // ── login ────────────────────────────────────────────────
  async login(email, password) {
    if (sb) {
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.toLowerCase().trim(), password
      });
      if (error) return { success: false, error: error.message };

      const m = data.user.user_metadata || {};
      const user = { id: data.user.id, name: m.name || email.split('@')[0], email: data.user.email, storeName: m.store_name || 'My Store' };
      this._saveSession(user);
      return { success: true, user };
    }

    const users = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const user = users.find(u => u.email === email.toLowerCase().trim() && u.password === password);
    if (!user) return { success: false, error: 'Invalid email or password.' };
    this._saveSession(user);
    return { success: true, user };
  },

  // ── logout ───────────────────────────────────────────────
  async logout() {
    if (sb) { try { await sb.auth.signOut(); } catch(_){} }
    localStorage.removeItem(this.SESSION_KEY);
    const p = window.location.pathname;
    window.location.href = p.includes('/pages/') ? '../login.html' : 'login.html';
  },

  // ── guards ───────────────────────────────────────────────
  isLoggedIn()  { return this.getSession() !== null; },

  requireAuth() {
    if (!this.isLoggedIn()) {
      const p = window.location.pathname;
      window.location.href = p.includes('/pages/') ? '../login.html' : 'login.html';
      return false;
    }
    return true;
  },

  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      const p = window.location.pathname;
      window.location.href = p.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
    }
  },

  getCurrentUser() {
    return this.getSession() || { name: 'Demo Merchant', email: 'demo@supportgenie.ai', storeName: 'Acme E-Commerce' };
  },

  // ── demo auto-login for 1-click testing ──────────────────
  demoLogin() {
    const demoUser = {
      id: 'user_demo_99',
      name: 'Demo Merchant',
      email: 'demo@supportgenie.ai',
      storeName: 'Acme Apparel Store'
    };
    this._saveSession(demoUser);
    const p = window.location.pathname;
    window.location.href = p.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
    return { success: true, user: demoUser };
  }
};

window.Auth = Auth;
