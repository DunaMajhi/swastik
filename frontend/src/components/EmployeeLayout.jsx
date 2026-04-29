import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function EmployeeLayout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar role="employee" />
      <div className="main-content">
        <Topbar title={title} />
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
