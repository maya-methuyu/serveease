import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Avatar } from '@/components/ui';
import type { Review } from '@/types';

export function AdminReviewsPage() {
  const { navigate } = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('reviews')
      .select(`*, customer:profiles!reviews_customer_id_fkey(*), provider:profiles!reviews_provider_id_fkey(*)`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data as Review[]) || []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(reviews.filter((r) => r.id !== id));
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <h1 className="text-3xl font-bold font-display text-neutral-900 mb-2">All Reviews</h1>
        <p className="text-neutral-500 mb-6">Monitor and moderate customer reviews.</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-20" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-12 text-center">
            <Star size={32} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500">No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="card p-4 flex items-start gap-4">
                <Avatar name={review.customer?.full_name || ''} src={review.customer?.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-neutral-900">{review.customer?.full_name || 'Anonymous'}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-accent-400 text-accent-400' : 'fill-neutral-200 text-neutral-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Reviewing: {review.provider?.full_name}</p>
                  {review.comment && <p className="text-sm text-neutral-600">{review.comment}</p>}
                  <p className="text-xs text-neutral-400 mt-1">{formatDate(review.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
