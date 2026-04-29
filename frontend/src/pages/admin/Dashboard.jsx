import { useEffect, useState } from 'react';
import { Users, UserCheck, TrendingUp, IndianRupee, BarChart2, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#4f8ef7', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#fb923c'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</p>)}
    </div>
  );
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/dashboard-stats'),
      api.get('/leads/analytics'),
      api.get('/attendance/admin?date=' + new Date().toISOString().split('T')[0]),
    ]).then(([s, a, att]) => {
      setStats(s.data.stats);
      setAnalytics(a.data.analytics);
      setRecentAttendance(att.data.records?.slice(0, 5) || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><div className="spinner-page"><div className="spinner" /></div></AdminLayout>;

  const kpis = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: '#4f8ef7', bg: 'rgba(79,142,247,0.15)' },
    { label: 'Active Today', value: stats?.activeToday || 0, icon: UserCheck, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    { label: 'Total Leads', value: stats?.totalLeads || 0, icon: TrendingUp, color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
    { label: 'Monthly Revenue', value: formatCurrency(stats?.revenue || 0), icon: IndianRupee, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  ];

  const statusData = analytics?.statusBreakdown?.map(s => ({
    name: s._id?.replace(/-/g, ' '), value: s.count, revenue: s.revenue
  })) || [];

  const dailyData = analytics?.dailySales?.slice(-14).map(d => ({
    date: d._id?.slice(5), leads: d.count, revenue: d.revenue
  })) || [];

  return (
    <AdminLayout title="Dashboard">
      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">
        {/* Daily Leads chart */}
        <div className="chart-card">
          <div className="chart-title">Daily Leads — Last 14 Days</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="leads" stroke="#4f8ef7" strokeWidth={2.5} dot={false} name="Leads" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Status pie */}
        <div className="chart-card">
          <div className="chart-title">Lead Status Breakdown</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {statusData.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{s.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid-2">
        <div className="chart-card">
          <div className="chart-title">Top Performers This Month</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics?.topEmployees?.map(e => ({ name: e.user?.name?.split(' ')[0], revenue: e.revenue, leads: e.count })) || []}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#4f8ef7" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Attendance */}
        <div className="card">
          <div className="chart-title" style={{ marginBottom: 16 }}>Today's Check-ins</div>
          {recentAttendance.length === 0 ? (
            <div className="empty-state"><Activity size={32} /><p>No check-ins yet today</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentAttendance.map((r) => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="avatar">{r.userId?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.userId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.userId?.department}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${r.checkOutTime ? 'badge-muted' : 'badge-success'}`}>{r.checkOutTime ? 'Checked Out' : 'Active'}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      {new Date(r.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
