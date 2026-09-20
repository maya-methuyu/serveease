import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getServiceIcon, ArrowRight, ClipboardList, Calendar, Clock3, TrendingUp } from '@/components/Icons';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { statusConfig, paymentStatusConfig } from '@/lib/bookingStatus';
import { Avatar, Badge } from '@/components/ui';
import type { Booking } from '@/types';
import { useServices } from '@/lib/hooks';

export function CustomerDashboard() {
  const { navigate } = useRouter();
  const { profile, session } = useAuth();
  const { services } = useServices();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        provider:profiles!bookings_provider_id_fkey(*)
      `)
      .eq('customer_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) || []);
        setLoading(false);
      });
  }, [session]);

  const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-neutral-900 mb-1">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-neutral-500">Manage your bookings and discover new services.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<ClipboardList size={20} />} value={bookings.length.toString()} label="Total bookings" color="primary" />
          <StatCard icon={<Clock3 size={20} />} value={activeBookings.length.toString()} label="Active bookings" color="secondary" />
          <StatCard icon={<TrendingUp size={20} />} value={formatCurrency(totalSpent)} label="Total spent" color="accent" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick browse */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-neutral-900">Browse Services</h2>
              <button onClick={() => navigate('/services')} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {services.slice(0, 4).map((service) => {
                const Icon = getServiceIcon(service.icon);
                return (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="card p-4 text-center hover:shadow-md hover:border-primary-200 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-100 transition-colors">
                      <Icon className="text-primary-600" size={20} />
                    </div>
                    <p className="text-xs font-medium text-neutral-700 line-clamp-2">{service.name}</p>
                  </button>
                );
              })}
            </div>

            {/* Recent bookings */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-neutral-900">Recent Bookings</h2>
              <button onClick={() => navigate('/customer/bookings')} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight size={16} />
              </button>
            </div>
            {loading ? (
              <div className="card p-6 animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-100 rounded-xl" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-neutral-300" />
                </div>
                <p className="text-neutral-500 font-medium mb-2">No bookings yet</p>
                <p className="text-sm text-neutral-400 mb-4">Browse services and book your first one.</p>
                <button onClick={() => navigate('/services')} className="btn-primary">Browse Services</button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <BookingRow key={booking.id} booking={booking} onClick={() => navigate(`/customer/bookings/${booking.id}`)} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card p-6 mb-4">
              <h3 className="font-semibold text-neutral-900 mb-4">Your Profile</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={profile?.full_name || ''} src={profile?.avatar_url} size="lg" />
                <div>
                  <p className="font-semibold text-neutral-900">{profile?.full_name}</p>
                  <p className="text-sm text-neutral-500">{profile?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {profile?.phone && <div className="flex justify-between"><span className="text-neutral-400">Phone</span><span className="text-neutral-700">{profile.phone}</span></div>}
                {profile?.location && <div className="flex justify-between"><span className="text-neutral-400">Location</span><span className="text-neutral-700">{profile.location}</span></div>}
              </div>
              <button onClick={() => navigate('/profile')} className="btn-outline w-full mt-4">Edit Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: 'primary' | 'secondary' | 'accent' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

function BookingRow({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const status = statusConfig[booking.status];
  const Icon = getServiceIcon(booking.service?.icon || 'Wrench');

  return (
    <button onClick={onClick} className="card p-4 w-full text-left hover:shadow-md transition-all flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
        <Icon className="text-primary-600" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 text-sm truncate">{booking.service?.name}</p>
        <p className="text-xs text-neutral-500 truncate">{booking.provider?.full_name}</p>
        <p className="text-xs text-neutral-400">{formatDate(booking.scheduled_date)} • {formatTime(booking.scheduled_time)}</p>
      </div>
      <div className="text-right shrink-0">
        <Badge variant={status.variant}>{status.label}</Badge>
        <p className="text-sm font-semibold text-neutral-900 mt-1">{formatCurrency(Number(booking.total_amount))}</p>
      </div>
    </button>
  );
}
