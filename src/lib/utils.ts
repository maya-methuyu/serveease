export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export function avatarColor(seed: string): string {
  const colors = [
    'bg-primary-500', 'bg-secondary-500', 'bg-accent-500',
    'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-sky-500',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
