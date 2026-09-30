import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
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
  LogOut,
  Globe,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalItems, openCart } = useCart();
  const {
    currentPage,
    goToShop,
    goToHome,
    goToDashboard,
    goToLookbook,
    goToAdmin,
    searchQuery,
    setSearchQuery,
  } = useNavigation();
  const { currentUser, logout, openAuthModal } = useAuth();
  const { currency, setCurrency, openCurrencyModal } = useCurrency();
  const { wishlist, announcementConfig } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'featured' | 'goretex' | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('raylux_announcement_dismissed_v2') === 'true';
    } catch {
      return false;
    }
  });

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
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

  const userFirstName = currentUser ? currentUser.name.split(' ')[0] : '';

  return (
    <>
      {/* 1. TOP UTILITY BAR (Authentic Nike & Adidas Global Flagship) */}
      <div className="bg-[#f5f5f5] text-[#666666] text-[11px] font-sans font-medium h-8 border-b border-neutral-200/80 hidden sm:flex items-center justify-between px-6 sm:px-10 select-none">
        
        {/* Left: Brand Innovation Badge & Adidas-style 3-stripe minimalism */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToHome}
            className="flex items-center gap-1.5 font-sans text-[11px] font-bold tracking-wider text-black hover:text-neutral-600 transition-colors uppercase"
          >
            {/* Minimal Adidas 3-Stripe Geometric Mark */}
            <span className="inline-flex gap-0.5 items-end h-2.5">
              <span className="w-0.5 h-1.5 bg-black rounded-xs"></span>
              <span className="w-0.5 h-2 bg-black rounded-xs"></span>
              <span className="w-0.5 h-2.5 bg-black rounded-xs"></span>
            </span>
            <span>RAYLUXX ATHLETICS</span>
          </button>
          <span className="text-neutral-300">|</span>
          <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
            TECHNICAL HEADWEAR SPEC
          </span>
        </div>

        {/* Right: Member Utility & Region Switcher */}
        <div className="flex items-center gap-3.5">
          {currentUser ? (
            <>
              <button
                onClick={() => goToDashboard('user')}
                className="hover:text-black font-semibold text-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                    {userFirstName[0]}
                  </span>
                )}
                <span>Hi, {userFirstName}</span>
              </button>
              <span className="text-neutral-300">|</span>
              <button
                onClick={() => goToDashboard('orders')}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Orders
              </button>
              <span className="text-neutral-300">|</span>
              <button
                onClick={logout}
                className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={11} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => goToShop()}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Find a Store
              </button>
              <span className="text-neutral-300">|</span>
              <button
                onClick={() => openAuthModal('signin')}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Help
              </button>
              <span className="text-neutral-300">|</span>
              <button
                onClick={() => openAuthModal('signup')}
                className="hover:text-black font-bold text-black transition-colors cursor-pointer"
              >
                Join Us
              </button>
              <span className="text-neutral-300">|</span>
              <button
                onClick={() => openAuthModal('signin')}
                className="hover:text-black font-bold text-black transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}

          <span className="text-neutral-300">|</span>

          {/* Tri-Currency Switcher Pill */}
          <div className="flex items-center bg-neutral-200/70 p-0.5 rounded-full text-[10px] font-bold">
            {(['USD', 'GBP', 'EUR'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  currency === c
                    ? 'bg-white text-black shadow-2xs font-black'
                    : 'text-neutral-600 hover:text-black'
                }`}
                title={`Switch currency to ${c}`}
              >
                {c === 'USD' ? '$ USD' : c === 'GBP' ? '£ GBP' : '€ EUR'}
              </button>
            ))}
          </div>

          <button
            onClick={openCurrencyModal}
            className="hover:text-black transition-colors flex items-center gap-1 text-[11px] font-semibold text-neutral-600 cursor-pointer"
            title="Open Region & Currency Selector"
          >
            <Globe size={12} />
            <span>Region</span>
          </button>

          <span className="text-neutral-300">|</span>

          {/* Admin Link */}
          <button
            onClick={goToAdmin}
            className="hover:text-black font-bold text-black transition-colors flex items-center gap-1 cursor-pointer"
            title="Access Staff Operations Portal"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN NIKE & ADIDAS COMBINATION HEADER */}
      <header
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all select-none"
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Mobile Menu Trigger & Currency Pill */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="p-1.5 -ml-1.5 text-black hover:bg-neutral-100 rounded-full transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button
              onClick={openCurrencyModal}
              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 text-[10px] font-bold text-black flex items-center gap-1 transition-colors"
            >
              <Globe size={11} />
              <span>{currency}</span>
            </button>
          </div>

          {/* BRAND WORDMARK (Iconic Nike Monumental Typography) */}
          <div className="flex items-center">
            <button
              onClick={goToHome}
              className="group flex items-center gap-2 text-left focus:outline-none cursor-pointer"
            >
              <span className="font-nike text-3xl sm:text-4xl font-black tracking-tighter text-black group-hover:opacity-85 transition-opacity">
                RAYLUXX
              </span>
            </button>
          </div>

          {/* DESKTOP NAV LINKS (Nike Font & Weight with Interactive Mega Previews) */}
          <nav className="hidden lg:flex items-center space-x-7 font-sans text-[14px] font-semibold tracking-normal text-neutral-900">
            <button
              onClick={goToHome}
              onMouseEnter={() => setActiveMegaMenu('featured')}
              className={`py-5 transition-colors relative cursor-pointer ${
                currentPage === 'home'
                  ? 'text-black font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'
                  : 'hover:text-neutral-500'
              }`}
            >
              New & Featured
            </button>

            <button
              onClick={() => goToShop('STRUCTURED')}
              onMouseEnter={() => setActiveMegaMenu(null)}
              className="py-5 hover:text-neutral-500 transition-colors cursor-pointer"
            >
              Men's Caps
            </button>

            <button
              onClick={() => goToShop('TECHNICAL')}
              onMouseEnter={() => setActiveMegaMenu('goretex')}
              className="py-5 hover:text-neutral-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>GORE-TEX® Series</span>
              <ChevronDown size={13} className="text-neutral-400" />
            </button>

            <button
              onClick={goToLookbook}
              onMouseEnter={() => setActiveMegaMenu(null)}
              className={`py-5 transition-colors relative flex items-center gap-1 cursor-pointer ${
                currentPage === 'lookbook'
                  ? 'text-black font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'
                  : 'hover:text-neutral-500'
              }`}
            >
              <span>Lookbook</span>
            </button>

            <button
              onClick={() => goToShop()}
              onMouseEnter={() => setActiveMegaMenu(null)}
              className={`py-5 transition-colors relative cursor-pointer ${
                currentPage === 'shop'
                  ? 'text-black font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'
                  : 'hover:text-neutral-500'
              }`}
            >
              Shop All
            </button>
          </nav>

          {/* RIGHT ACTIONS: NIKE SEARCH PILL + WISHLIST + BAG + PROFILE */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Nike Search Pill Input with Interactive Suggestions */}
            <div ref={searchContainerRef} className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <div
                  className={`flex items-center bg-[#f5f5f5] hover:bg-[#eaeaea] focus-within:bg-white rounded-full px-3.5 py-2 transition-all border ${
                    searchFocused ? 'border-black w-60 shadow-md bg-white' : 'border-transparent w-44 lg:w-52'
                  }`}
                >
                  <Search size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
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
                      className="text-neutral-400 hover:text-black p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </form>

              {/* Interactive Search Suggestions Popover (Nike.com style) */}
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
                      className="w-full text-left text-xs font-semibold py-1.5 px-2 hover:bg-neutral-50 rounded-lg flex items-center justify-between text-neutral-800"
                    >
                      <span>Monolith 6-Panel Series</span>
                      <ArrowRight size={12} className="text-neutral-400" />
                    </button>
                    <button
                      onMouseDown={() => handleSearchSuggestionClick('Technical', 'TECHNICAL')}
                      className="w-full text-left text-xs font-semibold py-1.5 px-2 hover:bg-neutral-50 rounded-lg flex items-center justify-between text-neutral-800"
                    >
                      <span>GORE-TEX® Waterproof Alpine</span>
                      <ArrowRight size={12} className="text-neutral-400" />
                    </button>
                    <button
                      onMouseDown={() => handleSearchSuggestionClick('Camp', 'CAMP_CAP')}
                      className="w-full text-left text-xs font-semibold py-1.5 px-2 hover:bg-neutral-50 rounded-lg flex items-center justify-between text-neutral-800"
                    >
                      <span>Cordura® 500D Tactical Camp</span>
                      <ArrowRight size={12} className="text-neutral-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist / Favorites Heart Button with Live Counter */}
            <button
              onClick={() => goToDashboard('wishlist')}
              title="Saved Favorites"
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
              aria-label="Favorites"
            >
              <Heart size={20} />
              {wishlist && wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white font-sans text-[10px] font-black flex items-center justify-center shadow-xs animate-scaleIn">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Button (Nike style with counter) */}
            <button
              onClick={openCart}
              aria-label="Shopping Bag"
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
            >
              <ShoppingBag size={20} />
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
                <User size={20} />
              )}
              {currentUser && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

          </div>
        </div>

        {/* 2B. MEGA-MENU HOVER DROPDOWN (Nike.com style) */}
        {activeMegaMenu && (
          <div
            className="w-full bg-white border-t border-neutral-200 shadow-xl py-8 px-6 sm:px-12 animate-fadeIn"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 text-xs font-sans">
              {activeMegaMenu === 'featured' ? (
                <>
                  <div className="col-span-3 space-y-3">
                    <span className="font-nike text-sm font-bold tracking-tight uppercase text-black block">
                      FEATURED DROPS
                    </span>
                    <ul className="space-y-2 text-neutral-600 font-medium">
                      <li>
                        <button
                          onClick={() => { goToShop(); setActiveMegaMenu(null); }}
                          className="hover:text-black transition-colors"
                        >
                          New Releases 2026
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { goToShop('STRUCTURED'); setActiveMegaMenu(null); }}
                          className="hover:text-black transition-colors"
                        >
                          Monolith 01 // Onyx Heavy Twill
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { goToShop('TECHNICAL'); setActiveMegaMenu(null); }}
                          className="hover:text-black transition-colors"
                        >
                          Apex Storm // GORE-TEX 3L
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { goToLookbook(); setActiveMegaMenu(null); }}
                          className="hover:text-black transition-colors font-bold text-black"
                        >
                          View 2026 Lookbook Archive
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-3 space-y-3">
                    <span className="font-nike text-sm font-bold tracking-tight uppercase text-black block">
                      HEADWEAR DIVISIONS
                    </span>
                    <ul className="space-y-2 text-neutral-600 font-medium">
                      <li>
                        <button
                          onClick={() => { goToShop('STRUCTURED'); setActiveMegaMenu(null); }}
                          className="hover:text-black transition-colors"
                        >
                          Structured 6-Panel Caps
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { goToShop('CAMP_CAP'); setActiveMegaMenu(null); }}
                          className="hover:text-black transition-colors"
                        >
                          Cordura® 500D 5-Panel Camp
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { goToShop('RUNNER'); setActiveMegaMenu(null); }}
                          className="hover:text-black transition-colors"
                        >
                          Aerorunner 48g Featherlight
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-6 grid grid-cols-2 gap-4">
                    <div
                      onClick={() => { goToShop('STRUCTURED'); setActiveMegaMenu(null); }}
                      className="group/card cursor-pointer relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80"
                        alt="Monolith Series"
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                          DIVISION 01
                        </span>
                        <p className="font-nike text-base font-bold uppercase">MONOLITH HEAVY TWILL</p>
                      </div>
                    </div>

                    <div
                      onClick={() => { goToShop('TECHNICAL'); setActiveMegaMenu(null); }}
                      className="group/card cursor-pointer relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=600&q=80"
                        alt="GORE-TEX Series"
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                          DIVISION 02
                        </span>
                        <p className="font-nike text-base font-bold uppercase">GORE-TEX® 3L ALPINE</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-4 space-y-3">
                    <span className="font-nike text-sm font-bold tracking-tight uppercase text-black block">
                      GORE-TEX® 3-LAYER INNOVATION
                    </span>
                    <p className="text-neutral-600 leading-relaxed text-xs font-normal">
                      Every cap in the GORE-TEX® series features a 28,000mm hydrostatic head waterproof barrier, bonded taped interior seams, and laser-perforated thermal regulation vents.
                    </p>
                    <button
                      onClick={() => { goToShop('TECHNICAL'); setActiveMegaMenu(null); }}
                      className="inline-flex items-center gap-1.5 font-bold uppercase text-black hover:underline pt-1"
                    >
                      <span>Explore Technical Series</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="col-span-8 grid grid-cols-3 gap-4">
                    {[
                      {
                        title: 'APEX STORM // GORE-TEX',
                        sub: 'Alpine Membrane 3L',
                        img: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=400&q=80',
                      },
                      {
                        title: 'AERORUNNER 48G',
                        sub: 'Featherlight Ripstop',
                        img: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=400&q=80',
                      },
                      {
                        title: 'CIPHER 04 // CORDURA',
                        sub: 'Mil-Spec Ballistic 500D',
                        img: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=400&q=80',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => { goToShop('TECHNICAL'); setActiveMegaMenu(null); }}
                        className="group/item cursor-pointer space-y-2"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                          <img
                            src={item.img}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div>
                          <p className="font-nike font-bold uppercase text-black text-xs group-hover/item:underline">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-neutral-500">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. NIKE ANNOUNCEMENT SUB-HEADER (WITH DISMISS BUTTON) */}
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
                  {announcementConfig.linkText || 'Join or Sign In'}
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

      {/* 4. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white animate-fadeIn select-none font-sans">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <span className="font-nike text-3xl font-black tracking-tighter">
              RAYLUXX
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-black hover:bg-neutral-100 rounded-full"
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

            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest block">
                FLAGSHIP COLLECTIONS
              </span>

              <button
                onClick={() => { goToHome(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-2xl font-nike font-black uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-black hover:opacity-75"
              >
                <span>NEW & FEATURED</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => { goToShop(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-2xl font-nike font-black uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-black hover:opacity-75"
              >
                <span>SHOP ALL CAPS</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => { goToShop('STRUCTURED'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black"
              >
                <span>MEN'S 6-PANEL</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => { goToShop('TECHNICAL'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black"
              >
                <span>GORE-TEX® SERIES</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => { goToLookbook(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xl font-nike font-bold uppercase tracking-tight py-2 text-left border-b border-neutral-100 text-neutral-800 hover:text-black"
              >
                <span>LOOKBOOK EDITORIAL</span>
                <Camera size={16} />
              </button>
            </div>

            {/* Currency selector on mobile */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest block mb-2">
                ACTIVE CURRENCY
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['USD', 'GBP', 'EUR'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      currency === c
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    {c === 'USD' ? '$ USD' : c === 'GBP' ? '£ GBP' : '€ EUR'}
                  </button>
                ))}
              </div>
            </div>

            {/* Account on Mobile */}
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
                      className="py-2 px-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-center"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => { goToDashboard('wishlist'); setMobileMenuOpen(false); }}
                      className="py-2 px-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-center"
                    >
                      Favorites ({wishlist.length})
                    </button>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 text-xs text-neutral-600 hover:text-black font-semibold text-center border-t border-neutral-200 pt-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { openAuthModal('signin'); setMobileMenuOpen(false); }}
                    className="py-3 bg-white border-2 border-black text-black font-bold uppercase text-xs rounded-full text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                    className="py-3 bg-black text-white font-bold uppercase text-xs rounded-full text-center"
                  >
                    Join Us
                  </button>
                </div>
              )}
            </div>

            {/* Admin Console Access */}
            <div className="pt-2">
              <button
                onClick={() => { goToAdmin(); setMobileMenuOpen(false); }}
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-2xl text-xs font-bold text-black flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Operations Admin Console</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
