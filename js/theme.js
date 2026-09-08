// ============================================================
//  Theme Manager — Light & Dark Mode
// ============================================================

(function () {
  const THEME_KEY = 'sg_theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(btn => {
      btn.textContent = theme === 'dark' ? 'Light Theme' : 'Dark Theme';
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  // Apply immediately before DOM renders to avoid flicker
  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  window.Theme = {
    get: getPreferredTheme,
    toggle() {
      const active = document.documentElement.getAttribute('data-theme') || 'light';
      const next = active === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    },
    init() {
      applyTheme(getPreferredTheme());
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.Theme.init();
  });
})();
