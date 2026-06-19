export const statusBadgeClass = (status) => {
  const map = {
    'Submitted': 'badge-submitted',
    'Assigned': 'badge-assigned',
    'In Progress': 'badge-progress',
    'Resolved': 'badge-resolved',
    'Closed': 'badge-closed',
  };
  return map[status] || 'badge-submitted';
};

export const priorityBadgeClass = (priority) => {
  const map = {
    'Low': 'badge-priority-low',
    'Medium': 'badge-priority-medium',
    'High': 'badge-priority-high',
    'Critical': 'badge-priority-critical',
  };
  return map[priority] || 'badge-priority-medium';
};

export const categoryIcon = (category) => {
  const map = {
    Electrical: '⚡', Plumbing: '🔧', Housekeeping: '🧹',
    Internet: '📡', Furniture: '🪑', Mess: '🍽️', 'Water Supply': '💧',
  };
  return map[category] || '📋';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const CATEGORIES = ['Electrical', 'Plumbing', 'Housekeeping', 'Internet', 'Furniture', 'Mess', 'Water Supply'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
