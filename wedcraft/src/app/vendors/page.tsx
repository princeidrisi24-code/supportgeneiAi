"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import type { Vendor } from "@/lib/database.types";

type VendorStatus = 'booked' | 'pending' | 'cancelled' | 'contacted';

const VENDOR_CATEGORIES = ["Venue", "Catering", "Photography", "Videography", "Decor & Flowers", "Music & DJ", "Makeup & Beauty", "Mehendi", "Invitations", "Transport", "Pandit/Priest", "Jeweler", "Other"];

function VendorModal({ onClose, onSave, vendor, saving }: {
  onClose: () => void;
  onSave: (data: Partial<Vendor>) => void;
  vendor?: Vendor | null;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    name: vendor?.name || '',
    category: vendor?.category || VENDOR_CATEGORIES[0],
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    cost: vendor?.cost?.toString() || '',
    status: (vendor?.status || 'contacted') as VendorStatus,
    notes: vendor?.notes || '',
  });
  const [error, setError] = useState('');

  const update = (field: string, value: string) => { setForm(prev => ({ ...prev, [field]: value })); setError(''); };

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Vendor name is required.'); return; }
    if (form.name.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Invalid email address.'); return; }
    if (form.phone && !/^[\d\s+\-()]{7,15}$/.test(form.phone)) { setError('Invalid phone number.'); return; }
    const cost = parseFloat(form.cost) || 0;
    if (cost < 0) { setError('Cost cannot be negative.'); return; }

    onSave({
      name: form.name.trim(),
      category: form.category,
      phone: form.phone.trim(),
      email: form.email.trim(),
      cost,
      status: form.status,
      notes: form.notes.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{vendor ? '✏️ Edit Vendor' : '🏪 Add Vendor'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Vendor Name *</label>
            <input className="form-input" placeholder="e.g., Raj Caterers" value={form.name}
              onChange={e => update('name', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={form.category} onChange={e => update('category', e.target.value)} disabled={saving}>
              {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone}
              onChange={e => update('phone', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="vendor@email.com" value={form.email}
              onChange={e => update('email', e.target.value)} disabled={saving} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Cost (₹)</label>
            <input className="form-input" type="number" min="0" step="1000" placeholder="0" value={form.cost}
              onChange={e => update('cost', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input form-select" value={form.status} onChange={e => update('status', e.target.value)} disabled={saving}>
              <option value="contacted">📞 Contacted</option>
              <option value="pending">⏳ Pending</option>
              <option value="booked">✅ Booked</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input form-textarea" placeholder="Any notes about this vendor..." value={form.notes}
            onChange={e => update('notes', e.target.value)} disabled={saving} rows={3} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-tertiary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : vendor ? 'Update Vendor' : 'Add Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const { user, wedding, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchVendors = useCallback(async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vendors').select('*').eq('wedding_id', wedding.id).order('created_at', { ascending: false });
      const raw = data || [];
      const clean = raw.filter((v: any) => !v.id?.startsWith('v-') && !v.name?.includes('Grand Heritage'));
      setVendors(clean);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load vendors.', 'error');
    } finally {
      setLoading(false);
    }
  }, [wedding]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (wedding) fetchVendors();
  }, [authLoading, user, wedding, fetchVendors, router]);

  const saveVendor = async (data: Partial<Vendor>) => {
    if (!wedding) return;
    setSaving(true);
    try {
      if (editingVendor) {
        const { data: updated, error } = await supabase.from('vendors').update(data).eq('id', editingVendor.id).select().single();
        if (error) throw error;
        setVendors(prev => prev.map(v => v.id === editingVendor.id ? updated : v));
        showToast('Vendor updated!', 'success');
      } else {
        const { data: created, error } = await supabase.from('vendors').insert({ ...data, name: data.name || '', wedding_id: wedding.id }).select().single();
        if (error) throw error;
        setVendors(prev => [created, ...prev]);
        showToast('Vendor added!', 'success');
      }
      setShowModal(false);
      setEditingVendor(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save vendor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteVendor = async (id: string) => {
    if (!confirm('Remove this vendor?')) return;
    const backup = vendors.find(v => v.id === id);
    setVendors(prev => prev.filter(v => v.id !== id));
    try {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
      showToast('Vendor removed.', 'success');
    } catch (err: unknown) {
      if (backup) setVendors(prev => [...prev, backup]);
      showToast(err instanceof Error ? err.message : 'Failed to remove vendor.', 'error');
    }
  };

  const quickUpdateStatus = async (id: string, status: VendorStatus) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    try {
      const { error } = await supabase.from('vendors').update({ status }).eq('id', id);
      if (error) throw error;
      showToast(`Vendor marked as ${status}!`, 'success');
    } catch (err: unknown) {
      fetchVendors();
      showToast(err instanceof Error ? err.message : 'Failed to update status.', 'error');
    }
  };

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const filtered = vendors.filter(v => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== 'all' && v.category !== catFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const totalCost = vendors.reduce((s, v) => s + Number(v.cost), 0);
  const bookedCost = vendors.filter(v => v.status === 'booked').reduce((s, v) => s + Number(v.cost), 0);
  const booked = vendors.filter(v => v.status === 'booked').length;
  const pendingCount = vendors.filter(v => v.status === 'pending' || v.status === 'contacted').length;
  const usedCategories = [...new Set(vendors.map(v => v.category))];

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      booked: { cls: 'badge-green', label: '✅ Booked' },
      pending: { cls: 'badge-orange', label: '⏳ Pending' },
      contacted: { cls: 'badge-purple', label: '📞 Contacted' },
      cancelled: { cls: 'badge-red', label: '❌ Cancelled' },
    };
    return map[s] || { cls: 'badge-gray', label: s };
  };

  if (authLoading || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoadingSpinner size={48} message="Loading vendors..." /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>🏪 Your dream team</p>
        <h1>Vendors</h1>
        <p>Manage all your wedding vendors in one place</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        {[
          { label: "Total Vendors", value: vendors.length, icon: "🏪", color: "rose" },
          { label: "Booked", value: booked, icon: "✅", color: "green" },
          { label: "Pending", value: pendingCount, icon: "⏳", color: "gold" },
          { label: "Total Cost", value: fmt(totalCost), icon: "💰", color: "plum" },
        ].map((stat, idx) => (
          <div key={stat.label} className="card animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="stat-card">
              <div className={`card-icon ${stat.color}`}>{stat.icon}</div>
              <div>
                <div className="stat-value" style={{ fontSize: typeof stat.value === 'string' ? '22px' : undefined }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bookedCost > 0 && (
        <div className="card animate-fade-in-up" style={{ marginBottom: '24px', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-semibold">Confirmed Vendor Spend</span>
            <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{fmt(bookedCost)} of {fmt(totalCost)}</span>
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <div className="progress-bar-fill green" style={{ width: `${totalCost > 0 ? (bookedCost / totalCost) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input form-select" style={{ width: '160px', height: '40px' }}
            value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-input form-select" style={{ width: '140px', height: '40px' }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => { setEditingVendor(null); setShowModal(true); }}>+ Add Vendor</button>
        </div>
      </div>

      {/* Vendor Cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-title">{vendors.length === 0 ? 'No vendors yet' : 'No matching vendors'}</div>
          <div className="empty-state-text">{vendors.length === 0 ? 'Start adding your wedding vendors!' : 'Try adjusting your search or filters.'}</div>
          {vendors.length === 0 && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add First Vendor</button>}
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map((vendor, idx) => {
            const sb = statusBadge(vendor.status);
            return (
              <div key={vendor.id} className="vendor-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="vendor-card-header">
                  <div>
                    <div className="vendor-name">{vendor.name}</div>
                    <div className="vendor-category">{vendor.category}</div>
                  </div>
                  <span className={`badge ${sb.cls}`}>{sb.label}</span>
                </div>

                {vendor.phone && <div className="vendor-detail">📞 {vendor.phone}</div>}
                {vendor.email && <div className="vendor-detail">✉️ {vendor.email}</div>}
                {vendor.notes && <div className="vendor-detail" style={{ fontStyle: 'italic', fontSize: '12px' }}>💬 {vendor.notes}</div>}

                <div className="vendor-cost">{fmt(Number(vendor.cost))}</div>

                <div className="vendor-actions">
                  {vendor.status !== 'booked' && (
                    <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}
                      onClick={() => quickUpdateStatus(vendor.id, 'booked')}>✅ Book</button>
                  )}
                  {vendor.status === 'booked' && (
                    <button className="btn btn-sm btn-tertiary" style={{ flex: 1 }}
                      onClick={() => quickUpdateStatus(vendor.id, 'pending')}>↩️ Unbook</button>
                  )}
                  <button className="btn btn-sm btn-ghost" onClick={() => { setEditingVendor(vendor); setShowModal(true); }}>✏️</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => deleteVendor(vendor.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <VendorModal onClose={() => { setShowModal(false); setEditingVendor(null); }} onSave={saveVendor} vendor={editingVendor} saving={saving} />}
    </div>
  );
}
