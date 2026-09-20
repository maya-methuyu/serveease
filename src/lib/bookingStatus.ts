import type { BookingStatus, PaymentStatus } from '@/types';

export const statusConfig: Record<BookingStatus, { label: string; variant: 'warning' | 'secondary' | 'danger' | 'success' | 'neutral' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'danger' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

export const paymentStatusConfig: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' }> = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
};
