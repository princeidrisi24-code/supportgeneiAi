"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions";
  icon: string;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const commands: CommandItem[] = [
    // Navigation
    { id: "nav-dash", title: "Dashboard Overview", category: "Navigation", icon: "🏠", action: () => navigate("/") },
    { id: "nav-checklist", title: "Wedding Checklist & Timeline", category: "Navigation", icon: "📋", action: () => navigate("/checklist") },
    { id: "nav-budget", title: "Budget Tracker & Expenses", category: "Navigation", icon: "💰", action: () => navigate("/budget") },
    { id: "nav-guests", title: "Guest List & RSVPs", category: "Navigation", icon: "👥", action: () => navigate("/guests") },
    { id: "nav-seating", title: "Seating Chart & Floor Planner", category: "Navigation", icon: "🪑", action: () => navigate("/seating") },
    { id: "nav-vendors", title: "Vendors & Contacts", category: "Navigation", icon: "🏪", action: () => navigate("/vendors") },
    { id: "nav-ai", title: "AI Wedding Assistant", category: "Navigation", icon: "🤖", action: () => navigate("/ai-assistant") },
    { id: "nav-site", title: "Wedding Website Builder", category: "Navigation", icon: "🎨", action: () => navigate("/wedding-site") },
    { id: "nav-settings", title: "Account & Wedding Settings", category: "Navigation", icon: "⚙️", action: () => navigate("/settings") },

    // Actions
    { id: "act-task", title: "Add New Task", category: "Actions", icon: "➕", action: () => navigate("/checklist") },
    { id: "act-guest", title: "Add New Guest", category: "Actions", icon: "💌", action: () => navigate("/guests") },
    { id: "act-expense", title: "Record Expense", category: "Actions", icon: "💵", action: () => navigate("/budget") },
    { id: "act-table", title: "Manage Seating Tables", category: "Actions", icon: "🪑", action: () => navigate("/seating") },
    { id: "act-site", title: "Publish or Edit Wedding Website", category: "Actions", icon: "🚀", action: () => navigate("/wedding-site") },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 4, 19, 0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "14vh",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "var(--color-surface)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--color-border-light)",
          overflow: "hidden",
          animation: "scaleIn 0.15s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border-light)",
          }}
        >
          <span style={{ fontSize: "18px", color: "var(--color-text-muted)" }}>🔍</span>
          <input
            ref={inputRef}
            placeholder="Search commands, pages, or actions... (Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "16px",
              background: "transparent",
              color: "var(--color-text)",
              fontFamily: "var(--font-primary)",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              padding: "2px 6px",
              background: "var(--color-divider)",
              borderRadius: "4px",
              color: "var(--color-text-secondary)",
              fontWeight: 600,
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>
              No commands found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: isSelected ? "var(--color-primary-subtle)" : "transparent",
                    transition: "background 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px" }}>{item.icon}</span>
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--color-primary)",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Press Enter ↵
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            background: "var(--color-background)",
            borderTop: "1px solid var(--color-border-light)",
            fontSize: "11px",
            color: "var(--color-text-muted)",
          }}
        >
          <span>Use ↑ ↓ to navigate, ↵ to select</span>
          <span>Tip: Press <strong>⌘K</strong> anywhere to reopen</span>
        </div>
      </div>
    </div>
  );
}
