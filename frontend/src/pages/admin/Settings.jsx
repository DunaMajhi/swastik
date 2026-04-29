import { useEffect, useState } from 'react';
import { Save, MapPin } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [geofence, setGeofence] = useState({ enabled: false, centerLat: 28.6139, centerLng: 77.2090, radius: 500 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/geofence').then(({ data }) => {
      if (data.value) setGeofence(data.value);
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { key: 'geofence', value: { ...geofence, centerLat: Number(geofence.centerLat), centerLng: Number(geofence.centerLng), radius: Number(geofence.radius) } });
      toast.success('Geofence settings saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setGeofence(p => ({ ...p, [k]: v }));

  return (
    <AdminLayout title="Settings">
      {loading ? <div className="spinner-page"><div className="spinner" /></div> : (
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Geo-Fencing</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set office boundary for attendance check-in</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable Geo-Fencing</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Employees must be within the radius to check in</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                <input type="checkbox" checked={geofence.enabled} onChange={e => set('enabled', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', inset: 0, background: geofence.enabled ? 'var(--accent)' : 'var(--border-light)', borderRadius: 12, transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', left: geofence.enabled ? 22 : 2, top: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
                </span>
              </label>
            </div>

            <div className="grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Office Latitude</label>
                <input type="number" step="0.0001" className="form-control" value={geofence.centerLat} onChange={e => set('centerLat', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Office Longitude</label>
                <input type="number" step="0.0001" className="form-control" value={geofence.centerLng} onChange={e => set('centerLng', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Allowed Radius (meters): <strong style={{ color: 'var(--accent)' }}>{geofence.radius}m</strong></label>
                <input type="range" min={50} max={2000} step={50} value={geofence.radius} onChange={e => set('radius', e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}><span>50m</span><span>2000m</span></div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={save} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>

          <div className="card" style={{ background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.2)' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>Quick Setup</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              To get your office coordinates, open Google Maps, right-click on your office location and copy the coordinates. Paste latitude and longitude above. A typical office radius is <strong>200–500m</strong>.
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
