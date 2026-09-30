"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ShareRsvpModal from "@/app/components/ShareRsvpModal";
import type { WeddingSiteSection, WeddingSiteEvent } from "@/lib/database.types";

const TEMPLATES = [
  {
    id: "royal",
    name: "Royal Elegance",
    preview: "linear-gradient(135deg, #2D1B3D 0%, #1A0F2A 50%, #3D1E4F 100%)",
    accent: "#D4A574",
    font: "Playfair Display",
    description: "Deep plum tones with gold accents. Perfect for grand celebrations.",
  },
  {
    id: "garden",
    name: "Garden Romance",
    preview: "linear-gradient(135deg, #F5F0EB 0%, #E8E0D8 50%, #F8F3EE 100%)",
    accent: "#7FB77E",
    font: "Playfair Display",
    description: "Soft neutrals with sage green. Ideal for outdoor weddings.",
  },
  {
    id: "modern",
    name: "Modern Minimal",
    preview: "linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 50%, #FFFFFF 100%)",
    accent: "#E8A0BF",
    font: "Inter",
    description: "Clean white with blush accents. For the contemporary couple.",
  },
  {
    id: "celestial",
    name: "Celestial Night",
    preview: "linear-gradient(135deg, #0A1628 0%, #162544 50%, #0D1E3A 100%)",
    accent: "#6CA0DC",
    font: "Playfair Display",
    description: "Deep navy with silver stars. Magical evening atmosphere.",
  },
  {
    id: "tropical",
    name: "Tropical Paradise",
    preview: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)",
    accent: "#FFD166",
    font: "Inter",
    description: "Lush greens with golden sun. Perfect for destination weddings.",
  },
  {
    id: "vintage",
    name: "Vintage Rose",
    preview: "linear-gradient(135deg, #FDF0F5 0%, #F5E1EA 50%, #FDF0F5 100%)",
    accent: "#C2748B",
    font: "Playfair Display",
    description: "Dusty rose and cream. Timeless romantic aesthetics.",
  },
];

const DEFAULT_SECTIONS: WeddingSiteSection[] = [
  { id: "hero", title: "Hero Banner", icon: "🌟", enabled: true, content: "We're getting married!" },
  { id: "story", title: "Our Story", icon: "💕", enabled: true, content: "From the moment we met, we knew something special was unfolding. Our journey from friends to partners to soulmates has been the most beautiful adventure of our lives." },
  { id: "events", title: "Events", icon: "📅", enabled: true, content: "Mehendi · Sangeet · Wedding Ceremony · Reception" },
  { id: "venue", title: "Venue & Travel", icon: "📍", enabled: true, content: "Join us at our beautiful venue. Details about accommodation and travel will be shared here." },
  { id: "gallery", title: "Photo Gallery", icon: "📸", enabled: true, content: "Our favorite moments together" },
  { id: "rsvp", title: "RSVP", icon: "💌", enabled: true, content: "We'd love to have you celebrate with us! Please let us know if you can make it." },
  { id: "registry", title: "Gift Registry", icon: "🎁", enabled: false, content: "Your presence is the greatest gift." },
  { id: "faq", title: "FAQ", icon: "❓", enabled: false, content: "Common questions about the wedding." },
];

const DEFAULT_EVENTS: WeddingSiteEvent[] = [];

export default function WeddingSitePage() {
  const { user, wedding, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState("royal");
  const [sections, setSections] = useState<WeddingSiteSection[]>(DEFAULT_SECTIONS);
  const [events, setEvents] = useState<WeddingSiteEvent[]>(DEFAULT_EVENTS);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"design" | "content" | "events" | "preview">("design");
  const [customUrl, setCustomUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  // Load existing site from Supabase
  const loadSite = useCallback(async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wedding_sites")
        .select("*")
        .eq("wedding_id", wedding.id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

      if (data) {
        setSiteId(data.id);
        setSelectedTemplateId(data.template_id || "royal");
        setSections(data.sections && Array.isArray(data.sections) ? data.sections : DEFAULT_SECTIONS);
        setEvents(data.custom_events && Array.isArray(data.custom_events) ? data.custom_events : DEFAULT_EVENTS);
        setCustomUrl(data.slug || "");
        setIsPublished(data.is_published || false);

        // Fetch RSVP count
        const { count } = await supabase
          .from("site_rsvps")
          .select("*", { count: "exact", head: true })
          .eq("wedding_site_id", data.id);
        setRsvpCount(count || 0);
      } else {
        // No site exists yet — generate default slug
        const slug = `${wedding.partner1_name?.toLowerCase() || "partner1"}-and-${wedding.partner2_name?.toLowerCase() || "partner2"}`.replace(/[^a-z0-9-]/g, "-");
        setCustomUrl(slug);
      }
    } catch (err: unknown) {
      console.error("Failed to load wedding site:", err);
    } finally {
      setLoading(false);
    }
  }, [wedding]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (wedding) loadSite();
  }, [authLoading, user, wedding, loadSite, router]);

  const handleSave = async (publish = false) => {
    if (!wedding) return;
    if (!customUrl.trim()) { showToast("Please enter a URL slug for your site.", "error"); return; }

    setSaving(true);
    try {
      const siteData = {
        wedding_id: wedding.id,
        slug: customUrl.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        template_id: selectedTemplateId,
        sections: sections,
        custom_events: events,
        is_published: publish || isPublished,
        published_at: publish ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (siteId) {
        // Update existing
        const { error } = await supabase
          .from("wedding_sites")
          .update(siteData)
          .eq("id", siteId);
        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("wedding_sites")
          .insert(siteData)
          .select()
          .single();
        if (error) throw error;
        setSiteId(data.id);
      }

      if (publish) setIsPublished(true);
      showToast(publish ? "🎉 Site published! Share the link with your guests." : "💾 Site saved as draft.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save site.";
      if (msg.includes("duplicate key") || msg.includes("unique")) {
        showToast("This URL slug is already taken. Please choose a different one.", "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!siteId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("wedding_sites")
        .update({ is_published: false, published_at: null })
        .eq("id", siteId);
      if (error) throw error;
      setIsPublished(false);
      showToast("Site unpublished. Guests can no longer access it.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to unpublish.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s));
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));
  };

  const updateEvent = (eventId: string, field: keyof WeddingSiteEvent, value: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, [field]: value } : e));
  };

  const addEvent = () => {
    const newEvent: WeddingSiteEvent = {
      id: `e${Date.now()}`,
      name: "New Event",
      icon: "🎉",
      date: "",
      time: "",
      venue: "",
      dressCode: "",
      description: "Describe this event...",
    };
    setEvents(prev => [...prev, newEvent]);
    setEditingEvent(newEvent.id);
  };

  const removeEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const copyLink = () => {
    const link = `${window.location.origin}/site/${customUrl}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const p1 = wedding?.partner1_name || "Partner 1";
  const p2 = wedding?.partner2_name || "Partner 2";
  const weddingDateStr = wedding?.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "Date not set";

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner size={48} message="Loading wedding site builder..." />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>
          🎨 Share your celebration
        </p>
        <h1>Wedding Website</h1>
        <p>Create a beautiful website to share with your guests</p>
      </div>

      {/* Status Bar */}
      <div className="card animate-fade-in-up" style={{ marginBottom: "24px", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Status badge */}
          <span className={`badge ${isPublished ? "badge-green" : "badge-orange"}`} style={{ fontSize: "13px" }}>
            {isPublished ? "✅ Published" : "📝 Draft"}
          </span>

          {/* URL */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--color-surface-elevated, #f5f3f0)", padding: "8px 14px", borderRadius: "8px", fontFamily: "monospace", fontSize: "13px", flex: 1, minWidth: "200px" }}>
            <span className="text-muted">{typeof window !== 'undefined' ? window.location.origin : ''}/site/</span>
            <input
              style={{ border: "none", background: "transparent", fontFamily: "monospace", fontSize: "13px", color: "var(--color-primary-dark)", fontWeight: 600, outline: "none", flex: 1 }}
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            />
          </div>

          {/* Actions */}
          <button className="btn btn-sm btn-secondary" onClick={copyLink}>
            {copied ? "✅ Copied!" : "📋 Copy Link"}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowShareModal(true)}>
            💌 Share & QR Code
          </button>
          {isPublished && (
            <a href={`/site/${customUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
              🔗 Open Site
            </a>
          )}
          {rsvpCount > 0 && (
            <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              💌 {rsvpCount} RSVP{rsvpCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "24px" }}>
        <button className={`tab ${activeTab === "design" ? "active" : ""}`} onClick={() => setActiveTab("design")}>🎨 Design</button>
        <button className={`tab ${activeTab === "content" ? "active" : ""}`} onClick={() => setActiveTab("content")}>✏️ Content</button>
        <button className={`tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>📅 Events</button>
        <button className={`tab ${activeTab === "preview" ? "active" : ""}`} onClick={() => setActiveTab("preview")}>👁️ Preview</button>
      </div>

      {/* Design Tab */}
      {activeTab === "design" && (
        <div className="animate-fade-in">
          <h3 style={{ marginBottom: "16px", fontSize: "1.1rem" }}>Choose a Template</h3>
          <div className="grid-3">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`card ${selectedTemplateId === template.id ? "card-gradient" : ""}`}
                style={{ cursor: "pointer", border: selectedTemplateId === template.id ? `2px solid ${template.accent}` : undefined, padding: "0", overflow: "hidden" }}
                onClick={() => setSelectedTemplateId(template.id)}
              >
                <div style={{ height: "140px", background: template.preview, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: template.id === "modern" || template.id === "garden" || template.id === "vintage" ? "#2D2D3F" : "#FFFFFF", position: "relative" }}>
                  <div style={{ fontFamily: template.font, fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>
                    {p1} & {p2}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.7 }}>{weddingDateStr}</div>
                  <div style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", width: "30px", height: "3px", background: template.accent, borderRadius: "2px" }} />
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div className="font-semibold text-sm" style={{ marginBottom: "4px" }}>{template.name}</div>
                  <div className="text-xs text-muted">{template.description}</div>
                  {selectedTemplateId === template.id && (
                    <div className="badge badge-green" style={{ marginTop: "8px" }}>✓ Selected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Page Sections</h3>
            <p className="text-xs text-muted">Toggle sections on/off, click edit to customize</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sections.map((section) => (
              <div key={section.id} className="card" style={{ padding: "16px 20px", opacity: section.enabled ? 1 : 0.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.3rem" }}>{section.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold text-sm">{section.title}</div>
                    {editingSection !== section.id && (
                      <div className="text-xs text-muted" style={{ marginTop: "2px" }}>
                        {section.content.substring(0, 80)}{section.content.length > 80 ? "..." : ""}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                    style={{
                      width: "44px", height: "24px", borderRadius: "12px",
                      background: section.enabled ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" : "var(--color-border)",
                      position: "relative", transition: "all 0.3s ease", flexShrink: 0, border: "none", cursor: "pointer",
                    }}
                  >
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#FFFFFF", position: "absolute", top: "3px", left: section.enabled ? "23px" : "3px", transition: "left 0.3s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); setEditingSection(editingSection === section.id ? null : section.id); }}>
                    {editingSection === section.id ? "✓ Done" : "✏️ Edit"}
                  </button>
                </div>
                {editingSection === section.id && (
                  <div style={{ marginTop: "12px", animation: "fadeIn 0.3s ease-out" }}>
                    <textarea
                      className="form-input form-textarea"
                      value={section.content}
                      onChange={(e) => updateSectionContent(section.id, e.target.value)}
                      rows={4}
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Wedding Events</h3>
            <button className="btn btn-sm btn-primary" onClick={addEvent}>+ Add Event</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {events.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 20px" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📅</div>
                <div className="empty-state-title">No Events Scheduled Yet</div>
                <div className="empty-state-text">
                  Add ceremony, reception, and party schedules to display on your custom wedding website.
                </div>
                <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={addEvent}>
                  + Add First Event
                </button>
              </div>
            ) : (
              events.map((event) => (
              <div key={event.id} className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: editingEvent === event.id ? "16px" : "0" }}>
                  <span style={{ fontSize: "1.5rem" }}>{event.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold">{event.name}</div>
                    <div className="text-xs text-muted">
                      {event.time}{event.venue ? ` · ${event.venue}` : ""}{event.dressCode ? ` · 👗 ${event.dressCode}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditingEvent(editingEvent === event.id ? null : event.id)}>
                    {editingEvent === event.id ? "✓ Done" : "✏️"}
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => removeEvent(event.id)} style={{ color: "var(--color-error)" }}>🗑️</button>
                </div>

                {editingEvent === event.id && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", animation: "fadeIn 0.3s ease-out" }}>
                    <div className="form-group">
                      <label className="form-label">Event Name</label>
                      <input className="form-input" value={event.name} onChange={(e) => updateEvent(event.id, "name", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Icon Emoji</label>
                      <input className="form-input" value={event.icon} onChange={(e) => updateEvent(event.id, "icon", e.target.value)} maxLength={4} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input className="form-input" type="date" value={event.date} onChange={(e) => updateEvent(event.id, "date", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input className="form-input" value={event.time} placeholder="e.g., 4:30 PM" onChange={(e) => updateEvent(event.id, "time", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Venue</label>
                      <input className="form-input" value={event.venue} placeholder="e.g., Grand Ballroom" onChange={(e) => updateEvent(event.id, "venue", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dress Code</label>
                      <input className="form-input" value={event.dressCode} placeholder="e.g., Traditional Ethnic" onChange={(e) => updateEvent(event.id, "dressCode", e.target.value)} />
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Description</label>
                      <textarea className="form-input form-textarea" value={event.description} onChange={(e) => updateEvent(event.id, "description", e.target.value)} rows={2} />
                    </div>
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div className="animate-fade-in">
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-xl)", border: "1px solid var(--color-border-light)" }}>
            {/* Preview Hero */}
            <div style={{ background: selectedTemplate.preview, padding: "80px 40px", textAlign: "center", color: selectedTemplate.id === "modern" || selectedTemplate.id === "garden" || selectedTemplate.id === "vintage" ? "#2D2D3F" : "#FFFFFF", position: "relative" }}>
              <div style={{ fontSize: "14px", letterSpacing: "4px", textTransform: "uppercase", opacity: 0.7, marginBottom: "16px" }}>
                We&apos;re Getting Married
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "48px", fontWeight: 700, marginBottom: "8px", lineHeight: 1.2 }}>
                {p1} & {p2}
              </div>
              <div style={{ width: "60px", height: "3px", background: selectedTemplate.accent, margin: "16px auto", borderRadius: "2px" }} />
              <div style={{ fontSize: "16px", opacity: 0.8 }}>{weddingDateStr}</div>
              {wedding?.venue && (
                <div style={{ fontSize: "14px", opacity: 0.6, marginTop: "4px" }}>
                  📍 {wedding.venue}{wedding.city ? ` · ${wedding.city}` : ""}
                </div>
              )}
            </div>

            {/* Preview Sections */}
            {sections.filter(s => s.enabled && s.id !== "hero").map((section, idx) => (
              <div key={section.id} style={{ padding: "48px 40px", background: idx % 2 === 0 ? "#FFFFFF" : "#FAF8F5", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{section.icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 600, marginBottom: "8px", color: "#2D2D3F" }}>{section.title}</div>
                <div style={{ width: "40px", height: "2px", background: selectedTemplate.accent, margin: "12px auto 20px", borderRadius: "2px" }} />
                <div style={{ maxWidth: "600px", margin: "0 auto", fontSize: "15px", lineHeight: 1.7, color: "#6B6B80" }}>{section.content}</div>

                {/* Events Preview */}
                {section.id === "events" && (
                  events.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "24px", maxWidth: "700px", margin: "24px auto 0" }}>
                      {events.map((event) => (
                        <div key={event.id} style={{ padding: "20px", borderRadius: "12px", border: `1px solid ${selectedTemplate.accent}40`, background: `${selectedTemplate.accent}08` }}>
                          <div style={{ fontSize: "24px", marginBottom: "8px" }}>{event.icon}</div>
                          <div style={{ fontWeight: 600, color: "#2D2D3F", marginBottom: "4px" }}>{event.name}</div>
                          {event.time && <div style={{ fontSize: "12px", color: selectedTemplate.accent, fontWeight: 600 }}>{event.time}</div>}
                          <div style={{ fontSize: "12px", color: "#9B9BAD", marginTop: "4px" }}>{event.description}</div>
                          {event.dressCode && (
                            <div style={{ fontSize: "11px", color: "#7B7B8E", marginTop: "6px" }}>👗 {event.dressCode}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "13px", color: "#9B9BAD", marginTop: "16px", fontStyle: "italic" }}>
                      Ceremony schedule will appear here once added in the Events tab.
                    </p>
                  )
                )}

                {/* RSVP Button */}
                {section.id === "rsvp" && (
                  <div style={{ marginTop: "24px" }}>
                    <button className="btn btn-lg" style={{ background: selectedTemplate.accent, color: "#FFFFFF", padding: "14px 40px", fontSize: "16px", borderRadius: "30px" }}>
                      RSVP Now →
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Footer */}
            <div style={{ background: selectedTemplate.preview, padding: "32px", textAlign: "center", color: selectedTemplate.id === "modern" || selectedTemplate.id === "garden" || selectedTemplate.id === "vintage" ? "#2D2D3F" : "#FFFFFF", fontSize: "14px", opacity: 0.7 }}>
              Made with 💕 on WedCraft
            </div>
          </div>
        </div>
      )}

      {/* Save / Publish Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", gap: "12px", flexWrap: "wrap" }}>
        {isPublished && (
          <button className="btn btn-tertiary" onClick={handleUnpublish} disabled={saving}>
            ⏸️ Unpublish
          </button>
        )}
        <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Draft"}
        </button>
        <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
          {saving ? "Publishing..." : isPublished ? "🔄 Update & Publish" : "🚀 Publish Site"}
        </button>
      </div>

      {showShareModal && (
        <ShareRsvpModal
          onClose={() => setShowShareModal(false)}
          slug={customUrl}
          partner1={p1}
          partner2={p2}
        />
      )}
    </div>
  );
}
