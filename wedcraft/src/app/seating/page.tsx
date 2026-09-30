"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import type { Guest } from "@/lib/database.types";

interface TableInfo {
  id: string;
  name: string;
  capacity: number;
  shape: "round" | "rectangle";
}

export default function SeatingPage() {
  const { user, wedding, loading: authLoading } = useAuth();
  const router = useRouter();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchGuest, setSearchGuest] = useState("");
  const [sideFilter, setSideFilter] = useState<"all" | "bride" | "groom" | "mutual">("all");
  const [rsvpFilter, setRsvpFilter] = useState<"all" | "accepted">("accepted");
  
  // Table modal state
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(8);
  const [newTableShape, setNewTableShape] = useState<"round" | "rectangle">("round");
  const [updatingGuestId, setUpdatingGuestId] = useState<string | null>(null);

  // Load tables from localStorage
  useEffect(() => {
    if (!wedding) return;
    try {
      const saved = localStorage.getItem(`wedcraft_seating_tables_${wedding.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTables(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [wedding]);

  const saveTables = (newTables: TableInfo[]) => {
    setTables(newTables);
    if (wedding) {
      try {
        localStorage.setItem(`wedcraft_seating_tables_${wedding.id}`, JSON.stringify(newTables));
      } catch {
        // ignore
      }
    }
  };

  const fetchGuests = useCallback(async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("wedding_id", wedding.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setGuests(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load guests.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [wedding]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (wedding) fetchGuests();
  }, [authLoading, user, wedding, fetchGuests, router]);

  // Assign guest to table
  const assignGuest = async (guestId: string, tableName: string) => {
    setUpdatingGuestId(guestId);
    const prev = guests;
    setGuests((curr) =>
      curr.map((g) => (g.id === guestId ? { ...g, table_number: tableName } : g))
    );

    try {
      const { error } = await supabase
        .from("guests")
        .update({ table_number: tableName })
        .eq("id", guestId);

      if (error) throw error;
      showToast(tableName ? `Guest assigned to ${tableName}` : "Guest unseated", "success");
    } catch (err: unknown) {
      setGuests(prev);
      const msg = err instanceof Error ? err.message : "Failed to update seating";
      showToast(msg, "error");
    } finally {
      setUpdatingGuestId(null);
    }
  };

  // Add new table
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      showToast("Table name is required", "error");
      return;
    }

    const newTable: TableInfo = {
      id: `table-${Date.now()}`,
      name: newTableName.trim(),
      capacity: Math.max(2, Math.min(30, newTableCapacity)),
      shape: newTableShape,
    };

    const updated = [...tables, newTable];
    saveTables(updated);
    setNewTableName("");
    setShowAddTableModal(false);
    showToast(`Table "${newTable.name}" created!`, "success");
  };

  // Delete table
  const handleDeleteTable = async (tableToDelete: TableInfo) => {
    if (!confirm(`Are you sure you want to delete "${tableToDelete.name}"? Seated guests will be moved to unassigned.`)) {
      return;
    }

    // Unassign guests
    const seatedHere = guests.filter((g) => g.table_number === tableToDelete.name);
    if (seatedHere.length > 0) {
      setGuests((curr) =>
        curr.map((g) => (g.table_number === tableToDelete.name ? { ...g, table_number: "" } : g))
      );
      try {
        await supabase
          .from("guests")
          .update({ table_number: "" })
          .eq("wedding_id", wedding?.id || "")
          .eq("table_number", tableToDelete.name);
      } catch {
        // ignore
      }
    }

    const updated = tables.filter((t) => t.id !== tableToDelete.id);
    saveTables(updated);
    showToast(`Deleted "${tableToDelete.name}"`, "info");
  };

  // Auto assign remaining guests
  const autoAssignGuests = async () => {
    const unseated = guests.filter((g) => {
      if (g.table_number) return false;
      if (rsvpFilter === "accepted" && g.rsvp_status !== "accepted") return false;
      return true;
    });

    if (unseated.length === 0) {
      showToast("No unassigned guests to seat!", "info");
      return;
    }

    if (!confirm(`Auto-assign ${unseated.length} guests across available tables?`)) {
      return;
    }

    let unassignedIdx = 0;
    const updates: { id: string; table_number: string }[] = [];
    const guestsCopy = [...guests];

    for (const table of tables) {
      const currentlyAtTable = guestsCopy.filter((g) => g.table_number === table.name).length;
      let availableSeats = table.capacity - currentlyAtTable;

      while (availableSeats > 0 && unassignedIdx < unseated.length) {
        const guest = unseated[unassignedIdx];
        updates.push({ id: guest.id, table_number: table.name });
        // update local copy
        const gIdx = guestsCopy.findIndex((g) => g.id === guest.id);
        if (gIdx !== -1) guestsCopy[gIdx].table_number = table.name;

        availableSeats--;
        unassignedIdx++;
      }
    }

    setGuests(guestsCopy);

    // Save in batches
    for (const item of updates) {
      await supabase.from("guests").update({ table_number: item.table_number }).eq("id", item.id);
    }

    showToast(`Seated ${updates.length} guests!`, "success");
  };

  // Export seating plan as CSV
  const exportSeatingCSV = () => {
    const rows = [
      ["Table", "Guest Name", "Side", "RSVP Status", "Dietary", "Plus Ones", "Group"],
    ];

    tables.forEach((t) => {
      const seated = guests.filter((g) => g.table_number === t.name);
      seated.forEach((g) => {
        rows.push([
          `"${t.name}"`,
          `"${g.name}"`,
          `"${g.side}"`,
          `"${g.rsvp_status}"`,
          `"${g.dietary || "None"}"`,
          `"${g.plus_ones || 0}"`,
          `"${g.guest_group || ""}"`,
        ]);
      });
    });

    // Also include unseated
    const unseated = guests.filter((g) => !g.table_number);
    unseated.forEach((g) => {
      rows.push([
        `"Unassigned"`,
        `"${g.name}"`,
        `"${g.side}"`,
        `"${g.rsvp_status}"`,
        `"${g.dietary || "None"}"`,
        `"${g.plus_ones || 0}"`,
        `"${g.guest_group || ""}"`,
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WedCraft_Seating_Chart_${wedding?.partner1_name || "Wedding"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Seating chart downloaded!", "success");
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner size={48} message="Loading seating chart..." />
      </div>
    );
  }

  // Filter unassigned guests for the left tray
  const unassignedGuests = guests.filter((g) => {
    if (g.table_number) return false;
    if (rsvpFilter === "accepted" && g.rsvp_status !== "accepted") return false;
    if (sideFilter !== "all" && g.side !== sideFilter) return false;
    if (searchGuest && !g.name.toLowerCase().includes(searchGuest.toLowerCase())) return false;
    return true;
  });

  const totalSeated = guests.filter((g) => g.table_number).length;
  const totalAttending = guests.filter((g) => g.rsvp_status === "accepted").length;
  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>🪑 Floor & Table Planner</p>
        <h1>Seating Chart</h1>
        <p>Organize reception tables, arrange guests, and track seating capacity seamlessly</p>
      </div>

      {/* Stats Bar */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        <div className="card">
          <div className="stat-card">
            <div className="card-icon gold">🪑</div>
            <div>
              <div className="stat-value">{tables.length}</div>
              <div className="stat-label">Total Tables</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-card">
            <div className="card-icon green">✅</div>
            <div>
              <div className="stat-value">{totalSeated}</div>
              <div className="stat-label">Guests Seated</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-card">
            <div className="card-icon rose">👥</div>
            <div>
              <div className="stat-value">{guests.filter((g) => !g.table_number).length}</div>
              <div className="stat-label">Unassigned Guests</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-card">
            <div className="card-icon purple">🎯</div>
            <div>
              <div className="stat-value">
                {totalCapacity > 0 ? Math.round((totalSeated / totalCapacity) * 100) : 0}%
              </div>
              <div className="stat-label">{totalSeated} of {totalCapacity} Seats Filled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Unassigned List on Left, Tables Grid on Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Unassigned Guests */}
        <div className="card" style={{ position: "sticky", top: "20px", maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
              Unassigned ({unassignedGuests.length})
            </h3>
            <span className="badge" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary)" }}>
              {rsvpFilter === "accepted" ? "Attending only" : "All guests"}
            </span>
          </div>

          {/* Search & Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            <div className="search-bar" style={{ width: "100%" }}>
              <span className="search-bar-icon">🔍</span>
              <input
                placeholder="Search guests..."
                value={searchGuest}
                onChange={(e) => setSearchGuest(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {(["all", "bride", "groom"] as const).map((s) => (
                <button
                  key={s}
                  className={`tab ${sideFilter === s ? "active" : ""}`}
                  style={{ flex: 1, padding: "4px 8px", fontSize: "11px", textAlign: "center" }}
                  onClick={() => setSideFilter(s)}
                >
                  {s === "all" ? "All Sides" : s === "bride" ? "👰 Bride" : "🤵 Groom"}
                </button>
              ))}
            </div>
          </div>

          {/* Guest items list */}
          <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px" }}>
            {unassignedGuests.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>All filtered guests are seated!</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                  Great job organizing your reception.
                </div>
              </div>
            ) : (
              unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--color-background)",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {guest.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                      <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                        {guest.side === "bride" ? "👰 Bride" : guest.side === "groom" ? "🤵 Groom" : "🤝 Mutual"}
                      </span>
                      {guest.dietary && (
                        <span className="badge" style={{ fontSize: "10px", padding: "1px 6px", background: "#FEF3C7", color: "#92400E" }}>
                          🥗 {guest.dietary}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assign to table dropdown */}
                  <select
                    className="form-input form-select"
                    style={{ width: "auto", maxWidth: "110px", padding: "4px 8px", fontSize: "11px", height: "30px" }}
                    value=""
                    disabled={updatingGuestId === guest.id}
                    onChange={(e) => {
                      if (e.target.value) assignGuest(guest.id, e.target.value);
                    }}
                  >
                    <option value="">+ Seat</option>
                    {tables.map((t) => {
                      const count = guests.filter((g) => g.table_number === t.name).length;
                      return (
                        <option key={t.id} value={t.name} disabled={count >= t.capacity}>
                          {t.name} ({count}/{t.capacity})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Tables Grid */}
        <div>
          {/* Action Toolbar */}
          <div className="toolbar" style={{ marginBottom: "20px" }}>
            <div className="toolbar-left">
              <button className="btn btn-primary" onClick={() => setShowAddTableModal(true)}>
                + Add Table
              </button>
              <button className="btn btn-secondary" onClick={autoAssignGuests}>
                ⚡ Auto-Assign Guests
              </button>
            </div>
            <div className="toolbar-right">
              <button
                className={`tab ${rsvpFilter === "accepted" ? "active" : ""}`}
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => setRsvpFilter(rsvpFilter === "accepted" ? "all" : "accepted")}
              >
                {rsvpFilter === "accepted" ? "✓ Attending Only" : "👥 Show All Guests"}
              </button>
              <button className="btn btn-tertiary" onClick={exportSeatingCSV} title="Download Seating CSV">
                📥 Export Plan
              </button>
            </div>
          </div>

          {/* Tables Cards Grid */}
          {tables.length === 0 ? (
            <div className="empty-state" style={{ padding: "48px 24px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🪑</div>
              <div className="empty-state-title">No Tables Configured Yet</div>
              <div className="empty-state-text">
                Start designing your reception seating layout by adding your first table.
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: "16px" }}
                onClick={() => setShowAddTableModal(true)}
              >
                + Add First Table
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {tables.map((table) => {
              const seatedGuests = guests.filter((g) => g.table_number === table.name);
              const isFull = seatedGuests.length >= table.capacity;
              const percent = Math.min(100, Math.round((seatedGuests.length / table.capacity) * 100));

              // Side breakdown
              const brideCount = seatedGuests.filter((g) => g.side === "bride").length;
              const groomCount = seatedGuests.filter((g) => g.side === "groom").length;

              // Dietary count
              const dietaryGuests = seatedGuests.filter((g) => g.dietary && g.dietary.trim());

              return (
                <div
                  key={table.id}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderTop: `4px solid ${isFull ? "var(--color-success)" : "var(--color-primary)"}`,
                  }}
                >
                  {/* Table Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>
                          {table.shape === "round" ? "🟡" : "🟩"}
                        </span>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>{table.name}</h3>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                        {table.shape === "round" ? "Round Table" : "Rectangular Table"} • Max {table.capacity} seats
                      </div>
                    </div>

                    <button
                      className="btn btn-icon btn-ghost"
                      style={{ fontSize: "13px", padding: "4px" }}
                      title="Delete Table"
                      onClick={() => handleDeleteTable(table)}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Capacity Bar */}
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "600" }}>
                        {seatedGuests.length} / {table.capacity} Seated
                      </span>
                      <span style={{ color: isFull ? "var(--color-success)" : "var(--color-primary)", fontWeight: "700" }}>
                        {isFull ? "Table Full" : `${table.capacity - seatedGuests.length} seats left`}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: "6px" }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: isFull ? "var(--color-success)" : "var(--color-primary)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {seatedGuests.length > 0 && (
                      <span className="badge" style={{ fontSize: "11px", background: "var(--color-divider)" }}>
                        👰 {brideCount} • 🤵 {groomCount}
                      </span>
                    )}
                    {dietaryGuests.length > 0 && (
                      <span className="badge" style={{ fontSize: "11px", background: "#FEF3C7", color: "#92400E" }}>
                        🥗 {dietaryGuests.length} Dietary Notes
                      </span>
                    )}
                  </div>

                  {/* Seated Guests List */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", minHeight: "120px" }}>
                    {seatedGuests.length === 0 ? (
                      <div
                        style={{
                          border: "1px dashed var(--color-border)",
                          borderRadius: "8px",
                          padding: "24px 12px",
                          textAlign: "center",
                          color: "var(--color-text-muted)",
                          fontSize: "13px",
                        }}
                      >
                        No guests seated here yet.
                        <div style={{ fontSize: "11px", marginTop: "4px" }}>
                          Select from unassigned list to place here.
                        </div>
                      </div>
                    ) : (
                      seatedGuests.map((g, idx) => (
                        <div
                          key={g.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            background: "var(--color-background)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", width: "16px" }}>
                              #{idx + 1}
                            </span>
                            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              <span style={{ fontWeight: "600" }}>{g.name}</span>
                              {g.dietary && (
                                <span style={{ marginLeft: "6px", color: "#B45309", fontSize: "10px" }}>
                                  ({g.dietary})
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            className="btn btn-icon btn-ghost"
                            style={{ fontSize: "12px", padding: "2px 6px" }}
                            title="Unseat guest"
                            disabled={updatingGuestId === g.id}
                            onClick={() => assignGuest(g.id, "")}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="modal-overlay" onClick={() => setShowAddTableModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🪑 Add New Table</h3>
              <button className="modal-close" onClick={() => setShowAddTableModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label className="form-label">Table Name or Number *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Table 5, Groom VIP, High School Friends"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Seating Capacity</label>
                  <input
                    className="form-input"
                    type="number"
                    min={2}
                    max={30}
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 8)}
                  />
                  <span className="form-helper">Typically 8 - 12 seats</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Table Shape</label>
                  <select
                    className="form-input form-select"
                    value={newTableShape}
                    onChange={(e) => setNewTableShape(e.target.value as "round" | "rectangle")}
                  >
                    <option value="round">🟡 Round Table</option>
                    <option value="rectangle">🟩 Rectangular Table</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-tertiary"
                  onClick={() => setShowAddTableModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
