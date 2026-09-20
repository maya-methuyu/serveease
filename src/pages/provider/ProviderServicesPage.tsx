import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useServices } from '@/lib/hooks';
import {
  Plus, Edit, Trash2, Star, Loader2, ArrowLeft,
} from '@/components/Icons';
import { getServiceIcon } from '@/components/Icons';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui';
import { Modal } from '@/components/Modal';
import type { ProviderService, Service } from '@/types';

export function ProviderServicesPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();
  const { services: allServices } = useServices();
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProviderService | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('provider_services')
      .select(`*, service:services(*)`)
      .eq('provider_id', session.user.id)
      .order('is_featured', { ascending: false })
      .then(({ data }) => {
        setProviderServices((data as ProviderService[]) || []);
        setLoading(false);
      });
  }, [session]);

  function openAdd() {
    setEditing(null);
    setSelectedServiceId('');
    setPrice('');
    setDescription('');
    setIsFeatured(false);
    setError('');
    setModalOpen(true);
  }

  function openEdit(ps: ProviderService) {
    setEditing(ps);
    setSelectedServiceId(ps.service_id);
    setPrice(ps.price.toString());
    setDescription(ps.description || '');
    setIsFeatured(ps.is_featured);
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) return;
    setSubmitting(true);
    setError('');

    const payload = {
      provider_id: session.user.id,
      service_id: selectedServiceId,
      price: parseFloat(price),
      description,
      is_featured: isFeatured,
    };

    let result;
    if (editing) {
      result = await supabase
        .from('provider_services')
        .update(payload)
        .eq('id', editing.id);
    } else {
      result = await supabase
        .from('provider_services')
        .insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }

    // Refresh
    const { data } = await supabase
      .from('provider_services')
      .select(`*, service:services(*)`)
      .eq('provider_id', session.user.id)
      .order('is_featured', { ascending: false });
    setProviderServices((data as ProviderService[]) || []);
    setModalOpen(false);
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('provider_services').delete().eq('id', id);
    setProviderServices(providerServices.filter((ps) => ps.id !== id));
  }

  const availableServices = allServices.filter(
    (s) => !providerServices.some((ps) => ps.service_id === s.id)
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/provider')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-display text-neutral-900 mb-1">My Services</h1>
            <p className="text-neutral-500">Manage the services you offer and their pricing.</p>
          </div>
          <button onClick={openAdd} disabled={availableServices.length === 0} className="btn-primary">
            <Plus size={18} /> Add Service
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-24" />)}
          </div>
        ) : providerServices.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Plus size={28} className="text-neutral-300" />
            </div>
            <p className="text-neutral-500 font-medium mb-2">No services added yet</p>
            <p className="text-sm text-neutral-400 mb-4">Add services to start receiving bookings.</p>
            {availableServices.length > 0 && (
              <button onClick={openAdd} className="btn-primary">Add Your First Service</button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {providerServices.map((ps) => {
              const Icon = getServiceIcon(ps.service?.icon || 'Wrench');
              return (
                <div key={ps.id} className="card p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-neutral-900">{ps.service?.name}</h4>
                      {ps.is_featured && <Badge variant="accent"><Star size={10} /> Featured</Badge>}
                    </div>
                    {ps.description && <p className="text-sm text-neutral-500 line-clamp-1">{ps.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary-600">{formatCurrency(ps.price)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(ps)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(ps.id)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="label">Service</label>
            <select
              required
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                const svc = allServices.find((s) => s.id === e.target.value);
                if (svc && !editing) setPrice(svc.base_price.toString());
              }}
              disabled={!!editing}
              className="input"
            >
              <option value="">Select a service</option>
              {(editing ? allServices : availableServices).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Price (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="299"
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Describe what's included in this service..."
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600"
            />
            <div>
              <p className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                <Star size={14} className="text-accent-500" /> Featured listing
              </p>
              <p className="text-xs text-neutral-500">Appear at the top of search results (premium feature)</p>
            </div>
          </label>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : editing ? 'Update Service' : 'Add Service'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
