import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../lib/api';
import { formatCurrency, formatDate, leadStatusLabel, leadStatusClass } from '../../lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['new','contacted','in-progress','proposal','closed-won','closed-lost'];

function LeadModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState(lead
    ? { clientName: lead.clientName, clientPhone: lead.clientPhone || '', product: lead.product || '', amount: lead.amount || '', status: lead.status, notes: lead.notes || '' }
    : { clientName: '', clientPhone: '', product: '', amount: '', status: 'new', notes: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const getLocation = () => new Promise((res) =>
    navigator.geolocation.getCurrentPosition(
      p => res({ visitLat: p.coords.latitude, visitLng: p.coords.longitude }),
      () => res({}),
      { timeout: 5000 }
    )
  );

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const loc = await getLocation();
      const payload = { ...form, amount: Number(form.amount), ...loc };
      if (lead) await api.put(`/leads/${lead._id}`, payload);
      else await api.post('/leads', payload);
      toast.success(lead ? 'Lead updated!' : 'Lead added!');
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving lead'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{lead ? 'Update Lead' : 'Add Client Visit'}</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Client Name *</label>
              <input className="form-control" value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Product / Service</label>
              <input className="form-control" value={form.product} onChange={e => set('product', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Deal Amount (₹)</label>
              <input type="number" className="form-control" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{leadStatusLabel[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            📍 Your current GPS location will be saved with this visit
          </p>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeeLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads?limit=100' + (statusFilter ? `&status=${statusFilter}` : ''));
      setLeads(data.leads || []);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <EmployeeLayout title="My Leads">
      <div className="section-header">
        <select className="form-control" style={{ width: 170 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{leadStatusLabel[s]}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={16} /> Add Visit
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Client</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><p>No leads yet — add your first client visit!</p></div></td></tr>
            ) : leads.map(l => (
              <tr key={l._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{l.clientName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.clientPhone}</div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{l.product || '—'}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(l.amount)}</td>
                <td>
                  <span className={`badge ${leadStatusClass[l.status] || 'badge-muted'}`}>
                    {leadStatusLabel[l.status]}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(l.createdAt)}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal(l)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <LeadModal
          lead={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </EmployeeLayout>
  );
}
