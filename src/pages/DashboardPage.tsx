import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { UserOrders } from '../components/dashboard/UserOrders';
import { UserTickets } from '../components/dashboard/UserTickets';
import { useCart } from '../context/CartContext';
import { useTickets } from '../context/TicketContext';
import { useCurrency } from '../context/CurrencyContext';
import { AddAddressModal, AddressData } from '../components/account/AddAddressModal';
import { AddPaymentModal, PaymentCardData } from '../components/account/AddPaymentModal';
import {
  ShieldCheck,
  Package,
  ArrowLeft,
  Heart,
  MapPin,
  ShoppingBag,
  Plus,
  Trash2,
  CreditCard,
  Settings,
  Check,
  LogOut,
  LifeBuoy,
  User as UserIcon,
  Globe,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { dashboardTab, goToDashboard, goToHome, goToAdmin, goToShop } = useNavigation();
  const { currentUser, logout, updateProfile, openAuthModal } = useAuth();
  const { wishlist: wishlistIds, toggleWishlist, products } = useStore();
  const { addToCart } = useCart();
  const { tickets } = useTickets();
  const { formatPrice, currency, setCurrency, openCurrencyModal } = useCurrency();

  const userOpenTicketsCount = useMemo(() => {
    if (!currentUser) return 0;
    return tickets.filter(
      (t) =>
        (t.customerEmail?.toLowerCase() === currentUser.email.toLowerCase() || t.userId === currentUser.id) &&
        t.status !== 'RESOLVED'
    ).length;
  }, [tickets, currentUser]);

  // Wishlist items derived from StoreContext
  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlistIds.includes(p.id));
  }, [products, wishlistIds]);

  // Addresses state
  const [addresses, setAddresses] = useState<AddressData[]>([
    {
      id: 'addr-1',
      title: 'HOME RESIDENCE',
      fullName: currentUser?.name || 'Marcus Vance',
      street: '450 West 33rd Street, Fl 14',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'DESIGN STUDIO',
      fullName: `${currentUser?.name || 'Marcus Vance'} (Studio)`,
      street: '120 Broadway, Suite 800',
      city: 'New York',
      state: 'NY',
      zip: '10271',
      country: 'United States',
      isDefault: false,
    },
  ]);

  // Payment methods state
  const [paymentCards, setPaymentCards] = useState<PaymentCardData[]>([
    {
      id: 'card-1',
      brand: 'Visa',
      last4: '4242',
      expiry: '08/28',
      cardholder: currentUser ? currentUser.name.toUpperCase() : 'MARCUS VANCE',
      isDefault: true,
    },
    {
      id: 'card-2',
      brand: 'Mastercard',
      last4: '8819',
      expiry: '11/27',
      cardholder: currentUser ? currentUser.name.toUpperCase() : 'MARCUS VANCE',
      isDefault: false,
    },
  ]);

  // Profile preferences state
  const [profileName, setProfileName] = useState(currentUser?.name || 'Marcus Vance');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'marcus.vance@studio.com');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '+1 (555) 234-8921');
  const [sizePreference, setSizePreference] = useState(currentUser?.sizePreference || 'L/XL (58-61CM)');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Sync state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      if (currentUser.phone) setProfilePhone(currentUser.phone);
      if (currentUser.sizePreference) setSizePreference(currentUser.sizePreference);
    }
  }, [currentUser]);

  // Modals state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleRemoveWishlist = (productId: string) => {
    toggleWishlist(productId);
  };

  const handleAddAddress = (newAddr: AddressData) => {
    if (newAddr.isDefault) {
      setAddresses((prev) => [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))]);
    } else {
      setAddresses((prev) => [newAddr, ...prev]);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleAddPayment = (newCard: PaymentCardData) => {
    if (newCard.isDefault) {
      setPaymentCards((prev) => [newCard, ...prev.map((c) => ({ ...c, isDefault: false }))]);
    } else {
      setPaymentCards((prev) => [newCard, ...prev]);
    }
  };

  const handleDeleteCard = (id: string) => {
    setPaymentCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSetDefaultCard = (id: string) => {
    setPaymentCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      sizePreference,
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // If user is guest / not logged in
  if (!currentUser) {
    return (
      <div className="w-full min-h-[85vh] bg-[#fafafa] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-white border border-neutral-200 p-8 sm:p-10 space-y-6 shadow-xl rounded-2xl text-center">
          
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <UserIcon size={28} />
          </div>

          <div className="space-y-2">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-400">
              RAYLUXX MEMBER PORTAL
            </span>
            <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
              SIGN IN TO ACCESS YOUR ACCOUNT
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Track active package shipments, manage saved delivery destinations, and review curated headwear favorites.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full py-4 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all shadow-lg"
            >
              Sign In to Member Portal
            </button>

            <button
              onClick={() => openAuthModal('signup')}
              className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-black font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all"
            >
              Join Rayluxx (Create Account)
            </button>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-center gap-4 text-xs">
            <button onClick={goToHome} className="text-neutral-500 hover:text-black font-semibold">
              ← Return to Storefront
            </button>
            <span>•</span>
            <button onClick={() => goToShop()} className="text-neutral-500 hover:text-black font-semibold">
              Shop All Caps
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fafafa] font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border-b border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2 font-medium">
              <button onClick={goToHome} className="hover:text-black">RAYLUXX</button>
              <span>/</span>
              <span>MEMBER PORTAL</span>
              <span>/</span>
              <span className="text-black font-bold uppercase">
                {dashboardTab.toUpperCase()}
              </span>
            </div>
            <h1 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-1">
              {dashboardTab === 'wishlist'
                ? 'SAVED FAVORITES ARCHIVE'
                : dashboardTab === 'addresses'
                ? 'SAVED DELIVERY DESTINATIONS'
                : dashboardTab === 'payments'
                ? 'PAYMENT METHODS & BILLING'
                : dashboardTab === 'settings'
                ? 'MEMBER SETTINGS & SIZING PREFERENCES'
                : dashboardTab === 'tickets'
                ? 'CLIENT CARE & SUPPORT TICKETS'
                : 'MEMBER ACCOUNT & DISPATCHES'}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-neutral-100 px-3.5 py-1.5 rounded-full border border-neutral-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-neutral-700 font-semibold uppercase">
              {currentUser.status} MEMBER // {currentUser.provider === 'google' ? 'GOOGLE VERIFIED' : 'EMAIL VERIFIED'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Pane Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT DASHBOARD SIDEBAR */}
          <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-sm">
            
            {/* User Profile Mini Block */}
            <div className="pb-6 border-b border-neutral-200 space-y-3">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-black shadow"
                />
              ) : (
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-nike text-2xl font-bold shadow">
                  {currentUser.name.split(' ').map((n) => n[0]).join('')}
                </div>
              )}
              <div>
                <h3 className="font-nike text-2xl font-bold uppercase text-black leading-tight">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-neutral-500">{currentUser.email}</p>
                <p className="font-mono text-[11px] text-neutral-400 mt-0.5">MEMBER ID: #{currentUser.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            {/* Sidebar Navigation Links (Nike style) */}
            <nav className="space-y-1.5 text-xs font-bold uppercase">
              
              <button
                onClick={() => goToDashboard('user')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 transition-all text-left rounded-xl ${
                  dashboardTab === 'user' || dashboardTab === 'orders'
                    ? 'bg-black text-white shadow'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <Package size={17} />
                <span>Orders & Tracking</span>
              </button>

              <button
                onClick={() => goToDashboard('wishlist')}
                className={`w-full flex items-center justify-between px-3.5 py-3 transition-all text-left rounded-xl ${
                  dashboardTab === 'wishlist'
                    ? 'bg-black text-white shadow'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart size={17} />
                  <span>Favorites / Wishlist</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  dashboardTab === 'wishlist' ? 'bg-white text-black' : 'bg-neutral-100 text-black'
                }`}>
                  {wishlistProducts.length}
                </span>
              </button>

              <button
                onClick={() => goToDashboard('addresses')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 transition-all text-left rounded-xl ${
                  dashboardTab === 'addresses'
                    ? 'bg-black text-white shadow'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <MapPin size={17} />
                <span>Delivery Addresses</span>
              </button>

              <button
                onClick={() => goToDashboard('payments')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 transition-all text-left rounded-xl ${
                  dashboardTab === 'payments'
                    ? 'bg-black text-white shadow'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <CreditCard size={17} />
                <span>Payment Methods</span>
              </button>

              <button
                onClick={() => goToDashboard('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 transition-all text-left rounded-xl ${
                  dashboardTab === 'settings'
                    ? 'bg-black text-white shadow'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <Settings size={17} />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => goToDashboard('tickets')}
                className={`w-full flex items-center justify-between px-3.5 py-3 transition-all text-left rounded-xl ${
                  dashboardTab === 'tickets'
                    ? 'bg-black text-white shadow'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LifeBuoy size={17} />
                  <span>Support & Concierge</span>
                </div>
                {userOpenTicketsCount > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    dashboardTab === 'tickets' ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {userOpenTicketsCount}
                  </span>
                )}
              </button>

              <div className="pt-3 border-t border-neutral-200 space-y-1.5">
                <button
                  onClick={goToAdmin}
                  className="w-full flex items-center justify-between px-3.5 py-3 transition-all text-left rounded-xl bg-neutral-50 text-neutral-800 border border-neutral-200 hover:bg-black hover:text-white group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={17} />
                    <span>Store Admin Console</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-neutral-200 text-neutral-700 group-hover:bg-neutral-800 group-hover:text-white rounded">
                    Staff
                  </span>
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-red-600 hover:bg-red-50 transition-colors text-left rounded-xl"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>

            </nav>

            {/* Return button */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={goToHome}
                className="w-full py-3 border border-neutral-300 text-center text-xs font-bold uppercase text-neutral-700 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 rounded-full"
              >
                <ArrowLeft size={14} />
                <span>Return to Storefront</span>
              </button>
            </div>

          </div>

          {/* RIGHT CONTENT WORKSPACE */}
          <div className="lg:col-span-9 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* 1. ORDERS TAB (Default) */}
            {(dashboardTab === 'user' || dashboardTab === 'orders') && <UserOrders />}

            {/* 2. SUPPORT & TICKETS TAB */}
            {dashboardTab === 'tickets' && <UserTickets />}

            {/* 3. WISHLIST / FAVORITES TAB */}
            {dashboardTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-neutral-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-nike text-3xl font-black uppercase text-black">
                      SAVED FAVORITES ({wishlistProducts.length})
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Caps saved to your member archive. One-click move to bag.
                    </p>
                  </div>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <Heart size={36} className="text-neutral-300 mx-auto" />
                    <h4 className="font-nike text-2xl font-bold uppercase">NO SAVED ITEMS</h4>
                    <p className="text-neutral-500 text-xs">Explore the collection to add caps to your favorites.</p>
                    <button
                      onClick={() => goToShop()}
                      className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-neutral-800"
                    >
                      Browse All Caps
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((item) => (
                      <div key={item.id} className="border border-neutral-200 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                        <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden relative group">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <button
                            onClick={() => handleRemoveWishlist(item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white text-neutral-400 hover:text-red-600 rounded-full shadow transition-colors"
                            title="Remove from favorites"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase text-[#b85d19]">{item.badge || 'Member Product'}</span>
                          <h4 className="font-nike text-xl font-bold uppercase text-black leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-xs text-neutral-500">
                            {item.profile} • {item.material}
                          </p>
                          <p className="text-sm font-bold text-black mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={() => addToCart(item, item.sizes[0], item.colors[0]?.name || 'Standard')}
                            className="w-full py-3 bg-black text-white font-sans text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow"
                          >
                            <ShoppingBag size={14} />
                            <span>MOVE TO BAG</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SAVED DELIVERY ADDRESSES TAB */}
            {dashboardTab === 'addresses' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-neutral-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-nike text-3xl font-black uppercase text-black">
                      SAVED DELIVERY ADDRESSES ({addresses.length})
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Manage verified shipping locations for instant express checkout.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="px-5 py-2.5 bg-black text-white font-sans text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Plus size={14} />
                    <span>ADD ADDRESS</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 border rounded-xl space-y-3 relative transition-all ${
                        addr.isDefault ? 'border-black bg-neutral-50' : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-neutral-600 uppercase">
                          {addr.title}
                        </span>
                        {addr.isDefault ? (
                          <span className="text-[10px] font-bold bg-black text-white px-2.5 py-0.5 rounded-full uppercase">
                            DEFAULT DISPATCH
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[10px] text-neutral-500 hover:text-black uppercase font-semibold underline"
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      <div className="text-xs space-y-1 text-neutral-700 leading-relaxed">
                        <p className="font-bold text-black text-sm">{addr.fullName}</p>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-neutral-500">{addr.country}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-200 flex justify-end gap-3 text-xs font-semibold">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-neutral-400 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. PAYMENT METHODS TAB */}
            {dashboardTab === 'payments' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-neutral-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-nike text-3xl font-black uppercase text-black">
                      SAVED PAYMENT METHODS ({paymentCards.length})
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Encrypted billing profiles for instant one-click express ordering.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-5 py-2.5 bg-black text-white font-sans text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Plus size={14} />
                    <span>ADD CARD</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {paymentCards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-6 border rounded-xl space-y-4 relative ${
                        card.isDefault ? 'border-black bg-neutral-50' : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-nike text-xl font-bold uppercase text-black flex items-center gap-2">
                          <CreditCard size={18} />
                          <span>{card.brand}</span>
                        </span>
                        {card.isDefault ? (
                          <span className="text-[10px] font-bold bg-black text-white px-2.5 py-0.5 rounded-full uppercase">
                            DEFAULT CARD
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultCard(card.id)}
                            className="text-[10px] text-neutral-500 hover:text-black uppercase font-semibold underline"
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="font-mono text-base font-bold tracking-widest text-black">
                          •••• •••• •••• {card.last4}
                        </p>
                        <div className="flex justify-between text-xs text-neutral-500 pt-1 font-mono">
                          <span>EXP: {card.expiry}</span>
                          <span className="uppercase">{card.cardholder}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-200 flex justify-end">
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-neutral-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. ACCOUNT SETTINGS & PREFERENCES TAB */}
            {dashboardTab === 'settings' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-neutral-200">
                  <h3 className="font-nike text-3xl font-black uppercase text-black">
                    MEMBER PROFILE & SIZING PREFERENCES
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Update personal information, notifications, and tailored cranial specifications.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl text-xs">
                  
                  {/* Personal info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase text-black">Personal Details</h4>
                    
                    <div>
                      <label className="block font-semibold uppercase text-neutral-700 mb-1">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-neutral-700 mb-1">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-neutral-700 mb-1">
                        MOBILE NUMBER (FOR DISPATCH SMS)
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Sizing Preference */}
                  <div className="space-y-4 pt-6 border-t border-neutral-200">
                    <h4 className="text-sm font-bold uppercase text-black">Preferred Cap Sizing</h4>
                    <p className="text-neutral-500 text-xs">Pre-selects your size on Product Detail Pages.</p>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {['S/M (54-57CM)', 'L/XL (58-61CM)', 'ADJUSTABLE'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSizePreference(sz)}
                          className={`py-3 px-2 border text-xs font-bold uppercase text-center rounded-lg transition-all ${
                            sizePreference === sz
                              ? 'border-black bg-black text-white shadow'
                              : 'border-neutral-200 hover:border-black text-black'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-3 pt-6 border-t border-neutral-200">
                    <h4 className="text-sm font-bold uppercase text-black">Notification Preferences</h4>
                    
                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        className="w-4 h-4 accent-black rounded"
                      />
                      <span className="text-neutral-700 font-medium text-xs">
                        Email me 60 minutes before new GORE-TEX and limited drops
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                        className="w-4 h-4 accent-black rounded"
                      />
                      <span className="text-neutral-700 font-medium text-xs">
                        SMS delivery tracking updates from courier
                      </span>
                    </label>
                  </div>

                  {/* Regional Currency & Market Preferences */}
                  <div className="space-y-4 pt-6 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase text-black">Regional Currency & Storefront Market</h4>
                        <p className="text-neutral-500 text-xs">Select your currency for live conversions and localized checkout.</p>
                      </div>
                      <button
                        type="button"
                        onClick={openCurrencyModal}
                        className="text-xs font-bold text-black underline uppercase hover:opacity-70 flex items-center gap-1"
                      >
                        <Globe size={13} />
                        <span>Open Modal</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
                        { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
                        { code: 'EUR', label: 'Eurozone Euro', symbol: '€', flag: '🇪🇺' },
                      ].map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCurrency(c.code as any)}
                          className={`p-3.5 border text-xs font-bold rounded-2xl transition-all text-left flex flex-col justify-between gap-1.5 ${
                            currency === c.code
                              ? 'border-black bg-black text-white shadow-md'
                              : 'border-neutral-200 hover:border-black text-neutral-800 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl select-none">{c.flag}</span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              currency === c.code ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {c.symbol}
                            </span>
                          </div>
                          <div>
                            <span className="font-nike text-sm font-black uppercase tracking-tight block">
                              {c.code}
                            </span>
                            <span className={`text-[11px] font-medium truncate block ${
                              currency === c.code ? 'text-neutral-300' : 'text-neutral-500'
                            }`}>
                              {c.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow"
                    >
                      <Check size={14} />
                      <span>SAVE CHANGES</span>
                    </button>

                    {settingsSavedToast && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                        ✓ Member preferences updated successfully
                      </span>
                    )}
                  </div>

                </form>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* MODALS */}
      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAdd={handleAddAddress}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onAdd={handleAddPayment}
      />

    </div>
  );
};
