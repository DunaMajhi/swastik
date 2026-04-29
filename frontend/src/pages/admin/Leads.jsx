import { useEffect, useState } from 'react';
import { Plus, Search, X, Filter } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { formatCurrency, formatDate, leadStatusLabel, leadStatusClass, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['new','contacted','in-progress','proposal','closed-won','closed-lost'];
const PRIORITY_OPTIONS = ['low','medium','high'];

function LeadModal({ lead, employees, onClose, onSaved }) {
  const [form, setForm] = useState(lead ? { ...lead, assignedTo: lead.assignedTo?._id || '' } : {
    clientName: '', clientPhone: '', product: '', amount: '', status: 'new', priority: 'medium', source: 'other', notes: '', assignedTo: '', followUpDate: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (lead) await api.put(`/leads/${lead._id}`, form);
      else await api.post('/leads', form);
      toast.success(lead ? 'Lead updated!' : 'Lead created!');
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{lead ? 'Edit Lead' : 'New Lead'}</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="form-label">Client Name *</label><input className="form-control" value={form.clientName} onChange={e => set('clientName', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Product</label><input className="form-control" value={form.product} onChange={e => set('product', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Amount (₹)</label><input type="number" className="form-control" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{leadStatusLabel[s]}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Assign To</label>
              <select className="form-control" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
                <option value="">Unassigned</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Follow Up Date</label>
              <input type="date" className="form-control" value={form.followUpDate ? form.followUpDate.split('T')[0] : ''} onChange={e => set('followUpDate', e.target.value)} />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | lead object

  const load = async () => {
    setLoading(true);
    try {
      const [l, e] = await Promise.all([
        api.get(`/leads?search=${search}&status=${statusFilter}&limit=50`),
        api.get('/users'),
      ]);
      setLeads(l.data.leads); setEmployees(e.data.users);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead?')) return;
    await api.delete(`/leads/${id}`);
    toast.success('Lead deleted'); load();
  };

  return (
    <AdminLayout title="Leads / CRM">
      <div className="section-header">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: 34, width: 220 }} placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 170 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{leadStatusLabel[s]}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> New Lead</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Client</th><th>Product</th><th>Amount</th><th>Status</th><th>Priority</th><th>Assigned To</th><th>Follow Up</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : leads.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><p>No leads found</p></div></td></tr>
              : leads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.clientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lead.clientPhone}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{lead.product || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(lead.amount)}</td>
                  <td><span className={`badge ${leadStatusClass[lead.status] || 'badge-muted'}`}>{leadStatusLabel[lead.status]}</span></td>
                  <td><span className={`badge ${lead.priority === 'high' ? 'badge-danger' : lead.priority === 'medium' ? 'badge-warning' : 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>{lead.priority}</span></td>
                  <td>
                    {lead.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>{getInitials(lead.assignedTo?.name)}</div>
                        <span style={{ fontSize: '0.82rem' }}>{lead.assignedTo?.name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unassigned</span>}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(lead.followUpDate)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal(lead)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteLead(lead._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {modal && <LeadModal lead={modal === 'new' ? null : modal} employees={employees} onClose={() => setModal(null)} onSaved={load} />}
    </AdminLayout>
  );
}
