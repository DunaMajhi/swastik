import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MapPin, ClipboardCheck,
  TrendingUp, CheckSquare, Settings, LogOut,
  BarChart2, Map
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getInitials } from '../lib/utils';

const adminLinks = [
  { section: 'Overview' },
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/map', icon: Map, label: 'Live Map' },
  { section: 'Management' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/admin/leads', icon: TrendingUp, label: 'Leads / CRM' },
  { to: '/admin/tasks', icon: CheckSquare, label: 'Tasks' },
  { section: 'Analytics' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const employeeLinks = [
  { section: 'My Work' },
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/employee/leads', icon: TrendingUp, label: 'My Leads' },
  { to: '/employee/tasks', icon: CheckSquare, label: 'My Tasks' },
];

export default function Sidebar({ role }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⚡ SwastikForce</h1>
        <span>{role === 'admin' ? 'Admin Panel' : 'Employee Portal'}</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((item, i) => {
          if (item.section) return (
            <div key={i} className="nav-section-label">{item.section}</div>
          );
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-chip-avatar">{getInitials(user?.name)}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="user-chip-name" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div className="user-chip-role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '6px', borderRadius: '8px' }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
