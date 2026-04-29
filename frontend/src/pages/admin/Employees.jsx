import { useEffect, useState } from 'react';
import { UserPlus, Search, ToggleLeft, ToggleRight, Edit2, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { formatDate, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

function AddEmployeeModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '', employeeId: '', target: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'employee', target: Number(form.target) });
      toast.success('Employee added!');
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add New Employee</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 12 }}>
            {[['name','Full Name','text',true],['email','Email','email',true],['password','Password','password',true],['phone','Phone','tel',false],['department','Department','text',false],['employeeId','Employee ID','text',false]].map(([k,l,t,req]) => (
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                <input type={t} className="form-control" value={form[k]} onChange={e => set(k, e.target.value)} required={req} />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Target (₹)</label>
            <input type="number" className="form-control" value={form.target} onChange={e => set('target', e.target.value)} placeholder="500000" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding…' : 'Add Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users' + (search ? `?search=${search}` : ''));
      setEmployees(data.users);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const toggleStatus = async (id, name, current) => {
    try {
      await api.put(`/users/${id}/toggle-status`);
      toast.success(`${name} ${current ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <AdminLayout title="Employees">
      <div className="section-header">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input id="emp-search" className="form-control" style={{ paddingLeft: 38, width: 280 }}
            placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button id="add-emp-btn" className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>ID</th><th>Department</th><th>Phone</th>
              <th>Target</th><th>Joined</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={8}><div className="empty-state"><p>No employees found</p></div></td></tr>
            ) : employees.map((emp) => (
              <tr key={emp._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar">{getInitials(emp.name)}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.employeeId || '—'}</span></td>
                <td>{emp.department || '—'}</td>
                <td>{emp.phone || '—'}</td>
                <td style={{ fontWeight: 600 }}>₹{(emp.target || 0).toLocaleString('en-IN')}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(emp.joiningDate)}</td>
                <td>
                  <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => toggleStatus(emp._id, emp.name, emp.isActive)} title={emp.isActive ? 'Deactivate' : 'Activate'}>
                    {emp.isActive ? <ToggleRight size={18} color="var(--success)" /> : <ToggleLeft size={18} color="var(--text-muted)" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onAdded={load} />}
    </AdminLayout>
  );
}
