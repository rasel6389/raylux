import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { MapPin, ArrowUpRight, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { goToShop, goToDashboard, goToAdmin, goToLookbook } = useNavigation();
  const { openAuthModal } = useAuth();
  const { currency, openCurrencyModal } = useCurrency();

  const handleSizeGuide = () => {
    alert('RAYLUXX CAP FIT SPECIFICATION:\n• S/M: 54cm - 57cm (Inner circumference)\n• L/XL: 58cm - 61cm (Deep structured crown)\n• ADJUSTABLE: 54cm - 62cm with Mil-Spec webbing strap.');
  };

  const handleShippingInfo = () => {
    alert('GLOBAL DISPATCH POLICY:\n• Standard Worldwide: 3-5 business days via DHL Express / FedEx.\n• Complimentary dispatch on orders $150+ (£120+ / €140+).\n• 30-Day hassle-free return guarantee on all unworn items.');
  };

  return (
    <footer className="w-full bg-[#111111] text-white pt-12 pb-8 font-sans border-t border-neutral-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Directory (Authentic Nike & Adidas Global Flagship Layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800 text-xs">
          
          {/* Column 1: FEATURED RESOURCES */}
          <div className="space-y-3.5">
            <h4 className="font-nike text-sm font-black tracking-wider uppercase text-white">
              RESOURCES
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button
                  onClick={() => goToShop()}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Find a Store</span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="hover:text-white transition-colors font-bold text-neutral-200"
                >
                  Become a Member
                </button>
              </li>
              <li>
                <button
                  onClick={goToLookbook}
                  className="hover:text-white transition-colors text-left"
                >
                  2026 Field Lookbook
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="hover:text-white transition-colors text-left"
                >
                  Member Allocation Access
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: HELP & SUPPORT */}
          <div className="space-y-3.5">
            <h4 className="font-nike text-sm font-black tracking-wider uppercase text-white">
              HELP & SUPPORT
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button
                  onClick={() => goToDashboard('orders')}
                  className="hover:text-white transition-colors text-left"
                >
                  Order Status & Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={handleShippingInfo}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Shipping & Worldwide Delivery
                </button>
              </li>
              <li>
                <button
                  onClick={handleShippingInfo}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  30-Day Risk-Free Returns
                </button>
              </li>
              <li>
                <button
                  onClick={handleSizeGuide}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Technical Sizing Guide
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@rayluxx.com"
                  className="hover:text-white transition-colors text-left block"
                >
                  support@rayluxx.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: DIVISIONS & MATERIALS */}
          <div className="space-y-3.5">
            <h4 className="font-nike text-sm font-black tracking-wider uppercase text-white">
              COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button
                  onClick={() => goToShop('STRUCTURED')}
                  className="hover:text-white transition-colors text-left"
                >
                  Monolith 6-Panel Series
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToShop('TECHNICAL')}
                  className="hover:text-white transition-colors text-left"
                >
                  GORE-TEX® 3L Waterproof
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToShop('CAMP_CAP')}
                  className="hover:text-white transition-colors text-left"
                >
                  Cordura® 500D Tactical
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToShop('RUNNER')}
                  className="hover:text-white transition-colors text-left"
                >
                  Aerorunner 48g Featherlight
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToShop()}
                  className="hover:text-white transition-colors text-left"
                >
                  All Technical Silhouettes
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: BRAND & PORTALS */}
          <div className="space-y-3.5">
            <h4 className="font-nike text-sm font-black tracking-wider uppercase text-white">
              COMPANY & OPS
            </h4>
            <ul className="space-y-2.5 text-neutral-400 font-medium">
              <li>
                <button
                  onClick={() => goToDashboard('user')}
                  className="hover:text-white transition-colors text-left"
                >
                  Member Account Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToDashboard('wishlist')}
                  className="hover:text-white transition-colors text-left"
                >
                  Saved Favorites
                </button>
              </li>
              <li>
                <button
                  onClick={goToAdmin}
                  className="hover:text-white font-semibold transition-colors flex items-center gap-1.5 text-left text-neutral-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Store Operations Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={openCurrencyModal}
                  className="hover:text-white transition-colors flex items-center gap-1 text-neutral-300"
                >
                  <Globe size={13} />
                  <span>Currency: {currency}</span>
                </button>
              </li>
              <li className="text-[11px] text-neutral-500 pt-1">
                Global Terminals: Tokyo • London • New York
              </li>
            </ul>
          </div>

        </div>

        {/* Compact Bottom Legal & Region Row (Nike style, tight padding) */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-500 font-medium">
          <div className="flex flex-wrap items-center gap-3 text-neutral-400">
            <button
              onClick={openCurrencyModal}
              className="flex items-center gap-1 text-white hover:text-neutral-300 transition-colors cursor-pointer"
            >
              <MapPin size={12} />
              <span>United States ({currency})</span>
            </button>
            <span className="hidden sm:inline">•</span>
            <span>© {new Date().getFullYear()} RAYLUXX, Inc. All Rights Reserved • rayluxx.com</span>
          </div>

          <div className="flex flex-wrap gap-4 text-neutral-400">
            <button onClick={() => goToShop()} className="hover:text-white cursor-pointer transition-colors">
              Guides
            </button>
            <button onClick={handleShippingInfo} className="hover:text-white cursor-pointer transition-colors">
              Terms of Sale
            </button>
            <button onClick={() => alert('RAYLUXX Terms of Use: Engineered with zero compromise.')} className="hover:text-white cursor-pointer transition-colors">
              Terms of Use
            </button>
            <button onClick={() => alert('RAYLUXX Privacy Policy: We protect all member data with 256-bit encryption.')} className="hover:text-white cursor-pointer transition-colors">
              Privacy Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
