import { useRouter, parseQuery } from '@/context/RouterContext';
import { useProviders, useProviderRating } from '@/lib/hooks';
import { ArrowLeft, MapPin, Star, BadgeCheck, ArrowRight, Search } from '@/components/Icons';
import { StarRating } from '@/components/StarRating';
import { Avatar, Badge } from '@/components/ui';
import { useState } from 'react';
import type { Profile } from '@/types';

export function ProvidersPage() {
  const { navigate } = useRouter();
  const { providers, loading } = useProviders();
  const [search, setSearch] = useState('');

  const filtered = providers.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-neutral-900 mb-2">Find Providers</h1>
          <p className="text-neutral-500">Browse all verified service providers in your area.</p>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search by name or location..."
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-neutral-200 rounded" />
                    <div className="h-3 w-16 bg-neutral-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-neutral-400 text-lg mb-2">No providers found.</p>
            <p className="text-sm text-neutral-400">Try a different search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((provider) => (
              <ProviderListCard
                key={provider.id}
                provider={provider}
                onClick={() => navigate(`/providers/${provider.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderListCard({ provider, onClick }: { provider: Profile; onClick: () => void }) {
  const { avgRating, reviewCount } = useProviderRating(provider.id);

  return (
    <button onClick={onClick} className="card p-6 text-left hover:shadow-lg hover:border-primary-200 transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <Avatar name={provider.full_name} src={provider.avatar_url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 truncate">{provider.full_name}</h3>
            {provider.is_verified && <BadgeCheck size={16} className="text-primary-600 shrink-0" />}
          </div>
          {provider.location && (
            <div className="flex items-center gap-1 text-sm text-neutral-500 mb-2">
              <MapPin size={14} /> {provider.location}
            </div>
          )}
          <div className="flex items-center gap-3">
            <StarRating rating={avgRating} showNumber size={14} />
            <span className="text-xs text-neutral-400">({reviewCount})</span>
            {provider.is_premium && <Badge variant="accent"><Star size={10} /> Premium</Badge>}
          </div>
        </div>
        <ArrowRight size={18} className="text-neutral-300 group-hover:text-primary-600 transition-colors shrink-0 mt-2" />
      </div>
      {provider.bio && <p className="text-sm text-neutral-500 mt-3 line-clamp-2">{provider.bio}</p>}
    </button>
  );
}
