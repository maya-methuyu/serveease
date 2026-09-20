import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet,
  CheckCircle2, XCircle, Phone, Loader2, Star,
} from 'lucide-react';
import { getServiceIcon } from '@/components/Icons';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { statusConfig, paymentStatusConfig } from '@/lib/bookingStatus';
import { Badge, Avatar } from '@/components/ui';
import { StarRating } from '@/components/StarRating';
import type { Booking, Review } from '@/types';

export function ProviderBookingDetailPage() {
  const { path, navigate } = useRouter();
  const bookingId = path.split('/')[3];

  const [booking, setBooking] = useState<Booking | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase
      .from('bookings')
      .select(`*, service:services(*), customer:profiles!bookings_customer_id_fkey(*)`)
      .eq('id', bookingId)
      .maybeSingle()
      .then(({ data }) => {
        setBooking(data as Booking | null);
        setLoading(false);
      });

    supabase
      .from('reviews')
      .select(`*, customer:profiles!reviews_customer_id_fkey(*)`)
      .eq('booking_id', bookingId)
      .then(({ data }) => setReviews((data as Review[]) || []));
  }, [bookingId]);

  async function updateStatus(status: Booking['status']) {
    if (!booking) return;
    setUpdating(true);
    const updates: any = { status };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    await supabase.from('bookings').update(updates).eq('id', booking.id);
    setBooking({ ...booking, ...updates });
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">Booking not found.</p>
        <button onClick={() => navigate('/provider/bookings')} className="btn-primary">Back to Bookings</button>
      </div>
    );
  }

  const status = statusConfig[booking.status];
  const payStatus = paymentStatusConfig[booking.payment_status];
  const Icon = getServiceIcon(booking.service?.icon || 'Wrench');
  const yourEarning = Number(booking.total_amount) * 0.85;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/provider/bookings')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to bookings
        </button>

        {/* Status banner */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                <Icon className="text-primary-600" size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-neutral-900">{booking.service?.name}</h1>
                <p className="text-sm text-neutral-500">Booking #{booking.id.slice(0, 8)}</p>
              </div>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>

        {/* Customer info */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Customer</h3>
          <div className="flex items-center gap-4">
            <Avatar name={booking.customer?.full_name || ''} src={booking.customer?.avatar_url} size="lg" />
            <div>
              <p className="font-semibold text-neutral-900">{booking.customer?.full_name}</p>
              {booking.customer?.phone && (
                <a href={`tel:${booking.customer.phone}`} className="text-sm text-primary-600 flex items-center gap-1 mt-1">
                  <Phone size={14} /> {booking.customer.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Booking Details</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <DetailRow icon={<Calendar size={16} />} label="Date" value={formatDate(booking.scheduled_date)} />
            <DetailRow icon={<Clock size={16} />} label="Time" value={formatTime(booking.scheduled_time)} />
            <DetailRow
              icon={booking.payment_method === 'online' ? <CreditCard size={16} /> : <Wallet size={16} />}
              label="Payment"
              value={`${booking.payment_method === 'online' ? 'Online' : 'Cash'} (${payStatus.label})`}
            />
            <DetailRow icon={<MapPin size={16} />} label="Address" value={booking.address} />
          </div>
          {booking.notes && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">Customer Notes</p>
              <p className="text-sm text-neutral-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Earnings */}
        <div className="card p-6 mb-6 bg-primary-50/40 border-primary-100">
          <h3 className="font-semibold text-neutral-900 mb-4">Earnings Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Total booking amount</span>
              <span className="font-medium">{formatCurrency(Number(booking.total_amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Platform commission (15%)</span>
              <span className="font-medium text-red-500">-{formatCurrency(Number(booking.total_amount) * 0.15)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">Your earnings</span>
              <span className="font-bold text-primary-600 text-lg">{formatCurrency(yourEarning)}</span>
            </div>
          </div>
        </div>

        {/* Review (if completed and exists) */}
        {reviews.length > 0 && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Customer Review</h3>
            {reviews.map((review) => (
              <div key={review.id}>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={review.customer?.full_name || ''} src={review.customer?.avatar_url} size="sm" />
                  <div>
                    <p className="font-medium text-sm text-neutral-900">{review.customer?.full_name}</p>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                </div>
                {review.comment && <p className="text-sm text-neutral-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {booking.status === 'pending' && (
            <>
              <button onClick={() => updateStatus('accepted')} disabled={updating} className="btn-primary flex-1">
                {updating ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Accept</>}
              </button>
              <button onClick={() => updateStatus('rejected')} disabled={updating} className="btn-danger flex-1">
                <XCircle size={18} /> Reject
              </button>
            </>
          )}
          {booking.status === 'accepted' && (
            <button onClick={() => updateStatus('completed')} disabled={updating} className="btn-primary flex-1">
              {updating ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Mark as Completed</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm text-neutral-700 break-words">{value}</p>
      </div>
    </div>
  );
}
