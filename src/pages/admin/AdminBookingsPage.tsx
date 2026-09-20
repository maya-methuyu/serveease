import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Search } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { statusConfig } from '@/lib/bookingStatus';
import { Badge } from '@/components/ui';
import type { Booking, BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

export function AdminBookingsPage() {
  const { navigate } = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    supabase
      .from('bookings')
      .select(`*, service:services(*), customer:profiles!bookings_customer_id_fkey(*), provider:profiles!bookings_provider_id_fkey(*)`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch =
      b.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.provider?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters: { label: string; value: BookingStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <h1 className="text-3xl font-bold font-display text-neutral-900 mb-2">All Bookings</h1>
        <p className="text-neutral-500 mb-6">Monitor all bookings across the platform.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search by service, customer, or provider..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                filter === f.value ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-neutral-500">No bookings found.</p>
          </div>
        ) : (
          <div className="card divide-y divide-neutral-100">
            {filtered.map((booking) => {
              const status = statusConfig[booking.status];
              return (
                <div key={booking.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-neutral-900 text-sm truncate">{booking.service?.name}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-neutral-500 truncate">
                      {booking.customer?.full_name} → {booking.provider?.full_name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-neutral-900 text-sm">{formatCurrency(Number(booking.total_amount))}</p>
                    <p className="text-xs text-neutral-400">{booking.payment_method}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
