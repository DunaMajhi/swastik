import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BarChart2, ClipboardCheck, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand">⚡ SwastikForce</div>
        <p className="auth-tagline">The complete sales force management platform for modern teams</p>
        <div className="auth-features">
          {[
            { icon: MapPin, color: '#4f8ef7', bg: 'rgba(79,142,247,0.15)', title: 'GPS Live Tracking', sub: 'Monitor your team in real-time' },
            { icon: ClipboardCheck, color: '#22c55e', bg: 'rgba(34,197,94,0.15)', title: 'Smart Attendance', sub: 'Geo-fenced check-in system' },
            { icon: BarChart2, color: '#a855f7', bg: 'rgba(168,85,247,0.15)', title: 'Sales Analytics', sub: 'Automated reports & insights' },
          ].map(({ icon: Icon, color, bg, title, sub }) => (
            <div className="auth-feature" key={title}>
              <div className="auth-feature-icon" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <div className="auth-feature-text">
                <strong>{title}</strong>
                <span>{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <h2 className="auth-form-title">Sign In</h2>
        <p className="auth-form-sub">Enter your credentials to access the platform</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="email" type="email" className="form-control" placeholder="you@company.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" type={showPass ? 'text' : 'password'} className="form-control"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                required style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: 28 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>Demo Credentials</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Admin', email: 'admin@swastikforce.com', pass: 'admin123' },
              { label: 'Employee', email: 'rahul@swastikforce.com', pass: 'emp123' },
            ].map(({ label, email: e, pass }) => (
              <button key={label} className="btn btn-secondary btn-sm" onClick={() => { setEmail(e); setPassword(pass); }}>
                Use {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
