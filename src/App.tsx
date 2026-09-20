import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ServicesPage } from '@/pages/customer/ServicesPage';
import { ServiceDetailPage } from '@/pages/customer/ServiceDetailPage';
import { ProviderDetailPage } from '@/pages/customer/ProviderDetailPage';
import { ProvidersPage } from '@/pages/customer/ProvidersPage';
import { BookingPage } from '@/pages/customer/BookingPage';
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard';
import { CustomerBookingsPage } from '@/pages/customer/CustomerBookingsPage';
import { BookingDetailPage } from '@/pages/customer/BookingDetailPage';
import { ProviderDashboard } from '@/pages/provider/ProviderDashboard';
import { ProviderServicesPage } from '@/pages/provider/ProviderServicesPage';
import { ProviderBookingsPage } from '@/pages/provider/ProviderBookingsPage';
import { ProviderBookingDetailPage } from '@/pages/provider/ProviderBookingDetailPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProvidersPage } from '@/pages/admin/AdminProvidersPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { path, navigate } = useRouter();
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
  const segments = cleanPath.split('/').filter(Boolean);

  // Route: /dashboard — redirect based on role
  if (cleanPath === '/dashboard') {
    if (profile?.role === 'admin') {
      navigate('/admin');
      return null;
    }
    if (profile?.role === 'provider') {
      navigate('/provider');
      return null;
    }
    navigate('/customer');
    return null;
  }

  // Auth routes
  if (cleanPath === '/login') return <WithNav><LoginPage /></WithNav>;
  if (cleanPath === '/signup') return <WithNav><SignupPage /></WithNav>;

  // Public pages
  if (cleanPath === '/') return <WithNav><LandingPage /></WithNav>;
  if (cleanPath === '/how-it-works') return <WithNav><HowItWorksPage /></WithNav>;
  if (cleanPath === '/services') return <WithNav><ServicesPage /></WithNav>;
  if (cleanPath === '/providers') return <WithNav><ProvidersPage /></WithNav>;

  // Service detail: /services/:id
  if (segments[0] === 'services' && segments[1]) return <WithNav><ServiceDetailPage /></WithNav>;

  // Provider detail: /providers/:id
  if (segments[0] === 'providers' && segments[1] && segments[1] !== 'admin') {
    return <WithNav><ProviderDetailPage /></WithNav>;
  }

  // Booking page: /book
  if (cleanPath === '/book') {
    return <WithNav><RequireAuth profile={profile}><BookingPage /></RequireAuth></WithNav>;
  }

  // Profile page
  if (cleanPath === '/profile') {
    return <WithNav><RequireAuth profile={profile}><ProfilePage /></RequireAuth></WithNav>;
  }

  // Customer routes
  if (segments[0] === 'customer') {
    if (segments.length === 1) return <WithNav><RequireAuth profile={profile}><CustomerDashboard /></RequireAuth></WithNav>;
    if (segments[1] === 'bookings' && !segments[2]) return <WithNav><RequireAuth profile={profile}><CustomerBookingsPage /></RequireAuth></WithNav>;
    if (segments[1] === 'bookings' && segments[2]) return <WithNav><RequireAuth profile={profile}><BookingDetailPage /></RequireAuth></WithNav>;
  }

  // Provider routes
  if (segments[0] === 'provider') {
    if (segments.length === 1) return <WithNav><RequireAuth profile={profile}><ProviderDashboard /></RequireAuth></WithNav>;
    if (segments[1] === 'services') return <WithNav><RequireAuth profile={profile}><ProviderServicesPage /></RequireAuth></WithNav>;
    if (segments[1] === 'bookings' && !segments[2]) return <WithNav><RequireAuth profile={profile}><ProviderBookingsPage /></RequireAuth></WithNav>;
    if (segments[1] === 'bookings' && segments[2]) return <WithNav><RequireAuth profile={profile}><ProviderBookingDetailPage /></RequireAuth></WithNav>;
  }

  // Admin routes
  if (segments[0] === 'admin') {
    if (segments.length === 1) return <WithNav><RequireAdmin profile={profile}><AdminDashboard /></RequireAdmin></WithNav>;
    if (segments[1] === 'providers') return <WithNav><RequireAdmin profile={profile}><AdminProvidersPage /></RequireAdmin></WithNav>;
    if (segments[1] === 'customers') return <WithNav><RequireAdmin profile={profile}><AdminCustomersPage /></RequireAdmin></WithNav>;
    if (segments[1] === 'bookings') return <WithNav><RequireAdmin profile={profile}><AdminBookingsPage /></RequireAdmin></WithNav>;
    if (segments[1] === 'reviews') return <WithNav><RequireAdmin profile={profile}><AdminReviewsPage /></RequireAdmin></WithNav>;
  }

  // Fallback
  return (
    <WithNav>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold font-display text-neutral-900 mb-3">Page not found</h1>
        <p className="text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
      </div>
    </WithNav>
  );
}

function WithNav({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function RequireAuth({ profile, children }: { profile: ReturnType<typeof useAuth>['profile']; children: React.ReactNode }) {
  const { navigate } = useRouter();
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">Please sign in to access this page.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
      </div>
    );
  }
  return <>{children}</>;
}

function RequireAdmin({ profile, children }: { profile: ReturnType<typeof useAuth>['profile']; children: React.ReactNode }) {
  const { navigate } = useRouter();
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">Please sign in to access the admin dashboard.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
      </div>
    );
  }
  if (profile.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold font-display text-neutral-900 mb-2">Access Denied</h1>
        <p className="text-neutral-500 mb-6">You need admin privileges to access this page.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}
