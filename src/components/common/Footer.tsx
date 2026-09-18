import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { Check, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { goToShop, goToDashboard, goToAdmin } = useNavigation();
  const { openAuthModal } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#111111] text-white pt-16 pb-12 font-sans border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Manifesto Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-neutral-800">
          <div className="lg:col-span-6 space-y-3">
            <span className="font-sans text-xs font-bold uppercase text-neutral-400 tracking-wider block">
              MEMBER ACCESS DISPATCH
            </span>
            <h3 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
              BE THE FIRST TO KNOW ABOUT EXCLUSIVE DROPS.
            </h3>
            <p className="font-sans text-sm text-neutral-400 max-w-md leading-relaxed">
              Get priority notification on limited GORE-TEX and Cordura cap editions before public release.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-end">
            <form onSubmit={handleSubscribe} className="w-full max-w-md space-y-2">
              <div className="flex bg-neutral-900 border border-neutral-700 rounded-full overflow-hidden p-1 focus-within:border-white transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full bg-transparent px-4 py-2.5 text-xs font-sans text-white placeholder-neutral-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-colors flex items-center justify-center flex-shrink-0"
                >
                  {subscribed ? <Check size={14} /> : <span>Sign Up</span>}
                </button>
              </div>
              {subscribed && (
                <p className="font-sans text-xs text-emerald-400 font-medium pl-3">
                  ✓ Success! You're subscribed to Rayluxx Member Drops.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Directory Columns (Nike style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14 border-b border-neutral-800 text-xs">
          
          {/* Column 1 */}
          <div className="space-y-4">
            <h4 className="font-nike text-lg font-bold tracking-tight uppercase text-white">
              RESOURCES
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button onClick={() => goToShop()} className="hover:text-white transition-colors">
                  Find a Store
                </button>
              </li>
              <li>
                <button onClick={() => openAuthModal('signup')} className="hover:text-white transition-colors font-semibold">
                  Become a Member
                </button>
              </li>
              <li>
                <button onClick={() => goToShop()} className="hover:text-white transition-colors">
                  Send Us Feedback
                </button>
              </li>
              <li>
                <button onClick={() => openAuthModal('signup')} className="hover:text-white transition-colors">
                  Member Privileges
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <h4 className="font-nike text-lg font-bold tracking-tight uppercase text-white">
              HELP & SUPPORT
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button onClick={() => goToDashboard('orders')} className="hover:text-white transition-colors text-left">
                  Order Status & Tracking
                </button>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Complimentary standard worldwide dispatch on orders $150+.')}>
                Shipping & Delivery
              </li>
              <li className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('30-Day Risk-Free Returns on unworn caps in original packaging.')}>
                Returns & Exchanges
              </li>
              <li className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Cap Sizing: S/M fits 54-57cm. L/XL fits 58-61cm. Adjustable fits 54-62cm.')}>
                Cap Size Guide
              </li>
              <li className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Customer Care: support@rayluxx.com (Mon-Fri 9AM-6PM EST) • rayluxx.com')}>
                Contact Customer Care
              </li>
            </ul>
          </div>


          {/* Column 3 */}
          <div className="space-y-4">
            <h4 className="font-nike text-lg font-bold tracking-tight uppercase text-white">
              COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button onClick={() => goToShop('STRUCTURED')} className="hover:text-white transition-colors">
                  Monolith 6-Panel Series
                </button>
              </li>
              <li>
                <button onClick={() => goToShop('TECHNICAL')} className="hover:text-white transition-colors">
                  GORE-TEX® Waterproof Alpine
                </button>
              </li>
              <li>
                <button onClick={() => goToShop('CAMP_CAP')} className="hover:text-white transition-colors">
                  Cordura® 500D Tactical Camp
                </button>
              </li>
              <li>
                <button onClick={() => goToShop('RUNNER')} className="hover:text-white transition-colors">
                  Aerorunner 48g Featherlight
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="space-y-4">
            <h4 className="font-nike text-lg font-bold tracking-tight uppercase text-white">
              PORTALS & ACCESS
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button onClick={() => goToDashboard('user')} className="hover:text-white transition-colors">
                  Member Account Overview
                </button>
              </li>
              <li>
                <button onClick={() => goToDashboard('wishlist')} className="hover:text-white transition-colors">
                  Saved Favorites
                </button>
              </li>
              <li>
                <button onClick={goToAdmin} className="hover:text-white font-semibold transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Store Operations Matrix</span>
                </button>
              </li>
              <li className="text-neutral-500 pt-2 text-[11px]">
                Global Hubs: Tokyo • Berlin • New York
              </li>
            </ul>
          </div>

        </div>

        {/* Big Watermark */}
        <div className="pt-10 pb-6 select-none text-center">
          <span className="font-nike text-6xl sm:text-8xl lg:text-9xl font-black uppercase text-neutral-900 tracking-tighter block">
            RAYLUXX
          </span>
        </div>

        {/* Legal & Location Bottom Bar */}
        <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-2 text-neutral-400">
            <MapPin size={13} />
            <span>United States</span>
            <span>© {new Date().getFullYear()} RAYLUXX, Inc. All Rights Reserved • rayluxx.com</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <span className="hover:text-white cursor-pointer">Guides</span>
            <span className="hover:text-white cursor-pointer">Terms of Sale</span>
            <span className="hover:text-white cursor-pointer">Terms of Use</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
