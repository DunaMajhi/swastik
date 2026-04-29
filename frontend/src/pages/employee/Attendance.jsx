import { useEffect, useState, useCallback } from 'react';
import { MapPin, LogIn, LogOut, Clock, CheckCircle } from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../lib/api';
import { formatTime, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import { connectSocket } from '../../lib/socket';

export default function EmployeeAttendance() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    const [t, h] = await Promise.all([api.get('/attendance/today'), api.get('/attendance/my')]);
    setToday(t.data.today);
    setHistory(h.data.records || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Background location ping every 30s when checked in
  useEffect(() => {
    if (!today?.checkInTime || today?.checkOutTime) return;
    const socket = connectSocket('employee');
    const ping = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        api.post('/location/update', { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }).catch(() => {});
      });
    };
    ping();
    const id = setInterval(ping, 30000);
    return () => clearInterval(id);
  }, [today?.checkInTime, today?.checkOutTime]);

  const getLocation = () => new Promise((res, rej) =>
    navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), rej, { timeout: 10000 })
  );

  const checkIn = async () => {
    setActionLoading(true);
    try {
      const loc = await getLocation();
      const { data } = await api.post('/attendance/checkin', loc);
      toast.success(data.message);
      setToday(data.attendance);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not get location. Enable GPS.');
    } finally { setActionLoading(false); }
  };

  const checkOut = async () => {
    setActionLoading(true);
    try {
      const loc = await getLocation();
      const { data } = await api.post('/attendance/checkout', loc);
      toast.success(`${data.message} — ${data.workingHours}h worked`);
      setToday(data.attendance);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check out');
    } finally { setActionLoading(false); }
  };

  const isCheckedIn = today?.checkInTime && !today?.checkOutTime;
  const isComplete = today?.checkInTime && today?.checkOutTime;

  return (
    <EmployeeLayout title="Attendance">
      {/* Check-in card */}
      <div className="checkin-card mb-6">
        <div className="checkin-time">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        <div className="checkin-date">{formatDate(new Date())}</div>

        {isComplete ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div className="checkin-btn-big done"><CheckCircle size={32} /><span>Done!</span></div>
            <p style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>Worked {today.workingHours}h today 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <button className={`checkin-btn-big ${isCheckedIn ? 'out' : 'in'}`} onClick={isCheckedIn ? checkOut : checkIn} disabled={actionLoading}>
              {actionLoading ? <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /> :
                isCheckedIn ? <><LogOut size={28} /><span>Check Out</span></> : <><LogIn size={28} /><span>Check In</span></>
              }
            </button>
            {isCheckedIn && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
                Checked in at {formatTime(today.checkInTime)}
              </p>
            )}
          </div>
        )}

        {/* Status row */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {[['Check In', formatTime(today?.checkInTime), '#22c55e'], ['Check Out', formatTime(today?.checkOutTime), '#ef4444'], ['Hours', today?.workingHours ? `${today.workingHours}h` : '—', '#4f8ef7']].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{l}</div>
              <div style={{ fontWeight: 700, color: v === '—' ? 'var(--text-muted)' : c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="section-header"><span className="section-title">Attendance History</span></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Working Hours</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : history.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><p>No attendance records</p></div></td></tr>
              : history.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.date}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatTime(r.checkInTime)}</td>
                  <td style={{ color: r.checkOutTime ? 'var(--danger)' : 'var(--text-muted)' }}>{formatTime(r.checkOutTime)}</td>
                  <td>
                    {r.workingHours ? <span style={{ fontWeight: 700, color: r.workingHours >= 8 ? 'var(--success)' : r.workingHours >= 4 ? 'var(--warning)' : 'var(--danger)' }}>{r.workingHours}h</span> : '—'}
                  </td>
                  <td><span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'half-day' ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'capitalize' }}>{r.status}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </EmployeeLayout>
  );
}
