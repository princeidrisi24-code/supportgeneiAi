"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import type { BudgetItem } from "@/lib/database.types";

const BUDGET_CATEGORIES = ["Venue", "Catering", "Photography", "Decor", "Attire", "Entertainment", "Invitations", "Makeup & Beauty", "Transport", "Gifts & Favors", "Honeymoon", "Other"];
const COLORS = ['#753FC9', '#FEBD3D', '#4AA564', '#FFA500', '#C62828', '#3B82F6', '#9B6FE0', '#FF6B6B', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

function BudgetModal({ onClose, onSave, item, saving }: {
  onClose: () => void;
  onSave: (data: Partial<BudgetItem>) => void;
  item?: BudgetItem | null;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    category: item?.category || BUDGET_CATEGORIES[0],
    vendor_name: item?.vendor_name || '',
    allocated: item?.allocated?.toString() || '',
    spent: item?.spent?.toString() || '',
    paid: item?.paid || false,
    notes: item?.notes || '',
  });
  const [error, setError] = useState('');

  const update = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = () => {
    if (!form.category) { setError('Category is required.'); return; }
    const allocated = parseFloat(form.allocated) || 0;
    const spent = parseFloat(form.spent) || 0;
    if (allocated < 0 || spent < 0) { setError('Amounts cannot be negative.'); return; }
    if (spent > allocated * 2) { setError('Spent amount seems unusually high. Please verify.'); return; }

    onSave({
      category: form.category,
      vendor_name: form.vendor_name.trim(),
      allocated,
      spent,
      paid: form.paid,
      notes: form.notes.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{item ? '✏️ Edit Budget Item' : '💰 Add Budget Item'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input form-select" value={form.category} onChange={e => update('category', e.target.value)} disabled={saving}>
              {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Vendor Name</label>
            <input className="form-input" placeholder="e.g., Raj Caterers" value={form.vendor_name}
              onChange={e => update('vendor_name', e.target.value)} disabled={saving} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Allocated (₹)</label>
            <input className="form-input" type="number" min="0" step="1000" placeholder="0"
              value={form.allocated} onChange={e => update('allocated', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Spent (₹)</label>
            <input className="form-input" type="number" min="0" step="100" placeholder="0"
              value={form.spent} onChange={e => update('spent', e.target.value)} disabled={saving} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input form-textarea" placeholder="Any additional details..."
            value={form.notes} onChange={e => update('notes', e.target.value)} disabled={saving} rows={2} />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={form.paid} onChange={e => update('paid', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} disabled={saving} />
          <label className="form-label" style={{ margin: 0 }}>Mark as fully paid</label>
        </div>

        <div className="modal-footer">
          <button className="btn btn-tertiary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : item ? 'Update' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const { user, wedding, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchBudget = useCallback(async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('budget_items').select('*').eq('wedding_id', wedding.id).order('created_at', { ascending: false });
      const raw = data || [];
      const clean = raw.filter((b: any) => !b.id?.startsWith('b-') && !b.vendor_name?.includes('Grand Heritage'));
      setItems(clean);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load budget.', 'error');
    } finally {
      setLoading(false);
    }
  }, [wedding]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (wedding) fetchBudget();
  }, [authLoading, user, wedding, fetchBudget, router]);

  const saveItem = async (data: Partial<BudgetItem>) => {
    if (!wedding) return;
    setSaving(true);
    try {
      if (editingItem) {
        const { data: updated, error } = await supabase.from('budget_items').update(data).eq('id', editingItem.id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
        showToast('Budget item updated!', 'success');
      } else {
        const { data: created, error } = await supabase.from('budget_items').insert({ ...data, category: data.category || 'Other', wedding_id: wedding.id }).select().single();
        if (error) throw error;
        setItems(prev => [created, ...prev]);
        showToast('Budget item added!', 'success');
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this budget item?')) return;
    const backup = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      const { error } = await supabase.from('budget_items').delete().eq('id', id);
      if (error) throw error;
      showToast('Budget item deleted.', 'success');
    } catch (err: unknown) {
      if (backup) setItems(prev => [...prev, backup]);
      showToast(err instanceof Error ? err.message : 'Failed to delete.', 'error');
    }
  };

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const totalBudget = Number(wedding?.total_budget || 0);
  const totalAllocated = items.reduce((s, i) => s + Number(i.allocated), 0);
  const totalSpent = items.reduce((s, i) => s + Number(i.spent), 0);
  const remaining = totalBudget - totalSpent;
  const paidCount = items.filter(i => i.paid).length;

  const filteredItems = categoryFilter === 'all' ? items : items.filter(i => i.category === categoryFilter);
  const usedCategories = [...new Set(items.map(i => i.category))];

  if (authLoading || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoadingSpinner size={48} message="Loading budget..." />
    </div>;
  }

  return (
    <div>
      <div className="page-header">
        <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>💰 Financial overview</p>
        <h1>Wedding Budget</h1>
        <p>Track every rupee of your wedding expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="budget-summary">
        {[
          { label: "Total Budget", value: fmt(totalBudget), cls: "total" },
          { label: "Allocated", value: fmt(totalAllocated), cls: "spent" },
          { label: "Total Spent", value: fmt(totalSpent), cls: "spent" },
          { label: "Remaining", value: fmt(Math.max(0, remaining)), cls: remaining >= 0 ? "remaining" : "pending" },
        ].map(s => (
          <div key={s.label} className="card budget-card animate-fade-in-up">
            <div className={`budget-amount ${s.cls}`}>{s.value}</div>
            <div className="budget-label">{s.label}</div>
          </div>
        ))}
      </div>

      {remaining < 0 && (
        <div className="auth-error" style={{ marginBottom: '24px' }}>
          ⚠️ You are over budget by {fmt(Math.abs(remaining))}! Consider reviewing your expenses.
        </div>
      )}

      {/* Budget Breakdown Chart */}
      {items.length > 0 && (
        <div className="card animate-fade-in-up" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">📊 Spending by Category</div>
              <div className="card-subtitle">{usedCategories.length} categories</div>
            </div>
            <div className="text-sm text-muted">
              {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '0%'} of budget used
            </div>
          </div>

          {/* Overall progress */}
          <div style={{ marginBottom: '20px' }}>
            <div className="progress-bar" style={{ height: '10px' }}>
              <div className="progress-bar-fill" style={{
                width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%`,
                background: totalSpent > totalBudget ? 'var(--color-error)' : undefined,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span className="text-xs text-muted">Spent: {fmt(totalSpent)}</span>
              <span className="text-xs text-muted">Budget: {fmt(totalBudget)}</span>
            </div>
          </div>

          {/* Category breakdown bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {usedCategories.map((cat, idx) => {
              const catItems = items.filter(i => i.category === cat);
              const catAllocated = catItems.reduce((s, i) => s + Number(i.allocated), 0);
              const catSpent = catItems.reduce((s, i) => s + Number(i.spent), 0);
              const catPercent = catAllocated > 0 ? Math.min(100, (catSpent / catAllocated) * 100) : 0;
              const overBudget = catSpent > catAllocated && catAllocated > 0;

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx % COLORS.length], flexShrink: 0 }} />
                      <span className="text-sm font-semibold">{cat}</span>
                      <span className="text-xs text-muted">({catItems.length} items)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`text-sm ${overBudget ? 'font-bold' : ''}`} style={{ color: overBudget ? 'var(--color-error)' : undefined }}>
                        {fmt(catSpent)}
                      </span>
                      <span className="text-xs text-muted">/ {fmt(catAllocated)}</span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-bar-fill" style={{
                      width: `${catPercent}%`,
                      background: overBudget ? 'var(--color-error)' : COLORS[idx % COLORS.length],
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual pie representation */}
          {totalSpent > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
              {usedCategories.map((cat, idx) => {
                const catSpent = items.filter(i => i.category === cat).reduce((s, i) => s + Number(i.spent), 0);
                const pct = totalSpent > 0 ? Math.round((catSpent / totalSpent) * 100) : 0;
                if (pct < 1) return null;
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: `${COLORS[idx % COLORS.length]}15`, border: `1px solid ${COLORS[idx % COLORS.length]}30`, fontSize: '12px', fontWeight: 500 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                    {cat}: {pct}%
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <select className="form-input form-select" style={{ width: '200px', height: '40px' }}
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories ({items.length})</option>
            {usedCategories.map(c => (
              <option key={c} value={c}>{c} ({items.filter(i => i.category === c).length})</option>
            ))}
          </select>
          <span className="text-sm text-muted">{paidCount} of {items.length} paid</span>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
            + Add Expense
          </button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-title">{items.length === 0 ? 'No budget items yet' : 'No items in this category'}</div>
          <div className="empty-state-text">{items.length === 0 ? 'Start tracking your wedding expenses!' : 'Try selecting a different category.'}</div>
          {items.length === 0 && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add First Expense</button>}
        </div>
      ) : (
        <div className="card">
          <table className="guest-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Vendor</th>
                <th style={{ textAlign: 'right' }}>Allocated</th>
                <th style={{ textAlign: 'right' }}>Spent</th>
                <th>Progress</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const pct = Number(item.allocated) > 0 ? Math.min(100, (Number(item.spent) / Number(item.allocated)) * 100) : 0;
                const overBudget = Number(item.spent) > Number(item.allocated) && Number(item.allocated) > 0;
                return (
                  <tr key={item.id} style={{ animationDelay: `${idx * 0.03}s` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[BUDGET_CATEGORIES.indexOf(item.category) % COLORS.length], flexShrink: 0 }} />
                        <span className="font-semibold">{item.category}</span>
                      </div>
                    </td>
                    <td>{item.vendor_name || <span className="text-muted">—</span>}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(Number(item.allocated))}</td>
                    <td style={{ textAlign: 'right', color: overBudget ? 'var(--color-error)' : undefined, fontWeight: overBudget ? 700 : 400 }}>
                      {fmt(Number(item.spent))}
                    </td>
                    <td style={{ width: '120px' }}>
                      <div className="progress-bar" style={{ height: '6px' }}>
                        <div className="progress-bar-fill" style={{
                          width: `${pct}%`,
                          background: overBudget ? 'var(--color-error)' : undefined,
                        }} />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.paid ? 'badge-green' : overBudget ? 'badge-red' : 'badge-orange'}`}>
                        {item.paid ? 'Paid' : overBudget ? 'Over' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-icon btn-ghost" title="Edit" style={{ fontSize: '14px' }}
                          onClick={() => { setEditingItem(item); setShowModal(true); }}>✏️</button>
                        <button className="btn btn-icon btn-ghost" title="Delete" style={{ fontSize: '14px' }}
                          onClick={() => deleteItem(item.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <BudgetModal onClose={() => { setShowModal(false); setEditingItem(null); }} onSave={saveItem} item={editingItem} saving={saving} />}
    </div>
  );
}
