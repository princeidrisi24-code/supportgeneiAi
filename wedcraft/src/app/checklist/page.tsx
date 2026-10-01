"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { createIssue, closeIssue, reopenIssue, isGitHubConfigured } from "@/lib/github";
import { showToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import type { Task } from "@/lib/database.types";

const CATEGORIES = [
  { name: "Venue & Logistics", icon: "🏰" },
  { name: "Catering & Food", icon: "🍽️" },
  { name: "Photography & Video", icon: "📸" },
  { name: "Attire & Beauty", icon: "👗" },
  { name: "Invitations", icon: "💌" },
  { name: "Decor & Flowers", icon: "🌸" },
  { name: "Entertainment", icon: "🎵" },
  { name: "Other", icon: "📦" },
];

function TaskModal({
  task,
  onClose,
  onSave,
  loading: saving,
}: {
  task?: Task | null;
  onClose: () => void;
  onSave: (taskData: { text: string; priority: 'high' | 'medium' | 'low'; due_date: string; assignee: string; category: string }) => void;
  loading: boolean;
}) {
  const isEditing = Boolean(task);
  const [text, setText] = useState(task?.text || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(task?.priority || "medium");
  const [due, setDue] = useState(task?.due_date || "");
  const [assignee, setAssignee] = useState(task?.assignee || "");
  const [category, setCategory] = useState(task?.category || CATEGORIES[0].name);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) { setError("Task description is required."); return; }
    if (text.trim().length < 3) { setError("Task must be at least 3 characters."); return; }
    onSave({ text: text.trim(), priority, due_date: due, assignee: assignee.trim(), category });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? "✏️ Edit Task" : "✨ Add New Task"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Task Description *</label>
          <input
            className="form-input"
            placeholder="e.g., Book the DJ for sangeet..."
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            maxLength={200}
            disabled={saving}
            autoFocus
          />
          <span className="form-helper" style={{ textAlign: 'right' }}>{text.length}/200</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={category} onChange={(e) => setCategory(e.target.value)} disabled={saving}>
              {CATEGORIES.map((cat) => (<option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-input form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
              disabled={saving}
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={due} onChange={(e) => setDue(e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <input className="form-input" placeholder="e.g., Rahul" value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={saving} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-tertiary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Task')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const { user, wedding, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"category" | "timeline">("category");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('fetchTasks error:', error);
      }
      const raw = data || [];
      const clean = raw.filter((t: any) => !['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7', 'task-8'].includes(t.id));
      setTasks(clean);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load tasks.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [wedding]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (wedding) fetchTasks();
  }, [authLoading, user, wedding, fetchTasks, router]);

  const handleSaveTask = async (taskData: { text: string; priority: 'high' | 'medium' | 'low'; due_date: string; assignee: string; category: string }) => {
    if (!wedding) {
      showToast('Wedding profile not loaded yet.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingTask) {
        const { data, error } = await supabase.from('tasks').update({
          text: taskData.text,
          priority: taskData.priority,
          due_date: taskData.due_date || null,
          assignee: taskData.assignee || '',
          category: taskData.category,
        }).eq('id', editingTask.id).select().single();
        if (error) throw error;
        setTasks(prev => prev.map(t => t.id === editingTask.id ? (data || { ...t, ...taskData }) : t));
        setShowModal(false);
        setEditingTask(null);
        showToast('Task updated successfully!', 'success');
      } else {
        const { data, error } = await supabase.from('tasks').insert({
          wedding_id: wedding.id,
          text: taskData.text,
          priority: taskData.priority,
          due_date: taskData.due_date || null,
          assignee: taskData.assignee || '',
          category: taskData.category,
          completed: false,
        }).select().single();
        if (error) throw error;
        if (data) {
          setTasks(prev => [data, ...prev]);
        } else {
          await fetchTasks();
        }
        setShowModal(false);
        setEditingTask(null);
        showToast('Task added successfully! 🎉', 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (editingTask ? 'Failed to update task.' : 'Failed to add task.');
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t));

    try {
      const { error } = await supabase.from('tasks').update({ completed: newCompleted }).eq('id', taskId);
      if (error) throw error;

      // GitHub sync
      if (task.github_issue_number) {
        if (newCompleted) {
          await closeIssue(task.github_issue_number);
        } else {
          await reopenIssue(task.github_issue_number);
        }
      }

      showToast(newCompleted ? 'Task completed! 🎉' : 'Task reopened.', 'success');
    } catch (err: unknown) {
      // Rollback
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: task.completed } : t));
      const msg = err instanceof Error ? err.message : 'Failed to update task.';
      showToast(msg, 'error');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setDeletingId(taskId);
    const taskBackup = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      showToast('Task deleted.', 'success');
    } catch (err: unknown) {
      if (taskBackup) setTasks(prev => [...prev, taskBackup]);
      const msg = err instanceof Error ? err.message : 'Failed to delete task.';
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const syncToGitHub = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.github_issue_number) { showToast('Already synced to GitHub.', 'info'); return; }

    setSyncingId(taskId);
    try {
      const issue = await createIssue(
        task.text,
        `**Category:** ${task.category}\n**Priority:** ${task.priority}\n**Assignee:** ${task.assignee || 'Unassigned'}\n**Due:** ${task.due_date || 'No date'}\n\n---\n*Created from WedCraft*`,
        [task.priority, task.category.toLowerCase().replace(/[^a-z]/g, '-')]
      );
      if (!issue) throw new Error('GitHub API returned no data.');

      const { error } = await supabase.from('tasks').update({ github_issue_number: issue.number }).eq('id', taskId);
      if (error) throw error;

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, github_issue_number: issue.number } : t));
      showToast(`Synced to GitHub Issue #${issue.number}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sync to GitHub.';
      showToast(msg, 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed" && !task.completed) return false;
    if (filter === "pending" && task.completed) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (searchQuery && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by category
  const grouped = new Map<string, Task[]>();
  filteredTasks.forEach(task => {
    const cat = task.category || 'Other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(task);
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner size={48} message="Loading checklist..." />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>✨ Stay on track</p>
        <h1>Wedding Checklist</h1>
        <p>Your personalized wedding planning timeline</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        {[
          { label: "Total Tasks", value: totalTasks, icon: "📋", color: "rose" },
          { label: "Completed", value: completedTasks, icon: "✅", color: "green" },
          { label: "Pending", value: pendingTasks, icon: "⏳", color: "gold" },
          { label: "High Priority", value: highPriority, icon: "🔥", color: "danger" },
        ].map((stat, idx) => (
          <div key={stat.label} className="card animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="stat-card">
              <div className={`card-icon ${stat.color}`}>{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card animate-fade-in-up" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span className="font-semibold">Overall Progress</span>
          <span className="font-bold" style={{ color: "var(--color-primary)" }}>{overallPercent}%</span>
        </div>
        <div className="progress-bar" style={{ height: "10px" }}>
          <div className="progress-bar-fill" style={{ width: `${overallPercent}%` }} />
        </div>
        <div className="text-xs text-muted" style={{ marginTop: "8px" }}>{completedTasks} of {totalTasks} tasks completed</div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {(["all", "pending", "completed"] as const).map(f => (
              <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "pending" ? "Pending" : "Done"}
              </button>
            ))}
          </div>
          <div style={{ display: "inline-flex", background: "var(--color-divider)", padding: "3px", borderRadius: "10px", gap: "2px" }}>
            <button
              className={`btn btn-sm ${viewMode === "category" ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
              onClick={() => setViewMode("category")}
            >
              📁 Category View
            </button>
            <button
              className={`btn btn-sm ${viewMode === "timeline" ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
              onClick={() => setViewMode("timeline")}
            >
              ⏳ Timeline View
            </button>
          </div>
        </div>
        <div className="toolbar-right">
          {(["high", "medium", "low"] as const).map(p => (
            <button key={p} className={`filter-chip ${priorityFilter === p ? "active" : ""}`}
              onClick={() => setPriorityFilter(priorityFilter === p ? "all" : p)}>
              {p === "high" ? "🔴" : p === "medium" ? "🟡" : "🟢"} {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>+ Add Task</button>
        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">{tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}</div>
          <div className="empty-state-text">{tasks.length === 0 ? 'Start by adding your first wedding task!' : 'Try adjusting your search or filters.'}</div>
          {tasks.length === 0 && (
            <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>+ Add Your First Task</button>
          )}
        </div>
      ) : viewMode === "timeline" ? (
        /* Timeline View */
        <div className="timeline-container" style={{ position: "relative", paddingLeft: "24px" }}>
          {/* Vertical central bar */}
          <div
            style={{
              position: "absolute",
              left: "7px",
              top: "14px",
              bottom: "14px",
              width: "2px",
              background: "linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
              borderRadius: "2px",
            }}
          />

          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const buckets = [
              { id: 'overdue', title: 'Overdue Items', badge: 'Action Required', icon: '⚠️', color: 'var(--color-error)', tasks: [] as Task[] },
              { id: 'this_week', title: 'This Week', badge: 'Next 7 Days', icon: '⚡', color: '#F59E0B', tasks: [] as Task[] },
              { id: 'this_month', title: 'This Month', badge: 'Next 30 Days', icon: '📅', color: 'var(--color-primary)', tasks: [] as Task[] },
              { id: 'one_to_three', title: '1 – 3 Months Out', badge: 'Upcoming Milestone', icon: '🌸', color: '#EC4899', tasks: [] as Task[] },
              { id: 'three_to_six', title: '3 – 6 Months Out', badge: 'Mid-term Planning', icon: '💐', color: '#8B5CF6', tasks: [] as Task[] },
              { id: 'six_plus', title: '6+ Months Out', badge: 'Long-term Planning', icon: '🏰', color: '#3B82F6', tasks: [] as Task[] },
              { id: 'flexible', title: 'Flexible / Someday', badge: 'No Date Set', icon: '📝', color: '#6B7280', tasks: [] as Task[] },
            ];

            filteredTasks.forEach(task => {
              if (!task.due_date) {
                buckets[6].tasks.push(task);
                return;
              }
              const due = new Date(task.due_date);
              due.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays < 0 && !task.completed) {
                buckets[0].tasks.push(task);
              } else if (diffDays <= 7) {
                buckets[1].tasks.push(task);
              } else if (diffDays <= 30) {
                buckets[2].tasks.push(task);
              } else if (diffDays <= 90) {
                buckets[3].tasks.push(task);
              } else if (diffDays <= 180) {
                buckets[4].tasks.push(task);
              } else {
                buckets[5].tasks.push(task);
              }
            });

            const activeBuckets = buckets.filter(b => b.tasks.length > 0);

            return activeBuckets.map((bucket) => {
              const bCompleted = bucket.tasks.filter(t => t.completed).length;
              const bTotal = bucket.tasks.length;
              const bPercent = Math.round((bCompleted / bTotal) * 100);

              return (
                <div key={bucket.id} style={{ marginBottom: "32px", position: "relative" }}>
                  {/* Timeline Node Icon */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-24px",
                      top: "2px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: bucket.color,
                      border: "3px solid var(--color-surface)",
                      boxShadow: "0 0 0 2px " + bucket.color,
                    }}
                  />

                  {/* Bucket Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{bucket.icon}</span>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>{bucket.title}</h3>
                      <span className="badge" style={{ fontSize: "11px", background: "var(--color-divider)", color: "var(--color-text-secondary)" }}>
                        {bucket.badge}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="text-xs text-muted">{bCompleted}/{bTotal} done</span>
                      <div className="progress-bar" style={{ width: "80px", height: "6px" }}>
                        <div className="progress-bar-fill" style={{ width: `${bPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="card" style={{ padding: "8px 16px" }}>
                    <div className="task-list">
                      {bucket.tasks.map((task) => {
                        let countdownText = "";
                        let isOverdue = false;
                        if (task.due_date) {
                          const due = new Date(task.due_date);
                          due.setHours(0, 0, 0, 0);
                          const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (diff < 0) {
                            countdownText = `${Math.abs(diff)}d overdue`;
                            isOverdue = !task.completed;
                          } else if (diff === 0) {
                            countdownText = "Due today";
                          } else if (diff === 1) {
                            countdownText = "Due tomorrow";
                          } else {
                            countdownText = `In ${diff} days`;
                          }
                        }

                        return (
                          <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                            <div className={`task-priority ${task.priority}`} />
                            <div className={`task-checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task.id)}>
                              {task.completed && <span style={{ fontSize: "12px" }}>✓</span>}
                            </div>
                            <div className="task-content">
                              <div className="task-text">{task.text}</div>
                              <div className="task-meta">
                                {task.category && (
                                  <span className="badge" style={{ fontSize: "11px", background: "var(--color-primary-subtle)", color: "var(--color-primary)" }}>
                                    {task.category}
                                  </span>
                                )}
                                {task.due_date && (
                                  <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                                    📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {countdownText && ` (${countdownText})`}
                                  </span>
                                )}
                                </div>
                            </div>
                            {task.assignee && <div className="task-assignee">{task.assignee.charAt(0)}</div>}
                            <div className="task-actions">
                              <button className="btn btn-icon btn-ghost" title="Edit task"
                                onClick={() => { setEditingTask(task); setShowModal(true); }}
                                style={{ fontSize: "14px" }}>
                                ✏️
                              </button>
                              <button className="btn btn-icon btn-ghost" title="Delete task"
                                onClick={() => deleteTask(task.id)} disabled={deletingId === task.id}
                                style={{ fontSize: "14px" }}>
                                {deletingId === task.id ? '⏳' : '🗑️'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        /* Tasks grouped by category */
        Array.from(grouped.entries()).map(([catName, catTasks]) => {
          const catInfo = CATEGORIES.find(c => c.name === catName) || { icon: "📦" };
          const catCompleted = catTasks.filter(t => t.completed).length;
          const catPercent = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;

          return (
            <div key={catName} className="card task-category">
              <div className="task-category-header">
                <div className="task-category-title">
                  <span className="task-category-icon">{catInfo.icon}</span>
                  <span>{catName}</span>
                  <span className="task-category-count">{catCompleted}/{catTasks.length}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="progress-bar" style={{ width: "100px", height: "6px" }}>
                    <div className="progress-bar-fill" style={{ width: `${catPercent}%` }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{catPercent}%</span>
                </div>
              </div>

              <div className="task-list">
                {catTasks.map((task) => (
                  <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                    <div className={`task-priority ${task.priority}`} />
                    <div className={`task-checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task.id)}>
                      {task.completed && <span style={{ fontSize: "12px" }}>✓</span>}
                    </div>
                    <div className="task-content">
                      <div className="task-text">{task.text}</div>
                      <div className="task-meta">
                        {task.due_date && (
                          <span className={`task-due ${new Date(task.due_date) < new Date() && !task.completed ? 'overdue' : ''}`}>
                            📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.assignee && <div className="task-assignee">{task.assignee.charAt(0)}</div>}
                    <div className="task-actions">
                      <button className="btn btn-icon btn-ghost" title="Edit task"
                        onClick={() => { setEditingTask(task); setShowModal(true); }}
                        style={{ fontSize: "14px" }}>
                        ✏️
                      </button>
                      <button className="btn btn-icon btn-ghost" title="Delete task"
                        onClick={() => deleteTask(task.id)} disabled={deletingId === task.id}
                        style={{ fontSize: "14px" }}>
                        {deletingId === task.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSaveTask}
          loading={saving}
        />
      )}
    </div>
  );
}
