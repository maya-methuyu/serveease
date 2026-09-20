import { useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useServices } from '@/lib/hooks';
import { getServiceIcon } from '@/components/Icons';
import {
  ArrowRight, Shield, Clock, BadgeCheck, Star, Wrench,
  Search, Calendar, CheckCircle2, TrendingUp, Users, MapPin,
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';

const popularLocations = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
];

export function LandingPage() {
  const { navigate } = useRouter();
  const { services, loading } = useServices();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('loc', location);
    navigate(`/services${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 lg:pt-28 lg:pb-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-6 animate-fade-in">
              <BadgeCheck size={16} /> Trusted by 50,000+ households across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6 animate-slide-up">
              Trusted Local Home Services<br />
              <span className="text-primary-200">at Your Doorstep</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 leading-relaxed max-w-2xl animate-slide-up">
              Book verified plumbers, electricians, cleaners, and more — right at your doorstep.
              Compare ratings, choose your time, and pay your way.
            </p>

            {/* Search + location bar */}
            <div className="bg-white rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-3 animate-slide-up max-w-2xl">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-3 py-2.5 text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="What service do you need?"
                />
              </div>
              <div className="relative sm:w-48">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  list="locations"
                  className="w-full pl-10 pr-3 py-2.5 text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Select city"
                />
                <datalist id="locations">
                  {popularLocations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
              <button onClick={handleSearch} className="btn-primary sm:px-6 shrink-0">
                <Search size={18} /> Search
              </button>
            </div>

            {/* Popular locations */}
            <div className="flex flex-wrap items-center gap-2 mt-5 animate-slide-up">
              <span className="text-sm text-primary-200">Popular:</span>
              {popularLocations.slice(0, 5).map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setLocation(loc); handleSearch(); }}
                  className="text-sm text-white/80 hover:text-white px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-slide-up">
              <button
                onClick={() => navigate('/services')}
                className="btn bg-white text-primary-700 hover:bg-primary-50 active:scale-95 shadow-lg"
              >
                <Search size={18} /> Browse All Services
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn border-2 border-white/30 text-white hover:bg-white/10 active:scale-95"
              >
                Become a Provider <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 20C1200 60 960 0 720 20C480 40 240 70 0 30L0 80Z" fill="#f8f9fa" />
        </svg>
      </section>

      {/* Stats bar */}
      <section className="bg-neutral-50 -mt-1 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users size={22} />} value="50K+" label="Happy customers" />
            <StatCard icon={<Wrench size={22} />} value="2,500+" label="Verified providers" />
            <StatCard icon={<Star size={22} />} value="4.8/5" label="Average rating" />
            <StatCard icon={<Clock size={22} />} value="24/7" label="Service available" />
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-neutral-900 mb-3">Services for every need</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">From quick fixes to deep cleans — find the right professional for any home service.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-12 w-12 rounded-xl bg-neutral-200 mb-4" />
                  <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
                  <div className="h-3 w-16 bg-neutral-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {services.map((service, i) => {
                const Icon = getServiceIcon(service.icon);
                return (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="card p-6 text-left hover:shadow-lg hover:border-primary-200 transition-all duration-300 group animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                      <Icon className="text-primary-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-neutral-900 text-sm mb-1">{service.name}</h3>
                    <p className="text-xs text-neutral-500 mb-2 line-clamp-2">{service.description}</p>
                    <p className="text-sm font-semibold text-primary-600">From {formatCurrency(service.base_price)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-neutral-900 mb-3">How it works</h2>
            <p className="text-neutral-500">Book a service in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              icon={<Search size={28} />}
              step="01"
              title="Choose a service"
              desc="Browse from our catalog of home services and find what you need."
            />
            <StepCard
              icon={<Calendar size={28} />}
              step="02"
              title="Pick a provider & time"
              desc="Compare verified providers by rating and price. Select your preferred date and time."
            />
            <StepCard
              icon={<CheckCircle2 size={28} />}
              step="03"
              title="Sit back and relax"
              desc="Your provider arrives on time. Pay online or in cash. Rate your experience."
            />
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display text-neutral-900 mb-4">Why customers trust NammaService</h2>
              <p className="text-neutral-500 mb-8">We vet every provider, so you don't have to worry about who's coming into your home.</p>

              <div className="space-y-5">
                <FeatureRow icon={<Shield size={20} />} title="Verified & background-checked" desc="Every provider goes through identity verification and background checks before joining." />
                <FeatureRow icon={<Star size={20} />} title="Transparent ratings" desc="Real reviews from real customers. No fake ratings, no hidden surprises." />
                <FeatureRow icon={<Clock size={20} />} title="On-time guarantee" desc="Providers arrive within the scheduled time slot or your convenience fee is waived." />
                <FeatureRow icon={<TrendingUp size={20} />} title="Fair pricing" desc="Compare prices upfront. No haggling, no last-minute charges." />
              </div>
            </div>

            <div className="relative">
              <div className="card p-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                    <BadgeCheck size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">NammaService Promise</p>
                    <p className="text-sm text-primary-100">Your satisfaction, guaranteed</p>
                  </div>
                </div>
                <p className="text-primary-50 leading-relaxed mb-6">
                  If you're not happy with the service, we'll make it right. Every booking is backed by our satisfaction guarantee.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs text-primary-100">Satisfaction</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-primary-100">Hidden fees</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-xs text-primary-100">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display text-neutral-900 mb-4">Ready to get started?</h2>
          <p className="text-neutral-500 mb-8 max-w-lg mx-auto">Join thousands of households who trust NammaService for their home service needs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/signup')} className="btn-primary px-8 py-3 text-base">
              Sign Up Now <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/services')} className="btn-outline px-8 py-3 text-base">
              Explore Services
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

function StepCard({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <div className="relative card p-8 hover:shadow-md transition-shadow">
      <div className="absolute top-4 right-5 text-4xl font-bold font-display text-neutral-100">{step}</div>
      <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 mb-1">{title}</h4>
        <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
