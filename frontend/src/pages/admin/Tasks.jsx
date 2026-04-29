import { useEffect, useState } from 'react';
import { Plus, X, CheckCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { formatDate, getInitials, priorityClass } from '../../lib/utils';
import toast from 'react-hot-toast';

function TaskModal({ employees, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/tasks', form); toast.success('Task assigned!'); onSaved(); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Assign Task</span><button className="modal-close" onClick={onClose}><X size={18} /></button></div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Task Title *</label><input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="form-label">Assign To *</label>
              <select className="form-control" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} required>
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['low','medium','high','urgent'].map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-control" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Assign Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    const [t, e] = await Promise.all([api.get('/tasks' + (statusFilter ? `?status=${statusFilter}` : '')), api.get('/users')]);
    setTasks(t.data.tasks); setEmployees(e.data.users); setLoading(false);
  };
  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/${id}`, { status });
    toast.success('Task updated'); load();
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`); toast.success('Deleted'); load();
  };

  const STATUS_COLORS = { pending: 'badge-warning', 'in-progress': 'badge-accent', completed: 'badge-success', cancelled: 'badge-danger' };

  return (
    <AdminLayout title="Tasks">
      <div className="section-header">
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Tasks</option>
          {['pending','in-progress','completed','cancelled'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Assign Task</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : tasks.map(t => (
                <tr key={t._id}>
                  <td><div style={{ fontWeight: 600 }}>{t.title}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.description?.slice(0, 60)}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{getInitials(t.assignedTo?.name)}</div>
                      <span style={{ fontSize: '0.85rem' }}>{t.assignedTo?.name}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${priorityClass[t.priority]}`} style={{ textTransform: 'capitalize' }}>{t.priority}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(t.dueDate)}</td>
                  <td><span className={`badge ${STATUS_COLORS[t.status] || 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>{t.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {t.status !== 'completed' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(t._id, 'completed')}><CheckCircle size={13} /></button>}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteTask(t._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showModal && <TaskModal employees={employees} onClose={() => setShowModal(false)} onSaved={load} />}
    </AdminLayout>
  );
}
