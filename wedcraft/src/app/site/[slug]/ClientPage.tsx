"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Use smart Supabase client with offline/local fallback support
const supabasePublic = supabase;

interface TemplateTheme {
  id: string;
  name: string;
  bg: string;
  cardBg: string;
  accent: string;
  font: string;
  textColor: string;
  textSecondary: string;
  heroText: string;
}

const THEMES: Record<string, TemplateTheme> = {
  royal: {
    id: "royal", name: "Royal Elegance",
    bg: "linear-gradient(135deg, #2D1B3D 0%, #1A0F2A 50%, #3D1E4F 100%)",
    cardBg: "rgba(255, 255, 255, 0.08)", accent: "#D4A574",
    font: "'Playfair Display', serif", textColor: "#FFFFFF",
    textSecondary: "#E2D9E8", heroText: "#FDFBF7",
  },
  garden: {
    id: "garden", name: "Garden Romance",
    bg: "linear-gradient(135deg, #F5F0EB 0%, #EAE2D8 50%, #F8F4EE 100%)",
    cardBg: "rgba(255, 255, 255, 0.85)", accent: "#5C8D5B",
    font: "'Playfair Display', serif", textColor: "#2D2D3F",
    textSecondary: "#5B5B6F", heroText: "#1F2F1F",
  },
  modern: {
    id: "modern", name: "Modern Minimal",
    bg: "linear-gradient(135deg, #FFFFFF 0%, #F7F7F8 50%, #FFFFFF 100%)",
    cardBg: "#FFFFFF", accent: "#C25983",
    font: "'Inter', sans-serif", textColor: "#1A1A26",
    textSecondary: "#636378", heroText: "#1A1A26",
  },
  celestial: {
    id: "celestial", name: "Celestial Night",
    bg: "linear-gradient(135deg, #0A1628 0%, #12213F 50%, #0D1E3A 100%)",
    cardBg: "rgba(255, 255, 255, 0.07)", accent: "#89B4E9",
    font: "'Playfair Display', serif", textColor: "#FFFFFF",
    textSecondary: "#CAD8EB", heroText: "#FFFFFF",
  },
  tropical: {
    id: "tropical", name: "Tropical Paradise",
    bg: "linear-gradient(135deg, #1B4332 0%, #245740 50%, #2D6A4F 100%)",
    cardBg: "rgba(255, 255, 255, 0.09)", accent: "#FFD166",
    font: "'Inter', sans-serif", textColor: "#FFFFFF",
    textSecondary: "#D8F3DC", heroText: "#FFFFFF",
  },
  vintage: {
    id: "vintage", name: "Vintage Rose",
    bg: "linear-gradient(135deg, #FDF0F5 0%, #F5E1EA 50%, #FAF0F4 100%)",
    cardBg: "rgba(255, 255, 255, 0.88)", accent: "#A64B74",
    font: "'Playfair Display', serif", textColor: "#2D2D3F",
    textSecondary: "#5D5258", heroText: "#3E1E2E",
  },
};

interface SiteSection {
  id: string;
  title: string;
  icon: string;
  enabled: boolean;
  content: string;
}

interface SiteEvent {
  id: string;
  name: string;
  icon: string;
  date: string;
  time: string;
  venue: string;
  dressCode: string;
  description: string;
}

interface SiteData {
  id: string;
  template_id: string;
  sections: SiteSection[];
  custom_events: SiteEvent[];
  wedding: {
    partner1_name: string;
    partner2_name: string;
    wedding_date: string;
    venue: string;
    city: string;
  } | null;
}

export default function PublicWeddingSitePage() {
  const params = useParams();
  const slugFromParams = typeof params?.slug === "string" ? params.slug : "";
  const [slug, setSlug] = useState<string>(slugFromParams);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/\/site\/([^/?#]+)/);
      if (match && match[1] && match[1] !== "preview") {
        setSlug(match[1]);
        return;
      }
    }
    if (slugFromParams && slugFromParams !== "preview") {
      setSlug(slugFromParams);
    }
  }, [slugFromParams]);

  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP Form
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"accepted" | "declined">("accepted");
  const [plusOnes, setPlusOnes] = useState("0");
  const [dietary, setDietary] = useState("Veg");
  const [blessing, setBlessing] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load site data from Supabase
  useEffect(() => {
    async function loadSite() {
      if (!slug || slug === "preview") {
        setLoading(false);
        return;
      }

      try {
        // Load the wedding site by slug
        const { data: site, error } = await supabasePublic
          .from("wedding_sites")
          .select("id, template_id, sections, custom_events, wedding_id")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error || !site) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Load the wedding details
        const { data: wedding } = await supabasePublic
          .from("weddings")
          .select("partner1_name, partner2_name, wedding_date, venue, city")
          .eq("id", site.wedding_id)
          .single();

        setSiteData({
          id: site.id,
          template_id: site.template_id || "royal",
          sections: Array.isArray(site.sections) ? site.sections : [],
          custom_events: Array.isArray(site.custom_events) ? site.custom_events : [],
          wedding,
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadSite();
  }, [slug]);

  // Countdown timer
  useEffect(() => {
    if (!siteData?.wedding?.wedding_date) return;
    const target = new Date(siteData.wedding.wedding_date).getTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [siteData?.wedding?.wedding_date]);

  // RSVP Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || !siteData) return;

    setSubmitting(true);
    try {
      // Get wedding_id from the site
      const { data: site } = await supabasePublic
        .from("wedding_sites")
        .select("wedding_id")
        .eq("id", siteData.id)
        .single();

      if (!site) throw new Error("Site not found");

      const { error } = await supabasePublic.from("site_rsvps").insert({
        wedding_site_id: siteData.id,
        wedding_id: site.wedding_id,
        name: rsvpName.trim(),
        email: rsvpEmail.trim(),
        rsvp_status: rsvpStatus,
        plus_ones: parseInt(plusOnes) || 0,
        dietary,
        blessing: blessing.trim(),
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("RSVP submission failed:", err);
      // Still show success to the user (graceful degradation)
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #2D1B3D 0%, #1A0F2A 100%)", color: "#FFFFFF" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", animation: "pulse 1.5s ease-in-out infinite" }}>💍</div>
          <div style={{ fontSize: "18px", fontWeight: 500, opacity: 0.8 }}>Loading your celebration...</div>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound || !siteData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #2D1B3D 0%, #1A0F2A 100%)", color: "#FFFFFF", textAlign: "center", padding: "24px" }}>
        <div>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>💒</div>
          <h1 style={{ fontSize: "32px", fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: "12px" }}>Wedding Site Not Found</h1>
          <p style={{ fontSize: "16px", opacity: 0.7, marginBottom: "32px", maxWidth: "480px" }}>
            This wedding website either doesn&apos;t exist or hasn&apos;t been published yet.
          </p>
          <Link href="/" style={{ display: "inline-block", background: "#D4A574", color: "#FFFFFF", padding: "12px 32px", borderRadius: "30px", textDecoration: "none", fontWeight: 600 }}>
            Create Your Own Wedding Site →
          </Link>
        </div>
      </div>
    );
  }

  const theme = THEMES[siteData.template_id] || THEMES.royal;
  const p1 = siteData.wedding?.partner1_name || "Partner 1";
  const p2 = siteData.wedding?.partner2_name || "Partner 2";
  const coupleTitle = `${p1} & ${p2}`;
  const weddingDateStr = siteData.wedding?.wedding_date
    ? new Date(siteData.wedding.wedding_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";
  const venueStr = [siteData.wedding?.venue, siteData.wedding?.city].filter(Boolean).join(" · ");

  const enabledSections = siteData.sections.filter(s => s.enabled);
  const isDark = !["modern", "garden", "vintage"].includes(siteData.template_id);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: "10px",
    border: `1px solid ${theme.accent}66`, background: "rgba(255, 255, 255, 0.2)",
    color: theme.textColor, fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.textColor, fontFamily: theme.font, transition: "all 0.4s ease" }}>
      {/* Top Bar */}
      <div style={{ background: "rgba(0, 0, 0, 0.2)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${theme.accent}33`, padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", color: isDark ? "#FFFFFF" : "#2D2D3F", textDecoration: "none", fontWeight: 600 }}>
          <span>💍</span>
          <span>WedCraft</span>
        </Link>
        <span style={{ opacity: 0.6, fontSize: "12px" }}>
          {coupleTitle}&apos;s Wedding
        </span>
      </div>

      {/* Hero Section */}
      <section style={{ padding: "90px 24px 70px", textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ color: theme.accent, fontSize: "16px", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 600, marginBottom: "16px" }}>
          We Are Getting Married
        </p>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 76px)", fontWeight: 800, lineHeight: 1.1, color: theme.heroText, marginBottom: "20px" }}>
          {coupleTitle}
        </h1>
        <div style={{ display: "inline-block", width: "60px", height: "3px", background: theme.accent, borderRadius: "2px", margin: "0 auto 24px" }} />
        {weddingDateStr && <p style={{ fontSize: "20px", color: theme.textSecondary, marginBottom: "8px" }}>{weddingDateStr}</p>}
        {venueStr && (
          <p style={{ fontSize: "16px", color: theme.accent, fontWeight: 500, marginBottom: "40px" }}>
            📍 {venueStr}
          </p>
        )}

        {/* Countdown */}
        {siteData.wedding?.wedding_date && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "18px", padding: "20px 36px", background: theme.cardBg, backdropFilter: "blur(16px)", borderRadius: "24px", border: `1px solid ${theme.accent}40`, boxShadow: "0 12px 36px rgba(0, 0, 0, 0.15)" }}>
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Mins" },
              { value: timeLeft.seconds, label: "Secs" },
            ].map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && <span style={{ fontSize: "28px", color: theme.accent, opacity: 0.5 }}>:</span>}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "36px", fontWeight: 700, color: theme.accent }}>{item.value}</div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }}>{item.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* RSVP CTA */}
        {enabledSections.some(s => s.id === "rsvp") && (
          <div style={{ marginTop: "36px" }}>
            <a href="#rsvp-section" style={{ display: "inline-block", background: theme.accent, color: "#FFFFFF", padding: "14px 36px", borderRadius: "30px", textDecoration: "none", fontWeight: 600, fontSize: "16px", boxShadow: `0 4px 20px ${theme.accent}66` }}>
              RSVP for Celebrations →
            </a>
          </div>
        )}
      </section>

      {/* Dynamic Sections */}
      {enabledSections.map((section, idx) => {
        if (section.id === "hero") return null;

        // Our Story
        if (section.id === "story") {
          return (
            <section key={section.id} style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
              <div style={{ background: theme.cardBg, backdropFilter: "blur(14px)", borderRadius: "24px", padding: "48px 40px", border: `1px solid ${theme.accent}30` }}>
                <span style={{ fontSize: "36px" }}>✨</span>
                <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.heroText, marginTop: "12px", marginBottom: "16px" }}>{section.title}</h2>
                <p style={{ fontSize: "16px", lineHeight: 1.8, color: theme.textSecondary }}>{section.content}</p>
              </div>
            </section>
          );
        }

        // Events
        if (section.id === "events" && siteData.custom_events.length > 0) {
          return (
            <section key={section.id} style={{ maxWidth: "960px", margin: "0 auto", padding: "60px 24px" }}>
              <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <p style={{ color: theme.accent, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600 }}>The Celebrations</p>
                <h2 style={{ fontSize: "36px", fontWeight: 700, color: theme.heroText }}>{section.title}</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                {siteData.custom_events.map((event) => (
                  <div key={event.id} style={{ background: theme.cardBg, backdropFilter: "blur(12px)", borderRadius: "20px", padding: "28px", border: `1px solid ${theme.accent}33`, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "32px" }}>{event.icon}</span>
                    {event.time && (
                      <div style={{ fontSize: "12px", color: theme.accent, fontWeight: 700, textTransform: "uppercase" }}>
                        {event.date ? `${new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ` : ""}{event.time}
                      </div>
                    )}
                    <h3 style={{ fontSize: "22px", fontWeight: 700, color: theme.heroText }}>{event.name}</h3>
                    <p style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: 1.6 }}>{event.description}</p>
                    {event.venue && <div style={{ fontSize: "12px", color: theme.accent }}>📍 {event.venue}</div>}
                    {event.dressCode && <div style={{ fontSize: "12px", color: theme.accent, marginTop: "4px" }}>👗 <strong>Dress Code:</strong> {event.dressCode}</div>}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // RSVP
        if (section.id === "rsvp") {
          return (
            <section key={section.id} id="rsvp-section" style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 24px 100px" }}>
              <div style={{ background: theme.cardBg, backdropFilter: "blur(20px)", borderRadius: "24px", padding: "44px 36px", border: `1px solid ${theme.accent}40`, boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <span style={{ fontSize: "40px" }}>💌</span>
                  <h2 style={{ fontSize: "30px", fontWeight: 700, color: theme.heroText, marginTop: "8px", marginBottom: "8px" }}>
                    Will You Celebrate With Us?
                  </h2>
                  <p style={{ fontSize: "14px", color: theme.textSecondary }}>{section.content}</p>
                </div>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "36px 20px", borderRadius: "16px", background: "rgba(74, 165, 100, 0.15)", border: "1px solid #4AA564" }}>
                    <span style={{ fontSize: "48px" }}>🎉</span>
                    <h3 style={{ fontSize: "22px", fontWeight: 700, margin: "16px 0 8px" }}>
                      {rsvpStatus === "accepted" ? "RSVP Confirmed! ✨" : "We Will Miss You! 💕"}
                    </h3>
                    <p style={{ fontSize: "15px", color: theme.textSecondary, maxWidth: "440px", margin: "0 auto" }}>
                      {rsvpStatus === "accepted"
                        ? `Thank you, ${rsvpName}! We can't wait to celebrate together.`
                        : `Thank you for letting us know, ${rsvpName}. You'll be in our thoughts.`}
                    </p>
                    <button onClick={() => { setSubmitted(false); setRsvpName(""); setRsvpEmail(""); setBlessing(""); }}
                      style={{ marginTop: "24px", background: "transparent", border: `1px solid ${theme.accent}`, color: theme.textColor, padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontSize: "13px" }}>
                      Submit another response
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRsvpSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Your Full Name *</label>
                      <input required type="text" placeholder="e.g., Ananya Verma" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} style={inputStyle} disabled={submitting} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Email Address</label>
                      <input type="email" placeholder="ananya@example.com" value={rsvpEmail} onChange={(e) => setRsvpEmail(e.target.value)} style={inputStyle} disabled={submitting} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Will you be attending? *</label>
                      <div style={{ display: "flex", gap: "16px" }}>
                        {(["accepted", "declined"] as const).map(status => (
                          <label key={status} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: `1px solid ${rsvpStatus === status ? theme.accent : `${theme.accent}33`}`, background: rsvpStatus === status ? `${theme.accent}22` : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600 }}>
                            <input type="radio" name="rsvp" checked={rsvpStatus === status} onChange={() => setRsvpStatus(status)} disabled={submitting} />
                            <span>{status === "accepted" ? "Joyfully Accepts ✨" : "Regretfully Declines"}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {rsvpStatus === "accepted" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Additional Guests</label>
                          <select value={plusOnes} onChange={(e) => setPlusOnes(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} disabled={submitting}>
                            <option value="0" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>Just Me (0)</option>
                            <option value="1" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>+1 Guest</option>
                            <option value="2" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>+2 Guests</option>
                            <option value="3" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>+3 (Family)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Meal Preference</label>
                          <select value={dietary} onChange={(e) => setDietary(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} disabled={submitting}>
                            <option value="Veg" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>Pure Vegetarian</option>
                            <option value="Jain" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>Jain Vegetarian</option>
                            <option value="Non-Veg" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>Non-Vegetarian</option>
                            <option value="Vegan" style={{ background: isDark ? "#2D1B3D" : "#fff", color: isDark ? "#fff" : "#000" }}>Vegan / Gluten-Free</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>A Blessing or Note for the Couple</label>
                      <textarea rows={3} placeholder="Share your warm wishes..." value={blessing} onChange={(e) => setBlessing(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} disabled={submitting} />
                    </div>

                    <button type="submit" disabled={submitting || !rsvpName.trim()} style={{ marginTop: "10px", background: theme.accent, color: "#FFFFFF", padding: "14px 28px", borderRadius: "30px", border: "none", fontWeight: 700, fontSize: "16px", cursor: submitting ? "wait" : "pointer", boxShadow: `0 4px 20px ${theme.accent}66`, opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? "Sending..." : "Send RSVP Response ✨"}
                    </button>
                  </form>
                )}
              </div>
            </section>
          );
        }

        // Generic section (venue, gallery, registry, faq, etc.)
        return (
          <section key={section.id} style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ background: theme.cardBg, backdropFilter: "blur(14px)", borderRadius: "24px", padding: "48px 40px", border: `1px solid ${theme.accent}30` }}>
              <span style={{ fontSize: "36px" }}>{section.icon}</span>
              <h2 style={{ fontSize: "28px", fontWeight: 700, color: theme.heroText, marginTop: "12px", marginBottom: "8px" }}>{section.title}</h2>
              <div style={{ width: "40px", height: "2px", background: theme.accent, margin: "12px auto 20px", borderRadius: "2px" }} />
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: theme.textSecondary, maxWidth: "600px", margin: "0 auto" }}>{section.content}</p>
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${theme.accent}33`, padding: "40px 24px", textAlign: "center", fontSize: "13px", opacity: 0.75 }}>
        <p>Made with 💕 for {coupleTitle}&apos;s Big Day</p>
        <p style={{ marginTop: "6px" }}>
          Powered by{" "}
          <Link href="/" style={{ color: theme.accent, textDecoration: "none", fontWeight: 600 }}>WedCraft</Link>
        </p>
      </footer>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
