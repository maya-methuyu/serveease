import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ClipboardList, DollarSign, Star, TrendingUp, ArrowRight,
  Clock3, CheckCircle2, BadgeCheck, AlertCircle,
} from '@/components/Icons';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { statusConfig } from '@/lib/bookingStatus';
import { Badge, Avatar } from '@/components/ui';
import { StarRating } from '@/components/StarRating';
import type { Booking, ProviderService, Review } from '@/types';

export function ProviderDashboard() {
  const { navigate } = useRouter();
  const { profile, session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    Promise.all([
      supabase
        .from('bookings')
        .select(`*, service:services(*), customer:profiles!bookings_customer_id_fkey(*)`)
        .eq('provider_id', session.user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('provider_services')
        .select(`*, service:services(*)`)
        .eq('provider_id', session.user.id),
      supabase
        .from('reviews')
        .select(`*, customer:profiles!reviews_customer_id_fkey(*)`)
        .eq('provider_id', session.user.id)
        .order('created_at', { ascending: false }),
    ]).then(([bRes, psRes, rRes]) => {
      setBookings((bRes.data as Booking[]) || []);
      setProviderServices((psRes.data as ProviderService[]) || []);
      setReviews((rRes.data as Review[]) || []);
      setLoading(false);
    });
  }, [session]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + Number(b.total_amount) * 0.85, 0);
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold font-display text-neutral-900">
              {profile?.full_name?.split(' ')[0] || 'Provider'}'s Dashboard
            </h1>
            {profile?.is_verified ? (
              <BadgeCheck size={24} className="text-primary-600" />
            ) : (
              <Badge variant="warning">Pending verification</Badge>
            )}
          </div>
          <p className="text-neutral-500">Manage your services, bookings, and earnings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ClipboardList size={20} />} value={pendingBookings.length.toString()} label="Pending requests" color="primary" onClick={() => navigate('/provider/bookings')} />
          <StatCard icon={<Clock3 size={20} />} value={activeBookings.length.toString()} label="Active bookings" color="secondary" onClick={() => navigate('/provider/bookings')} />
          <StatCard icon={<CheckCircle2 size={20} />} value={completedBookings.length.toString()} label="Completed" color="accent" onClick={() => navigate('/provider/bookings')} />
          <StatCard icon={<DollarSign size={20} />} value={formatCurrency(totalEarnings)} label="Earnings (85%)" color="primary" />
        </div>

        {!profile?.is_verified && (
          <div className="card p-4 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-600" />
              <p className="text-sm text-amber-800">
                Your account is pending admin verification. You can set up your services, but customers won't see you listed until verified.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending bookings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-neutral-900">Pending Requests</h2>
              <button onClick={() => navigate('/provider/bookings')} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight size={16} />
              </button>
            </div>
            {loading ? (
              <div className="card p-6 animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-neutral-100 rounded-xl" />)}
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={28} className="text-neutral-300" />
                </div>
                <p className="text-neutral-500 font-medium mb-2">No pending requests</p>
                <p className="text-sm text-neutral-400">New booking requests will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.slice(0, 5).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onClick={() => navigate(`/provider/bookings/${booking.id}`)} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Rating */}
            <div className="card p-6 mb-4">
              <h3 className="font-semibold text-neutral-900 mb-3">Your Rating</h3>
              <div className="flex items-center gap-3">
                <StarRating rating={avgRating} showNumber size={20} />
              </div>
              <p className="text-sm text-neutral-400 mt-2">{reviews.length} total reviews</p>
              {reviews.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="text-sm pb-2 border-b border-neutral-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size={10} />
                        <span className="text-xs text-neutral-400">{review.customer?.full_name}</span>
                      </div>
                      {review.comment && <p className="text-neutral-600 mt-1 line-clamp-2">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => navigate('/provider/services')} className="btn-outline w-full justify-start">
                  Manage Services
                </button>
                <button onClick={() => navigate('/profile')} className="btn-outline w-full justify-start">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color, onClick }: { icon: React.ReactNode; value: string; label: string; color: 'primary' | 'secondary' | 'accent'; onClick?: () => void }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
  };
  return (
    <button onClick={onClick} disabled={!onClick} className="card p-5 flex items-center gap-4 text-left hover:shadow-md transition-all disabled:cursor-default">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </button>
  );
}

function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const status = statusConfig[booking.status];
  return (
    <button onClick={onClick} className="card p-4 w-full text-left hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-neutral-900 text-sm">{booking.service?.name}</p>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={booking.customer?.full_name || ''} src={booking.customer?.avatar_url} size="sm" />
        <p className="text-sm text-neutral-600">{booking.customer?.full_name}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>{formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)}</span>
        <span className="font-semibold text-neutral-900">{formatCurrency(Number(booking.total_amount))}</span>
      </div>
    </button>
  );
}
