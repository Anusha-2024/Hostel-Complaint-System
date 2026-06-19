import { statusBadgeClass, priorityBadgeClass } from '../../utils/helpers';

export const StatusBadge = ({ status }) => (
  <span className={`badge ${statusBadgeClass(status)}`}>
    <span className="badge-dot" />
    {status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${priorityBadgeClass(priority)}`}>
    {priority}
  </span>
);

export const SLABadge = ({ breached }) => {
  if (!breached) return null;
  return (
    <span className="badge badge-priority-critical">
      ⚠ SLA Breached
    </span>
  );
};
