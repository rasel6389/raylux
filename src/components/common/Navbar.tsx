import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Heart,
  User,
  ArrowRight,
  Camera,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';

type MegaMenuType = 'goretex' | 'sixpanel' | 'fivepanel' | null;

export const Navbar: React.FC = () => {
  const { totalItems, openCart } = useCart();
  const {
    currentPage,
    goToShop,
    goToHome,
    goToDashboard,
    goToLookbook,
    goToProduct,
    goToAdmin,
    goToSupport,
    goToTracking,
    searchQuery,
    setSearchQuery,
    shopCategoryFilter,
  } = useNavigation();
  const { currentUser, logout, openAuthModal } = useAuth();
  const { currency, setCurrency, openCurrencyModal } = useCurrency();
  const { wishlist, announcementConfig } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuType>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('raylux_announcement_dismissed_v2') === 'true';
    } catch {
      return false;
    }
  });

  // Handle Mega Menu Hover with smooth delay to prevent flickering
  const handleMouseEnterNav = (menu: MegaMenuType) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setActiveMegaMenu(menu);
  };

  const handleMouseLeaveNav = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  // Close search and currency popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(target)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismissAnnouncement = () => {
    setIsAnnouncementDismissed(true);
    try {
      sessionStorage.setItem('raylux_announcement_dismissed_v2', 'true');
    } catch {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      goToShop(undefined, searchQuery.trim());
    }
  };

  const handleSearchSuggestionClick = (query: string, category?: any) => {
    setSearchQuery(query);
    setSearchFocused(false);
    goToShop(category, query);
  };

  const currencyItems = [
    { code: 'USD' as CurrencyCode, symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'GBP' as CurrencyCode, symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'EUR' as CurrencyCode, symbol: '€', name: 'Euro', flag: '🇪🇺' },
  ];

  const activeCurrencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  return (
    <>
      {/* NIKE-STYLE ARCHITECTURAL FLAGSHIP HEADER */}
      <header
        className="sticky top-0 z-40 w-full bg-white/98 backdrop-blur-md border-b border-neutral-200 select-none font-sans"
        onMouseLeave={handleMouseLeaveNav}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Menu Trigger & Mobile Currency Badge */}
          <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="p-1.5 -ml-1.5 text-black hover:bg-neutral-100 rounded-full transition-colors focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button
              onClick={openCurrencyModal}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 text-[11px] font-bold text-black flex items-center gap-1 transition-colors cursor-pointer"
              title="Change Currency"
            >
              <span>{activeCurrencySymbol}</span>
              <span>{currency}</span>
            </button>
          </div>

          {/* Left / Center: BRAND LOGO */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={goToHome}
              className="group flex items-center gap-2 text-left focus:outline-none cursor-pointer"
              aria-label="RAYLUXX Home"
            >
              <span className="font-nike text-3xl sm:text-4xl font-black tracking-tighter text-black group-hover:opacity-85 transition-opacity">
                RAYLUXX
              </span>
            </button>
          </div>

          {/* CENTER: DESKTOP CATEGORY NAV (Nike Style: Short, Punchy, Never Wraps) */}
          <nav className="hidden lg:flex items-center justify-center space-x-5 xl:space-x-7 font-sans text-[14px] font-bold text-neutral-800 tracking-tight whitespace-nowrap h-full">
            
            {/* 1. Shop All */}
            <button
              onClick={() => { goToShop(); setActiveMegaMenu(null); }}
              onMouseEnter={() => handleMouseEnterNav(null)}
              className={`h-full flex items-center px-1 transition-colors relative whitespace-nowrap flex-shrink-0 cursor-pointer ${
                currentPage === 'shop' && (!shopCategoryFilter || shopCategoryFilter === 'ALL')
                  ? 'text-black font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Shop All
            </button>

            {/* 2. GORE-TEX® Series */}
            <div
              className="h-full flex items-center relative"
              onMouseEnter={() => handleMouseEnterNav('goretex')}
            >
              <button
                onClick={() => { goToShop('TECHNICAL'); setActiveMegaMenu(null); }}
                className={`h-full flex items-center gap-1 px-1 transition-colors relative whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  currentPage === 'shop' && shopCategoryFilter === 'TECHNICAL'
                    ? 'text-black font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                <span>GORE-TEX®</span>
                <ChevronDown size={12} className={`text-neutral-400 transition-transform duration-200 ${activeMegaMenu === 'goretex' ? 'rotate-180 text-black' : ''}`} />
              </button>
            </div>

            {/* 3. 6-Panel Series */}
            <div
              className="h-full flex items-center relative"
              onMouseEnter={() => handleMouseEnterNav('sixpanel')}
            >
              <button
                onClick={() => { goToShop('STRUCTURED'); setActiveMegaMenu(null); }}
                className={`h-full flex items-center gap-1 px-1 transition-colors relative whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  currentPage === 'shop' && shopCategoryFilter === 'STRUCTURED'
                    ? 'text-black font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                <span>6-Panel</span>
                <ChevronDown size={12} className={`text-neutral-400 transition-transform duration-200 ${activeMegaMenu === 'sixpanel' ? 'rotate-180 text-black' : ''}`} />
              </button>
            </div>

            {/* 4. 5-Panel Camp */}
            <div
              className="h-full flex items-center relative"
              onMouseEnter={() => handleMouseEnterNav('fivepanel')}
            >
              <button
                onClick={() => { goToShop('CAMP_CAP'); setActiveMegaMenu(null); }}
                className={`h-full flex items-center gap-1 px-1 transition-colors relative whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  currentPage === 'shop' && shopCategoryFilter === 'CAMP_CAP'
                    ? 'text-black font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                <span>5-Panel</span>
                <ChevronDown size={12} className={`text-neutral-400 transition-transform duration-200 ${activeMegaMenu === 'fivepanel' ? 'rotate-180 text-black' : ''}`} />
              </button>
            </div>

            {/* 5. Aerorunner */}
            <button
              onClick={() => { goToShop('RUNNER'); setActiveMegaMenu(null); }}
              onMouseEnter={() => handleMouseEnterNav(null)}
              className={`h-full flex items-center px-1 transition-colors relative whitespace-nowrap flex-shrink-0 cursor-pointer ${
                currentPage === 'shop' && shopCategoryFilter === 'RUNNER'
                  ? 'text-black font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Runner
            </button>

            {/* 6. Lookbook */}
            <button
              onClick={() => { goToLookbook(); setActiveMegaMenu(null); }}
              onMouseEnter={() => handleMouseEnterNav(null)}
              className={`h-full flex items-center px-1 transition-colors relative whitespace-nowrap flex-shrink-0 cursor-pointer ${
                currentPage === 'lookbook'
                  ? 'text-black font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Lookbook
            </button>
          </nav>

          {/* RIGHT ACTIONS: SEARCH + SERIAL CURRENCY DROPDOWN + WISHLIST + BAG + PROFILE */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            
            {/* Nike Search Pill Input (Compact, doesn't steal space) */}
            <div ref={searchContainerRef} className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <div
                  className={`flex items-center bg-[#f5f5f5] hover:bg-[#eaeaea] focus-within:bg-white rounded-full px-3 py-1.5 transition-all border ${
                    searchFocused ? 'border-black w-48 lg:w-56 shadow-md bg-white' : 'border-transparent w-32 lg:w-40'
                  }`}
                >
                  <Search size={14} className="text-neutral-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Caps..."
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs font-sans text-black placeholder-neutral-500 focus:outline-none w-full"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-neutral-400 hover:text-black p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </form>

              {/* Search Suggestions Popover */}
              {searchFocused && (
                <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 z-50 animate-fadeIn">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {['GORE-TEX 3L', 'Monolith 01', 'Cordura Camp', 'Waterproof', 'Bone'].map((tag) => (
                      <button
                        key={tag}
                        onMouseDown={() => handleSearchSuggestionClick(tag)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-medium text-neutral-800 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2 pt-2 border-t border-neutral-100">
                    Quick Categories
                  </span>
                  <div className="space-y-1">
                    <button
                      onMouseDown={() => handleSearchSuggestionClick('Structured', 'STRUCTURED')}
                      className="w-full text-left text-xs font-semibold py-1.5 px-2 hover:bg-neutral-50 rounded-lg flex items-center justify-between text-neutral-800 cursor-pointer"
                    >
                      <span>6-Panel Monolith Series</span>
                      <ArrowRight size={12} className="text-neutral-400" />
                    </button>
                    <button
                      onMouseDown={() => handleSearchSuggestionClick('Technical', 'TECHNICAL')}
                      className="w-full text-left text-xs font-semibold py-1.5 px-2 hover:bg-neutral-50 rounded-lg flex items-center justify-between text-neutral-800 cursor-pointer"
                    >
                      <span>GORE-TEX® Alpine Series</span>
                      <ArrowRight size={12} className="text-neutral-400" />
                    </button>
                    <button
                      onMouseDown={() => handleSearchSuggestionClick('Camp', 'CAMP_CAP')}
                      className="w-full text-left text-xs font-semibold py-1.5 px-2 hover:bg-neutral-50 rounded-lg flex items-center justify-between text-neutral-800 cursor-pointer"
                    >
                      <span>5-Panel Cordura® Camp</span>
                      <ArrowRight size={12} className="text-neutral-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COMPACT SERIAL CURRENCY DROPDOWN */}
            <div ref={currencyDropdownRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold font-sans bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-200 transition-colors cursor-pointer"
                title="Select Store Currency"
                aria-label="Currency Selector"
              >
                <span>{activeCurrencySymbol}</span>
                <span>{currency}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 text-neutral-500 ${
                    currencyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 mb-1">
                    Select Currency
                  </div>
                  <div className="space-y-1">
                    {currencyItems.map((item) => {
                      const isSelected = currency === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setCurrency(item.code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-black text-white font-bold shadow-xs'
                              : 'text-neutral-800 hover:bg-neutral-100'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-sm">{item.flag}</span>
                            <span>{item.symbol} {item.code}</span>
                          </span>
                          {isSelected ? (
                            <Check size={14} className="text-white" />
                          ) : (
                            <span className="text-[10px] text-neutral-400">{item.name}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 mt-1 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrencyDropdownOpen(false);
                        openCurrencyModal();
                      }}
                      className="w-full text-center text-[11px] font-semibold text-neutral-500 hover:text-black py-1 cursor-pointer"
                    >
                      All Regional Details →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist / Favorites */}
            <button
              onClick={() => goToDashboard('wishlist')}
              title="Saved Favorites"
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
              aria-label="Favorites"
            >
              <Heart size={19} />
              {wishlist && wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white font-sans text-[10px] font-black flex items-center justify-center shadow-xs animate-scaleIn">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag */}
            <button
              onClick={openCart}
              aria-label="Shopping Bag"
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
            >
              <ShoppingBag size={19} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black text-white font-sans text-[10px] font-black flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account Profile Button */}
            <button
              onClick={() => {
                if (currentUser) {
                  goToDashboard('user');
                } else {
                  openAuthModal('signin');
                }
              }}
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In to Account'}
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
              aria-label="Account"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-neutral-300"
                />
              ) : (
                <User size={19} />
              )}
              {currentUser && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

          </div>
        </div>

        {/* NIKE-STYLE INTERACTIVE MEGA-MENU DROPDOWN (Absolute floating to prevent page jump) */}
        {activeMegaMenu && (
          <div
            className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-2xl py-8 px-6 sm:px-12 animate-fadeIn z-50 font-sans"
            onMouseEnter={() => handleMouseEnterNav(activeMegaMenu)}
            onMouseLeave={handleMouseLeaveNav}
          >
            <div className="max-w-7xl mx-auto">
              {/* 1. GORE-TEX Mega Menu */}
              {activeMegaMenu === 'goretex' && (
                <div className="grid grid-cols-12 gap-8 items-start">
                  <div className="col-span-4 space-y-3">
                    <span className="font-nike text-sm font-black tracking-tight uppercase text-black block">
                      GORE-TEX® ALPINE SERIES
                    </span>
                    <p className="text-neutral-600 leading-relaxed text-xs font-normal">
                      Engineered with authentic 3-layer waterproof-breathable GORE-TEX Pro membrane, 100% seam-sealed tape, and laser micro-perforations for high-output alpine transit.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => { goToShop('TECHNICAL'); setActiveMegaMenu(null); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <span>EXPLORE ALL GORE-TEX® CAPS</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-8 grid grid-cols-2 gap-6">
                    <div
                      onClick={() => { goToProduct('rlx-02-apex-storm'); setActiveMegaMenu(null); }}
                      className="group/item cursor-pointer p-4 rounded-2xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/50 flex gap-4 items-center"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=400&q=80"
                          alt="Apex Storm"
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">GORE-TEX 3L</span>
                        <h4 className="font-nike text-base font-bold uppercase text-black leading-tight group-hover/item:underline">
                          APEX STORM // 3L
                        </h4>
                        <p className="text-xs text-neutral-600 font-medium">$110 USD • 28,000mm Waterproof</p>
                      </div>
                    </div>

                    <div
                      onClick={() => { goToProduct('rlx-06-geo-grid'); setActiveMegaMenu(null); }}
                      className="group/item cursor-pointer p-4 rounded-2xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/50 flex gap-4 items-center"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80"
                          alt="Geo Grid"
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">ALPINE EDITION</span>
                        <h4 className="font-nike text-base font-bold uppercase text-black leading-tight group-hover/item:underline">
                          GEO-GRID PRO // STORM
                        </h4>
                        <p className="text-xs text-neutral-600 font-medium">$105 USD • Bonded Seams</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 6-Panel Mega Menu */}
              {activeMegaMenu === 'sixpanel' && (
                <div className="grid grid-cols-12 gap-8 items-start">
                  <div className="col-span-4 space-y-3">
                    <span className="font-nike text-sm font-black tracking-tight uppercase text-black block">
                      STRUCTURED 6-PANEL ARCHITECTURE
                    </span>
                    <p className="text-neutral-600 leading-relaxed text-xs font-normal">
                      Definitive architectural crowns reinforced with rigid inner buckram, 340 GSM heavy twill weaves, and CNC-machined matte hardware.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => { goToShop('STRUCTURED'); setActiveMegaMenu(null); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <span>VIEW ALL 6-PANEL CAPS</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-8 grid grid-cols-2 gap-6">
                    <div
                      onClick={() => { goToProduct('rlx-01-onyx'); setActiveMegaMenu(null); }}
                      className="group/item cursor-pointer p-4 rounded-2xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/50 flex gap-4 items-center"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80"
                          alt="Monolith 01"
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">SERIES 01</span>
                        <h4 className="font-nike text-base font-bold uppercase text-black leading-tight group-hover/item:underline">
                          MONOLITH 01 // ONYX
                        </h4>
                        <p className="text-xs text-neutral-600 font-medium">$85 USD • 340 GSM Heavy Twill</p>
                      </div>
                    </div>

                    <div
                      onClick={() => { goToProduct('rlx-03-bone-archetype'); setActiveMegaMenu(null); }}
                      className="group/item cursor-pointer p-4 rounded-2xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/50 flex gap-4 items-center"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=400&q=80"
                          alt="Archetype 03"
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">LIMITED RUN</span>
                        <h4 className="font-nike text-base font-bold uppercase text-black leading-tight group-hover/item:underline">
                          ARCHETYPE 03 // BONE
                        </h4>
                        <p className="text-xs text-neutral-600 font-medium">$80 USD • Chalk Piqué Weave</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 5-Panel Mega Menu */}
              {activeMegaMenu === 'fivepanel' && (
                <div className="grid grid-cols-12 gap-8 items-start">
                  <div className="col-span-4 space-y-3">
                    <span className="font-nike text-sm font-black tracking-tight uppercase text-black block">
                      5-PANEL CAMP & TACTICAL
                    </span>
                    <p className="text-neutral-600 leading-relaxed text-xs font-normal">
                      Low-profile technical silhouettes crafted from genuine 500D ballistic Cordura® nylon, flexible polymer visors, and magnetic Fidlock® tension systems.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => { goToShop('CAMP_CAP'); setActiveMegaMenu(null); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <span>SHOP ALL 5-PANEL CAPS</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-8 grid grid-cols-2 gap-6">
                    <div
                      onClick={() => { goToProduct('rlx-04-cipher-camp'); setActiveMegaMenu(null); }}
                      className="group/item cursor-pointer p-4 rounded-2xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/50 flex gap-4 items-center"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=400&q=80"
                          alt="Cipher 04"
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">BALLISTIC SPEC</span>
                        <h4 className="font-nike text-base font-bold uppercase text-black leading-tight group-hover/item:underline">
                          CIPHER 04 // CORDURA
                        </h4>
                        <p className="text-xs text-neutral-600 font-medium">$95 USD • Fidlock® Magnetic Closure</p>
                      </div>
                    </div>

                    <div
                      onClick={() => { goToShop('CAMP_CAP'); setActiveMegaMenu(null); }}
                      className="group/item cursor-pointer p-4 rounded-2xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/50 flex gap-4 items-center"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=400&q=80"
                          alt="Modular Camp"
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">TACTICAL FIELD</span>
                        <h4 className="font-nike text-base font-bold uppercase text-black leading-tight group-hover/item:underline">
                          ALL CAMP SILHOUETTES
                        </h4>
                        <p className="text-xs text-neutral-600 font-medium">Explore 5-Panel Cordura & Ripstop</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
 
      {/* NIKE-STYLE MEGA MENU DIMMING BACKDROP OVERLAY */}
      {activeMegaMenu && (
        <div
          className="fixed inset-0 top-16 sm:top-20 bg-black/30 backdrop-blur-[1px] z-30 transition-opacity animate-fadeIn"
          onMouseEnter={handleMouseLeaveNav}
          onClick={() => setActiveMegaMenu(null)}
        />
      )}

      {/* ANNOUNCEMENT SUB-HEADER (Dismissible) */}
      {!isAnnouncementDismissed && announcementConfig?.active && (
        <div className="bg-[#f5f5f5] py-2 px-6 sm:px-10 text-center text-[12px] font-sans font-medium text-neutral-800 border-b border-neutral-200 relative flex items-center justify-center animate-fadeIn select-none">
          <div className="max-w-4xl mx-auto pr-6 flex items-center justify-center gap-2">
            <Sparkles size={13} className="text-black flex-shrink-0" />
            {currentUser ? (
              <p>
                Welcome, <strong className="text-black">{currentUser.name}</strong> • All-Access Rayluxx Member • {
                  currency === 'GBP' ? 'Free Dispatch on Orders £120+' : currency === 'EUR' ? 'Free Dispatch on Orders €140+' : 'Free Dispatch on Orders $150+'
                }.{' '}
                <button
                  onClick={() => goToDashboard('user')}
                  className="underline font-bold hover:text-black cursor-pointer ml-1"
                >
                  Member Portal
                </button>
              </p>
            ) : (
              <p>
                {announcementConfig.text ? (
                  <span>
                    {announcementConfig.text}{' '}
                    {announcementConfig.discountCode && (
                      <span className="font-bold text-black bg-neutral-200 px-1.5 py-0.5 rounded font-mono ml-1">
                        {announcementConfig.discountCode}
                      </span>
                    )}
                  </span>
                ) : (
                  <span>
                    Members: Complimentary Worldwide Dispatch on orders {
                      currency === 'GBP' ? '£120+' : currency === 'EUR' ? '€140+' : '$150+'
                    } • 30-Day Risk-Free Returns.
                  </span>
                )}{' '}
                <button
                  onClick={() => openAuthModal('signin')}
                  className="underline font-bold hover:text-black cursor-pointer ml-1"
                >
                  {announcementConfig.linkText || 'Sign In / Join'}
                </button>
              </p>
            )}
          </div>
          <button
            id="dismiss-announcement-btn"
            onClick={handleDismissAnnouncement}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
            title="Dismiss announcement"
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white animate-fadeIn select-none font-sans">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <span className="font-nike text-3xl font-black tracking-tighter">
              RAYLUXX
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-black hover:bg-neutral-100 rounded-full cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Mobile Search Bar */}
            <form
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setMobileMenuOpen(false);
              }}
              className="relative"
            >
              <div className="flex items-center bg-neutral-100 rounded-full px-4 py-3 border border-neutral-200 focus-within:border-black transition-colors">
                <Search size={18} className="text-neutral-500 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search technical caps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm font-sans text-black placeholder-neutral-500 focus:outline-none w-full"
                />
              </div>
            </form>

            {/* Mobile Direct Category Navigation */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest block">
                HEADWEAR COLLECTIONS
              </span>

              <button
                onClick={() => { goToShop(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-2xl font-nike font-black uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-black hover:opacity-75 cursor-pointer"
              >
                <span>SHOP ALL CAPS</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => { goToShop('TECHNICAL'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>GORE-TEX® TECHNICAL</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => { goToShop('STRUCTURED'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>6-PANEL MONOLITH</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => { goToShop('CAMP_CAP'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>5-PANEL CAMP</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => { goToShop('RUNNER'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>RUNNER SPEED</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => { goToLookbook(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>LOOKBOOK EDITORIAL</span>
                <Camera size={16} />
              </button>

              <button
                onClick={() => { goToTracking(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>TRACK PACKAGE TELEMETRY</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => { goToSupport(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>CLIENT SUPPORT CONCIERGE</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Mobile Currency Selector (Serial 3 rows) */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest block mb-2">
                ACTIVE STORE CURRENCY
              </span>
              <div className="space-y-2">
                {currencyItems.map((item) => {
                  const isSelected = currency === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => setCurrency(item.code)}
                      className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">{item.flag}</span>
                        <span>{item.symbol} {item.code} — {item.name}</span>
                      </span>
                      {isSelected && <Check size={16} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Member Account in Mobile Drawer */}
            <div className="pt-2 space-y-3">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest block">
                MEMBER ACCOUNT
              </span>

              {currentUser ? (
                <div className="p-4 bg-neutral-50 rounded-2xl space-y-3 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
                        {currentUser.name[0]}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-black leading-tight">{currentUser.name}</p>
                        <p className="text-xs text-neutral-500">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => { goToDashboard('orders'); setMobileMenuOpen(false); }}
                      className="py-2 px-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-center cursor-pointer"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => { goToDashboard('wishlist'); setMobileMenuOpen(false); }}
                      className="py-2 px-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-center cursor-pointer"
                    >
                      Favorites ({wishlist.length})
                    </button>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 text-xs text-neutral-600 hover:text-black font-semibold text-center border-t border-neutral-200 pt-2 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { openAuthModal('signin'); setMobileMenuOpen(false); }}
                    className="py-3 bg-white border-2 border-black text-black font-bold uppercase text-xs rounded-full text-center cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                    className="py-3 bg-black text-white font-bold uppercase text-xs rounded-full text-center cursor-pointer"
                  >
                    Join Us
                  </button>
                </div>
              )}
            </div>

            {/* Operations Portal Link */}
            <div className="pt-2">
              <button
                onClick={() => { goToAdmin(); setMobileMenuOpen(false); }}
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-2xl text-xs font-bold text-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Operations Admin Portal</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
