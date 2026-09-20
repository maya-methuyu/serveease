import { useRouter } from '@/context/RouterContext';
import { Wrench, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Wrench className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold font-display text-white">NammaService</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Connecting you with trusted local service providers for all your home needs.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/services')} className="hover:text-white transition-colors">Browse Services</button></li>
              <li><button onClick={() => navigate('/providers')} className="hover:text-white transition-colors">Find Providers</button></li>
              <li><button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Become a Provider</button></li>
              <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Sign Up</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail size={15} /> support@serveease.com</li>
              <li className="flex items-center gap-2"><Phone size={15} /> +91 1800 200 3000</li>
              <li className="flex items-center gap-2"><MapPin size={15} /> Available across India</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} NammaService. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
