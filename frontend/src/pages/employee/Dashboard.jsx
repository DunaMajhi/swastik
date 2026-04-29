import { useEffect, useState } from 'react';
import { TrendingUp, CheckSquare, Clock, Target } from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { formatCurrency, formatTime } from '../../lib/utils';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [today, setToday] = useState(null);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/attendance/today'),
      api.get('/leads?limit=5'),
      api.get('/tasks?status=pending'),
    ]).then(([att, l, t]) => {
      setToday(att.data.today);
      setLeads(l.data.leads || []);
      setTasks(t.data.tasks || []);
    }).finally(() => setLoading(false));
  }, []);

  const totalSales = leads.filter(l => l.status === 'closed-won').reduce((a, l) => a + l.amount, 0);
  const targetPct = user?.target ? Math.min(100, Math.round((totalSales / user.target) * 100)) : 0;

  if (loading) return <EmployeeLayout title="My Dashboard"><div className="spinner-page"><div className="spinner" /></div></EmployeeLayout>;

  return (
    <EmployeeLayout title="My Dashboard">
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Here's your work summary for today</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: today?.checkInTime ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)' }}>
            <Clock size={22} color={today?.checkInTime ? '#22c55e' : '#ef4444'} />
          </div>
          <div className="kpi-label">Today's Status</div>
          <div className="kpi-value" style={{ fontSize: '1.1rem' }}>{today?.checkInTime ? (today.checkOutTime ? 'Completed' : 'Active') : 'Not Checked In'}</div>
          {today?.checkInTime && <div className="kpi-sub">In: {formatTime(today.checkInTime)}{today.checkOutTime ? ` • Out: ${formatTime(today.checkOutTime)}` : ''}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(79,142,247,0.15)' }}><TrendingUp size={22} color="#4f8ef7" /></div>
          <div className="kpi-label">My Leads</div>
          <div className="kpi-value">{leads.length}</div>
          <div className="kpi-sub">{leads.filter(l => l.status === 'closed-won').length} closed won</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(168,85,247,0.15)' }}><CheckSquare size={22} color="#a855f7" /></div>
          <div className="kpi-label">Pending Tasks</div>
          <div className="kpi-value">{tasks.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><Target size={22} color="#f59e0b" /></div>
          <div className="kpi-label">Target Progress</div>
          <div className="kpi-value">{targetPct}%</div>
          <div className="kpi-sub">{formatCurrency(totalSales)} of {formatCurrency(user?.target)}</div>
        </div>
      </div>

      {/* Target progress bar */}
      {user?.target > 0 && (
        <div className="card mb-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 700 }}>Monthly Sales Target</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{targetPct}%</span>
          </div>
          <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${targetPct}%`, height: '100%', background: `linear-gradient(90deg, var(--accent), var(--success))`, borderRadius: 5, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{formatCurrency(totalSales)} earned</span>
            <span>{formatCurrency((user?.target || 0) - totalSales)} remaining</span>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Recent leads */}
        <div className="card">
          <div className="chart-title" style={{ marginBottom: 14 }}>Recent Leads</div>
          {leads.slice(0, 4).map(l => (
            <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{l.clientName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.product}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{formatCurrency(l.amount)}</div>
                <span className={`badge badge-sm ${l.status === 'closed-won' ? 'badge-success' : l.status === 'closed-lost' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>{l.status}</span>
              </div>
            </div>
          ))}
          {leads.length === 0 && <div className="empty-state" style={{ padding: 24 }}><p>No leads yet</p></div>}
        </div>

        {/* Pending tasks */}
        <div className="card">
          <div className="chart-title" style={{ marginBottom: 14 }}>Pending Tasks</div>
          {tasks.slice(0, 4).map(t => (
            <div key={t._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warning)' : 'var(--text-muted)', marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.priority} priority</div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="empty-state" style={{ padding: 24 }}><p>No pending tasks 🎉</p></div>}
        </div>
      </div>
    </EmployeeLayout>
  );
}
