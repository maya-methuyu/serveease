import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getServiceIcon, ArrowRight } from '@/components/Icons';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { statusConfig } from '@/lib/bookingStatus';
import { Badge, Avatar } from '@/components/ui';
import type { Booking, BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

export function ProviderBookingsPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('bookings')
      .select(`*, service:services(*), customer:profiles!bookings_customer_id_fkey(*)`)
      .eq('provider_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) || []);
        setLoading(false);
      });
  }, [session]);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const filters: { label: string; value: BookingStatus | 'all'; count: number }[] = [
    { label: 'All', value: 'all', count: bookings.length },
    { label: 'Pending', value: 'pending', count: bookings.filter((b) => b.status === 'pending').length },
    { label: 'Accepted', value: 'accepted', count: bookings.filter((b) => b.status === 'accepted').length },
    { label: 'Completed', value: 'completed', count: bookings.filter((b) => b.status === 'completed').length },
    { label: 'Rejected', value: 'rejected', count: bookings.filter((b) => b.status === 'rejected').length },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold font-display text-neutral-900 mb-2">Booking Requests</h1>
        <p className="text-neutral-500 mb-6">Manage incoming booking requests from customers.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === f.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              )}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-24" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-neutral-500 font-medium mb-2">No bookings in this category</p>
            <p className="text-sm text-neutral-400">Booking requests from customers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const status = statusConfig[booking.status];
              const Icon = getServiceIcon(booking.service?.icon || 'Wrench');
              return (
                <button
                  key={booking.id}
                  onClick={() => navigate(`/provider/bookings/${booking.id}`)}
                  className="card p-5 w-full text-left hover:shadow-md transition-all flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-neutral-900 truncate">{booking.service?.name}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">{booking.customer?.full_name}</p>
                    <p className="text-xs text-neutral-400 mt-1">{formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-neutral-900">{formatCurrency(Number(booking.total_amount))}</p>
                    <ArrowRight size={18} className="text-neutral-300 ml-auto mt-2" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
