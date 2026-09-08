// ============================================================
//  Auth Module — Supabase + localStorage fallback
// Clean Validation & Secure Session Handling
// ============================================================

const SUPABASE_URL = 'https://zbhvkailriqxmgnlnwog.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaHZrYWlscmlxeG1nbmxud29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjMyOTcsImV4cCI6MjEwNDMzOTI5N30.pKh4LXnsnl_ZPVkH2v2-7C3Bos3nknqGbwrWe_xTV34';

let sb = null;
try {
  if (typeof supabase !== 'undefined') {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
} catch (_) { }

const Auth = {
  SESSION_KEY: '_session',
  STORAGE_KEY: '_users',

  _sb() { return sb; },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
    } catch (_) {
      return null;
    }
  },

  _saveSession(user) {
    const s = {
      id: user.id,
      name: user.name,
      email: user.email,
      storeName: user.storeName || 'My Store',
      loginAt: Date.now()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(s));
    return s;
  },

  // ── Signup Validation & Account Creation ──────────────────
  async signup(name, email, password, storeName) {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanStore = (storeName || '').trim() || 'My Store';

    if (!cleanName) return { success: false, error: 'Please enter your full name.' };

    // Email regex validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // --- Supabase path ---
    if (sb) {
      try {
        const { data, error } = await sb.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: { data: { name: cleanName, store_name: cleanStore } }
        });
        if (error) return { success: false, error: error.message };

        const uid = data.user?.id;
        if (uid) {
          await sb.from('profiles').upsert({
            id: uid,
            name: cleanName,
            email: cleanEmail,
            store_name: cleanStore
          }, { onConflict: 'id' }).select();
        }

        const user = { id: uid || 'user_' + Date.now(), name: cleanName, email: cleanEmail, storeName: cleanStore };
        this._saveSession(user);
        return { success: true, user };
      } catch (err) {
        return { success: false, error: 'Authentication service temporarily unavailable. Please try again.' };
      }
    }

    // --- LocalStorage fallback ---
    const users = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const user = {
      id: 'user_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      storeName: cleanStore,
      createdAt: Date.now()
    };

    users.push(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    this._saveSession(user);
    return { success: true, user };
  },

  // ── Login Validation ──────────────────────────────────────
  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });
        if (error) return { success: false, error: 'Invalid email or password.' };

        const m = data.user.user_metadata || {};
        const user = {
          id: data.user.id,
          name: m.name || cleanEmail.split('@')[0],
          email: data.user.email,
          storeName: m.store_name || 'My Store'
        };
        this._saveSession(user);
        return { success: true, user };
      } catch (err) {
        return { success: false, error: 'Sign in failed. Please verify your credentials and network connection.' };
      }
    }

    const users = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
    if (!user) return { success: false, error: 'Invalid email or password.' };

    this._saveSession(user);
    return { success: true, user };
  },

  // ── Logout ────────────────────────────────────────────────
  async logout() {
    if (sb) { try { await sb.auth.signOut(); } catch (_) { } }
    localStorage.removeItem(this.SESSION_KEY);
    const p = window.location.pathname;
    window.location.href = p.includes('/pages/') ? '../login.html' : 'login.html';
  },

  // ── Guards ────────────────────────────────────────────────
  isLoggedIn() {
    return this.getSession() !== null;
  },

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
    return this.getSession() || { name: 'Demo Merchant', email: 'demo@.ai', storeName: 'Acme E-Commerce' };
  },

  demoLogin() {
    const demoUser = {
      id: 'user_demo_99',
      name: 'Demo Merchant',
      email: 'demo@.ai',
      storeName: 'Acme Apparel Store'
    };
    this._saveSession(demoUser);
    const p = window.location.pathname;
    window.location.href = p.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
    return { success: true, user: demoUser };
  }
};

window.Auth = Auth;
