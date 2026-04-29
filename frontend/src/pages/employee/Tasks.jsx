import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../lib/api';
import { formatDate, priorityClass } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/tasks' + (statusFilter ? `?status=${statusFilter}` : ''));
    setTasks(data.tasks || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [statusFilter]);

  const complete = async (id) => {
    await api.put(`/tasks/${id}`, { status: 'completed' });
    toast.success('Task marked complete!');
    load();
  };

  const STATUS_COLORS = { pending: 'badge-warning', 'in-progress': 'badge-accent', completed: 'badge-success', cancelled: 'badge-danger' };

  return (
    <EmployeeLayout title="My Tasks">
      <div className="section-header">
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Tasks</option>
          {['pending','in-progress','completed','cancelled'].map(s => (
            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
          ))}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Task</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : tasks.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><p>No tasks found 🎉</p></div></td></tr>
              : tasks.map(t => (
                <tr key={t._id}>
                  <td><div style={{ fontWeight: 600 }}>{t.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.description?.slice(0, 80)}</div></td>
                  <td><span className={`badge ${priorityClass[t.priority]}`} style={{ textTransform: 'capitalize' }}>{t.priority}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(t.dueDate)}</td>
                  <td><span className={`badge ${STATUS_COLORS[t.status] || 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>{t.status}</span></td>
                  <td>
                    {t.status === 'pending' || t.status === 'in-progress' ? (
                      <button className="btn btn-success btn-sm" onClick={() => complete(t._id)}>
                        <CheckCircle size={14} /> Done
                      </button>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </EmployeeLayout>
  );
}
