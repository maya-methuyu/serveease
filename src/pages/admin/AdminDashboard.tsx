import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Users, Wrench, DollarSign, TrendingUp, ArrowRight,
  ClipboardList, Star, BadgeCheck, BarChart3,
} from '@/components/Icons';
import { formatCurrency, formatDate } from '@/lib/format';
import { statusConfig } from '@/lib/bookingStatus';
import { Badge, Avatar } from '@/components/ui';
import type { Booking, Profile, Review } from '@/types';

export function AdminDashboard() {
  const { navigate } = useRouter();
  const [stats, setStats] = useState({ customers: 0, providers: 0, bookings: 0, revenue: 0, pendingProviders: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [pendingProviders, setPendingProviders] = useState<Profile[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider').eq('is_verified', false),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select(`*, service:services(*), customer:profiles!bookings_customer_id_fkey(*), provider:profiles!bookings_provider_id_fkey(*)`).order('created_at', { ascending: false }).limit(5),
      supabase.from('profiles').select('*').eq('role', 'provider').eq('is_verified', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('reviews').select(`*, customer:profiles!reviews_customer_id_fkey(*), provider:profiles!reviews_provider_id_fkey(*)`).order('created_at', { ascending: false }).limit(5),
    ]).then((results) => {
      const completedRevenue = results[3].count || 0;
      setStats({
        customers: results[0].count || 0,
        providers: results[1].count || 0,
        bookings: results[3].count || 0,
        revenue: completedRevenue * 20, // convenience fees as platform revenue proxy
        pendingProviders: results[2].count || 0,
      });
      setRecentBookings((results[4].data as Booking[]) || []);
      setPendingProviders((results[5].data as Profile[]) || []);
      setRecentReviews((results[6].data as Review[]) || []);
      setLoading(false);
    });
  }, []);

  async function verifyProvider(id: string) {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', id);
    setPendingProviders(pendingProviders.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-neutral-900 mb-1">Admin Dashboard</h1>
          <p className="text-neutral-500">Monitor and manage the NammaService platform.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users size={20} />} value={stats.customers.toString()} label="Customers" color="primary" onClick={() => navigate('/admin/customers')} />
          <StatCard icon={<Wrench size={20} />} value={stats.providers.toString()} label="Providers" color="secondary" onClick={() => navigate('/admin/providers')} />
          <StatCard icon={<ClipboardList size={20} />} value={stats.bookings.toString()} label="Total Bookings" color="accent" onClick={() => navigate('/admin/bookings')} />
          <StatCard icon={<DollarSign size={20} />} value={formatCurrency(stats.revenue)} label="Platform Revenue" color="primary" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending verifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-neutral-900">Pending Verifications</h2>
              {stats.pendingProviders > 0 && <Badge variant="warning">{stats.pendingProviders} pending</Badge>}
            </div>
            {loading ? (
              <div className="card p-6 animate-pulse space-y-3">
                {[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl" />)}
              </div>
            ) : pendingProviders.length === 0 ? (
              <div className="card p-8 text-center">
                <BadgeCheck size={32} className="text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">All providers verified</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProviders.map((provider) => (
                  <div key={provider.id} className="card p-4 flex items-center gap-3">
                    <Avatar name={provider.full_name} src={provider.avatar_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 text-sm truncate">{provider.full_name}</p>
                      <p className="text-xs text-neutral-500 truncate">{provider.email}</p>
                      <p className="text-xs text-neutral-400">{formatDate(provider.created_at)}</p>
                    </div>
                    <button onClick={() => verifyProvider(provider.id)} className="btn-primary text-xs px-3 py-2">
                      <BadgeCheck size={14} /> Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-neutral-900">Recent Bookings</h2>
              <button onClick={() => navigate('/admin/bookings')} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight size={16} />
              </button>
            </div>
            {loading ? (
              <div className="card p-6 animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl" />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="card p-8 text-center">
                <ClipboardList size={32} className="text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const status = statusConfig[booking.status];
                  return (
                    <div key={booking.id} className="card p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm truncate">{booking.service?.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{booking.customer?.full_name} → {booking.provider?.full_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <p className="text-xs text-neutral-400 mt-1">{formatDate(booking.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent reviews */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-neutral-900">Recent Reviews</h2>
              <button onClick={() => navigate('/admin/reviews')} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight size={16} />
              </button>
            </div>
            {loading ? (
              <div className="card p-6 animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl" />)}
              </div>
            ) : recentReviews.length === 0 ? (
              <div className="card p-8 text-center">
                <Star size={32} className="text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No reviews yet</p>
              </div>
            ) : (
              <div className="card divide-y divide-neutral-100">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-4 flex items-center gap-3">
                    <Avatar name={review.customer?.full_name || ''} src={review.customer?.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-neutral-900 truncate">{review.customer?.full_name}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < review.rating ? 'fill-accent-400 text-accent-400' : 'fill-neutral-200 text-neutral-200'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">→ {review.provider?.full_name}</p>
                      {review.comment && <p className="text-xs text-neutral-600 mt-1 line-clamp-1">{review.comment}</p>}
                    </div>
                    <span className="text-xs text-neutral-400 shrink-0">{formatDate(review.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
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
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </button>
  );
}
