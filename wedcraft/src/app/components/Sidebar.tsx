"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const navItems = [
  {
    section: "Planning",
    items: [
      { label: "Dashboard", href: "/", icon: "🏠" },
      { label: "Checklist", href: "/checklist", icon: "📋" },
      { label: "Budget", href: "/budget", icon: "💰" },
      { label: "Guest List", href: "/guests", icon: "👥" },
      { label: "Seating Chart", href: "/seating", icon: "🪑" },
      { label: "Vendors", href: "/vendors", icon: "🏪" },
    ],
  },
  {
    section: "Tools",
    items: [
      { label: "AI Assistant", href: "/ai-assistant", icon: "🤖" },
      { label: "Wedding Site", href: "/wedding-site", icon: "🎨" },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: "⚙️" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, wedding, signOut } = useAuth();
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [counts, setCounts] = useState<{ tasks?: number; guests?: number; vendors?: number }>({});

  useEffect(() => {
    if (!wedding) return;
    let active = true;

    const fetchCounts = async () => {
      try {
        const [tasksRes, guestsRes, vendorsRes] = await Promise.all([
          supabase.from("tasks").select("id").eq("wedding_id", wedding.id).eq("completed", false),
          supabase.from("guests").select("id").eq("wedding_id", wedding.id),
          supabase.from("vendors").select("id").eq("wedding_id", wedding.id),
        ]);

        if (active) {
          const rawTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
          const rawGuests = Array.isArray(guestsRes.data) ? guestsRes.data : [];
          const rawVendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : [];

          const cleanTasks = rawTasks.filter((t: any) => !t.id?.startsWith('task-'));
          const cleanGuests = rawGuests.filter((g: any) => !g.id?.startsWith('g-'));
          const cleanVendors = rawVendors.filter((v: any) => !v.id?.startsWith('v-'));

          setCounts({
            tasks: cleanTasks.length,
            guests: cleanGuests.length,
            vendors: cleanVendors.length,
          });
        }
      } catch {
        // ignore
      }
    };

    fetchCounts();
    return () => {
      active = false;
    };
  }, [wedding, pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch {
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  const p1 = wedding?.partner1_name || 'Partner 1';
  const p2 = wedding?.partner2_name || 'Partner 2';
  const weddingDateStr = wedding?.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date not set';

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
        style={{
          display: "none",
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 150,
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #1A1035 0%, #0F0A1F 100%)",
          color: "#fff",
          fontSize: "1.3rem",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isMobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💍</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">WedCraft</span>
            <span className="sidebar-brand-tagline">Plan your perfect day</span>
          </div>
        </div>

        {/* Quick Search Shortcut */}
        <div style={{ padding: "0 16px 14px 16px" }}>
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 12px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              color: "rgba(255, 255, 255, 0.75)",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Open Command Palette (Cmd+K)"
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🔍</span> Quick Search...
            </span>
            <span style={{ fontSize: "10px", padding: "1px 5px", background: "rgba(255,255,255,0.18)", borderRadius: "4px", color: "#fff" }}>
              ⌘K
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map((item) => {
                const getBadge = () => {
                  if (item.href === "/checklist" && counts.tasks !== undefined && counts.tasks > 0) return counts.tasks;
                  if (item.href === "/guests" && counts.guests !== undefined && counts.guests > 0) return counts.guests;
                  if (item.href === "/vendors" && counts.vendors !== undefined && counts.vendors > 0) return counts.vendors;
                  return null;
                };
                const badge = getBadge();

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {badge !== null && (
                      <span className="sidebar-link-badge">{badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-wedding-info">
              <div className="sidebar-wedding-avatar">
                {p1.charAt(0)}&{p2.charAt(0)}
              </div>
              <div className="sidebar-wedding-details">
                <span className="sidebar-wedding-names">{p1} & {p2}</span>
                <span className="sidebar-wedding-date">{weddingDateStr}</span>
              </div>
            </div>
          )}
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? '⏳ Signing out...' : '🚪 Sign Out'}
          </button>
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 992px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
