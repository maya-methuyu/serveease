import { useState, useEffect } from 'react';
import { useRouter, parseQuery } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft, Calendar, Clock, MapPin, CreditCard, Wallet,
  Loader2, AlertCircle, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Profile, Service, ProviderService } from '@/types';

const CONVENIENCE_FEE = 20;

export function BookingPage() {
  const { navigate } = useRouter();
  const { profile, session } = useAuth();
  const query = parseQuery(window.location.search);
  const providerId = query.provider;
  const serviceId = query.service;

  const [provider, setProvider] = useState<Profile | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [providerService, setProviderService] = useState<ProviderService | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(profile?.location || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  useEffect(() => {
    async function loadData() {
      const [{ data: pData }, { data: sData }, { data: psData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', providerId).maybeSingle(),
        supabase.from('services').select('*').eq('id', serviceId).maybeSingle(),
        supabase
          .from('provider_services')
          .select('*')
          .eq('provider_id', providerId)
          .eq('service_id', serviceId)
          .maybeSingle(),
      ]);
      setProvider(pData as Profile | null);
      setService(sData as Service | null);
      setProviderService(psData as ProviderService | null);
      setLoading(false);
    }
    if (providerId && serviceId) loadData();
    else setLoading(false);
  }, [providerId, serviceId]);

  const basePrice = providerService?.price ?? service?.base_price ?? 0;
  const total = basePrice + CONVENIENCE_FEE;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user || !provider || !service) return;

    setSubmitting(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('bookings')
      .insert({
        customer_id: session.user.id,
        provider_id: provider.id,
        service_id: service.id,
        provider_service_id: providerService?.id || null,
        scheduled_date: date,
        scheduled_time: time,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'online' ? 'paid' : 'pending',
        total_amount: total,
        convenience_fee: CONVENIENCE_FEE,
        address,
        notes,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/bookings');
      }, 2000);
    }
  }

  if (!session || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">Please sign in to book a service.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!provider || !service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">Booking information not found.</p>
        <button onClick={() => navigate('/services')} className="btn-primary">Browse Services</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <CheckCircle2 size={32} className="text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold font-display text-neutral-900 mb-2">Booking Confirmed!</h2>
        <p className="text-neutral-500">Redirecting to your bookings...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('-1')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold font-display text-neutral-900 mb-6">Book a Service</h1>

        {/* Service summary */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Service</p>
              <p className="font-semibold text-neutral-900">{service.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-400">Provider</p>
              <p className="font-semibold text-neutral-900">{provider.full_name}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time */}
          <div className="card p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary-600" /> Schedule
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Time Slot</label>
                <select
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {parseInt(slot) >= 12 ? `${parseInt(slot) - 12 || 12}:00 PM` : `${parseInt(slot)}:00 AM`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" /> Service Address
            </h3>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Full address where the service is needed"
            />
            <div className="mt-3">
              <label className="label">Additional Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[60px] resize-none"
                placeholder="Describe the issue or any specific requirements"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary-600" /> Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <PaymentOption
                active={paymentMethod === 'cash'}
                onClick={() => setPaymentMethod('cash')}
                icon={<Wallet size={20} />}
                title="Cash"
                desc="Pay after service"
              />
              <PaymentOption
                active={paymentMethod === 'online'}
                onClick={() => setPaymentMethod('online')}
                icon={<CreditCard size={20} />}
                title="Online"
                desc="Pay now"
              />
            </div>
          </div>

          {/* Price breakdown */}
          <div className="card p-6 bg-primary-50/40 border-primary-100">
            <h3 className="font-semibold text-neutral-900 mb-4">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Service charge</span>
                <span className="font-medium text-neutral-900">{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Convenience fee</span>
                <span className="font-medium text-neutral-900">{formatCurrency(CONVENIENCE_FEE)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-bold text-primary-600 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>Confirm Booking <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
        active ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${active ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold text-sm text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">{desc}</p>
      </div>
    </button>
  );
}
