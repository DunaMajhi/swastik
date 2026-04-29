import { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { formatTime, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

function exportCSV(records) {
  const headers = ['Employee','Email','Department','Date','Check In','Check Out','Working Hours','Status'];
  const rows = records.map(r => [
    r.userId?.name, r.userId?.email, r.userId?.department,
    r.date, formatTime(r.checkInTime), formatTime(r.checkOutTime),
    r.workingHours || 0, r.status
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `attendance-${Date.now()}.csv`; a.click();
}

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('daily'); // daily | monthly

  useEffect(() => {
    setLoading(true);
    const query = viewMode === 'daily'
      ? `?date=${date}`
      : `?month=${month}&year=${year}`;
    api.get('/attendance/admin' + query)
      .then(({ data }) => setRecords(data.records || []))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [date, month, year, viewMode]);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <AdminLayout title="Attendance">
      <div className="section-header">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {['daily','monthly'].map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                style={{ padding: '8px 16px', background: viewMode === m ? 'var(--accent)' : 'var(--bg-secondary)', color: viewMode === m ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {m}
              </button>
            ))}
          </div>
          {viewMode === 'daily' ? (
            <input type="date" className="form-control" style={{ width: 180 }} value={date} onChange={e => setDate(e.target.value)} />
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-control" style={{ width: 120 }} value={month} onChange={e => setMonth(e.target.value)}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <input type="number" className="form-control" style={{ width: 90 }} value={year} onChange={e => setYear(e.target.value)} min={2020} max={2030} />
            </div>
          )}
        </div>
        <button className="btn btn-secondary" onClick={() => exportCSV(records)}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th>
              <th>Hours</th><th>Location</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><p>No attendance records found</p></div></td></tr>
            ) : records.map((r) => (
              <tr key={r._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.userId?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.userId?.department}</div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{r.date}</td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatTime(r.checkInTime)}</td>
                <td style={{ color: r.checkOutTime ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {r.checkOutTime ? formatTime(r.checkOutTime) : '—'}
                </td>
                <td>
                  {r.workingHours ? (
                    <span style={{ fontWeight: 700, color: r.workingHours >= 8 ? 'var(--success)' : r.workingHours >= 4 ? 'var(--warning)' : 'var(--danger)' }}>
                      {r.workingHours}h
                    </span>
                  ) : '—'}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {r.checkInLat ? `${r.checkInLat.toFixed(4)}, ${r.checkInLng.toFixed(4)}` : '—'}
                </td>
                <td>
                  <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'half-day' ? 'badge-warning' : r.status === 'leave' ? 'badge-accent' : 'badge-danger'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
