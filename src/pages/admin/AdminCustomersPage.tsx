import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { Search, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Avatar } from '@/components/ui';
import type { Profile } from '@/types';

export function AdminCustomersPage() {
  const { navigate } = useRouter();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCustomers((data as Profile[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = customers.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <h1 className="text-3xl font-bold font-display text-neutral-900 mb-2">Customers</h1>
        <p className="text-neutral-500 mb-6">View all registered customers on the platform.</p>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search by name or email..."
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-16" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-neutral-500">No customers found.</p>
          </div>
        ) : (
          <div className="card divide-y divide-neutral-100">
            {filtered.map((customer) => (
              <div key={customer.id} className="p-4 flex items-center gap-4">
                <Avatar name={customer.full_name} src={customer.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{customer.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-neutral-500 truncate">{customer.email}</p>
                </div>
                <div className="text-right shrink-0 text-xs text-neutral-400">
                  <p>{customer.location || 'No location'}</p>
                  <p>Joined {formatDate(customer.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
