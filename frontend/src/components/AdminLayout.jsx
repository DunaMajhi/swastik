import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="main-content">
        <Topbar title={title} />
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
