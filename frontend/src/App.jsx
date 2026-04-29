import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import LiveMap from './pages/admin/LiveMap';
import Employees from './pages/admin/Employees';
import AdminAttendance from './pages/admin/Attendance';
import AdminLeads from './pages/admin/Leads';
import AdminTasks from './pages/admin/Tasks';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeads from './pages/employee/Leads';
import EmployeeTasks from './pages/employee/Tasks';

function ProtectedRoute({ children, requiredRole }) {
  const { user, token, loading } = useAuthStore();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh' }}><div className="spinner" style={{ width:40,height:40,borderWidth:4 }} /></div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  return children;
}

export default function App() {
  const { fetchMe, token } = useAuthStore();
  useEffect(() => { if (token) fetchMe(); else useAuthStore.setState({ loading: false }); }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background:'var(--bg-card)',color:'var(--text-primary)',border:'1px solid var(--border)',fontFamily:'Inter,sans-serif',fontSize:'0.875rem' }, success:{ iconTheme:{ primary:'var(--success)',secondary:'var(--bg-card)' } }, error:{ iconTheme:{ primary:'var(--danger)',secondary:'var(--bg-card)' } } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/map" element={<ProtectedRoute requiredRole="admin"><LiveMap /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute requiredRole="admin"><Employees /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><AdminAttendance /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute requiredRole="admin"><AdminLeads /></ProtectedRoute>} />
        <Route path="/admin/tasks" element={<ProtectedRoute requiredRole="admin"><AdminTasks /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

        {/* Employee */}
        <Route path="/employee/dashboard" element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/attendance" element={<ProtectedRoute requiredRole="employee"><EmployeeAttendance /></ProtectedRoute>} />
        <Route path="/employee/leads" element={<ProtectedRoute requiredRole="employee"><EmployeeLeads /></ProtectedRoute>} />
        <Route path="/employee/tasks" element={<ProtectedRoute requiredRole="employee"><EmployeeTasks /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
