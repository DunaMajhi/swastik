import { Bell } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { formatDate } from '../lib/utils';

export default function Topbar({ title }) {
  const { user } = useAuthStore();
  const today = formatDate(new Date());

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{today}</span>
        <button className="btn btn-ghost" style={{ padding: '8px', position: 'relative' }}>
          <Bell size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
            {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
