import { useRouter } from '@/context/RouterContext';
import { Search, Calendar, CheckCircle2, Shield, Star, Clock, TrendingUp, ArrowRight, BadgeCheck } from 'lucide-react';

export function HowItWorksPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold font-display mb-4">How NammaService Works</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Book trusted home service professionals in three simple steps. It's fast, easy, and reliable.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              icon={<Search size={28} />}
              step="01"
              title="Choose a Service"
              desc="Browse our catalog of home services — from plumbing to cleaning to salon at home. Pick the one you need."
            />
            <StepCard
              icon={<Calendar size={28} />}
              step="02"
              title="Pick a Provider & Time"
              desc="Compare verified providers by rating, price, and location. Choose a date and time that works for you."
            />
            <StepCard
              icon={<CheckCircle2 size={28} />}
              step="03"
              title="Get It Done"
              desc="Your provider arrives on time. Pay online or in cash. Rate your experience to help others choose."
            />
          </div>
        </div>
      </section>

      {/* For customers */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display text-neutral-900 mb-4">For Customers</h2>
              <div className="space-y-4">
                <FeatureRow icon={<Shield size={20} />} title="Verified Providers" desc="Every provider is background-checked and identity-verified." />
                <FeatureRow icon={<Star size={20} />} title="Transparent Reviews" desc="Read real reviews from real customers before booking." />
                <FeatureRow icon={<Clock size={20} />} title="Flexible Scheduling" desc="Pick a time slot that fits your schedule, 7 days a week." />
                <FeatureRow icon={<TrendingUp size={20} />} title="Fair Pricing" desc="See prices upfront. No haggling, no surprise charges." />
              </div>
            </div>
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
              <BadgeCheck size={40} className="text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">NammaService Promise</h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Not satisfied with the service? We'll make it right. Every booking is backed by our satisfaction guarantee.
              </p>
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Get Started <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* For providers */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 card p-8 bg-gradient-to-br from-secondary-50 to-primary-50 border-secondary-100">
              <TrendingUp size={40} className="text-secondary-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Grow Your Business</h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Join thousands of service providers earning on NammaService. Set your own prices, manage your schedule, and grow your customer base.
              </p>
              <button onClick={() => navigate('/signup')} className="btn-secondary">
                Become a Provider <ArrowRight size={18} />
              </button>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold font-display text-neutral-900 mb-4">For Service Providers</h2>
              <div className="space-y-4">
                <FeatureRow icon={<TrendingUp size={20} />} title="Earn More" desc="Keep 85% of every booking. Premium features available from ₹199/month." />
                <FeatureRow icon={<Calendar size={20} />} title="Be Your Own Boss" desc="Accept or decline bookings. Set your availability and pricing." />
                <FeatureRow icon={<Star size={20} />} title="Build Your Reputation" desc="Collect reviews and climb the rankings in your area." />
                <FeatureRow icon={<Shield size={20} />} title="Get Verified" desc="Pass our verification process and earn the trusted badge." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display text-neutral-900 mb-4">Ready to get started?</h2>
          <p className="text-neutral-500 mb-8">Join NammaService today — whether you need a service or want to offer one.</p>
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
