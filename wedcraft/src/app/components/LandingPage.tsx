"use client";

import React, { useState } from "react";
import Link from "next/link";

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Wedding Co-Pilot",
    desc: "Get personalized 12-month checklists, instant answers for attire, sangeet song playlists, and smart timeline advice tailored to your wedding style.",
    badge: "AI Powered",
  },
  {
    icon: "💰",
    title: "Intelligent Budget Manager",
    desc: "Allocate your budget across 12+ categories with Indian Rupee formatting, track paid vs pending expenses, and catch overspending before it happens.",
    badge: "Smart Tracking",
  },
  {
    icon: "👥",
    title: "Guest List & Instant RSVP",
    desc: "Track bride & groom sides, manage plus-ones, collect dietary preferences (Veg, Jain, Vegan), and assign seating arrangements with zero stress.",
    badge: "Frictionless",
  },
  {
    icon: "🏪",
    title: "Curated Vendor Hub",
    desc: "Organize vendor quotes, contacts, contracts, and payment milestones for venues, caterers, photographers, and makeup artists in one central place.",
    badge: "All-in-One",
  },
  {
    icon: "🎨",
    title: "Designer Wedding Websites",
    desc: "Choose from 6 handcrafted luxury templates. Share custom URLs with your guests to showcase your story, event schedules, and collect RSVPs online.",
    badge: "6 Templates",
  },
  {
    icon: "📅",
    title: "Multi-Day Event Timelines",
    desc: "Built for modern celebrations — easily organize Mehendi, Haldi, Sangeet, Wedding, and Reception schedules with precision minute-by-minute flows.",
    badge: "Multi-Day",
  },
];

const TEMPLATES_PREVIEW = [
  {
    id: "royal",
    name: "Royal Elegance",
    palette: "Deep Plum & Gold",
    bg: "linear-gradient(135deg, #2D1B3D 0%, #1A0F2A 50%, #3D1E4F 100%)",
    accent: "#D4A574",
    vibe: "Grand Palaces & Royal Forts",
  },
  {
    id: "garden",
    name: "Garden Romance",
    palette: "Sage Green & Ivory",
    bg: "linear-gradient(135deg, #F5F0EB 0%, #E8E0D8 50%, #F8F3EE 100%)",
    accent: "#7FB77E",
    vibe: "Outdoor Lawns & Daytime Florals",
  },
  {
    id: "modern",
    name: "Modern Minimal",
    palette: "Blush Rose & Clean White",
    bg: "linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 50%, #FFFFFF 100%)",
    accent: "#E8A0BF",
    vibe: "Contemporary Chic & Urban Vows",
  },
  {
    id: "celestial",
    name: "Celestial Night",
    palette: "Midnight Navy & Silver",
    bg: "linear-gradient(135deg, #0A1628 0%, #162544 50%, #0D1E3A 100%)",
    accent: "#6CA0DC",
    vibe: "Starlit Receptions & Cocktail Galas",
  },
  {
    id: "tropical",
    name: "Tropical Paradise",
    palette: "Emerald & Golden Sun",
    bg: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)",
    accent: "#FFD166",
    vibe: "Beachside & Destination Weddings",
  },
  {
    id: "vintage",
    name: "Vintage Rose",
    palette: "Dusty Rose & Champagne",
    bg: "linear-gradient(135deg, #FDF0F5 0%, #F5E1EA 50%, #FDF0F5 100%)",
    accent: "#C47B9B",
    vibe: "Heritage Haveli & Nostalgic Charm",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "WedCraft saved us over 80 hours of stressful coordination. The AI checklist ensured we never missed a single ritual deadline, and our guests loved the website RSVP!",
    couple: "Ananya & Kabir",
    city: "Mumbai",
    date: "Married Nov 2026",
    avatar: "👰🏻‍♀️🤵🏻",
  },
  {
    quote:
      "The budget manager is a lifesaver. We tracked ₹18 Lakhs across 14 vendors without a single spreadsheet error, and saved ₹60,000 on catering negotiations.",
    couple: "Priya & Rohan",
    city: "New Delhi",
    date: "Married Jan 2027",
    avatar: "💍✨",
  },
  {
    quote:
      "Having our wedding website, guest list, dietary requirements, and vendor contracts in one app was incredible. Best wedding tool out there.",
    couple: "Meera & Siddharth",
    city: "Bengaluru",
    date: "Married Feb 2027",
    avatar: "🌸💕",
  },
];

const FAQS = [
  {
    q: "Is WedCraft free to use?",
    a: "Yes! WedCraft has a generous Free Forever starter plan that includes the complete AI checklist, budget manager, up to 50 guests, and a customizable wedding website.",
  },
  {
    q: "Can my partner and family collaborate with me?",
    a: "Absolutely! You can plan together, share task assignments, coordinate with vendors, and keep everyone on the same page with real-time updates.",
  },
  {
    q: "Does it support Indian wedding ceremonies (Mehendi, Sangeet, etc.)?",
    a: "Yes! WedCraft is crafted with multi-day cultural weddings in mind. Our AI assistant, checklist templates, and timeline builders natively understand Mehendi, Sangeet, Haldi, Phere, and Reception events.",
  },
  {
    q: "How do guests RSVP to our wedding?",
    a: "When you publish your wedding website, guests receive a custom link (e.g. wedcraft.app/site/rahul-sneha). They can view your schedule and submit their RSVP with plus-ones and dietary preferences in seconds — no account required for guests!",
  },
  {
    q: "Can I export our budget and guest list?",
    a: "Yes, you can easily view and manage your data with real-time statistics, search, and category breakdowns.",
  },
];

export default function LandingPage() {
  // Interactive Calculator State
  const [budgetVal, setBudgetVal] = useState(1500000); // 15 Lakhs
  const [guestsCount, setGuestsCount] = useState(250);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculate allocations
  const venueCost = Math.round(budgetVal * 0.35);
  const cateringCost = Math.round(budgetVal * 0.25);
  const photoCost = Math.round(budgetVal * 0.12);
  const decorCost = Math.round(budgetVal * 0.14);
  const attireCost = Math.round(budgetVal * 0.08);
  const miscCost = Math.round(budgetVal * 0.06);

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className="landing-container">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <span className="brand-gem">💍</span>
            <span className="brand-title">WedCraft</span>
            <span className="brand-tag">AI Studio</span>
          </div>

          <nav className="landing-menu">
            <a href="#features">Features</a>
            <a href="#calculator">Budget Estimator</a>
            <a href="#templates">Websites</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <Link href="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm pulse-glow">
              Get Started Free ✨
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span className="hero-sparkle">✨</span>
          <span>Reimagining Wedding Planning with AI</span>
          <span className="hero-pill-badge">New 2.0</span>
        </div>

        <h1 className="hero-heading">
          Make Wedding Planning Feel Like{" "}
          <span className="hero-gradient-text">Falling in Love</span>
        </h1>

        <p className="hero-subheading">
          Say goodbye to chaotic spreadsheets and forgotten RSVPs. WedCraft is your intelligent,
          all-in-one wedding studio featuring an AI assistant, smart budget tracking, dynamic
          timelines, and luxury wedding websites.
        </p>

        <div className="hero-cta-group">
          <Link href="/signup" className="btn btn-primary btn-lg pulse-glow">
            Start Planning Free →
          </Link>
          <a href="#calculator" className="btn btn-secondary btn-lg">
            Try Live Estimator 📊
          </a>
        </div>

        <div className="hero-trust-bar">
          <div className="trust-item">
            <span>🔒</span> 100% Private & Secure
          </div>
          <div className="trust-item">
            <span>🤖</span> AI-Powered Timeline
          </div>
          <div className="trust-item">
            <span>🇮🇳</span> INR & Cultural Ready
          </div>
          <div className="trust-item">
            <span>✨</span> No Credit Card Required
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="hero-preview-wrapper">
          <div className="hero-preview-glass">
            <div className="preview-top-bar">
              <div className="preview-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="preview-url-bar">wedcraft.app/dashboard</div>
              <div className="preview-status">Live Sync 🟢</div>
            </div>

            <div className="preview-grid">
              {/* Countdown Card */}
              <div className="preview-card glass-glow">
                <div className="preview-card-header">
                  <span className="preview-card-title">⏳ Wedding Countdown</span>
                  <span className="badge badge-purple">March 15, 2027</span>
                </div>
                <div className="preview-timer">
                  <div className="timer-unit">
                    <span className="timer-val">172</span>
                    <span className="timer-lbl">Days</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-unit">
                    <span className="timer-val">14</span>
                    <span className="timer-lbl">Hours</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-unit">
                    <span className="timer-val">38</span>
                    <span className="timer-lbl">Mins</span>
                  </div>
                </div>
                <p className="preview-hint">📍 The Oberoi Udaivilas, Udaipur</p>
              </div>

              {/* AI Insight Card */}
              <div className="preview-card glass-glow">
                <div className="preview-card-header">
                  <span className="preview-card-title">🤖 AI Co-Pilot Tip</span>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="ai-tip-box">
                  <p>
                    <strong>💡 Smart Catering Insight:</strong> For 250 guests, switching your
                    welcome cocktail to live counters can optimize food waste and save{" "}
                    <strong>₹45,000</strong> without lowering menu quality!
                  </p>
                </div>
                <div className="ai-chips-preview">
                  <span className="mini-chip">📸 Photographer Tips</span>
                  <span className="mini-chip">🎵 Sangeet Playlist</span>
                  <span className="mini-chip">👗 Lehenga Guide</span>
                </div>
              </div>

              {/* Budget & RSVP Progress Card */}
              <div className="preview-card glass-glow">
                <div className="preview-card-header">
                  <span className="preview-card-title">💰 Budget & RSVP Velocity</span>
                  <span className="badge badge-amber">68% Planned</span>
                </div>
                <div className="progress-preview-item">
                  <div className="progress-lbls">
                    <span>Budget Spent: ₹9.8L of ₹15L</span>
                    <span>65%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill fill-budget" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div className="progress-preview-item" style={{ marginTop: "12px" }}>
                  <div className="progress-lbls">
                    <span>RSVP Responses: 184 / 220 Guests</span>
                    <span>84%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill fill-rsvp" style={{ width: "84%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <p className="section-eyebrow">Complete Wedding Suite</p>
          <h2 className="section-title">Everything You Need From Engagement to &quot;I Do&quot;</h2>
          <p className="section-subtitle">
            Engineered to replace 5 disconnected apps and fragmented WhatsApp groups with one cohesive,
            luxury planning studio.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-top">
                <span className="feature-icon">{f.icon}</span>
                <span className="feature-badge">{f.badge}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Budget Estimator Tool */}
      <section id="calculator" className="landing-section calculator-section">
        <div className="section-header">
          <p className="section-eyebrow">Interactive Planning Tool</p>
          <h2 className="section-title">Instant Wedding Budget Allocator</h2>
          <p className="section-subtitle">
            Drag the sliders below to see our AI-recommended budget breakdown across Indian wedding
            categories.
          </p>
        </div>

        <div className="calculator-container card">
          <div className="calc-sliders-grid">
            <div className="calc-slider-box">
              <div className="slider-header">
                <label>Estimated Total Budget:</label>
                <span className="slider-highlight">{formatINR(budgetVal)}</span>
              </div>
              <input
                type="range"
                min="300000"
                max="5000000"
                step="50000"
                value={budgetVal}
                onChange={(e) => setBudgetVal(Number(e.target.value))}
                className="custom-range"
              />
              <div className="slider-scale">
                <span>₹3 Lakhs</span>
                <span>₹25 Lakhs</span>
                <span>₹50 Lakhs</span>
              </div>
            </div>

            <div className="calc-slider-box">
              <div className="slider-header">
                <label>Estimated Guest Count:</label>
                <span className="slider-highlight">{guestsCount} Guests</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="custom-range"
              />
              <div className="slider-scale">
                <span>50 Guests</span>
                <span>400 Guests</span>
                <span>800 Guests</span>
              </div>
            </div>
          </div>

          <div className="calc-results-grid">
            <div className="calc-result-pill">
              <span className="pill-dot" style={{ background: "#753FC9" }}></span>
              <div className="pill-info">
                <span className="pill-name">Venue & Stay (35%)</span>
                <span className="pill-val">{formatINR(venueCost)}</span>
              </div>
            </div>
            <div className="calc-result-pill">
              <span className="pill-dot" style={{ background: "#4AA564" }}></span>
              <div className="pill-info">
                <span className="pill-name">Catering & Food (25%)</span>
                <span className="pill-val">{formatINR(cateringCost)}</span>
              </div>
            </div>
            <div className="calc-result-pill">
              <span className="pill-dot" style={{ background: "#FEBD3D" }}></span>
              <div className="pill-info">
                <span className="pill-name">Decor & Florals (14%)</span>
                <span className="pill-val">{formatINR(decorCost)}</span>
              </div>
            </div>
            <div className="calc-result-pill">
              <span className="pill-dot" style={{ background: "#3B82F6" }}></span>
              <div className="pill-info">
                <span className="pill-name">Photo & Video (12%)</span>
                <span className="pill-val">{formatINR(photoCost)}</span>
              </div>
            </div>
            <div className="calc-result-pill">
              <span className="pill-dot" style={{ background: "#EC4899" }}></span>
              <div className="pill-info">
                <span className="pill-name">Attire & Beauty (8%)</span>
                <span className="pill-val">{formatINR(attireCost)}</span>
              </div>
            </div>
            <div className="calc-result-pill">
              <span className="pill-dot" style={{ background: "#9B6FE0" }}></span>
              <div className="pill-info">
                <span className="pill-name">Music, Gifts & Misc (6%)</span>
                <span className="pill-val">{formatINR(miscCost)}</span>
              </div>
            </div>
          </div>

          <div className="calc-cta">
            <p>
              Want to customize your exact vendor payments and track milestone deposits?
            </p>
            <Link href="/signup" className="btn btn-primary btn-md">
              Track This Budget in WedCraft ✨
            </Link>
          </div>
        </div>
      </section>

      {/* Website Templates Showcase */}
      <section id="templates" className="landing-section">
        <div className="section-header">
          <p className="section-eyebrow">Luxury Wedding Websites</p>
          <h2 className="section-title">Craft a Digital Invitation Your Guests Will Remember</h2>
          <p className="section-subtitle">
            Choose from 6 professionally designed wedding website templates. Customize with your
            photos, schedule, venue maps, and collect RSVPs in real time.
          </p>
        </div>

        <div className="templates-showcase-grid">
          {TEMPLATES_PREVIEW.map((t) => (
            <div key={t.id} className="template-showcase-card">
              <div className="template-thumb" style={{ background: t.bg }}>
                <span className="template-preview-badge" style={{ color: t.accent }}>
                  {t.palette}
                </span>
                <div className="template-preview-couple" style={{ color: t.id === "modern" || t.id === "garden" || t.id === "vintage" ? "#2D2D3F" : "#FFFFFF" }}>
                  Rahul & Sneha
                </div>
              </div>
              <div className="template-details">
                <div className="template-title-row">
                  <h4 className="template-name">{t.name}</h4>
                  <span className="template-dot" style={{ background: t.accent }}></span>
                </div>
                <p className="template-vibe">{t.vibe}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link href="/signup" className="btn btn-secondary btn-lg">
            Explore All Templates in Studio →
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section testimonials-section">
        <div className="section-header">
          <p className="section-eyebrow">Love Stories</p>
          <h2 className="section-title">Loved by Over 2,500 Happy Couples</h2>
          <p className="section-subtitle">
            Here is how modern couples simplified their big day with WedCraft.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{t.avatar}</span>
                <div>
                  <div className="author-name">{t.couple}</div>
                  <div className="author-city">
                    {t.city} · {t.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="landing-section">
        <div className="section-header">
          <p className="section-eyebrow">Simple, Transparent Pricing</p>
          <h2 className="section-title">Start Free, Upgrade When You Need More</h2>
          <p className="section-subtitle">
            No surprise vendor markups or hidden fees. Plan on your own terms.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Starter Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Starter Free</h3>
              <p className="pricing-desc">For couples starting their planning journey</p>
              <div className="pricing-price">
                <span className="currency">₹</span>
                <span className="amount">0</span>
                <span className="period">/ forever</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✅ 42+ Item AI Wedding Checklist</li>
              <li>✅ Basic Budget Manager (up to ₹5L)</li>
              <li>✅ Guest List up to 50 Guests</li>
              <li>✅ 1 Classic Wedding Website Template</li>
              <li>✅ AI Planning Tips & Countdown</li>
            </ul>
            <Link href="/signup" className="btn btn-secondary w-full">
              Get Started Free
            </Link>
          </div>

          {/* Premium Couple Plan (Featured) */}
          <div className="pricing-card featured-pricing">
            <div className="popular-badge">Most Popular 💕</div>
            <div className="pricing-header">
              <h3 className="pricing-title">Premium Couple</h3>
              <p className="pricing-desc">Complete stress-free planning for your entire wedding</p>
              <div className="pricing-price">
                <span className="currency">₹</span>
                <span className="amount">499</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✅ Unlimited Tasks & Custom Categories</li>
              <li>✅ Full INR Budget Manager with Vendor Tracking</li>
              <li>✅ Unlimited Guests & Digital RSVP Collection</li>
              <li>✅ All 6 Designer Wedding Website Templates</li>
              <li>✅ 24/7 AI Wedding Assistant & Co-Pilot</li>
              <li>✅ Seating & Table Assignments Tool</li>
              <li>✅ Multi-Day Ceremony Timeline Builder</li>
            </ul>
            <Link href="/signup" className="btn btn-primary w-full pulse-glow">
              Start 14-Day Free Trial ✨
            </Link>
          </div>

          {/* Pro Planner Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Wedding Planner Pro</h3>
              <p className="pricing-desc">For professional coordinators and agencies</p>
              <div className="pricing-price">
                <span className="currency">₹</span>
                <span className="amount">1,999</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✅ Manage Up to 15 Weddings Simultaneously</li>
              <li>✅ Client Collaboration Portal</li>
              <li>✅ White-label Wedding Websites</li>
              <li>✅ Vendor Contract & Invoice Storage</li>
              <li>✅ Priority 24/7 Dedicated Support</li>
              <li>✅ Export to Excel & PDF Reports</li>
            </ul>
            <Link href="/signup" className="btn btn-secondary w-full">
              Contact Pro Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-section faq-section">
        <div className="section-header">
          <p className="section-eyebrow">Got Questions?</p>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item ${openFaq === idx ? "active" : ""}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-toggle">{openFaq === idx ? "−" : "+"}</span>
              </div>
              {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="landing-final-cta">
        <div className="final-cta-content">
          <span className="cta-icon">💍</span>
          <h2 className="cta-heading">Your Dream Wedding Deserves Seamless Planning</h2>
          <p className="cta-subtext">
            Join thousands of couples crafting their unforgettable celebrations with WedCraft.
            Set up takes less than 2 minutes.
          </p>
          <div className="cta-buttons">
            <Link href="/signup" className="btn btn-primary btn-lg pulse-glow">
              Create Your Free Wedding Plan →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-col-brand">
            <div className="landing-brand">
              <span className="brand-gem">💍</span>
              <span className="brand-title">WedCraft</span>
            </div>
            <p className="footer-tagline">
              The AI-powered wedding studio making planning joyful, elegant, and deeply personal.
            </p>
            <p className="footer-copy">© {new Date().getFullYear()} WedCraft Inc. All rights reserved.</p>
          </div>

          <div className="footer-col">
            <h5>Product</h5>
            <Link href="/signup">AI Assistant</Link>
            <Link href="/signup">Budget Manager</Link>
            <Link href="/signup">Guest List & RSVP</Link>
            <Link href="/signup">Website Builder</Link>
          </div>

          <div className="footer-col">
            <h5>Resources</h5>
            <a href="#features">Features</a>
            <a href="#calculator">Budget Estimator</a>
            <a href="#templates">Templates</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-col">
            <h5>Account</h5>
            <Link href="/login">Sign In</Link>
            <Link href="/signup">Create Free Account</Link>
            <Link href="/settings">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
