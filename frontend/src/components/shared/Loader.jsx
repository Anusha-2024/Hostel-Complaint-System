export const Spinner = () => <div className="spinner" />;

export const PageLoader = () => (
  <div className="page-loader">
    <Spinner />
  </div>
);

export const EmptyState = ({ icon = '📭', title, subtitle }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h4>{title}</h4>
    {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
  </div>
);
