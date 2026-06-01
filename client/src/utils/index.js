import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns';

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d');
};

export const isOverdue = (date) => date && isPast(new Date(date));

export const priorityMeta = {
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10 text-red-400' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10 text-orange-400' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10 text-yellow-400' },
  low: { label: 'Low', color: 'text-zinc-400', bg: 'bg-zinc-500/10 text-zinc-400' },
};

export const statusMeta = {
  backlog: { label: 'Backlog', color: 'bg-zinc-600', dot: 'bg-zinc-400' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-600', dot: 'bg-blue-400' },
  review: { label: 'Review', color: 'bg-purple-600', dot: 'bg-purple-400' },
  completed: { label: 'Completed', color: 'bg-green-600', dot: 'bg-green-400' },
};

export const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export const colorFromString = (str) => {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
