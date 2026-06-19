import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ title, actions, children }) => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-content">
      <Topbar title={title} actions={actions} />
      <div className="page-container">{children}</div>
    </div>
  </div>
);

export default AppLayout;
