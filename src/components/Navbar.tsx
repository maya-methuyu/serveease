import { useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { Wrench, Menu, X, LogOut, LayoutDashboard, Home as HomeIcon, ClipboardList, User } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { path, navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (p: string) => path === p || (p !== '/' && path.startsWith(p));

  const dashboardLink =
    profile?.role === 'admin' ? '/admin'
    : profile?.role === 'provider' ? '/provider'
    : '/customer';

  const handleNav = (to: string) => {
    navigate(to);
    setMobileOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-neutral-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => handleNav(profile ? dashboardLink : '/')} className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <Wrench className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold font-display text-neutral-900">NammaService</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink active={isActive('/')} onClick={() => handleNav(profile ? dashboardLink : '/')}>
            {profile ? 'Dashboard' : 'Home'}
          </NavLink>
          <NavLink active={isActive('/services')} onClick={() => handleNav('/services')}>
            Services
          </NavLink>
          <NavLink active={isActive('/providers')} onClick={() => handleNav('/providers')}>
            Find Providers
          </NavLink>
          <NavLink active={isActive('/how-it-works')} onClick={() => handleNav('/how-it-works')}>
            How It Works
          </NavLink>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {profile ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <Avatar name={profile.full_name || profile.email} src={profile.avatar_url} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                  {profile.full_name || profile.email}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-neutral-500 truncate">{profile.email}</p>
                      <span className="inline-block mt-1 text-xs font-medium text-primary-600 capitalize">{profile.role}</span>
                    </div>
                    <MenuItem icon={<LayoutDashboard size={16} />} onClick={() => handleNav(dashboardLink)}>
                      Dashboard
                    </MenuItem>
                    {profile.role === 'customer' && (
                      <MenuItem icon={<ClipboardList size={16} />} onClick={() => handleNav('/customer/bookings')}>
                        My Bookings
                      </MenuItem>
                    )}
                    <MenuItem icon={<User size={16} />} onClick={() => handleNav('/profile')}>
                      Profile
                    </MenuItem>
                    <div className="border-t border-neutral-100 my-1" />
                    <MenuItem icon={<LogOut size={16} />} onClick={() => { signOut(); handleNav('/'); }} danger>
                      Sign Out
                    </MenuItem>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => handleNav('/login')} className="btn-ghost">Sign In</button>
              <button onClick={() => handleNav('/signup')} className="btn-primary">Get Started</button>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            <MobileLink icon={<HomeIcon size={18} />} active={isActive('/')} onClick={() => handleNav(profile ? dashboardLink : '/')}>
              {profile ? 'Dashboard' : 'Home'}
            </MobileLink>
            <MobileLink active={isActive('/services')} onClick={() => handleNav('/services')}>
              Services
            </MobileLink>
            <MobileLink active={isActive('/providers')} onClick={() => handleNav('/providers')}>
              Find Providers
            </MobileLink>
            <MobileLink active={isActive('/how-it-works')} onClick={() => handleNav('/how-it-works')}>
              How It Works
            </MobileLink>
            {!profile && (
              <div className="pt-3 space-y-2">
                <button onClick={() => handleNav('/login')} className="btn-outline w-full">Sign In</button>
                <button onClick={() => handleNav('/signup')} className="btn-primary w-full">Get Started</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        active ? 'text-primary-700 bg-primary-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
      )}
    >
      {children}
    </button>
  );
}

function MobileLink({ children, active, onClick, icon }: { children: React.ReactNode; active: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        active ? 'text-primary-700 bg-primary-50' : 'text-neutral-700 hover:bg-neutral-100'
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function MenuItem({ children, icon, onClick, danger }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-neutral-700 hover:bg-neutral-100'
      )}
    >
      {icon}
      {children}
    </button>
  );
}
