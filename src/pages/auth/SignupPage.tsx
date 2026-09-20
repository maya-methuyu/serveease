import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import {
  Wrench, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2,
  AlertCircle, ArrowLeft, Check,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

export function SignupPage() {
  const { navigate } = useRouter();
  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Update profile with extra fields
      await supabase
        .from('profiles')
        .update({
          phone,
          location,
          full_name: fullName,
        })
        .eq('id', data.user.id);

      navigate('/dashboard');
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="w-full max-w-lg">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="card p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
              <Wrench className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-neutral-900">Create your account</h1>
              <p className="text-sm text-neutral-500">Join NammaService as a customer or service provider</p>
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <label className="label">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                active={role === 'customer'}
                onClick={() => setRole('customer')}
                title="Customer"
                desc="Book home services"
              />
              <RoleCard
                active={role === 'provider'}
                onClick={() => setRole('provider')}
                title="Service Provider"
                desc="Offer your services"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input pl-10"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input pl-10"
                    placeholder="Mumbai, India"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
        active ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
      )}
    >
      {active && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}
      <p className="font-semibold text-neutral-900 text-sm">{title}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
    </button>
  );
}
