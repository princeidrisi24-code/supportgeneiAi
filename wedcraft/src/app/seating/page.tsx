"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  const [rsvpFilter, setRsvpFilter] = useState<"all" | "accepted">("all");

  // Table modal state
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(8);
  const [newTableShape, setNewTableShape] = useState<"round" | "rectangle">("round");
  const [updatingGuestId, setUpdatingGuestId] = useState<string | null>(null);

  // Seat Guest Modal on a specific table
  const [seatModalTable, setSeatModalTable] = useState<TableInfo | null>(null);
  const [modalSearchGuest, setModalSearchGuest] = useState("");

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

  // Helper to determine which table a guest belongs to
  const getTableForGuest = useCallback((guest: Guest): TableInfo | null => {
    if (!guest.table_number || !guest.table_number.trim()) return null;
    const tn = guest.table_number.trim().toLowerCase();
    return tables.find((t) => t.name.trim().toLowerCase() === tn || t.id === guest.table_number) || null;
  }, [tables]);

  // Seated guests lookup map by table id
  const tableSeatedMap = useMemo(() => {
    const map: Record<string, Guest[]> = {};
    tables.forEach((t) => {
      map[t.id] = [];
    });
    guests.forEach((g) => {
      const matched = getTableForGuest(g);
      if (matched && map[matched.id]) {
        map[matched.id].push(g);
      }
    });
    return map;
  }, [tables, guests, getTableForGuest]);

  // Assign guest to table (or unseat with empty string)
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

    const trimmed = newTableName.trim();
    if (tables.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`A table named "${trimmed}" already exists`, "error");
      return;
    }

    const newTable: TableInfo = {
      id: `table-${Date.now()}`,
      name: trimmed,
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
    const seatedHere = tableSeatedMap[tableToDelete.id] || [];
    if (seatedHere.length > 0) {
      setGuests((curr) =>
        curr.map((g) => (seatedHere.some((sh) => sh.id === g.id) ? { ...g, table_number: "" } : g))
      );
      for (const g of seatedHere) {
        try {
          await supabase.from("guests").update({ table_number: "" }).eq("id", g.id);
        } catch {
          // ignore
        }
      }
    }

    const updated = tables.filter((t) => t.id !== tableToDelete.id);
    saveTables(updated);
    showToast(`Deleted "${tableToDelete.name}"`, "info");
  };

  // Auto assign remaining guests
  const autoAssignGuests = async () => {
    const unseated = guests.filter((g) => {
      const assignedTable = getTableForGuest(g);
      if (assignedTable) return false;
      if (rsvpFilter === "accepted" && g.rsvp_status !== "accepted") return false;
      return true;
    });

    if (unseated.length === 0) {
      showToast("No unassigned guests to seat!", "info");
      return;
    }

    if (tables.length === 0) {
      showToast("Please add at least one table first!", "error");
      setShowAddTableModal(true);
      return;
    }

    if (!confirm(`Auto-assign ${unseated.length} guests across available tables?`)) {
      return;
    }

    let unassignedIdx = 0;
    const updates: { id: string; table_number: string }[] = [];
    const guestsCopy = [...guests];

    for (const table of tables) {
      const currentlyAtTable = (tableSeatedMap[table.id] || []).length;
      let availableSeats = table.capacity - currentlyAtTable;

      while (availableSeats > 0 && unassignedIdx < unseated.length) {
        const guest = unseated[unassignedIdx];
        updates.push({ id: guest.id, table_number: table.name });

        const gIdx = guestsCopy.findIndex((g) => g.id === guest.id);
        if (gIdx !== -1) guestsCopy[gIdx].table_number = table.name;

        availableSeats--;
        unassignedIdx++;
      }
    }

    setGuests(guestsCopy);

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
      const seated = tableSeatedMap[t.id] || [];
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

    const unseated = guests.filter((g) => !getTableForGuest(g));
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

  // All guests that are not seated at any existing table
  const allUnassignedGuests = guests.filter((g) => getTableForGuest(g) === null);

  // Filter unassigned guests for the left tray
  const unassignedGuests = allUnassignedGuests.filter((g) => {
    if (rsvpFilter === "accepted" && g.rsvp_status !== "accepted") return false;
    if (sideFilter !== "all" && g.side !== sideFilter) return false;
    if (searchGuest && !g.name.toLowerCase().includes(searchGuest.toLowerCase())) return false;
    return true;
  });

  const totalSeated = guests.length - allUnassignedGuests.length;
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
              <div className="stat-value">{allUnassignedGuests.length}</div>
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
      <div style={{ display: "grid", gridTemplateColumns: "330px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Unassigned Guests */}
        <div className="card" style={{ position: "sticky", top: "20px", maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
              Unassigned ({unassignedGuests.length})
            </h3>
            <span className="badge" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary)", fontWeight: "600" }}>
              {allUnassignedGuests.length} Total
            </span>
          </div>

          {/* Quick RSVP toggle pill */}
          <div style={{ display: "flex", background: "var(--color-background)", borderRadius: "8px", padding: "3px", marginBottom: "12px", border: "1px solid var(--color-border-light)" }}>
            <button
              type="button"
              onClick={() => setRsvpFilter("all")}
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: "11px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: rsvpFilter === "all" ? "var(--color-primary)" : "transparent",
                color: rsvpFilter === "all" ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              All Guests ({allUnassignedGuests.length})
            </button>
            <button
              type="button"
              onClick={() => setRsvpFilter("accepted")}
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: "11px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: rsvpFilter === "accepted" ? "var(--color-primary)" : "transparent",
                color: rsvpFilter === "accepted" ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              Attending Only ({allUnassignedGuests.filter((g) => g.rsvp_status === "accepted").length})
            </button>
          </div>

          {/* Search & Side Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
            <div className="search-bar" style={{ width: "100%" }}>
              <span className="search-bar-icon">🔍</span>
              <input
                placeholder="Search unassigned guests..."
                value={searchGuest}
                onChange={(e) => setSearchGuest(e.target.value)}
                style={{ width: "100%", fontSize: "12px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              {(["all", "bride", "groom", "mutual"] as const).map((s) => (
                <button
                  key={s}
                  className={`tab ${sideFilter === s ? "active" : ""}`}
                  style={{ flex: 1, padding: "4px 6px", fontSize: "10px", textAlign: "center" }}
                  onClick={() => setSideFilter(s)}
                >
                  {s === "all" ? "All" : s === "bride" ? "👰 Bride" : s === "groom" ? "🤵 Groom" : "🤝 Mutual"}
                </button>
              ))}
            </div>
          </div>

          {/* Guest items list */}
          <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
            {unassignedGuests.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                  {allUnassignedGuests.length === 0 && guests.length > 0 ? "🎉" : "👥"}
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>
                  {guests.length === 0
                    ? "No guests in your guest list"
                    : allUnassignedGuests.length === 0
                    ? "All guests are seated!"
                    : "No guests match filters"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                  {guests.length === 0 ? (
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: "10px", fontSize: "12px", padding: "4px 10px" }}
                      onClick={() => router.push("/guests")}
                    >
                      + Add Guests in Guest List
                    </button>
                  ) : allUnassignedGuests.length > 0 && rsvpFilter === "accepted" ? (
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: "10px", fontSize: "12px", padding: "4px 10px" }}
                      onClick={() => setRsvpFilter("all")}
                    >
                      Show All ({allUnassignedGuests.length}) Guests
                    </button>
                  ) : (
                    "Great job organizing your reception."
                  )}
                </div>
              </div>
            ) : (
              unassignedGuests.map((guest) => {
                const rsvpColor =
                  guest.rsvp_status === "accepted"
                    ? { bg: "#DEF7EC", text: "#03543F", label: "✓ Attending" }
                    : guest.rsvp_status === "pending"
                    ? { bg: "#FEF08A", text: "#854D0E", label: "⏳ Pending" }
                    : guest.rsvp_status === "declined"
                    ? { bg: "#FDE8E8", text: "#9B1C1C", label: "✕ Declined" }
                    : { bg: "#E1EFFE", text: "#1E429F", label: "❓ Maybe" };

                const hasUnmatchedTable =
                  guest.table_number &&
                  guest.table_number.trim() !== "" &&
                  getTableForGuest(guest) === null;

                return (
                  <div
                    key={guest.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "10px 12px",
                      background: "var(--color-background)",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: "700", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {guest.name}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>
                            {guest.side === "bride" ? "👰 Bride" : guest.side === "groom" ? "🤵 Groom" : "🤝 Mutual"}
                          </span>
                          <span
                            className="badge"
                            style={{
                              fontSize: "10px",
                              padding: "1px 6px",
                              background: rsvpColor.bg,
                              color: rsvpColor.text,
                              fontWeight: "600",
                            }}
                          >
                            {rsvpColor.label}
                          </span>
                          {guest.dietary && (
                            <span className="badge" style={{ fontSize: "10px", padding: "1px 6px", background: "#FEF3C7", color: "#92400E" }}>
                              🥗 {guest.dietary}
                            </span>
                          )}
                          {hasUnmatchedTable && (
                            <span className="badge" style={{ fontSize: "10px", padding: "1px 6px", background: "#FEE2E2", color: "#991B1B" }}>
                              ⚠️ Prev: &quot;{guest.table_number}&quot;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seat Guest Action */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                      <select
                        className="form-input form-select"
                        style={{
                          flex: 1,
                          padding: "5px 8px",
                          fontSize: "11px",
                          height: "32px",
                          fontWeight: "600",
                          borderRadius: "6px",
                        }}
                        value=""
                        disabled={updatingGuestId === guest.id || tables.length === 0}
                        onChange={(e) => {
                          if (e.target.value) assignGuest(guest.id, e.target.value);
                        }}
                      >
                        <option value="">{tables.length === 0 ? "No tables added" : "Assign to Table... ▾"}</option>
                        {tables.map((t) => {
                          const count = (tableSeatedMap[t.id] || []).length;
                          const isFull = count >= t.capacity;
                          return (
                            <option key={t.id} value={t.name} disabled={isFull}>
                              {t.name} ({count}/{t.capacity} {isFull ? "Full" : "seated"})
                            </option>
                          );
                        })}
                      </select>

                      {/* If only 1 table exists with space, show 1-click quick seat button */}
                      {tables.length === 1 && (tableSeatedMap[tables[0].id] || []).length < tables[0].capacity && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: "11px", padding: "4px 8px", height: "32px", whiteSpace: "nowrap" }}
                          disabled={updatingGuestId === guest.id}
                          onClick={() => assignGuest(guest.id, tables[0].name)}
                          title={`Quick seat at ${tables[0].name}`}
                        >
                          Seat Here
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
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
              <button
                className="btn btn-secondary"
                onClick={autoAssignGuests}
                disabled={allUnassignedGuests.length === 0 || tables.length === 0}
              >
                ⚡ Auto-Assign Guests
              </button>
            </div>
            <div className="toolbar-right">
              <button
                className={`tab ${rsvpFilter === "accepted" ? "active" : ""}`}
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => setRsvpFilter(rsvpFilter === "accepted" ? "all" : "accepted")}
              >
                {rsvpFilter === "accepted" ? "✓ Attending Only" : "👥 All Guests"}
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
                const seatedGuests = tableSeatedMap[table.id] || [];
                const isFull = seatedGuests.length >= table.capacity;
                const percent = Math.min(100, Math.round((seatedGuests.length / table.capacity) * 100));

                const brideCount = seatedGuests.filter((g) => g.side === "bride").length;
                const groomCount = seatedGuests.filter((g) => g.side === "groom").length;
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

                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {!isFull && (
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: "11px", padding: "4px 8px", height: "28px" }}
                            title="Seat an unassigned guest at this table"
                            onClick={() => {
                              setSeatModalTable(table);
                              setModalSearchGuest("");
                            }}
                          >
                            + Seat Guest
                          </button>
                        )}
                        <button
                          className="btn btn-icon btn-ghost"
                          style={{ fontSize: "13px", padding: "4px" }}
                          title="Delete Table"
                          onClick={() => handleDeleteTable(table)}
                        >
                          🗑️
                        </button>
                      </div>
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
                            borderRadius: "10px",
                            padding: "24px 12px",
                            textAlign: "center",
                            color: "var(--color-text-muted)",
                            fontSize: "13px",
                            background: "rgba(0,0,0,0.01)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <div>No guests seated here yet.</div>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: "12px", padding: "6px 14px", marginTop: "4px" }}
                            onClick={() => {
                              setSeatModalTable(table);
                              setModalSearchGuest("");
                            }}
                          >
                            + Seat Guest at {table.name}
                          </button>
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
                              border: "1px solid var(--color-border-light)",
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

                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {/* Move to another table dropdown if more than 1 table exists */}
                              {tables.length > 1 && (
                                <select
                                  className="form-input form-select"
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 4px",
                                    height: "24px",
                                    width: "auto",
                                    maxWidth: "80px",
                                  }}
                                  value=""
                                  title="Move to another table"
                                  disabled={updatingGuestId === g.id}
                                  onChange={(e) => {
                                    if (e.target.value) assignGuest(g.id, e.target.value);
                                  }}
                                >
                                  <option value="">Move ▾</option>
                                  {tables
                                    .filter((t) => t.id !== table.id)
                                    .map((t) => {
                                      const count = (tableSeatedMap[t.id] || []).length;
                                      const isTargetFull = count >= t.capacity;
                                      return (
                                        <option key={t.id} value={t.name} disabled={isTargetFull}>
                                          {t.name} ({count}/{t.capacity})
                                        </option>
                                      );
                                    })}
                                </select>
                              )}

                              <button
                                className="btn btn-icon btn-ghost"
                                style={{ fontSize: "12px", padding: "2px 6px" }}
                                title="Unseat guest (move to unassigned)"
                                disabled={updatingGuestId === g.id}
                                onClick={() => assignGuest(g.id, "")}
                              >
                                ✕
                              </button>
                            </div>
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

      {/* Direct Seat Guest on Specific Table Modal */}
      {seatModalTable && (
        <div className="modal-overlay" onClick={() => setSeatModalTable(null)}>
          <div className="modal" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">🪑 Seat Guests at {seatModalTable.name}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  Capacity: {(tableSeatedMap[seatModalTable.id] || []).length} / {seatModalTable.capacity} seated (
                  {seatModalTable.capacity - (tableSeatedMap[seatModalTable.id] || []).length} seats remaining)
                </p>
              </div>
              <button className="modal-close" onClick={() => setSeatModalTable(null)}>✕</button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div className="search-bar" style={{ width: "100%" }}>
                <span className="search-bar-icon">🔍</span>
                <input
                  placeholder="Search unassigned guests to seat..."
                  value={modalSearchGuest}
                  onChange={(e) => setModalSearchGuest(e.target.value)}
                  style={{ width: "100%", fontSize: "13px" }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {allUnassignedGuests
                .filter((g) => !modalSearchGuest || g.name.toLowerCase().includes(modalSearchGuest.toLowerCase()))
                .length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--color-text-secondary)" }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>🎉</div>
                  <div style={{ fontWeight: "600" }}>No unassigned guests available</div>
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>
                    All guests have already been placed at tables!
                  </div>
                </div>
              ) : (
                allUnassignedGuests
                  .filter((g) => !modalSearchGuest || g.name.toLowerCase().includes(modalSearchGuest.toLowerCase()))
                  .map((guest) => {
                    const isTableFull =
                      (tableSeatedMap[seatModalTable.id] || []).length >= seatModalTable.capacity;

                    return (
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
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "13px" }}>{guest.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                              {guest.side === "bride" ? "👰 Bride" : guest.side === "groom" ? "🤵 Groom" : "🤝 Mutual"}
                            </span>
                            <span
                              className="badge"
                              style={{
                                fontSize: "10px",
                                padding: "1px 6px",
                                background: guest.rsvp_status === "accepted" ? "#DEF7EC" : "#FEF08A",
                                color: guest.rsvp_status === "accepted" ? "#03543F" : "#854D0E",
                              }}
                            >
                              {guest.rsvp_status}
                            </span>
                            {guest.dietary && (
                              <span style={{ fontSize: "10px", color: "#B45309" }}>
                                🥗 {guest.dietary}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: "11px", padding: "6px 12px" }}
                          disabled={isTableFull || updatingGuestId === guest.id}
                          onClick={async () => {
                            await assignGuest(guest.id, seatModalTable.name);
                            if ((tableSeatedMap[seatModalTable.id] || []).length + 1 >= seatModalTable.capacity) {
                              setSeatModalTable(null);
                            }
                          }}
                        >
                          Seat Here
                        </button>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: "16px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSeatModalTable(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
