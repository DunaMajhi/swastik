import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { connectSocket } from '../../lib/socket';
import { formatTime, getInitials } from '../../lib/utils';

// Fix default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const createIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [36, 36], iconAnchor: [18, 18],
});

const EMP_COLORS = ['#4f8ef7', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

export default function LiveMap() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [geofence, setGeofence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/location/live'),
      api.get('/settings/geofence'),
    ]).then(([loc, gf]) => {
      setLocations(loc.data.locations || []);
      setGeofence(gf.data.value);
    }).finally(() => setLoading(false));

    const socket = connectSocket('admin');
    socket.on('location:update', (data) => {
      setLocations(prev => {
        const idx = prev.findIndex(l => l._id?._id === data.userId || l._id === data.userId);
        const updated = { ...data, _id: { _id: data.userId, name: data.name }, lat: data.lat, lng: data.lng, timestamp: data.timestamp };
        if (idx >= 0) { const copy = [...prev]; copy[idx] = updated; return copy; }
        return [...prev, updated];
      });
    });
    return () => socket.off('location:update');
  }, []);

  const loadRoute = async (userId) => {
    const { data } = await api.get(`/location/history/${userId}`);
    setRouteHistory(data.points?.map(p => [p.lat, p.lng]) || []);
  };

  const center = locations.length > 0
    ? [locations[0].lat, locations[0].lng]
    : [28.6139, 77.2090];

  return (
    <AdminLayout title="Live Employee Map">
      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 120px)' }}>
        {/* Sidebar panel */}
        <div className="card" style={{ width: 280, flexShrink: 0, overflow: 'auto', padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Active Now ({locations.length})
          </div>
          {loading ? <div className="spinner-page"><div className="spinner" /></div> :
            locations.length === 0 ? <div className="empty-state" style={{ padding: 30 }}><p>No active employees</p></div> :
              locations.map((loc, i) => {
                const user = loc._id;
                const color = EMP_COLORS[i % EMP_COLORS.length];
                return (
                  <div key={i} onClick={() => { setSelected(loc); loadRoute(user?._id || loc._id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', background: selected === loc ? 'var(--bg-card-hover)' : 'transparent', transition: 'background 0.15s', marginBottom: 4 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'Employee'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Last: {formatTime(loc.timestamp)}</div>
                    </div>
                    <div className="status-dot online" style={{ marginLeft: 'auto' }} />
                  </div>
                );
              })
          }
        </div>

        {/* Map */}
        <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
            />
            {geofence?.enabled && (
              <Circle center={[geofence.centerLat, geofence.centerLng]} radius={geofence.radius}
                pathOptions={{ color: '#4f8ef7', fillColor: '#4f8ef7', fillOpacity: 0.08 }} />
            )}
            {locations.map((loc, i) => (
              <Marker key={i} position={[loc.lat, loc.lng]} icon={createIcon(EMP_COLORS[i % EMP_COLORS.length])}
                eventHandlers={{ click: () => { setSelected(loc); loadRoute(loc._id?._id || loc._id); } }}>
                <Popup>
                  <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 140 }}>
                    <strong>{loc._id?.name || 'Employee'}</strong><br />
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Last seen: {formatTime(loc.timestamp)}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
            {routeHistory.length > 0 && (
              <Polyline positions={routeHistory} pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '6 4' }} />
            )}
          </MapContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
