import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { BadgeCheck, Search, Star, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Badge, Avatar } from '@/components/ui';
import { StarRating } from '@/components/StarRating';
import type { Profile } from '@/types';

export function AdminProvidersPage() {
  const { navigate } = useRouter();
  const [providers, setProviders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'premium'>('all');

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProviders((data as Profile[]) || []);
        setLoading(false);
      });
  }, []);

  async function toggleVerified(provider: Profile) {
    const newVal = !provider.is_verified;
    await supabase.from('profiles').update({ is_verified: newVal }).eq('id', provider.id);
    setProviders(providers.map((p) => p.id === provider.id ? { ...p, is_verified: newVal } : p));
  }

  const filtered = providers.filter((p) => {
    const matchesSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'verified' && p.is_verified) ||
      (filter === 'unverified' && !p.is_verified) ||
      (filter === 'premium' && p.is_premium);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <h1 className="text-3xl font-bold font-display text-neutral-900 mb-2">Service Providers</h1>
        <p className="text-neutral-500 mb-6">Verify and manage all service providers on the platform.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search by name or email..."
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'verified', 'unverified', 'premium'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-neutral-500">No providers found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((provider) => (
              <div key={provider.id} className="card p-4 flex items-center gap-4">
                <Avatar name={provider.full_name} src={provider.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900 truncate">{provider.full_name}</p>
                    {provider.is_verified && <BadgeCheck size={16} className="text-primary-600" />}
                    {provider.is_premium && <Badge variant="accent"><Star size={10} /> Premium</Badge>}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{provider.email}</p>
                  <p className="text-xs text-neutral-400">Joined {formatDate(provider.created_at)}</p>
                </div>
                <div className="shrink-0">
                  {provider.is_verified ? (
                    <button onClick={() => toggleVerified(provider)} className="btn-outline text-xs px-3 py-2">Unverify</button>
                  ) : (
                    <button onClick={() => toggleVerified(provider)} className="btn-primary text-xs px-3 py-2">
                      <BadgeCheck size={14} /> Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
