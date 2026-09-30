"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ShareRsvpModal from "@/app/components/ShareRsvpModal";
import type { Guest } from "@/lib/database.types";

type RsvpStatus = 'accepted' | 'declined' | 'pending' | 'maybe';
type Side = 'bride' | 'groom' | 'mutual';

function GuestModal({ onClose, onSave, guest, saving }: {
  onClose: () => void;
  onSave: (data: Partial<Guest>) => void;
  guest?: Guest | null;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    name: guest?.name || '',
    email: guest?.email || '',
    phone: guest?.phone || '',
    side: (guest?.side || 'mutual') as Side,
    guest_group: guest?.guest_group || '',
    rsvp_status: (guest?.rsvp_status || 'pending') as RsvpStatus,
    plus_ones: guest?.plus_ones?.toString() || '0',
    dietary: guest?.dietary || '',
    table_number: guest?.table_number || '',
  });
  const [error, setError] = useState('');

  const update = (field: string, value: string) => { setForm(prev => ({ ...prev, [field]: value })); setError(''); };

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Guest name is required.'); return; }
    if (form.name.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Invalid email address.'); return; }
    if (form.phone && !/^[\d\s+\-()]{7,15}$/.test(form.phone)) { setError('Invalid phone number.'); return; }
    const plusOnes = parseInt(form.plus_ones) || 0;
    if (plusOnes < 0 || plusOnes > 10) { setError('Plus ones must be between 0 and 10.'); return; }

    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      side: form.side,
      guest_group: form.guest_group.trim(),
      rsvp_status: form.rsvp_status,
      plus_ones: plusOnes,
      dietary: form.dietary.trim(),
      table_number: form.table_number.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{guest ? '✏️ Edit Guest' : '👥 Add Guest'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="e.g., Amit Sharma" value={form.name}
            onChange={e => update('name', e.target.value)} disabled={saving} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="guest@email.com"
              value={form.email} onChange={e => update('email', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => update('phone', e.target.value)} disabled={saving} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Side</label>
            <select className="form-input form-select" value={form.side} onChange={e => update('side', e.target.value)} disabled={saving}>
              <option value="bride">Bride</option>
              <option value="groom">Groom</option>
              <option value="mutual">Mutual</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">RSVP Status</label>
            <select className="form-input form-select" value={form.rsvp_status} onChange={e => update('rsvp_status', e.target.value)} disabled={saving}>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Plus Ones</label>
            <input className="form-input" type="number" min="0" max="10" value={form.plus_ones}
              onChange={e => update('plus_ones', e.target.value)} disabled={saving} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Group</label>
            <input className="form-input" placeholder="e.g., Family, College Friends"
              value={form.guest_group} onChange={e => update('guest_group', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Table Number</label>
            <input className="form-input" placeholder="e.g., T1, VIP" value={form.table_number}
              onChange={e => update('table_number', e.target.value)} disabled={saving} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Dietary Requirements</label>
          <input className="form-input" placeholder="e.g., Vegetarian, Jain, No nuts"
            value={form.dietary} onChange={e => update('dietary', e.target.value)} disabled={saving} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-tertiary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : guest ? 'Update Guest' : 'Add Guest'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuestsPage() {
  const { user, wedding, loading: authLoading } = useAuth();
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('all');
  const [rsvpFilter, setRsvpFilter] = useState('all');

  const fetchGuests = useCallback(async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('guests').select('*').eq('wedding_id', wedding.id).order('name');
      const raw = data || [];
      const clean = raw.filter((g: any) => !g.id?.startsWith('g-') && !g.name?.includes('Vikram & Ananya'));
      setGuests(clean);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load guests.', 'error');
    } finally {
      setLoading(false);
    }
  }, [wedding]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (wedding) fetchGuests();
  }, [authLoading, user, wedding, fetchGuests, router]);

  const saveGuest = async (data: Partial<Guest>) => {
    if (!wedding) return;
    setSaving(true);
    try {
      if (editingGuest) {
        const { data: updated, error } = await supabase.from('guests').update(data).eq('id', editingGuest.id).select().single();
        if (error) throw error;
        setGuests(prev => prev.map(g => g.id === editingGuest.id ? updated : g));
        showToast('Guest updated!', 'success');
      } else {
        const { data: created, error } = await supabase.from('guests').insert({ ...data, name: data.name || '', wedding_id: wedding.id }).select().single();
        if (error) throw error;
        setGuests(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        showToast('Guest added!', 'success');
      }
      setShowModal(false);
      setEditingGuest(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save guest.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteGuest = async (id: string) => {
    if (!confirm('Remove this guest from the list?')) return;
    const backup = guests.find(g => g.id === id);
    setGuests(prev => prev.filter(g => g.id !== id));
    try {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (error) throw error;
      showToast('Guest removed.', 'success');
    } catch (err: unknown) {
      if (backup) setGuests(prev => [...prev, backup].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(err instanceof Error ? err.message : 'Failed to remove guest.', 'error');
    }
  };

  const quickUpdateRsvp = async (id: string, status: RsvpStatus) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvp_status: status } : g));
    try {
      const { error } = await supabase.from('guests').update({ rsvp_status: status }).eq('id', id);
      if (error) throw error;
    } catch (err: unknown) {
      fetchGuests();
      showToast(err instanceof Error ? err.message : 'Failed to update RSVP.', 'error');
    }
  };

  const filtered = guests.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (sideFilter !== 'all' && g.side !== sideFilter) return false;
    if (rsvpFilter !== 'all' && g.rsvp_status !== rsvpFilter) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Side', 'Group', 'RSVP Status', 'Plus Ones', 'Dietary', 'Table'];
    const rows = filtered.map(g => [
      g.name, g.email, g.phone, g.side, g.guest_group,
      g.rsvp_status, String(g.plus_ones || 0), g.dietary, g.table_number,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedcraft-guests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} guests to CSV!`, 'success');
  };

  const total = guests.length;
  const accepted = guests.filter(g => g.rsvp_status === 'accepted').length;
  const declined = guests.filter(g => g.rsvp_status === 'declined').length;
  const pending = guests.filter(g => g.rsvp_status === 'pending' || g.rsvp_status === 'maybe').length;
  const totalPlusOnes = guests.reduce((s, g) => s + (g.plus_ones || 0), 0);
  const totalHeadcount = accepted + guests.filter(g => g.rsvp_status === 'accepted').reduce((s, g) => s + (g.plus_ones || 0), 0);

  const rsvpBadge = (status: string) => {
    const map: Record<string, string> = { accepted: 'badge-green', declined: 'badge-red', pending: 'badge-orange', maybe: 'badge-purple' };
    return map[status] || 'badge-gray';
  };

  if (authLoading || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoadingSpinner size={48} message="Loading guest list..." /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>👥 Everyone you love</p>
        <h1>Guest List</h1>
        <p>Manage your wedding guests and track RSVPs</p>
      </div>

      {/* Stats */}
      <div className="guest-stats">
        {[
          { label: "Total Invited", value: total, color: "var(--color-text)" },
          { label: "Accepted", value: accepted, color: "var(--color-success)" },
          { label: "Declined", value: declined, color: "var(--color-error)" },
          { label: "Pending", value: pending, color: "var(--color-warning)" },
          { label: "Headcount", value: totalHeadcount, color: "var(--color-primary)" },
        ].map(s => (
          <div key={s.label} className="card guest-stat-card animate-fade-in-up">
            <div className="guest-stat-number" style={{ color: s.color }}>{s.value}</div>
            <div className="guest-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input form-select" style={{ width: '130px', height: '40px' }}
            value={sideFilter} onChange={e => setSideFilter(e.target.value)}>
            <option value="all">All Sides</option>
            <option value="bride">Bride</option>
            <option value="groom">Groom</option>
            <option value="mutual">Mutual</option>
          </select>
          <select className="form-input form-select" style={{ width: '140px', height: '40px' }}
            value={rsvpFilter} onChange={e => setRsvpFilter(e.target.value)}>
            <option value="all">All RSVP</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="pending">Pending</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-muted">{totalPlusOnes} plus ones</span>
          <button className="btn btn-secondary" onClick={() => setShowShareModal(true)} title="Share RSVP Link with Guests">
            💌 Share RSVP
          </button>
          {guests.length > 0 && (
            <button className="btn btn-secondary" onClick={exportCSV} title="Export guest list as CSV">
              📥 Export CSV
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setEditingGuest(null); setShowModal(true); }}>+ Add Guest</button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">{guests.length === 0 ? 'No guests yet' : 'No matching guests'}</div>
          <div className="empty-state-text">{guests.length === 0 ? 'Start adding your wedding guests!' : 'Try adjusting your search or filters.'}</div>
          {guests.length === 0 && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add First Guest</button>}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="guest-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Side</th>
                <th>Group</th>
                <th>RSVP</th>
                <th>+Ones</th>
                <th>Table</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(guest => (
                <tr key={guest.id}>
                  <td>
                    <div className="guest-name-cell">
                      <div className="guest-avatar">{guest.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="guest-name">{guest.name}</div>
                        {guest.email && <div className="guest-email">{guest.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{guest.side}</span></td>
                  <td>{guest.guest_group || <span className="text-muted">—</span>}</td>
                  <td>
                    <select className={`badge ${rsvpBadge(guest.rsvp_status)}`}
                      value={guest.rsvp_status}
                      onChange={e => quickUpdateRsvp(guest.id, e.target.value as RsvpStatus)}
                      style={{ border: 'none', cursor: 'pointer', appearance: 'none', padding: '4px 10px', fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-primary)' }}>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                      <option value="pending">Pending</option>
                      <option value="maybe">Maybe</option>
                    </select>
                  </td>
                  <td>{guest.plus_ones || 0}</td>
                  <td>{guest.table_number || <span className="text-muted">—</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-icon btn-ghost" title="Edit" style={{ fontSize: '14px' }}
                        onClick={() => { setEditingGuest(guest); setShowModal(true); }}>✏️</button>
                      <button className="btn btn-icon btn-ghost" title="Delete" style={{ fontSize: '14px' }}
                        onClick={() => deleteGuest(guest.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <GuestModal onClose={() => { setShowModal(false); setEditingGuest(null); }} onSave={saveGuest} guest={editingGuest} saving={saving} />}

      {showShareModal && (
        <ShareRsvpModal
          onClose={() => setShowShareModal(false)}
          slug={
            wedding?.partner1_name && wedding?.partner2_name
              ? `${wedding.partner1_name.toLowerCase().replace(/[^a-z0-9]/g, '')}-and-${wedding.partner2_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
              : 'our-wedding'
          }
          partner1={wedding?.partner1_name}
          partner2={wedding?.partner2_name}
        />
      )}
    </div>
  );
}
