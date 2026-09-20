import { useRouter, parseQuery } from '@/context/RouterContext';
import { useServices } from '@/lib/hooks';
import { getServiceIcon } from '@/components/Icons';
import { formatCurrency } from '@/lib/format';
import { Search, ArrowRight, MapPin } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ServicesPage() {
  const { navigate } = useRouter();
  const { services, loading } = useServices();
  const queryParams = parseQuery(window.location.search);
  const [search, setSearch] = useState(queryParams.q || '');
  const [location, setLocation] = useState(queryParams.loc || '');
  const [category, setCategory] = useState('All');

  const categories = ['All', ...new Set(services.map((s) => s.category))];

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || s.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-neutral-900 mb-2">Browse Services</h1>
          <p className="text-neutral-500">Find the right professional for any home service.</p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search for a service..."
            />
          </div>
          <div className="relative sm:w-56">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input pl-10"
              placeholder="Filter by city..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                category === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-14 w-14 rounded-xl bg-neutral-200 mb-4" />
                <div className="h-5 w-32 bg-neutral-200 rounded mb-2" />
                <div className="h-3 w-full bg-neutral-100 rounded mb-1" />
                <div className="h-3 w-3/4 bg-neutral-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => {
              const Icon = getServiceIcon(service.icon);
              return (
                <button
                  key={service.id}
                  onClick={() => navigate(`/services/${service.id}`)}
                  className="card p-6 text-left hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Icon className="text-primary-600" size={28} />
                    </div>
                    <span className="badge bg-neutral-100 text-neutral-600">{service.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <span className="font-semibold text-primary-600">From {formatCurrency(service.base_price)}</span>
                    <span className="flex items-center gap-1 text-sm text-neutral-400 group-hover:text-primary-600 transition-colors">
                      View <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg">No services found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
