"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/app/components/Toast";

export type WeddingStyle = "palace" | "banquet" | "resort" | "intimate";
export type ServiceTier = "standard" | "luxury" | "royal";

interface StyleConfig {
  id: WeddingStyle;
  icon: string;
  name: string;
  desc: string;
  shares: {
    venue: number;
    catering: number;
    decor: number;
    photo: number;
    attire: number;
    misc: number;
  };
}

const WEDDING_STYLES: StyleConfig[] = [
  {
    id: "palace",
    icon: "🏰",
    name: "Royal Palace / Destination",
    desc: "Heritage fort, royal hospitality, multi-day guest stay",
    shares: { venue: 0.38, catering: 0.22, decor: 0.16, photo: 0.12, attire: 0.07, misc: 0.05 },
  },
  {
    id: "banquet",
    icon: "🏛️",
    name: "Grand City Banquet",
    desc: "Luxury hotel ballroom, lavish food spread, vibrant DJ",
    shares: { venue: 0.28, catering: 0.30, decor: 0.15, photo: 0.13, attire: 0.08, misc: 0.06 },
  },
  {
    id: "resort",
    icon: "🌿",
    name: "Open Lawn & Resort",
    desc: "Sprawling floral mandap, outdoor carnival, food stalls",
    shares: { venue: 0.24, catering: 0.30, decor: 0.20, photo: 0.12, attire: 0.08, misc: 0.06 },
  },
  {
    id: "intimate",
    icon: "🏡",
    name: "Intimate & Heritage",
    desc: "Close family & friends, bespoke catering, candid cinema",
    shares: { venue: 0.18, catering: 0.34, decor: 0.16, photo: 0.16, attire: 0.10, misc: 0.06 },
  },
];

const BUDGET_PRESETS = [
  { label: "₹5 Lakhs", value: 500000 },
  { label: "₹15 Lakhs", value: 1500000 },
  { label: "₹25 Lakhs", value: 2500000 },
  { label: "₹50 Lakhs", value: 5000000 },
  { label: "₹1 Crore", value: 10000000 },
];

const GUEST_PRESETS = [
  { label: "Intimate (80)", value: 80 },
  { label: "Classic (250)", value: 250 },
  { label: "Grand (500)", value: 500 },
  { label: "Royal (800+)", value: 800 },
];

interface BudgetEstimatorProps {
  initialBudget?: number;
  initialGuests?: number;
  onApplyBudget?: (budget: number, items: { category: string; allocated: number; vendor_name: string; notes: string }[]) => Promise<void> | void;
  isEmbeddedInApp?: boolean;
}

export function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
  return `₹${val.toLocaleString("en-IN")}`;
}

export function formatExactINR(val: number): string {
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export default function BudgetEstimator({
  initialBudget = 2500000,
  initialGuests = 300,
  onApplyBudget,
  isEmbeddedInApp = false,
}: BudgetEstimatorProps) {
  const router = useRouter();
  const { user, wedding, refreshWedding } = useAuth();

  const [budgetVal, setBudgetVal] = useState<number>(initialBudget);
  const [guestsCount, setGuestsCount] = useState<number>(initialGuests);
  const [selectedStyle, setSelectedStyle] = useState<WeddingStyle>("banquet");
  const [applying, setApplying] = useState(false);

  // Current style configuration
  const currentStyleConfig = useMemo(() => {
    return WEDDING_STYLES.find((s) => s.id === selectedStyle) || WEDDING_STYLES[1];
  }, [selectedStyle]);

  // Dynamic calculations factoring both budget AND guest count
  const breakdown = useMemo(() => {
    const shares = currentStyleConfig.shares;

    // Guest count scale factor:
    // Large weddings (>400) require slightly higher catering & venue buffer
    // Small weddings (<150) allocate more towards personalized photography & attire
    let venueShare = shares.venue;
    let cateringShare = shares.catering;
    let decorShare = shares.decor;
    let photoShare = shares.photo;
    let attireShare = shares.attire;
    let miscShare = shares.misc;

    if (guestsCount >= 500) {
      cateringShare += 0.03;
      venueShare += 0.02;
      decorShare -= 0.02;
      photoShare -= 0.02;
      attireShare -= 0.01;
    } else if (guestsCount <= 120) {
      cateringShare -= 0.03;
      venueShare -= 0.03;
      photoShare += 0.03;
      decorShare += 0.02;
      attireShare += 0.01;
    }

    const venue = Math.round(budgetVal * venueShare);
    const catering = Math.round(budgetVal * cateringShare);
    const decor = Math.round(budgetVal * decorShare);
    const photo = Math.round(budgetVal * photoShare);
    const attire = Math.round(budgetVal * attireShare);
    const misc = Math.round(budgetVal * miscShare);

    const costPerGuest = Math.round(budgetVal / Math.max(1, guestsCount));
    const plateCost = Math.round(catering / Math.max(1, guestsCount));
    const estimatedRooms = Math.ceil(guestsCount * 0.35);

    let plateQuality = "✨ Premium Multi-Cuisine Buffet";
    if (plateCost < 1000) plateQuality = "🥘 Classic Banquet Buffet";
    else if (plateCost > 2800) plateQuality = "👑 5-Star Gourmet / Experiential Counters";

    let photoCrew = "2-3 Crew (Cinematic + Candid)";
    if (guestsCount >= 450) photoCrew = "4-6 Crew (Drone + 4K Cinema + Traditional)";

    return {
      venue,
      venuePercent: Math.round(venueShare * 100),
      catering,
      cateringPercent: Math.round(cateringShare * 100),
      decor,
      decorPercent: Math.round(decorShare * 100),
      photo,
      photoPercent: Math.round(photoShare * 100),
      attire,
      attirePercent: Math.round(attireShare * 100),
      misc,
      miscPercent: Math.round(miscShare * 100),
      costPerGuest,
      plateCost,
      plateQuality,
      estimatedRooms,
      photoCrew,
    };
  }, [budgetVal, guestsCount, currentStyleConfig]);

  // Categories payload for saving
  const categoryItems = useMemo(() => {
    return [
      {
        category: "Venue",
        allocated: breakdown.venue,
        vendor_name: `${currentStyleConfig.name} Venue Booking`,
        notes: `Estimated capacity for ${guestsCount} guests + ~${breakdown.estimatedRooms} guest rooms`,
      },
      {
        category: "Catering",
        allocated: breakdown.catering,
        vendor_name: "Multi-Cuisine Catering Service",
        notes: `Estimated ~${formatExactINR(breakdown.plateCost)}/plate (${breakdown.plateQuality})`,
      },
      {
        category: "Decor",
        allocated: breakdown.decor,
        vendor_name: "Wedding Floral & Stage Stylist",
        notes: "Mandap design, entrance arch, ambient fairy lights & reception stage",
      },
      {
        category: "Photography",
        allocated: breakdown.photo,
        vendor_name: "Cinematic Wedding Studio",
        notes: `${breakdown.photoCrew} with drone and luxury photo album`,
      },
      {
        category: "Attire",
        allocated: breakdown.attire,
        vendor_name: "Bridal & Groom Couture",
        notes: "Bridal lehenga, groom sherwani, styling accessories & luxury makeup",
      },
      {
        category: "Entertainment",
        allocated: breakdown.misc,
        vendor_name: "Live Entertainment & Sound",
        notes: "Live DJ, dhol troupe, guest welcome hampers & digital invitations",
      },
    ];
  }, [breakdown, currentStyleConfig, guestsCount]);

  const handleTrackOrApply = async () => {
    setApplying(true);
    try {
      // Always store in localStorage for persistence
      localStorage.setItem("wedcraft_pending_budget", String(budgetVal));
      localStorage.setItem("wedcraft_pending_guest_count", String(guestsCount));
      localStorage.setItem("wedcraft_pending_style", selectedStyle);
      localStorage.setItem("wedcraft_pending_breakdown", JSON.stringify(categoryItems));

      // If user provided onApplyBudget callback (e.g. from Budget page)
      if (onApplyBudget) {
        await onApplyBudget(budgetVal, categoryItems);
        showToast("Budget & dynamic allocations applied to your wedding!", "success");
        setApplying(false);
        return;
      }

      // If user is currently logged in with active wedding
      if (user && wedding) {
        await supabase
          .from("weddings")
          .update({ total_budget: budgetVal })
          .eq("id", wedding.id);

        // Populate or update budget_items table
        for (const item of categoryItems) {
          await supabase.from("budget_items").insert({
            wedding_id: wedding.id,
            category: item.category,
            vendor_name: item.vendor_name,
            allocated: item.allocated,
            spent: 0,
            paid: false,
            notes: item.notes,
          });
        }

        if (refreshWedding) await refreshWedding();
        showToast(`Budget of ${formatINR(budgetVal)} applied with 6 category allocations!`, "success");
        router.push("/budget");
      } else {
        // Not logged in -> Redirect to signup
        showToast(`Saved ${formatINR(budgetVal)} budget plan! Create an account to start tracking.`, "success");
        router.push("/signup");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply budget";
      showToast(msg, "error");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="calculator-container card" style={{ padding: isEmbeddedInApp ? "24px" : "36px" }}>
      {/* Wedding Celebration Style Selector */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "var(--color-text, #1E293B)" }}>
          1. Choose Your Celebration Style:
        </label>
        <div className="calc-style-grid">
          {WEDDING_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              className={`calc-style-btn ${selectedStyle === style.id ? "active" : ""}`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <span className="calc-style-icon">{style.icon}</span>
              <span className="calc-style-name">{style.name}</span>
              <span className="calc-style-desc">{style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="calc-sliders-grid" style={{ marginBottom: "28px" }}>
        {/* Budget Slider */}
        <div className="calc-slider-box">
          <div className="slider-header">
            <label style={{ color: "var(--color-text, #1E293B)" }}>2. Total Estimated Budget:</label>
            <span className="slider-highlight">{formatINR(budgetVal)}</span>
          </div>
          <input
            type="range"
            min="200000"
            max="10000000"
            step="50000"
            value={budgetVal}
            onChange={(e) => setBudgetVal(Number(e.target.value))}
            className="custom-range"
          />
          <div className="slider-scale">
            <span>₹2 Lakhs</span>
            <span>₹25 Lakhs</span>
            <span>₹50 Lakhs</span>
            <span>₹1 Crore</span>
          </div>
          {/* Quick presets */}
          <div className="calc-preset-bar">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`calc-preset-pill ${budgetVal === preset.value ? "active" : ""}`}
                onClick={() => setBudgetVal(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Count Slider */}
        <div className="calc-slider-box">
          <div className="slider-header">
            <label style={{ color: "var(--color-text, #1E293B)" }}>3. Estimated Guest Count:</label>
            <span className="slider-highlight">{guestsCount} Guests</span>
          </div>
          <input
            type="range"
            min="30"
            max="1000"
            step="10"
            value={guestsCount}
            onChange={(e) => setGuestsCount(Number(e.target.value))}
            className="custom-range"
          />
          <div className="slider-scale">
            <span>30 Guests</span>
            <span>250 Guests</span>
            <span>500 Guests</span>
            <span>1000 Guests</span>
          </div>
          {/* Quick presets */}
          <div className="calc-preset-bar">
            {GUEST_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`calc-preset-pill ${guestsCount === preset.value ? "active" : ""}`}
                onClick={() => setGuestsCount(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Metrics Row */}
      <div className="calc-metrics-row">
        <div className="calc-metric-box">
          <span className="calc-metric-label">Cost Per Guest</span>
          <span className="calc-metric-value">{formatExactINR(breakdown.costPerGuest)}</span>
          <span className="calc-metric-sub">Across all celebrations</span>
        </div>
        <div className="calc-metric-box">
          <span className="calc-metric-label">Catering / Plate</span>
          <span className="calc-metric-value">{formatExactINR(breakdown.plateCost)}</span>
          <span className="calc-metric-sub">{breakdown.plateQuality}</span>
        </div>
        <div className="calc-metric-box">
          <span className="calc-metric-label">Recommended Stay</span>
          <span className="calc-metric-value">~{breakdown.estimatedRooms} Rooms</span>
          <span className="calc-metric-sub">For outstation family</span>
        </div>
        <div className="calc-metric-box">
          <span className="calc-metric-label">Photo & Cinema</span>
          <span className="calc-metric-value">{breakdown.photoCrew.split(" ")[0]} Crew</span>
          <span className="calc-metric-sub">Drone + 4K Cinema</span>
        </div>
      </div>

      {/* Multi-Color Allocation Bar */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "var(--color-text-secondary, #64748B)", marginBottom: "6px" }}>
          <span>AI-Optimized Budget Distribution</span>
          <span>Total: 100% ({formatExactINR(budgetVal)})</span>
        </div>
        <div className="calc-multi-bar">
          <div className="calc-bar-segment" style={{ width: `${breakdown.venuePercent}%`, background: "#753FC9" }} title={`Venue: ${breakdown.venuePercent}%`} />
          <div className="calc-bar-segment" style={{ width: `${breakdown.cateringPercent}%`, background: "#4AA564" }} title={`Catering: ${breakdown.cateringPercent}%`} />
          <div className="calc-bar-segment" style={{ width: `${breakdown.decorPercent}%`, background: "#FEBD3D" }} title={`Decor: ${breakdown.decorPercent}%`} />
          <div className="calc-bar-segment" style={{ width: `${breakdown.photoPercent}%`, background: "#3B82F6" }} title={`Photography: ${breakdown.photoPercent}%`} />
          <div className="calc-bar-segment" style={{ width: `${breakdown.attirePercent}%`, background: "#EC4899" }} title={`Attire: ${breakdown.attirePercent}%`} />
          <div className="calc-bar-segment" style={{ width: `${breakdown.miscPercent}%`, background: "#9B6FE0" }} title={`Entertainment: ${breakdown.miscPercent}%`} />
        </div>
      </div>

      {/* Dynamic Results Grid */}
      <div className="calc-results-grid" style={{ marginBottom: "28px" }}>
        {/* Venue */}
        <div className="calc-result-pill">
          <span className="pill-dot" style={{ background: "#753FC9" }}></span>
          <div className="calc-result-card-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill-name">Venue & Stay ({breakdown.venuePercent}%)</span>
              <span className="pill-val">{formatINR(breakdown.venue)}</span>
            </div>
            <div className="calc-card-insight">
              🏨 Banquet & lawn capacity for {guestsCount} guests + ~{breakdown.estimatedRooms} rooms
            </div>
          </div>
        </div>

        {/* Catering */}
        <div className="calc-result-pill">
          <span className="pill-dot" style={{ background: "#4AA564" }}></span>
          <div className="calc-result-card-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill-name">Catering & Bar ({breakdown.cateringPercent}%)</span>
              <span className="pill-val">{formatINR(breakdown.catering)}</span>
            </div>
            <div className="calc-card-insight">
              🥘 ~{formatExactINR(breakdown.plateCost)} / plate ({breakdown.plateQuality})
            </div>
          </div>
        </div>

        {/* Decor */}
        <div className="calc-result-pill">
          <span className="pill-dot" style={{ background: "#FEBD3D" }}></span>
          <div className="calc-result-card-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill-name">Decor & Florals ({breakdown.decorPercent}%)</span>
              <span className="pill-val">{formatINR(breakdown.decor)}</span>
            </div>
            <div className="calc-card-insight">
              🌸 Mandap, Sangeet backdrop, fairy lights & entrance arch
            </div>
          </div>
        </div>

        {/* Photography */}
        <div className="calc-result-pill">
          <span className="pill-dot" style={{ background: "#3B82F6" }}></span>
          <div className="calc-result-card-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill-name">Photo & Cinema ({breakdown.photoPercent}%)</span>
              <span className="pill-val">{formatINR(breakdown.photo)}</span>
            </div>
            <div className="calc-card-insight">
              📸 {breakdown.photoCrew} + teaser video & albums
            </div>
          </div>
        </div>

        {/* Attire */}
        <div className="calc-result-pill">
          <span className="pill-dot" style={{ background: "#EC4899" }}></span>
          <div className="calc-result-card-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill-name">Attire & Beauty ({breakdown.attirePercent}%)</span>
              <span className="pill-val">{formatINR(breakdown.attire)}</span>
            </div>
            <div className="calc-card-insight">
              👗 Bridal lehenga, groom sherwani & luxury bridal makeup
            </div>
          </div>
        </div>

        {/* Entertainment & Misc */}
        <div className="calc-result-pill">
          <span className="pill-dot" style={{ background: "#9B6FE0" }}></span>
          <div className="calc-result-card-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill-name">Music, Gifts & Misc ({breakdown.miscPercent}%)</span>
              <span className="pill-val">{formatINR(breakdown.misc)}</span>
            </div>
            <div className="calc-card-insight">
              🎵 DJ setup, dhol artists, wedding invitations & return gifts
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="calc-cta">
        <p>
          {user
            ? "Apply these 6 AI-recommended allocations directly to your live wedding tracker."
            : "Want to track vendor advances, payments, and contracts with this exact budget?"}
        </p>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleTrackOrApply}
          disabled={applying}
          style={{ minWidth: "260px" }}
        >
          {applying
            ? "Applying Allocations..."
            : user
            ? "Apply to My Wedding Plan 🎯"
            : "Track This Budget in WedCraft ✨"}
        </button>
      </div>
    </div>
  );
}
