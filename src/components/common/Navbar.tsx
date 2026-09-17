import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ShoppingBag, Menu, X, Search, Heart, User, ArrowRight, Camera, ShieldCheck, LogOut, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalItems, openCart } = useCart();
  const { currentPage, goToShop, goToHome, goToDashboard, goToLookbook, goToAdmin, searchQuery, setSearchQuery } = useNavigation();
  const { currentUser, logout, openAuthModal } = useAuth();
  const { currency, setCurrency, openCurrencyModal } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      goToShop(undefined, searchQuery.trim());
    }
  };

  const userFirstName = currentUser ? currentUser.name.split(' ')[0] : '';

  return (
    <>
      {/* 1. TOP UTILITY BAR (Exact Nike Style) */}
      <div className="bg-[#f5f5f5] text-[#707072] text-[12px] font-sans font-medium h-9 border-b border-neutral-200 hidden sm:flex items-center justify-between px-6 sm:px-10 select-none">
        <div className="flex items-center gap-2">
          <button onClick={goToHome} className="font-nike text-sm font-black text-black hover:opacity-75 uppercase tracking-tight">
            RAYLUX LAB
          </button>
        </div>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <button
                onClick={() => goToDashboard('user')}
                className="hover:text-black font-semibold text-black transition-colors flex items-center gap-1.5"
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
              <span>|</span>
              <button onClick={() => goToDashboard('orders')} className="hover:text-black transition-colors">
                My Orders
              </button>
              <span>|</span>
              <button onClick={logout} className="hover:text-black transition-colors flex items-center gap-1">
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => goToShop()} className="hover:text-black transition-colors">
                Find a Store
              </button>
              <span>|</span>
              <button onClick={() => openAuthModal('signin')} className="hover:text-black transition-colors">
                Help
              </button>
              <span>|</span>
              <button
                onClick={() => openAuthModal('signup')}
                className="hover:text-black transition-colors font-medium"
              >
                Join Us
              </button>
              <span>|</span>
              <button
                onClick={() => openAuthModal('signin')}
                className="hover:text-black font-semibold text-black transition-colors"
              >
                Sign In
              </button>
            </>
          )}
          <span>|</span>

          {/* Tri-Currency Switcher Pill */}
          <div className="flex items-center bg-neutral-200/80 p-0.5 rounded-full text-[11px] font-bold">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                currency === 'USD' ? 'bg-white text-black shadow-2xs font-black' : 'text-neutral-600 hover:text-black'
              }`}
              title="Switch to US Dollar ($)"
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency('GBP')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                currency === 'GBP' ? 'bg-white text-black shadow-2xs font-black' : 'text-neutral-600 hover:text-black'
              }`}
              title="Switch to British Pound (£)"
            >
              £ GBP
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                currency === 'EUR' ? 'bg-white text-black shadow-2xs font-black' : 'text-neutral-600 hover:text-black'
              }`}
              title="Switch to Euro (€)"
            >
              € EUR
            </button>
          </div>

          <button
            onClick={openCurrencyModal}
            className="hover:text-black transition-colors flex items-center gap-1 text-[11px] font-semibold text-neutral-600"
            title="Open Region & Currency Selector"
          >
            <Globe size={13} />
            <span>Region</span>
          </button>

          <span>|</span>
          <button
            onClick={goToAdmin}
            className="hover:text-black font-bold text-black transition-colors flex items-center gap-1.5"
            title="Access Staff Operations Portal"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span>
            <span>Admin Console</span>
          </button>
        </div>
      </div>


      {/* 2. MAIN NIKE HEADER BAR */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Mobile Menu Trigger & Region Pill */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="p-1.5 -ml-1.5 text-black hover:bg-neutral-100 rounded-full transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              onClick={openCurrencyModal}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 text-[11px] font-bold text-black flex items-center gap-1 transition-colors"
              title="Change Currency & Region"
            >
              <Globe size={12} />
              <span>{currency}</span>
            </button>
          </div>

          {/* BRAND WORDMARK */}
          <div className="flex items-center">
            <button
              onClick={goToHome}
              className="group flex items-center gap-1.5 text-left focus:outline-none"
            >
              <span className="font-nike text-3xl sm:text-4xl font-black tracking-tighter text-black group-hover:opacity-80 transition-opacity">
                RAYLUX
              </span>
            </button>
          </div>

          {/* DESKTOP NAV LINKS (Nike Font & Weight) */}
          <nav className="hidden lg:flex items-center space-x-7 font-sans text-[15px] font-semibold tracking-normal text-neutral-900">
            <button
              onClick={goToHome}
              className={`py-2 transition-colors relative ${
                currentPage === 'home'
                  ? 'text-black font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'
                  : 'hover:text-neutral-500'
              }`}
            >
              New & Featured
            </button>

            <button
              onClick={() => goToShop('STRUCTURED')}
              className="py-2 hover:text-neutral-500 transition-colors"
            >
              Men's Caps
            </button>

            <button
              onClick={() => goToShop('TECHNICAL')}
              className="py-2 hover:text-neutral-500 transition-colors"
            >
              GORE-TEX® Series
            </button>

            <button
              onClick={goToLookbook}
              className={`py-2 transition-colors relative flex items-center gap-1.5 ${
                currentPage === 'lookbook'
                  ? 'text-black font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'
                  : 'hover:text-neutral-500'
              }`}
            >
              <span>Lookbook</span>
            </button>

            <button
              onClick={() => goToShop()}
              className={`py-2 transition-colors relative ${
                currentPage === 'shop'
                  ? 'text-black font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'
                  : 'hover:text-neutral-500'
              }`}
            >
              Shop All
            </button>
          </nav>

          {/* RIGHT ACTIONS: NIKE SEARCH PILL + FAVORITES + BAG + PROFILE */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Nike Search Pill Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <div className="flex items-center bg-[#f5f5f5] hover:bg-[#e5e5e5] focus-within:bg-[#e5e5e5] rounded-full px-3.5 py-2 w-44 lg:w-52 transition-colors">
                <Search size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search Caps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm font-sans text-black placeholder-neutral-500 focus:outline-none w-full"
                />
              </div>
            </form>

            {/* Wishlist / Favorites Heart Button */}
            <button
              onClick={() => goToDashboard('wishlist')}
              title="Saved Favorites"
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative"
              aria-label="Favorites"
            >
              <Heart size={21} />
            </button>

            {/* Shopping Bag Button (Nike style with counter) */}
            <button
              onClick={openCart}
              aria-label="Shopping Bag"
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative"
            >
              <ShoppingBag size={21} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black text-white font-sans text-[10px] font-bold flex items-center justify-center">
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
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative"
              aria-label="Account"
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover border border-neutral-300" />
              ) : (
                <User size={21} />
              )}
              {currentUser && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* 3. NIKE ANNOUNCEMENT SUB-HEADER */}
      <div className="bg-[#f5f5f5] py-2.5 px-4 text-center text-xs font-sans font-medium text-neutral-800 border-b border-neutral-200">
        {currentUser ? (
          <p>
            Welcome, <strong className="text-black">{currentUser.name}</strong> • All-Access Raylux Member • {
              currency === 'GBP' ? 'Free Dispatch on Orders £120+' : currency === 'EUR' ? 'Free Dispatch on Orders €140+' : 'Free Dispatch on Orders $150+'
            }.{' '}
            <button onClick={() => goToDashboard('user')} className="underline font-bold hover:text-black">
              View Member Portal
            </button>
          </p>
        ) : (
          <p>
            Members: Complimentary Worldwide Dispatch on orders {
              currency === 'GBP' ? '£120+' : currency === 'EUR' ? '€140+' : '$150+'
            } • 30-Day Risk-Free Returns.{' '}
            <button onClick={() => openAuthModal('signin')} className="underline font-bold hover:text-black">
              Join or Sign In
            </button>
          </p>
        )}
      </div>


      {/* 4. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white animate-fadeIn">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <span className="font-nike text-3xl font-black tracking-tighter">
              RAYLUX
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-black hover:bg-neutral-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 font-sans">
            {/* Mobile Search Bar */}
            <form
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setMobileMenuOpen(false);
              }}
              className="relative"
            >
              <div className="flex items-center bg-neutral-100 rounded-2xl px-4 py-3 border border-neutral-200 focus-within:border-black transition-colors">
                <Search size={18} className="text-neutral-500 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search technical caps & materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm font-sans text-black placeholder-neutral-500 focus:outline-none w-full"
                />
              </div>
            </form>

            <div className="space-y-3">
              <span className="font-sans text-[10px] font-bold uppercase text-neutral-400 tracking-widest block">
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

            <div className="pt-4 space-y-3">
              <span className="font-sans text-[10px] font-bold uppercase text-neutral-400 tracking-widest block">
                MEMBER ACCOUNT
              </span>

              {currentUser ? (
                <div className="p-4 bg-neutral-100 rounded-2xl space-y-3 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border border-neutral-300" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                          {currentUser.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-black text-sm">{currentUser.name}</p>
                        <p className="text-[11px] text-neutral-500">{currentUser.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-black text-white px-2.5 py-1 rounded-full uppercase">
                      {currentUser.status}
                    </span>
                  </div>

                  <div className="pt-2 flex gap-2 border-t border-neutral-200">
                    <button
                      onClick={() => { goToDashboard('user'); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-xl text-center shadow-xs"
                    >
                      Member Portal
                    </button>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="px-4 py-2.5 bg-white border border-neutral-300 text-neutral-800 text-xs font-bold uppercase rounded-xl hover:border-black"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={() => { openAuthModal('signin'); setMobileMenuOpen(false); }}
                    className="w-full py-3.5 bg-black text-white text-center font-sans text-xs font-bold uppercase rounded-2xl tracking-wider shadow-sm"
                  >
                    SIGN IN TO ACCOUNT
                  </button>
                  <button
                    onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                    className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-black text-center font-sans text-xs font-bold uppercase rounded-2xl tracking-wider border border-neutral-200"
                  >
                    JOIN RAYLUX (CREATE ACCOUNT)
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => { goToDashboard('orders'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 text-left font-sans text-xs font-bold uppercase rounded-xl hover:border-black transition-colors"
                >
                  <User size={15} />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => { goToDashboard('wishlist'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 text-left font-sans text-xs font-bold uppercase rounded-xl hover:border-black transition-colors"
                >
                  <Heart size={15} />
                  <span>Favorites</span>
                </button>
              </div>

              <button
                onClick={() => { goToAdmin(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 bg-black text-white text-left font-sans text-xs font-bold uppercase rounded-xl shadow-sm hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} />
                  <span>ADMIN OPERATIONS CONSOLE</span>
                </div>
                <span className="text-[9px] font-mono bg-neutral-800 text-white px-2 py-0.5 rounded">ACCESS</span>
              </button>
            </div>

          </div>

          {/* Mobile Drawer Footer: Tri-Currency Switcher + Region Popup Opener */}
          <div className="p-5 border-t border-neutral-200 bg-neutral-50 font-sans text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-500 uppercase text-[11px] flex items-center gap-1.5">
                <Globe size={13} className="text-black" />
                <span>Store Region & Currency</span>
              </span>
              <button
                onClick={() => { setMobileMenuOpen(false); openCurrencyModal(); }}
                className="text-[11px] font-bold text-black underline uppercase hover:opacity-75"
              >
                Change Modal
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCurrency('USD')}
                className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                  currency === 'USD'
                    ? 'bg-black text-white border-black shadow-xs font-black'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                }`}
              >
                🇺🇸 $ USD
              </button>
              <button
                onClick={() => setCurrency('GBP')}
                className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                  currency === 'GBP'
                    ? 'bg-black text-white border-black shadow-xs font-black'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                }`}
              >
                🇬🇧 £ GBP
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                  currency === 'EUR'
                    ? 'bg-black text-white border-black shadow-xs font-black'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                }`}
              >
                🇪🇺 € EUR
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest pt-1">
              <span>WORLDWIDE DISPATCH</span>
              <span>RAYLUX LAB</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
