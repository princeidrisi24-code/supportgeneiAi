"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function SettingsPage() {
  const { user, profile, wedding, loading: authLoading, refreshWedding, resetToFresh } = useAuth();
  const router = useRouter();

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Wedding form state
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [totalBudget, setTotalBudget] = useState("");

  // UI state
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWedding, setSavingWedding] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
    if (wedding) {
      setPartner1(wedding.partner1_name || "");
      setPartner2(wedding.partner2_name || "");
      setWeddingDate(wedding.wedding_date || "");
      setVenue(wedding.venue || "");
      setCity(wedding.city || "");
      setTotalBudget(wedding.total_budget?.toString() || "");
    }
  }, [authLoading, user, profile, wedding, router]);

  const saveProfile = async () => {
    if (!user) return;
    if (!name.trim()) {
      showToast("Name is required.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim() })
        .eq("id", user.id);
      if (error) throw error;
      showToast("Profile updated!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveWedding = async () => {
    if (!wedding) return;
    if (!partner1.trim() || !partner2.trim()) {
      showToast("Both partner names are required.", "error");
      return;
    }
    if (!weddingDate) {
      showToast("Wedding date is required.", "error");
      return;
    }
    setSavingWedding(true);
    try {
      const { error } = await supabase
        .from("weddings")
        .update({
          partner1_name: partner1.trim(),
          partner2_name: partner2.trim(),
          wedding_date: weddingDate,
          venue: venue.trim(),
          city: city.trim(),
          total_budget: parseFloat(totalBudget) || 0,
        })
        .eq("id", wedding.id);
      if (error) throw error;
      await refreshWedding();
      showToast("Wedding details updated!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update wedding.", "error");
    } finally {
      setSavingWedding(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    try {
      // Delete wedding data first
      if (wedding) {
        await supabase.from("vendors").delete().eq("wedding_id", wedding.id);
        await supabase.from("guests").delete().eq("wedding_id", wedding.id);
        await supabase.from("budget_items").delete().eq("wedding_id", wedding.id);
        await supabase.from("tasks").delete().eq("wedding_id", wedding.id);
        await supabase.from("weddings").delete().eq("id", wedding.id);
      }
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      router.replace("/login");
      showToast("Account deleted successfully.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete account.", "error");
      setDeletingAccount(false);
    }
  };

  const formatINR = (amount: number): string => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner size={48} message="Loading settings..." />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>
          ⚙️ Customize your experience
        </p>
        <h1>Settings</h1>
        <p>Manage your profile and wedding details</p>
      </div>

      <div className="grid-2">
        {/* Profile Settings */}
        <div className="card animate-fade-in-up">
          <div className="card-header">
            <div>
              <div className="card-title">👤 Profile</div>
              <div className="card-subtitle">Your personal information</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={savingProfile}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              value={email}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
            <p className="text-xs text-muted" style={{ marginTop: "4px" }}>
              Email cannot be changed
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Account ID</label>
            <input
              className="form-input"
              value={user?.id || ""}
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed", fontSize: "12px", fontFamily: "monospace" }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={saveProfile}
            disabled={savingProfile}
            style={{ marginTop: "8px" }}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* Wedding Details */}
        <div className="card animate-fade-in-up stagger-1">
          <div className="card-header">
            <div>
              <div className="card-title">💍 Wedding Details</div>
              <div className="card-subtitle">Your big day information</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Partner 1 Name</label>
              <input
                className="form-input"
                placeholder="First partner"
                value={partner1}
                onChange={(e) => setPartner1(e.target.value)}
                disabled={savingWedding}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Partner 2 Name</label>
              <input
                className="form-input"
                placeholder="Second partner"
                value={partner2}
                onChange={(e) => setPartner2(e.target.value)}
                disabled={savingWedding}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Wedding Date</label>
            <input
              className="form-input"
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              disabled={savingWedding}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input
                className="form-input"
                placeholder="e.g., Royal Orchid Palace"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                disabled={savingWedding}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-input"
                placeholder="e.g., Jaipur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={savingWedding}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Total Budget (₹)</label>
            <input
              className="form-input"
              type="number"
              placeholder="1000000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              disabled={savingWedding}
            />
            {totalBudget && parseFloat(totalBudget) > 0 && (
              <p className="text-xs text-muted" style={{ marginTop: "4px" }}>
                {formatINR(parseFloat(totalBudget))}
              </p>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={saveWedding}
            disabled={savingWedding}
            style={{ marginTop: "8px" }}
          >
            {savingWedding ? "Saving..." : "Save Wedding Details"}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card animate-fade-in-up stagger-2" style={{ marginTop: "24px" }}>
        <div className="card-title" style={{ fontSize: "1rem", marginBottom: "16px" }}>
          📊 Your Wedding at a Glance
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
          <div style={{ textAlign: "center", padding: "16px", background: "var(--color-primary-subtle)", borderRadius: "12px" }}>
            <div className="font-heading font-bold" style={{ fontSize: "1.3rem" }}>
              {partner1 && partner2 ? `${partner1} & ${partner2}` : "—"}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: "4px" }}>The Couple</div>
          </div>
          <div style={{ textAlign: "center", padding: "16px", background: "var(--color-success-bg)", borderRadius: "12px" }}>
            <div className="font-heading font-bold" style={{ fontSize: "1.3rem" }}>
              {weddingDate
                ? new Date(weddingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: "4px" }}>Wedding Date</div>
          </div>
          <div style={{ textAlign: "center", padding: "16px", background: "var(--color-warning-bg)", borderRadius: "12px" }}>
            <div className="font-heading font-bold" style={{ fontSize: "1.3rem" }}>
              {venue || city ? `${venue || ""} ${city ? `· ${city}` : ""}` : "—"}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: "4px" }}>Venue & City</div>
          </div>
          <div style={{ textAlign: "center", padding: "16px", background: "var(--color-accent-subtle)", borderRadius: "12px" }}>
            <div className="font-heading font-bold" style={{ fontSize: "1.3rem" }}>
              {totalBudget && parseFloat(totalBudget) > 0 ? formatINR(parseFloat(totalBudget)) : "—"}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: "4px" }}>Total Budget</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="card animate-fade-in-up stagger-3"
        style={{
          marginTop: "24px",
          borderColor: "var(--color-danger)",
          borderWidth: "1px",
        }}
      >
        <div className="card-header">
          <div>
            <div className="card-title" style={{ color: "var(--color-danger)" }}>
              ⚠️ Danger Zone
            </div>
            <div className="card-subtitle">Irreversible actions</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            background: "var(--color-background)",
            border: "1px solid var(--color-border-light)",
            borderRadius: "10px",
            marginBottom: "16px",
          }}
        >
          <div>
            <div className="font-semibold text-sm">Clear All Data & Start Fresh</div>
            <div className="text-xs text-muted">
              Wipe all tasks, budget items, guests, vendors, and seating to start with a blank fresh workspace.
            </div>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={async () => {
              if (!confirm('Clear all mock/starter data and start with an empty fresh workspace?')) return;
              await resetToFresh();
              showToast('Workspace reset to fresh!', 'success');
              window.location.reload();
            }}
          >
            🧹 Clear All & Start Fresh
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            background: "var(--color-danger-bg)",
            borderRadius: "10px",
          }}
        >
          <div>
            <div className="font-semibold text-sm">Delete Account</div>
            <div className="text-xs text-muted">
              Permanently delete your account and all wedding data. This cannot be undone.
            </div>
          </div>
          {!showDeleteConfirm ? (
            <button
              className="btn btn-sm"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: "var(--color-danger)",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              Delete Account
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingAccount}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                style={{ background: "var(--color-danger)", color: "#fff" }}
              >
                {deletingAccount ? "Deleting..." : "Yes, Delete Forever"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
