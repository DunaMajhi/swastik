import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { formatCurrency, leadStatusLabel } from '../../lib/utils';

const COLORS = ['#4f8ef7','#22c55e','#a855f7','#f59e0b','#ef4444','#fb923c'];

const CT = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
    <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
    {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('rev') ? formatCurrency(p.value) : p.value}</p>)}
  </div>
) : null;

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/leads/analytics?month=${month}&year=${year}`),
      api.get(`/attendance/admin?month=${month}&year=${year}`),
    ]).then(([a, att]) => { setAnalytics(a.data.analytics); setAttendance(att.data.records || []); })
      .finally(() => setLoading(false));
  }, [month, year]);

  const exportAttendanceCSV = () => {
    const rows = attendance.map(r => [r.userId?.name, r.date, r.workingHours || 0, r.status]);
    const csv = [['Name','Date','Hours','Status'], ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `attendance-report-${month}-${year}.csv`; a.click();
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="section-header">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 110 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" className="form-control" style={{ width: 90 }} value={year} onChange={e => setYear(Number(e.target.value))} min={2020} max={2030} />
        </div>
        <button className="btn btn-secondary" onClick={exportAttendanceCSV}><Download size={15} /> Export Attendance</button>
      </div>

      {loading ? <div className="spinner-page"><div className="spinner" /></div> : (
        <>
          {/* Revenue KPI */}
          <div className="kpi-grid" style={{ marginBottom: 28 }}>
            <div className="kpi-card">
              <div className="kpi-label">Monthly Revenue</div>
              <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(analytics?.totalRevenue)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Leads This Month</div>
              <div className="kpi-value">{analytics?.dailySales?.reduce((a, d) => a + d.count, 0) || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Working Days (Records)</div>
              <div className="kpi-value">{attendance.length}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Avg Working Hours</div>
              <div className="kpi-value">
                {attendance.length ? (attendance.reduce((a, r) => a + (r.workingHours || 0), 0) / attendance.length).toFixed(1) + 'h' : '—'}
              </div>
            </div>
          </div>

          <div className="grid-2 mb-6">
            <div className="chart-card">
              <div className="chart-title">Daily Revenue Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics?.dailySales || []}>
                  <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => v?.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CT />} />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} dot={false} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Top Performers</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics?.topEmployees?.map(e => ({ name: e.user?.name?.split(' ')[0], revenue: e.revenue })) || []}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="revenue" fill="#4f8ef7" radius={[4,4,0,0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <div className="chart-title">Lead Status Distribution</div>
            <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
              <ResponsiveContainer width="30%" height={180} minWidth={160}>
                <PieChart>
                  <Pie data={analytics?.statusBreakdown || []} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" paddingAngle={3}>
                    {(analytics?.statusBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, flex: 1 }}>
                {(analytics?.statusBreakdown || []).map((s, i) => (
                  <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px', minWidth: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{leadStatusLabel[s._id] || s._id}</span>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{s.count}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatCurrency(s.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
