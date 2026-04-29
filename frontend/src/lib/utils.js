export const formatCurrency = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN');

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (d) => {
  if (!d) return '—';
  return `${formatDate(d)} ${formatTime(d)}`;
};

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const leadStatusLabel = {
  new: 'New',
  contacted: 'Contacted',
  'in-progress': 'In Progress',
  proposal: 'Proposal',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost',
};

export const leadStatusClass = {
  new: 'status-new',
  contacted: 'badge-warning',
  'in-progress': 'badge-purple',
  proposal: '',
  'closed-won': 'badge-success',
  'closed-lost': 'badge-danger',
};

export const priorityClass = {
  low: 'badge-muted',
  medium: 'badge-warning',
  high: 'badge-danger',
  urgent: 'badge-danger',
};
