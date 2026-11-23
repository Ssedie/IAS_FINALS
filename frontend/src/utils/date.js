const TZ = 'Asia/Manila';

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat('en-PH', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatTime(iso) {
  return new Intl.DateTimeFormat('en-PH', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

// YYYY-MM-DD in Manila time, used to group transactions by day.
export function dayKey(iso) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso));
}

export function dayLabel(key) {
  const now = new Date();
  if (key === dayKey(now.toISOString())) return 'Today';
  if (key === dayKey(new Date(now.getTime() - 86400000).toISOString())) return 'Yesterday';
  return new Intl.DateTimeFormat('en-PH', { timeZone: TZ, dateStyle: 'long' }).format(new Date(`${key}T12:00:00+08:00`));
}

export function greeting() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(new Date()));
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}