import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Service, Profile, ProviderService, Review } from '@/types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setServices((data as Service[]) || []);
        setLoading(false);
      });
  }, []);

  return { services, loading };
}

export function useProviders(serviceId?: string) {
  const [providers, setProviders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .order('created_at', { ascending: false });

    if (serviceId) {
      // We'll filter provider_services instead
      supabase
        .from('provider_services')
        .select('provider_id')
        .eq('service_id', serviceId)
        .then(({ data }) => {
          const providerIds = (data || []).map((d) => d.provider_id);
          if (providerIds.length === 0) {
            setProviders([]);
            setLoading(false);
            return;
          }
          supabase
            .from('profiles')
            .select('*')
            .eq('role', 'provider')
            .in('id', providerIds)
            .order('created_at', { ascending: false })
            .then(({ data: pData }) => {
              setProviders((pData as Profile[]) || []);
              setLoading(false);
            });
        });
    } else {
      query.then(({ data }) => {
        setProviders((data as Profile[]) || []);
        setLoading(false);
      });
    }
  }, [serviceId]);

  return { providers, loading };
}

export function useProviderServices(providerId?: string, serviceId?: string) {
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from('provider_services')
      .select(`
        *,
        service:services(*),
        provider:profiles!provider_services_provider_id_fkey(*)
      `);

    if (providerId) query = query.eq('provider_id', providerId);
    if (serviceId) query = query.eq('service_id', serviceId);

    query.order('is_featured', { ascending: false }).then(({ data }) => {
      setProviderServices((data as ProviderService[]) || []);
      setLoading(false);
    });
  }, [providerId, serviceId]);

  return { providerServices, loading };
}

export function useProviderReviews(providerId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    supabase
      .from('reviews')
      .select(`
        *,
        customer:profiles!reviews_customer_id_fkey(*)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data as Review[]) || []);
        setLoading(false);
      });
  }, [providerId]);

  return { reviews, loading };
}

export function useProviderRating(providerId?: string) {
  const { reviews, loading } = useProviderReviews(providerId);
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  return { avgRating, reviewCount: reviews.length, reviews, loading };
}
