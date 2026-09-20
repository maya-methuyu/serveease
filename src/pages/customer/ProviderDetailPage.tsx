import { useRouter } from '@/context/RouterContext';
import { useProviderServices, useProviderReviews } from '@/lib/hooks';
import { ArrowLeft, MapPin, BadgeCheck, Phone, Calendar, Star } from '@/components/Icons';
import { formatCurrency, timeAgo } from '@/lib/format';
import { StarRating } from '@/components/StarRating';
import { Avatar, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import type { Profile } from '@/types';

export function ProviderDetailPage() {
  const { path, navigate } = useRouter();
  const providerId = path.split('/')[2];

  const { providerServices, loading } = useProviderServices(providerId);
  const { reviews, loading: reviewsLoading } = useProviderReviews(providerId);
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const reviewCount = reviews.length;
  const [provider, setProvider] = useState<Profile | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', providerId)
      .maybeSingle()
      .then(({ data }) => setProvider(data as Profile | null));
  }, [providerId]);

  if (loading || reviewsLoading || !provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-neutral-200 rounded" />
          <div className="h-48 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/services')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Provider header */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar name={provider.full_name} src={provider.avatar_url} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold font-display text-neutral-900">{provider.full_name}</h1>
                {provider.is_verified && (
                  <Badge variant="success"><BadgeCheck size={14} /> Verified</Badge>
                )}
              </div>
              {provider.location && (
                <div className="flex items-center gap-1 text-neutral-500 mb-3">
                  <MapPin size={16} /> {provider.location}
                </div>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} showNumber size={18} />
                </div>
                <span className="text-sm text-neutral-400">{reviewCount} reviews</span>
                {provider.is_premium && <Badge variant="accent"><Star size={12} /> Premium</Badge>}
              </div>
              {provider.bio && (
                <p className="text-neutral-600 leading-relaxed mb-4">{provider.bio}</p>
              )}
              {provider.phone && (
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <Phone size={16} /> {provider.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services offered */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold font-display text-neutral-900 mb-4">Services Offered</h2>
          {providerServices.length === 0 ? (
            <p className="text-neutral-400 text-sm">This provider hasn't listed any services yet.</p>
          ) : (
            <div className="space-y-3">
              {providerServices.map((ps) => (
                <div
                  key={ps.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-neutral-200 hover:border-primary-200 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-neutral-900">{ps.service?.name}</h4>
                      {ps.is_featured && <Badge variant="accent">Featured</Badge>}
                    </div>
                    {ps.description && <p className="text-sm text-neutral-500">{ps.description}</p>}
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="font-semibold text-primary-600">{formatCurrency(ps.price)}</span>
                    <button
                      onClick={() => navigate(`/book?provider=${provider.id}&service=${ps.service_id}`)}
                      className="btn-primary text-xs px-3 py-2"
                    >
                      <Calendar size={14} /> Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-display text-neutral-900">Reviews</h2>
            {reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} showNumber size={16} />
                <span className="text-sm text-neutral-400">({reviewCount})</span>
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-neutral-400 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar name={review.customer?.full_name || 'User'} src={review.customer?.avatar_url} size="sm" />
                    <div>
                      <p className="font-medium text-sm text-neutral-900">{review.customer?.full_name || 'Anonymous'}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size={12} />
                        <span className="text-xs text-neutral-400">{timeAgo(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-neutral-600 leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
