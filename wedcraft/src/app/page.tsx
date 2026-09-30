"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./components/LoadingSpinner";
import LandingPage from "./components/LandingPage";
import type { Task, BudgetItem, Guest, Vendor } from "@/lib/database.types";

// --- Countdown Timer ---
function CountdownTimer({ weddingDate, venue, city }: { weddingDate: string; venue?: string; city?: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(weddingDate).getTime();
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
  }, [weddingDate]);

  const dateStr = new Date(weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const locationParts = [venue, city].filter(Boolean).join(' · ');

  return (
    <div className="countdown-container">
      <div className="countdown-label">Your Big Day</div>
      <div className="countdown-date">{dateStr}{locationParts ? ` · ${locationParts}` : ''}</div>
      <div className="countdown-grid">
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.days}</span>
          <span className="countdown-unit">Days</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-item">
          <span className="countdown-number">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="countdown-unit">Hours</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-item">
          <span className="countdown-number">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="countdown-unit">Minutes</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-item">
          <span className="countdown-number">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="countdown-unit">Seconds</span>
        </div>
      </div>
    </div>
  );
}

// --- Progress Ring ---
function ProgressRing({ percent, size = 120, stroke = 8 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#753FC9" />
            <stop offset="100%" stopColor="#9B6FE0" />
          </linearGradient>
        </defs>
        <circle className="progress-ring-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
        <circle className="progress-ring-fill" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} stroke="url(#ringGradient)" />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-value">{percent}%</span>
        <span className="progress-ring-label">Spent</span>
      </div>
    </div>
  );
}

interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  totalSpent: number;
  totalGuests: number;
  acceptedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  totalVendors: number;
  bookedVendors: number;
  upcomingTasks: { id: string; text: string; due_date: string | null; priority: string; assignee: string; category: string }[];
  budgetCategories: { category: string; allocated: number; spent: number }[];
}

export default function DashboardPage() {
  const { user, wedding, loading: authLoading, resetToFresh } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');

  const handleResetToFresh = async () => {
    if (!confirm('Clear all mock/starter data and start with an empty fresh workspace?')) return;
    setClearing(true);
    try {
      await resetToFresh();
      window.location.reload();
    } catch {
      setClearing(false);
    }
  };

  const fetchDashboard = useCallback(async () => {
    if (!wedding) return;
    setLoading(true);
    setError('');

    try {
      const wid = wedding.id;

      // Fetch all data in parallel
      const [tasksRes, budgetRes, guestsRes, vendorsRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('wedding_id', wid).order('due_date', { ascending: true, nullsFirst: false }),
        supabase.from('budget_items').select('*').eq('wedding_id', wid),
        supabase.from('guests').select('*').eq('wedding_id', wid),
        supabase.from('vendors').select('*').eq('wedding_id', wid),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (budgetRes.error) throw budgetRes.error;
      if (guestsRes.error) throw guestsRes.error;
      if (vendorsRes.error) throw vendorsRes.error;

      const rawTasks: Task[] = (tasksRes.data as any) || [];
      const rawBudget: BudgetItem[] = (budgetRes.data as any) || [];
      const rawGuests: Guest[] = (guestsRes.data as any) || [];
      const rawVendors: Vendor[] = (vendorsRes.data as any) || [];

      // Filter out any residual mock items
      const tasks = rawTasks.filter(t => !t.id?.startsWith('task-') && !t.text?.includes('Finalize and book primary wedding venue'));
      const budgetItems = rawBudget.filter(b => !b.id?.startsWith('b-') && !b.vendor_name?.includes('Grand Heritage'));
      const guests = rawGuests.filter(g => !g.id?.startsWith('g-') && !g.name?.includes('Vikram & Ananya'));
      const vendors = rawVendors.filter(v => !v.id?.startsWith('v-') && !v.name?.includes('Grand Heritage'));

      // Aggregate budget by category
      const budgetMap = new Map<string, { allocated: number; spent: number }>();
      budgetItems.forEach(item => {
        const existing = budgetMap.get(item.category) || { allocated: 0, spent: 0 };
        existing.allocated += Number(item.allocated);
        existing.spent += Number(item.spent);
        budgetMap.set(item.category, existing);
      });

      const budgetCategories = Array.from(budgetMap.entries()).map(([category, vals]) => ({
        category,
        ...vals,
      }));

      setData({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        totalBudget: Number(wedding.total_budget),
        totalSpent: budgetItems.reduce((sum, b) => sum + Number(b.spent), 0),
        totalGuests: guests.length,
        acceptedGuests: guests.filter(g => g.rsvp_status === 'accepted').length,
        declinedGuests: guests.filter(g => g.rsvp_status === 'declined').length,
        pendingGuests: guests.filter(g => g.rsvp_status === 'pending' || g.rsvp_status === 'maybe').length,
        totalVendors: vendors.length,
        bookedVendors: vendors.filter(v => v.status === 'booked').length,
        upcomingTasks: tasks.filter(t => !t.completed).slice(0, 5),
        budgetCategories,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [wedding]);

  useEffect(() => {
    if (wedding) fetchDashboard();
  }, [wedding, fetchDashboard]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner size={48} message="Loading your wedding dashboard..." />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner size={48} message="Loading your wedding dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Something went wrong</div>
        <div className="empty-state-text">{error}</div>
        <button className="btn btn-primary" onClick={fetchDashboard}>Try Again</button>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💒</div>
        <div className="empty-state-title">No Wedding Found</div>
        <div className="empty-state-text">It looks like your wedding details haven&apos;t been set up yet. Please sign out and create a new account.</div>
      </div>
    );
  }

  if (!data) return null;

  const p1 = wedding.partner1_name;
  const p2 = wedding.partner2_name;
  const taskPercent = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  const budgetPercent = data.totalBudget > 0 ? Math.round((data.totalSpent / data.totalBudget) * 100) : 0;
  const rsvpPercent = data.totalGuests > 0 ? Math.round((data.acceptedGuests / data.totalGuests) * 100) : 0;

  const formatCurrency = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  const stats = [
    { label: "Tasks Done", value: `${data.completedTasks}/${data.totalTasks}`, icon: "📋", color: "rose", change: data.totalTasks > 0 ? `${taskPercent}% complete` : "No tasks yet", positive: taskPercent > 50 },
    { label: "Budget Spent", value: formatCurrency(data.totalSpent), icon: "💰", color: "gold", change: data.totalBudget > 0 ? `${budgetPercent}% of total` : (data.totalSpent > 0 ? `${formatCurrency(data.totalSpent)} spent` : "Budget not set"), positive: data.totalBudget > 0 ? budgetPercent < 80 : true },
    { label: "Guests RSVPd", value: `${data.acceptedGuests}/${data.totalGuests}`, icon: "👥", color: "plum", change: data.totalGuests > 0 ? `${rsvpPercent}% accepted` : "No guests yet", positive: rsvpPercent > 50 },
    { label: "Vendors Booked", value: `${data.bookedVendors}/${data.totalVendors}`, icon: "🏪", color: "green", change: data.totalVendors > 0 ? `${data.totalVendors - data.bookedVendors} pending` : "No vendors yet", positive: data.totalVendors === 0 || data.bookedVendors >= data.totalVendors },
  ];

  const COLORS = ['#753FC9', '#FEBD3D', '#4AA564', '#FFA500', '#C62828', '#3B82F6', '#9B6FE0', '#FF6B6B'];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>
            ✨ Welcome back, {p1} & {p2}
          </p>
          <h1>Wedding Dashboard</h1>
          <p>Your wedding planning progress at a glance</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '13px', padding: '8px 14px' }}
          onClick={handleResetToFresh}
          disabled={clearing}
          title="Clear all mock data and start with a completely fresh workspace"
        >
          {clearing ? '🧹 Clearing...' : '🧹 Start Fresh / Clear Data'}
        </button>
      </div>

      {/* Countdown */}
      <div className="animate-fade-in-up" style={{ marginBottom: "24px" }}>
        <CountdownTimer weddingDate={wedding.wedding_date} venue={wedding.venue} city={wedding.city} />
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        {stats.map((stat, idx) => (
          <div key={stat.label} className="card animate-fade-in-up" style={{ animationDelay: `${idx * 0.08}s` }}>
            <div className="stat-card">
              <div className={`card-icon ${stat.color}`}>{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-change ${stat.positive ? "positive" : "negative"}`}>{stat.change}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid-3" style={{ gridTemplateColumns: "1fr 1fr 300px" }}>
        {/* Upcoming Tasks */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-header">
            <div>
              <div className="card-title">Upcoming Tasks</div>
              <div className="card-subtitle">Your next priorities</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => router.push('/checklist')}>View All →</button>
          </div>
          {data.upcomingTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
              <p style={{ fontSize: '14px' }}>No pending tasks! Add some in the Checklist.</p>
            </div>
          ) : (
            <div className="task-list">
              {data.upcomingTasks.map((task, idx) => (
                <div key={task.id} className="task-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className={`task-priority ${task.priority}`} />
                  <div className="task-content">
                    <div className="task-text">{task.text}</div>
                    <div className="task-meta">
                      {task.due_date && (
                        <span className="task-due">📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                      {task.category && <span className="badge badge-purple" style={{ fontSize: '10px' }}>{task.category}</span>}
                    </div>
                  </div>
                  {task.assignee && <div className="task-assignee">{task.assignee.charAt(0)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Overview */}
        <div className="card animate-fade-in-up stagger-3">
          <div className="card-header">
            <div>
              <div className="card-title">Budget Overview</div>
              <div className="card-subtitle">{formatCurrency(data.totalBudget)} total budget</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => router.push('/budget')}>Details →</button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <ProgressRing percent={budgetPercent} size={130} stroke={10} />
          </div>

          {data.budgetCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              No budget items yet. Add some in the Budget page.
            </div>
          ) : (
            <div>
              {data.budgetCategories.slice(0, 5).map((item, idx) => (
                <div key={item.category} className="budget-category-item" style={{ padding: "10px 0" }}>
                  <div className="budget-category-color" style={{ background: COLORS[idx % COLORS.length] }} />
                  <div className="budget-category-info">
                    <div className="budget-category-name">{item.category}</div>
                    <div style={{ marginTop: "4px" }}>
                      <div className="progress-bar" style={{ height: "4px" }}>
                        <div className="progress-bar-fill" style={{
                          width: `${item.allocated > 0 ? Math.min(100, (item.spent / item.allocated) * 100) : 0}%`,
                          background: COLORS[idx % COLORS.length],
                        }} />
                      </div>
                    </div>
                  </div>
                  <div className="budget-category-amount">
                    {formatCurrency(item.spent)}
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>/ {formatCurrency(item.allocated)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* RSVP Status */}
          <div className="card card-gradient animate-fade-in-up stagger-4">
            <div className="card-title" style={{ marginBottom: "12px", fontSize: "16px" }}>💌 RSVP Status</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div className="font-bold" style={{ fontSize: "20px", color: "var(--color-success)" }}>{data.acceptedGuests}</div>
                <div className="text-xs text-muted">Accepted</div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div className="font-bold" style={{ fontSize: "20px", color: "var(--color-error)" }}>{data.declinedGuests}</div>
                <div className="text-xs text-muted">Declined</div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div className="font-bold" style={{ fontSize: "20px", color: "var(--color-warning)" }}>{data.pendingGuests}</div>
                <div className="text-xs text-muted">Pending</div>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill green" style={{ width: `${rsvpPercent}%` }} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card animate-fade-in-up stagger-5">
            <div className="card-title" style={{ marginBottom: "12px", fontSize: "16px" }}>⚡ Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => router.push('/checklist')}>📋 Add a task</button>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => router.push('/budget')}>💰 Add expense</button>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => router.push('/guests')}>👥 Add guest</button>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => router.push('/vendors')}>🏪 Add vendor</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
