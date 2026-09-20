import { useRouter, parseQuery } from '@/context/RouterContext';
import { useServices, useProviderServices, useProviderRating } from '@/lib/hooks';
import { getServiceIcon, ArrowLeft, Star, BadgeCheck, MapPin, ArrowRight } from '@/components/Icons';
import { formatCurrency } from '@/lib/format';
import { StarRating } from '@/components/StarRating';
import { Avatar, Badge } from '@/components/ui';
import type { Profile } from '@/types';

export function ServiceDetailPage() {
  const { path, navigate } = useRouter();
  const serviceId = path.split('/')[2];

  const { services, loading: servicesLoading } = useServices();
  const { providerServices, loading: psLoading } = useProviderServices(undefined, serviceId);

  const service = services.find((s) => s.id === serviceId);

  if (servicesLoading || psLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-neutral-200 rounded" />
          <div className="h-10 w-64 bg-neutral-200 rounded" />
          <div className="h-32 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-neutral-400 text-lg">Service not found.</p>
        <button onClick={() => navigate('/services')} className="btn-primary mt-4">Browse Services</button>
      </div>
    );
  }

  const Icon = getServiceIcon(service.icon);

  // Group provider services by provider
  const providersMap = new Map<string, { provider: Profile; services: typeof providerServices }>();
  providerServices.forEach((ps) => {
    if (!ps.provider) return;
    const existing = providersMap.get(ps.provider.id);
    if (existing) {
      existing.services.push(ps);
    } else {
      providersMap.set(ps.provider.id, { provider: ps.provider, services: [ps] });
    }
  });

  const providers = Array.from(providersMap.values());

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/services')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to services
        </button>

        {/* Service header */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-white to-primary-50/30 border-primary-100">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
              <Icon className="text-primary-700" size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold font-display text-neutral-900">{service.name}</h1>
                <Badge variant="primary">{service.category}</Badge>
              </div>
              <p className="text-neutral-600 mb-3">{service.description}</p>
              <p className="text-lg font-semibold text-primary-600">Starting from {formatCurrency(service.base_price)}</p>
            </div>
          </div>
        </div>

        {/* Providers */}
        <div>
          <h2 className="text-xl font-bold font-display text-neutral-900 mb-4">
            Available Providers {providers.length > 0 && `(${providers.length})`}
          </h2>

          {providers.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Star size={28} className="text-neutral-300" />
              </div>
              <p className="text-neutral-500 font-medium mb-2">No providers available yet</p>
              <p className="text-sm text-neutral-400 mb-4">Be the first to offer this service.</p>
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Become a Provider
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {providers.map(({ provider, services: ps }) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  providerServices={ps}
                  onView={() => navigate(`/providers/${provider.id}`)}
                  onBook={() => navigate(`/providers/${provider.id}?service=${service.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProviderCard({
  provider, providerServices: ps, onView, onBook,
}: {
  provider: Profile;
  providerServices: any[];
  onView: () => void;
  onBook: () => void;
}) {
  const { avgRating, reviewCount } = useProviderRating(provider.id);
  const minPrice = ps.length > 0 ? Math.min(...ps.map((p) => p.price)) : 0;

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <Avatar name={provider.full_name} src={provider.avatar_url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 truncate">{provider.full_name}</h3>
            {provider.is_verified && (
              <BadgeCheck size={18} className="text-primary-600 shrink-0" />
            )}
          </div>
          {provider.location && (
            <div className="flex items-center gap-1 text-sm text-neutral-500 mb-2">
              <MapPin size={14} /> {provider.location}
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <StarRating rating={avgRating} showNumber size={14} />
            <span className="text-xs text-neutral-400">({reviewCount} reviews)</span>
          </div>
          <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
            {provider.bio || 'Professional service provider with expertise in home services.'}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <div>
              <p className="text-xs text-neutral-400">Starting from</p>
              <p className="font-semibold text-primary-600">{formatCurrency(minPrice)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onView} className="btn-outline text-xs px-3 py-2">View Profile</button>
              <button onClick={onBook} className="btn-primary text-xs px-3 py-2">
                Book Now <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
