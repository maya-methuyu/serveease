import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet,
  Star, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { getServiceIcon } from '@/components/Icons';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { statusConfig, paymentStatusConfig } from '@/lib/bookingStatus';
import { Badge, Avatar } from '@/components/ui';
import { StarRating } from '@/components/StarRating';
import { Modal } from '@/components/Modal';
import type { Booking } from '@/types';

export function BookingDetailPage() {
  const { path, navigate } = useRouter();
  const { session } = useAuth();
  const bookingId = path.split('/')[3];

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        provider:profiles!bookings_provider_id_fkey(*)
      `)
      .eq('id', bookingId)
      .maybeSingle()
      .then(({ data }) => {
        setBooking(data as Booking | null);
        setLoading(false);
      });

    supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle()
      .then(({ data }) => setHasReview(!!data));
  }, [bookingId]);

  async function handleCancel() {
    if (!booking) return;
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id);
    setBooking({ ...booking, status: 'cancelled' });
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user || !booking) return;
    setSubmittingReview(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        booking_id: booking.id,
        customer_id: session.user.id,
        provider_id: booking.provider_id,
        rating,
        comment,
      });

    if (!error) {
      setHasReview(true);
      setReviewModalOpen(false);
    }
    setSubmittingReview(false);
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
        <button onClick={() => navigate('/customer/bookings')} className="btn-primary">Back to Bookings</button>
      </div>
    );
  }

  const status = statusConfig[booking.status];
  const payStatus = paymentStatusConfig[booking.payment_status];
  const Icon = getServiceIcon(booking.service?.icon || 'Wrench');
  const canCancel = booking.status === 'pending' || booking.status === 'accepted';
  const canReview = booking.status === 'completed' && !hasReview;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/customer/bookings')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
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

        {/* Provider info */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Service Provider</h3>
          <button
            onClick={() => navigate(`/providers/${booking.provider_id}`)}
            className="flex items-center gap-4 w-full text-left p-3 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <Avatar name={booking.provider?.full_name || ''} src={booking.provider?.avatar_url} size="lg" />
            <div>
              <p className="font-semibold text-neutral-900">{booking.provider?.full_name}</p>
              {booking.provider?.location && (
                <p className="text-sm text-neutral-500 flex items-center gap-1">
                  <MapPin size={14} /> {booking.provider.location}
                </p>
              )}
            </div>
          </button>
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
              <p className="text-xs text-neutral-400 mb-1">Notes</p>
              <p className="text-sm text-neutral-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Price breakdown */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Service charge</span>
              <span className="font-medium">{formatCurrency(Number(booking.total_amount) - Number(booking.convenience_fee))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Convenience fee</span>
              <span className="font-medium">{formatCurrency(Number(booking.convenience_fee))}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="font-bold text-primary-600 text-lg">{formatCurrency(Number(booking.total_amount))}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {canCancel && (
            <button onClick={handleCancel} className="btn-danger flex-1">
              Cancel Booking
            </button>
          )}
          {canReview && (
            <button onClick={() => setReviewModalOpen(true)} className="btn-primary flex-1">
              <Star size={18} /> Leave a Review
            </button>
          )}
          {hasReview && (
            <div className="flex-1 card p-4 text-center">
              <CheckCircle2 size={20} className="text-primary-600 mx-auto mb-1" />
              <p className="text-sm text-neutral-600">You've reviewed this booking</p>
            </div>
          )}
        </div>
      </div>

      {/* Review modal */}
      <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Rate your experience">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="text-center">
            <Avatar name={booking.provider?.full_name || ''} src={booking.provider?.avatar_url} size="lg" className="mx-auto mb-3" />
            <p className="font-semibold text-neutral-900">{booking.provider?.full_name}</p>
            <p className="text-sm text-neutral-500">{booking.service?.name}</p>
          </div>

          <div className="text-center">
            <label className="label text-center">Your Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={star <= rating ? 'fill-accent-400 text-accent-400' : 'fill-neutral-200 text-neutral-200'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Your Review (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Share your experience with this provider..."
            />
          </div>

          <button type="submit" disabled={submittingReview} className="btn-primary w-full">
            {submittingReview ? <Loader2 size={18} className="animate-spin" /> : 'Submit Review'}
          </button>
        </form>
      </Modal>
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
