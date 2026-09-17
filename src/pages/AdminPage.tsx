import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types/product';
import { ProductModal } from '../components/admin/ProductModal';
import {
  Lock,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Truck,
  Tag,
  Settings,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  KeyRound,
  Trash2,
  Eye,
  X,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Download,
  Menu,
} from 'lucide-react';

type AdminTab = 'overview' | 'orders' | 'inventory' | 'customers' | 'dispatches' | 'discounts' | 'settings';

interface PromoCodeItem {
  code: string;
  percent: number;
  active: boolean;
  uses: number;
  expiry: string;
}

const DEFAULT_PROMO_CODES: PromoCodeItem[] = [
  { code: 'RAYLUX10', percent: 10, active: true, uses: 42, expiry: '2026-12-31' },
  { code: 'MONOLITH20', percent: 20, active: true, uses: 18, expiry: '2026-10-15' },
  { code: 'MEMBER20', percent: 20, active: true, uses: 64, expiry: '2026-12-31' },
  { code: 'VIP25', percent: 25, active: false, uses: 9, expiry: '2026-08-30' },
];

export const AdminPage: React.FC = () => {
  const { isAdminLoggedIn, loginAdmin, logoutAdmin, goToHome } = useNavigation();
  const { orders, inventory, updateOrderStatus, updateOrderTracking, addProduct, restockProduct, deleteProduct } = useStore();
  const { registeredUsers } = useAuth();

  // Login form state
  const [email, setEmail] = useState('admin@raylux.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active Admin Tab & Mobile Sidebar Toggle
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PROCESSING' | 'IN TRANSIT' | 'DELIVERED'>('ALL');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('ALL');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'GOOGLE' | 'VIP'>('ALL');

  // Modals & Drawers
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedInspectOrder, setSelectedInspectOrder] = useState<Order | null>(null);
  const [inspectCustomer, setInspectCustomer] = useState<(typeof registeredUsers)[0] | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Promo Codes State (Persisted)
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>(() => {
    try {
      const saved = localStorage.getItem('raylux_promo_codes_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROMO_CODES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('raylux_promo_codes_v2', JSON.stringify(promoCodes));
    } catch {
      // ignore
    }
  }, [promoCodes]);

  // New Promo Code Form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState('15');

  // Store Settings State
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('150');
  const [standardRate, setStandardRate] = useState('12');
  const [expressRate, setExpressRate] = useState('18');
  const [taxRate, setTaxRate] = useState('8.8');

  // KPI Calculations
  const grossRevenue = useMemo(() => {
    return orders.reduce((sum, ord) => sum + ord.total, 84320);
  }, [orders]);

  const activeDispatchesCount = useMemo(() => {
    return orders.filter(o => o.status === 'PROCESSING' || o.status === 'IN TRANSIT').length;
  }, [orders]);

  const totalUnitsSold = useMemo(() => {
    return orders.reduce((sum, ord) => sum + ord.items.reduce((s, i) => s + i.quantity, 0), 948);
  }, [orders]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(i => i.stock <= 20);
  }, [inventory]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (orderStatusFilter !== 'ALL' && ord.status !== orderStatusFilter) {
        return false;
      }
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matchNum = ord.orderNumber.toLowerCase().includes(q);
        const matchName = ord.shippingAddress.fullName.toLowerCase().includes(q);
        const matchWaybill = ord.trackingNumber.toLowerCase().includes(q);
        const matchCity = ord.shippingAddress.city.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchWaybill && !matchCity) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, globalSearch]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (inventoryCategoryFilter !== 'ALL' && !item.material.toLowerCase().includes(inventoryCategoryFilter.toLowerCase())) {
        return false;
      }
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }
      return true;
    });
  }, [inventory, inventoryCategoryFilter, globalSearch]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return registeredUsers.filter((u) => {
      if (customerFilter === 'GOOGLE' && u.provider !== 'google') return false;
      if (customerFilter === 'VIP' && (u.totalOrders || 0) < 2) return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [registeredUsers, customerFilter, globalSearch]);

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(password);
    if (!success) {
      setErrorMsg('Invalid password. Use "raylux2026" or "admin".');
    } else {
      setErrorMsg('');
    }
  };

  const handleQuickDemoFill = () => {
    setPassword('raylux2026');
    loginAdmin('raylux2026');
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    const codeClean = newPromoCode.trim().toUpperCase();
    const pct = parseInt(newPromoPercent, 10);
    if (!codeClean || isNaN(pct) || pct <= 0 || pct > 100) {
      alert('Please provide a valid code and percentage between 1 and 100.');
      return;
    }
    const exists = promoCodes.find(p => p.code === codeClean);
    if (exists) {
      alert('Promo code already exists!');
      return;
    }
    setPromoCodes(prev => [
      { code: codeClean, percent: pct, active: true, uses: 0, expiry: '2026-12-31' },
      ...prev
    ]);
    setNewPromoCode('');
    showNotice(`Promo code ${codeClean} created!`);
  };

  const togglePromoCodeStatus = (code: string) => {
    setPromoCodes(prev =>
      prev.map(p => (p.code === code ? { ...p, active: !p.active } : p))
    );
    showNotice(`Updated promo status for ${code}`);
  };

  const deletePromoCode = (code: string) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code));
    showNotice(`Deleted promo code ${code}`);
  };

  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Order Number,Date,Customer,Total,Status,Carrier,Waybill\n' +
      orders.map(o => `"${o.orderNumber}","${o.date}","${o.shippingAddress.fullName}","${o.total}","${o.status}","${o.carrier}","${o.trackingNumber}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `raylux_orders_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('Orders CSV Manifest exported!');
  };

  // 1. ADMIN AUTHENTICATION GATE
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 space-y-7 shadow-xl">
          
          <div className="text-center space-y-2.5">
            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock size={26} />
            </div>
            <div>
              <span className="text-[11px] font-sans font-bold tracking-widest text-neutral-400 uppercase">
                INTERNAL OPERATIONS
              </span>
              <h2 className="font-nike text-4xl sm:text-5xl font-black uppercase text-black tracking-tight mt-0.5">
                RAYLUX OPERATIONS
              </h2>
            </div>
            <p className="text-xs font-sans text-neutral-500">
              Manage fulfillment, batch inventory, and client telemetry.
            </p>
          </div>

          {/* Demo Credentials Box */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-800">
              <KeyRound size={14} className="text-black" />
              <span className="font-sans uppercase tracking-wider">Demo Credentials:</span>
            </div>
            <div className="font-sans text-neutral-600 space-y-0.5 text-xs">
              <p>Email: <strong className="text-black font-semibold">admin@raylux.com</strong></p>
              <p>Password: <strong className="text-black font-semibold">raylux2026</strong> (or <strong className="text-black font-semibold">admin</strong>)</p>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="w-full mt-1.5 py-2.5 bg-black text-white hover:bg-neutral-800 font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Click for 1-Click Demo Login</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold uppercase text-neutral-700 mb-1.5 tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-sm text-black focus:outline-none focus:border-black rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-neutral-700 mb-1.5 tracking-wider">
                Security Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-sm text-black focus:outline-none focus:border-black rounded-xl"
              />
            </div>

            {errorMsg && (
              <p className="text-red-600 font-semibold text-xs bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors shadow-md"
            >
              SIGN IN TO CONSOLE
            </button>
          </form>

          <div className="pt-2 text-center border-t border-neutral-100">
            <button
              onClick={goToHome}
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
            >
              ← Return to Storefront
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. AUTHENTIC NIKE EDITORIAL OPERATIONS CONSOLE
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-black flex font-sans antialiased">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-full shadow-2xl font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={15} className="text-white" />
          <span>{notification}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION (EDITORIAL NIKE STYLE) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black text-white font-nike text-xl font-black flex items-center justify-center shadow-sm">
                  R
                </div>
                <div>
                  <h1 className="font-nike text-2xl font-black uppercase tracking-tight text-black leading-none">
                    RAYLUX
                  </h1>
                  <span className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-0.5">
                    OPERATIONS // TOKYO • BERLIN
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden text-neutral-400 hover:text-black p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Pill */}
            <div className="mt-3.5 px-3 py-1.5 bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-between text-[11px] font-sans">
              <span className="flex items-center gap-1.5 font-bold text-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="uppercase tracking-wider">STORE ACTIVE</span>
              </span>
              <span className="font-bold text-neutral-400">v2.6</span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 overflow-y-auto p-3.5 space-y-5">
            
            {/* GROUP 1: OPERATIONS */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-sans font-bold tracking-widest text-neutral-400 uppercase">
                OPERATIONS
              </span>

              <button
                onClick={() => { setActiveTab('overview'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'overview'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard size={16} />
                  <span>Overview</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'orders'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={16} />
                  <span>Orders</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === 'orders'
                      ? 'bg-white text-black'
                      : 'bg-neutral-100 text-black border border-neutral-200'
                  }`}
                >
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('inventory'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package size={16} />
                  <span>Inventory</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === 'inventory'
                      ? 'bg-white text-black'
                      : lowStockItems.length > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-100 text-black border border-neutral-200'
                  }`}
                >
                  {inventory.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('customers'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'customers'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={16} />
                  <span>Customers</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === 'customers'
                      ? 'bg-white text-black'
                      : 'bg-neutral-100 text-black border border-neutral-200'
                  }`}
                >
                  {registeredUsers.length}
                </span>
              </button>
            </div>

            {/* GROUP 2: LOGISTICS & MARKETING */}
            <div className="space-y-1 pt-1.5">
              <span className="px-3 text-[10px] font-sans font-bold tracking-widest text-neutral-400 uppercase">
                LOGISTICS & MARKETING
              </span>

              <button
                onClick={() => { setActiveTab('dispatches'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'dispatches'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck size={16} />
                  <span>Dispatches</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === 'dispatches'
                      ? 'bg-white text-black'
                      : 'bg-neutral-100 text-black border border-neutral-200'
                  }`}
                >
                  {activeDispatchesCount}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('discounts'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'discounts'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag size={16} />
                  <span>Promo Codes</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === 'discounts'
                      ? 'bg-white text-black'
                      : 'bg-neutral-100 text-black border border-neutral-200'
                  }`}
                >
                  {promoCodes.length}
                </span>
              </button>
            </div>

            {/* GROUP 3: SYSTEM */}
            <div className="space-y-1 pt-1.5">
              <span className="px-3 text-[10px] font-sans font-bold tracking-widest text-neutral-400 uppercase">
                CONFIG
              </span>

              <button
                onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'settings'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={16} />
                  <span>Settings</span>
                </div>
              </button>
            </div>

          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 space-y-2.5">
            
            {/* Operator Info */}
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-black text-white font-bold text-[11px] flex items-center justify-center">
                  MV
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-black truncate">Marcus Vance</p>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">admin@raylux.com</p>
                </div>
              </div>
              <ShieldCheck size={15} className="text-black shrink-0" />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={goToHome}
                className="py-2 px-2 bg-white hover:bg-black hover:text-white text-black rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-neutral-200 shadow-xs"
              >
                <ArrowLeft size={12} />
                <span>Storefront</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="py-2 px-2 bg-white hover:bg-red-600 hover:text-white text-black rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-neutral-200 shadow-xs"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>

          </div>

        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Utility Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-black hover:bg-neutral-100 rounded-lg"
            >
              <Menu size={18} />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-64 sm:w-80 md:w-96">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders, SKU specs, clients, or waybills..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-xs font-sans text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Clean Top Action Buttons (Single source, no duplicates) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus size={13} />
              <span>Add Product Spec</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white hover:border-black text-black border border-neutral-200 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export Manifest</span>
            </button>
          </div>

        </header>

        {/* WORKSPACE CONTENT BODY */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    OPERATIONAL DASHBOARD
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    EXECUTIVE OVERVIEW
                  </h2>
                </div>
                <div className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">
                  DISPATCH SYSTEM // ACTIVE
                </div>
              </div>

              {/* 4 Primary Nike-Style Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1 */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs hover:border-neutral-400 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                      GROSS VOLUME
                    </span>
                    <span className="p-1.5 bg-neutral-100 text-black rounded-full">
                      <DollarSign size={15} />
                    </span>
                  </div>
                  <div>
                    <p className="font-nike text-3xl sm:text-4xl font-black text-black tracking-tight">
                      ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <TrendingUp size={12} className="text-black" />
                      <span>+14.8% VS PREVIOUS PERIOD</span>
                    </p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs hover:border-neutral-400 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                      ACTIVE DISPATCHES
                    </span>
                    <span className="p-1.5 bg-neutral-100 text-black rounded-full">
                      <ShoppingBag size={15} />
                    </span>
                  </div>
                  <div>
                    <p className="font-nike text-3xl sm:text-4xl font-black text-black tracking-tight">
                      {orders.length} ORDERS
                    </p>
                    <p className="text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <Clock size={12} className="text-black" />
                      <span>{activeDispatchesCount} IN TRANSIT / PROCESSING</span>
                    </p>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs hover:border-neutral-400 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                      TOTAL UNITS SOLD
                    </span>
                    <span className="p-1.5 bg-neutral-100 text-black rounded-full">
                      <Package size={15} />
                    </span>
                  </div>
                  <div>
                    <p className="font-nike text-3xl sm:text-4xl font-black text-black tracking-tight">
                      {totalUnitsSold} UNITS
                    </p>
                    <p className="text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                      MONOLITH 01 LEADING ALLOCATION
                    </p>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs hover:border-neutral-400 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                      REGISTERED MEMBERS
                    </span>
                    <span className="p-1.5 bg-neutral-100 text-black rounded-full">
                      <Users size={15} />
                    </span>
                  </div>
                  <div>
                    <p className="font-nike text-3xl sm:text-4xl font-black text-black tracking-tight">
                      {registeredUsers.length} USERS
                    </p>
                    <p className="text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                      {registeredUsers.filter(u => u.provider === 'google').length} GOOGLE VERIFIED ACCOUNTS
                    </p>
                  </div>
                </div>

              </div>

              {/* Weekly Velocity Chart & Top Silhouettes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 7-Day Revenue Velocity Chart */}
                <div className="lg:col-span-8 bg-white border border-neutral-200 p-6 rounded-2xl space-y-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-nike text-2xl font-black uppercase text-black">
                        WEEKLY REVENUE VELOCITY
                      </h3>
                      <p className="text-xs font-sans text-neutral-500">Processed order volume across global hubs</p>
                    </div>
                    <span className="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-sans font-bold text-black uppercase">
                      AVG $12,125 / DAY
                    </span>
                  </div>

                  {/* Clean Minimalist Bar Chart */}
                  <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-neutral-200 pb-2">
                    {[
                      { day: 'MON', val: 65, rev: '$8,450', orders: 8 },
                      { day: 'TUE', val: 80, rev: '$10,400', orders: 11 },
                      { day: 'WED', val: 50, rev: '$6,500', orders: 6 },
                      { day: 'THU', val: 92, rev: '$11,960', orders: 14 },
                      { day: 'FRI', val: 100, rev: '$13,000', orders: 16 },
                      { day: 'SAT', val: 85, rev: '$11,050', orders: 12 },
                      { day: 'SUN', val: 75, rev: '$9,750', orders: 10 },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-9 bg-black text-white font-sans text-[10px] font-bold py-1 px-2.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md">
                          {bar.rev} • {bar.orders} orders
                        </div>
                        <div className="w-full bg-neutral-100 rounded-t-md overflow-hidden h-32 flex items-end">
                          <div
                            style={{ height: `${bar.val}%` }}
                            className="w-full bg-black group-hover:bg-neutral-700 transition-colors rounded-t"
                          ></div>
                        </div>
                        <span className="text-[11px] font-sans font-bold text-neutral-400 group-hover:text-black transition-colors uppercase">
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                    <span>* Real-time transactions</span>
                    <span className="text-black">100% DISPATCH ACCURACY</span>
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 rounded-2xl space-y-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-nike text-2xl font-black uppercase text-black">
                      TOP SILHOUETTES
                    </h3>
                    <p className="text-xs font-sans text-neutral-500">Highest velocity products</p>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { name: 'MONOLITH 01 // ONYX', units: '342 units', pct: '85%' },
                      { name: 'APEX STORM // GORE-TEX', units: '218 units', pct: '65%' },
                      { name: 'ARCHETYPE 03 // BONE', units: '164 units', pct: '48%' },
                      { name: 'CIPHER 04 // CORDURA', units: '124 units', pct: '36%' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-black uppercase">{item.name}</span>
                          <span className="font-mono text-neutral-500">{item.units}</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: item.pct }}
                            className="h-full bg-black rounded-full"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="w-full py-2.5 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Catalog Matrix</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>

              {/* Recent Orders Queue Preview */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-nike text-2xl font-black uppercase text-black">
                      RECENT DISPATCH QUEUE
                    </h3>
                    <p className="text-xs font-sans text-neutral-500">Real-time incoming customer orders</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors flex items-center gap-1"
                  >
                    <span>View All ({orders.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="divide-y divide-neutral-100 overflow-x-auto">
                  {orders.slice(0, 4).map((ord) => (
                    <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-black">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] font-sans text-neutral-400">
                            {ord.date}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              ord.status === 'DELIVERED'
                                ? 'bg-black text-white'
                                : ord.status === 'IN TRANSIT'
                                ? 'bg-neutral-200 text-black'
                                : 'bg-neutral-100 text-black border border-neutral-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs font-sans text-neutral-600">
                          Recipient: <strong className="text-black">{ord.shippingAddress.fullName}</strong> • {ord.shippingAddress.city}, {ord.shippingAddress.country}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="font-nike text-2xl font-black text-black">
                          ${ord.total.toFixed(2)} USD
                        </span>
                        <button
                          onClick={() => setSelectedInspectOrder(ord)}
                          className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Title (Clean, NO duplicate export button) */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    FULFILLMENT HUB
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    ORDER DISPATCH MATRIX
                  </h2>
                </div>
              </div>

              {/* Status Filter Tabs & Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {(['ALL', 'PROCESSING', 'IN TRANSIT', 'DELIVERED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        orderStatusFilter === st
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                      }`}
                    >
                      {st} ({st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length})
                    </button>
                  ))}
                </div>

                <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 px-2">
                  {filteredOrders.length} OF {orders.length} ORDERS
                </span>
              </div>

              {/* Orders Table with Generous Explicit Column Widths */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans min-w-[1050px]">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase font-sans text-[11px] font-bold tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-4 px-6 w-40 whitespace-nowrap">Order ID</th>
                        <th className="py-4 px-6 w-48">Customer</th>
                        <th className="py-4 px-6 min-w-[280px]">Items Manifest</th>
                        <th className="py-4 px-6 w-48">Courier & Waybill</th>
                        <th className="py-4 px-6 w-32 whitespace-nowrap">Total Billed</th>
                        <th className="py-4 px-6 w-40">Status</th>
                        <th className="py-4 px-6 w-28 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-400 font-sans uppercase font-bold text-xs tracking-wider">
                            No orders found matching query.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="font-mono text-sm font-black text-black block">
                                {ord.orderNumber}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-sans font-medium mt-0.5 block">
                                {ord.date}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <p className="font-bold text-black">{ord.shippingAddress.fullName}</p>
                              <p className="text-[11px] text-neutral-500">{ord.shippingAddress.city}, {ord.shippingAddress.country}</p>
                            </td>

                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                {ord.items.map((item, idx) => (
                                  <p key={idx} className="text-neutral-700 leading-snug">
                                    <strong className="text-black">{item.quantity}x</strong> {item.productName} ({item.size})
                                  </p>
                                ))}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <p className="font-bold text-black">{ord.carrier}</p>
                              <p className="font-mono text-[11px] text-neutral-500 mt-0.5">{ord.trackingNumber}</p>
                            </td>

                            <td className="py-4 px-6 font-nike text-2xl font-black text-black whitespace-nowrap">
                              ${ord.total.toFixed(2)}
                            </td>

                            <td className="py-4 px-6">
                              <select
                                value={ord.status}
                                onChange={(e) => {
                                  updateOrderStatus(ord.id, e.target.value as Order['status']);
                                  showNotice(`Order ${ord.orderNumber} updated to ${e.target.value}!`);
                                }}
                                className="text-xs font-bold px-3 py-1.5 rounded-full border border-neutral-300 focus:border-black focus:outline-none cursor-pointer uppercase bg-white shadow-xs"
                              >
                                <option value="PROCESSING">Processing</option>
                                <option value="IN TRANSIT">In Transit</option>
                                <option value="DELIVERED">Delivered</option>
                              </select>
                            </td>

                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => setSelectedInspectOrder(ord)}
                                className="px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                              >
                                <Eye size={12} />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: INVENTORY MATRIX */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Title (Clean, NO duplicate buttons) */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    CATALOG MANAGEMENT
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    INVENTORY & SKU MATRIX
                  </h2>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'Heavy Twill', 'GORE-TEX', 'Cordura', 'Ripstop'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      inventoryCategoryFilter === cat
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Inventory Table */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans min-w-[1000px]">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase font-sans text-[11px] font-bold tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-4 px-6 w-60">Product Silhouette</th>
                        <th className="py-4 px-6 w-40">SKU Spec</th>
                        <th className="py-4 px-6 min-w-[200px]">Textile / Material</th>
                        <th className="py-4 px-6 w-32 whitespace-nowrap">Unit Price</th>
                        <th className="py-4 px-6 w-40">Stock Allocation</th>
                        <th className="py-4 px-6 w-36">Status</th>
                        <th className="py-4 px-6 w-36 text-right">Stock Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-black">
                            {item.name}
                          </td>

                          <td className="py-4 px-6 font-mono text-neutral-500">
                            {item.sku}
                          </td>

                          <td className="py-4 px-6 text-neutral-600 font-medium">
                            {item.material}
                          </td>

                          <td className="py-4 px-6 font-nike text-2xl font-black text-black">
                            ${item.price.toFixed(2)}
                          </td>

                          <td className="py-4 px-6">
                            <span className="font-bold text-black text-sm block">
                              {item.stock} Units
                            </span>
                            <span className="text-[11px] text-neutral-400 font-sans block mt-0.5">
                              Reorder at {item.reorderPoint}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                item.stock > 25
                                  ? 'bg-neutral-100 text-black border border-neutral-200'
                                  : item.stock > 10
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.stock > 25 ? 'IN STOCK' : item.stock > 10 ? 'LOW STOCK' : 'RESTOCK'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  restockProduct(item.id, 25);
                                  showNotice(`Restocked +25 units for ${item.name}!`);
                                }}
                                className="px-3.5 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                              >
                                +25 Units
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete SKU ${item.name}?`)) {
                                    deleteProduct(item.id);
                                    showNotice(`Deleted ${item.name}`);
                                  }
                                }}
                                className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CUSTOMERS ARCHIVE */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    CLIENT ARCHIVE
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    REGISTERED MEMBERS
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {(['ALL', 'GOOGLE', 'VIP'] as const).map((cf) => (
                    <button
                      key={cf}
                      onClick={() => setCustomerFilter(cf)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        customerFilter === cf
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                      }`}
                    >
                      {cf === 'GOOGLE' ? 'Google Verified' : cf === 'VIP' ? 'VIP Members' : 'All Accounts'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans min-w-[1000px]">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase font-sans text-[11px] font-bold tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-4 px-6 w-60">Member Profile</th>
                        <th className="py-4 px-6 w-44">Auth Provider</th>
                        <th className="py-4 px-6 w-36">Date Joined</th>
                        <th className="py-4 px-6 w-44">Size Spec</th>
                        <th className="py-4 px-6 w-36">Orders Dispatched</th>
                        <th className="py-4 px-6 w-36">Lifetime Spend</th>
                        <th className="py-4 px-6 w-24 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {filteredCustomers.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-black">{user.name}</p>
                                <p className="text-[11px] text-neutral-500 font-mono">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {user.provider === 'google' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 text-black rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Google Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <span>Email Account</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 font-sans text-neutral-500">
                            {user.joinedDate || '2026-01-15'}
                          </td>

                          <td className="py-4 px-6 font-sans font-medium text-black">
                            {user.sizePreference || 'L/XL (58-61CM)'}
                          </td>

                          <td className="py-4 px-6 font-bold text-black">
                            {user.totalOrders || 1} Orders
                          </td>

                          <td className="py-4 px-6 font-nike text-2xl font-black text-black">
                            ${user.totalSpent ? user.totalSpent.toFixed(2) : '104.48'} USD
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setInspectCustomer(user)}
                              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: DISPATCHES & LOGISTICS */}
          {activeTab === 'dispatches' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    COURIER TELEMETRY
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    DISPATCHES & COURIER HUBS
                  </h2>
                </div>

                <span className="px-3 py-1 bg-neutral-100 text-black border border-neutral-200 rounded-full text-xs font-sans font-bold flex items-center gap-2 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="uppercase tracking-wider">GLOBAL FLEET OPERATIONAL</span>
                </span>
              </div>

              {/* Courier Hub Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { name: 'DHL Express Global Air', hub: 'Berlin Gateway (BER)', status: 'Optimal', delay: '0 min', active: '18 Packages' },
                  { name: 'FedEx Priority Overnight', hub: 'Tokyo Haneda Depot (HND)', status: 'Optimal', delay: '0 min', active: '12 Packages' },
                  { name: 'Standard Ground Freight', hub: 'US East Coast (EWR)', status: 'Active', delay: '< 2 hrs', active: '24 Packages' },
                ].map((hub, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2.5 shadow-xs">
                    <div className="flex justify-between items-start">
                      <Truck size={20} className="text-black" />
                      <span className="text-[10px] font-sans font-bold bg-neutral-100 text-black px-2.5 py-0.5 rounded-full border border-neutral-200 uppercase">
                        {hub.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-black text-sm uppercase">{hub.name}</h4>
                      <p className="text-xs text-neutral-500 font-sans mt-0.5">{hub.hub}</p>
                    </div>
                    <div className="pt-2 border-t border-neutral-100 flex justify-between text-xs font-sans font-medium text-neutral-500">
                      <span>In Transit: <strong className="text-black">{hub.active}</strong></span>
                      <span>Latency: <strong className="text-black">{hub.delay}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dispatches Waybill List */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h3 className="font-nike text-2xl font-black uppercase text-black">
                  ACTIVE WAYBILL TELEMETRY LOG
                </h3>

                <div className="divide-y divide-neutral-100">
                  {orders.map((ord) => (
                    <div key={ord.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-black">{ord.trackingNumber}</span>
                          <span className="text-xs text-neutral-500 font-sans font-bold uppercase">{ord.carrier}</span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-neutral-100 text-black rounded-full uppercase">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600">
                          Route: Tokyo Dispatch ➔ <strong className="text-black">{ord.shippingAddress.city}, {ord.shippingAddress.country}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const newWaybill = `1Z${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;
                            updateOrderTracking(ord.id, ord.carrier, newWaybill);
                            showNotice(`Generated new Waybill ${newWaybill}!`);
                          }}
                          className="px-4 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw size={12} />
                          <span>Regenerate Waybill</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: PROMO CODES */}
          {activeTab === 'discounts' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    MARKETING & INCENTIVES
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    PROMO CODES & CAMPAIGNS
                  </h2>
                </div>
                <span className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">
                  SYNCED WITH CHECKOUT
                </span>
              </div>

              {/* Create Promo Code Form */}
              <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-3 shadow-xs">
                <h3 className="font-nike text-xl font-black uppercase text-black">
                  CREATE NEW CAMPAIGN CODE
                </h3>

                <form onSubmit={handleCreatePromoCode} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TOKYO20, VIPDROP"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-sm text-black font-mono uppercase rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newPromoPercent}
                      onChange={(e) => setNewPromoPercent(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-sm text-black font-mono rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus size={14} />
                      <span>Activate Promo Code</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Coupons Table */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs font-sans min-w-[700px]">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase font-sans text-[11px] font-bold tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-4 px-6">Promo Code</th>
                      <th className="py-4 px-6">Discount Rate</th>
                      <th className="py-4 px-6">Campaign Status</th>
                      <th className="py-4 px-6">Total Redemptions</th>
                      <th className="py-4 px-6">Expiration</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {promoCodes.map((p) => (
                      <tr key={p.code} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-black text-sm">
                          {p.code}
                        </td>
                        <td className="py-4 px-6 font-nike text-2xl font-black text-black">
                          {p.percent}% OFF
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                              p.active
                                ? 'bg-black text-white'
                                : 'bg-neutral-100 text-neutral-400'
                            }`}
                          >
                            {p.active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-black">
                          {p.uses} Redemptions
                        </td>
                        <td className="py-4 px-6 font-sans text-neutral-500">
                          {p.expiry}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => togglePromoCodeStatus(p.code)}
                              className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                              {p.active ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deletePromoCode(p.code)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 7: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="pb-4 border-b border-neutral-200">
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                  SYSTEM CONFIGURATION
                </span>
                <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                  STORE SETTINGS & POLICIES
                </h2>
              </div>

              {/* Shipping & Tax Rules */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-5 shadow-xs">
                <h3 className="font-nike text-2xl font-black uppercase text-black">
                  SHIPPING TIERS & DISPATCH THRESHOLDS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Free Shipping Over ($)
                    </label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-sm text-black font-mono rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Standard Ground Rate ($)
                    </label>
                    <input
                      type="number"
                      value={standardRate}
                      onChange={(e) => setStandardRate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-sm text-black font-mono rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Express 2-Day Rate ($)
                    </label>
                    <input
                      type="number"
                      value={expressRate}
                      onChange={(e) => setExpressRate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-sm text-black font-mono rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Estimated Tax (%)
                    </label>
                    <input
                      type="text"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-sm text-black font-mono rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <button
                  onClick={() => showNotice('Shipping policies & tax rules saved!')}
                  className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Save Shipping Policies
                </button>
              </div>

              {/* Firebase Cloud Infrastructure Card */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-nike text-2xl font-black uppercase text-black">
                      FIREBASE CLOUD INFRASTRUCTURE
                    </h3>
                    <p className="text-xs font-sans text-neutral-500">Live backend services for Auth, Firestore Database, and Analytics</p>
                  </div>
                  <span className="px-3 py-1 bg-neutral-100 text-black border border-neutral-200 rounded-full text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>CONNECTED</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">Project ID</span>
                    <span className="font-mono text-xs font-bold text-black">rayluxuk</span>
                  </div>
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">Auth Domain</span>
                    <span className="font-mono text-xs font-bold text-black">rayluxuk.firebaseapp.com</span>
                  </div>
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">Storage Bucket</span>
                    <span className="font-mono text-xs font-bold text-black truncate block">rayluxuk.firebasestorage.app</span>
                  </div>
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">Measurement ID</span>
                    <span className="font-mono text-xs font-bold text-black">G-BDVV49DG71</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans text-neutral-600 flex items-center justify-between">
                  <span>Active Services: <strong className="text-black">Firebase Auth (Google & Email) • Cloud Firestore • Google Analytics</strong></span>
                  <span className="text-emerald-600 font-bold uppercase text-[11px] tracking-wide">● Operational</span>
                </div>
              </div>

              {/* Google OAuth Card */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-nike text-2xl font-black uppercase text-black">
                      GOOGLE OAUTH 2.0 INTEGRATION
                    </h3>
                    <p className="text-xs font-sans text-neutral-500">Single Sign-On identity bridge for customer accounts</p>
                  </div>
                  <span className="px-3 py-1 bg-neutral-100 text-black border border-neutral-200 rounded-full text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>CONNECTED</span>
                  </span>
                </div>

                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5 text-xs font-mono text-neutral-600">
                  <p>OAuth Client ID: <span className="text-black font-bold">894021-raylux-headwear.apps.googleusercontent.com</span></p>
                  <p>Scopes Authorized: <span className="text-black font-bold">profile, email, openid</span></p>
                  <p>Status: <span className="text-emerald-600 font-bold">Active & Synchronized</span></p>
                </div>
              </div>

              {/* Reset Controls */}
              <div className="bg-white border border-red-200 p-5 rounded-2xl space-y-2 shadow-xs">
                <h4 className="font-bold text-red-600 text-xs uppercase tracking-wider">RESET STORE DEMO STATE</h4>
                <p className="text-xs font-sans text-neutral-500">
                  Reset local demo orders, custom inventory SKUs, and promo codes back to factory defaults.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Reset all demo orders and inventory to factory state?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Reset Demo State to Defaults
                </button>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* INSPECT ORDER MODAL WITH PACKING SLIP PREVIEW */}
      {selectedInspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start pb-4 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                  DISPATCH MANIFEST // {selectedInspectOrder.date}
                </span>
                <h3 className="font-nike text-3xl font-black text-black mt-0.5">
                  {selectedInspectOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInspectOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Courier Service Pill */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-neutral-500 font-sans font-bold uppercase block">COURIER SERVICE</span>
                <strong className="text-black text-sm">{selectedInspectOrder.carrier}</strong>
                <p className="font-mono text-neutral-500 mt-0.5">{selectedInspectOrder.trackingNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedInspectOrder.status}
                  onChange={(e) => {
                    const newSt = e.target.value as Order['status'];
                    updateOrderStatus(selectedInspectOrder.id, newSt);
                    setSelectedInspectOrder({ ...selectedInspectOrder, status: newSt });
                    showNotice(`Order updated to ${newSt}!`);
                  }}
                  className="px-4 py-2 bg-white border border-neutral-300 text-black rounded-full font-bold uppercase text-xs focus:border-black focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="PROCESSING">Processing</option>
                  <option value="IN TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                HEADWEAR ITEMS ({selectedInspectOrder.items.length})
              </h4>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {selectedInspectOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-black text-xs uppercase">{item.productName}</p>
                        <p className="text-[11px] text-neutral-500 font-sans">
                          Size: {item.size} • Color: {item.color}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-neutral-500">{item.quantity}x</span>
                      <p className="font-nike text-lg font-bold text-black">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs space-y-1">
              <span className="font-sans font-bold text-neutral-400 uppercase block mb-1">DELIVERY DESTINATION</span>
              <p className="font-bold text-black">{selectedInspectOrder.shippingAddress.fullName}</p>
              <p className="text-neutral-600">{selectedInspectOrder.shippingAddress.street}</p>
              <p className="text-neutral-600">
                {selectedInspectOrder.shippingAddress.city}, {selectedInspectOrder.shippingAddress.state} {selectedInspectOrder.shippingAddress.zip}, {selectedInspectOrder.shippingAddress.country}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-sans font-bold text-neutral-400 uppercase block">TOTAL BILLED</span>
                <p className="font-nike text-3xl font-black text-black">
                  ${selectedInspectOrder.total.toFixed(2)} USD
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-black rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedInspectOrder(null)}
                  className="px-5 py-2 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE DRAWER */}
      {inspectCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start pb-3.5 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                {inspectCustomer.avatar ? (
                  <img src={inspectCustomer.avatar} alt={inspectCustomer.name} className="w-12 h-12 rounded-full object-cover border border-neutral-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-black text-white font-bold text-base flex items-center justify-center">
                    {inspectCustomer.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-nike text-2xl font-black text-black uppercase">{inspectCustomer.name}</h3>
                  <p className="text-xs font-mono text-neutral-500">{inspectCustomer.email}</p>
                </div>
              </div>
              <button onClick={() => setInspectCustomer(null)} className="p-1.5 text-neutral-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase">Account Type:</span>
                <span className="font-bold text-black capitalize">{inspectCustomer.provider || 'email'} Verified</span>
              </div>
              <div className="flex justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase">Size Preference:</span>
                <span className="font-bold text-black font-mono">{inspectCustomer.sizePreference || 'L/XL (58-61CM)'}</span>
              </div>
              <div className="flex justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase">Lifetime Orders:</span>
                <span className="font-bold text-black">{inspectCustomer.totalOrders || 1} Orders</span>
              </div>
              <div className="flex justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase">Total Spend:</span>
                <span className="font-bold text-black font-nike text-xl">
                  ${inspectCustomer.totalSpent ? inspectCustomer.totalSpent.toFixed(2) : '104.48'} USD
                </span>
              </div>
            </div>

            <button
              onClick={() => setInspectCustomer(null)}
              className="w-full py-3 bg-black text-white hover:bg-neutral-800 font-bold uppercase text-xs rounded-full transition-colors shadow-xs tracking-wider"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Product Spec Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={(data) => {
          addProduct(data);
          showNotice(`Added product SKU ${data.name}!`);
        }}
      />

    </div>
  );
};
