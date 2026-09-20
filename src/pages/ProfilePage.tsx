import { useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, User, MapPin, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '@/types';

export function ProfilePage() {
  const { navigate } = useRouter();
  const { profile, refreshProfile, session } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!session || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">Please sign in to view your profile.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) return;
    setSaving(true);

    await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, location, bio })
      .eq('id', session.user.id);

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('-1')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-3xl font-bold font-display text-neutral-900 mb-1">Edit Profile</h1>
        <p className="text-neutral-500 mb-6">Update your personal information.</p>

        {saved && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-primary-50 text-primary-700 text-sm animate-slide-down">
            <CheckCircle2 size={18} /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-10"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={profile.email || ''}
              disabled
              className="input bg-neutral-50 text-neutral-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="label">Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="input bg-neutral-50 text-neutral-400 cursor-not-allowed capitalize"
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="tel"
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input pl-10"
                placeholder="Mumbai, India"
              />
            </div>
          </div>

          {profile.role === 'provider' && (
            <div>
              <label className="label">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input min-h-[80px] resize-none"
                placeholder="Tell customers about your experience and expertise..."
              />
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
