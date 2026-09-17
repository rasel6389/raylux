import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation, AdminTab } from '../context/NavigationContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types/product';
import { ProductModal } from '../components/admin/ProductModal';
import {
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
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
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
  Bot,
  LifeBuoy,
  Send,
  Coins,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Edit3,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { useCurrency } from '../context/CurrencyContext';
import { getAIAgentConfig, saveAIAgentConfig, askGeminiAgent } from '../services/aiAgent';
import { AIAgentConfig, SupportTicket } from '../types/ticket';
import { InventoryItem } from '../types/product';

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
  const { isAdminLoggedIn, loginAdmin, logoutAdmin, goToHome, adminTab, setAdminTab } = useNavigation();
  const {
    orders,
    inventory,
    products,
    updateOrderStatus,
    updateOrderTracking,
    addProduct,
    updateProduct,
    restockProduct,
    deleteProduct,
  } = useStore();
  const { registeredUsers } = useAuth();

  // Login form state
  const [email, setEmail] = useState('admin@raylux.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active Admin Tab & Mobile Sidebar Toggle (synced with browser URL)
  const activeTab: AdminTab = adminTab || 'overview';
  const setActiveTab = (tab: AdminTab) => {
    setAdminTab(tab);
  };
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PROCESSING' | 'IN TRANSIT' | 'DELIVERED'>('ALL');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('ALL');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'GOOGLE' | 'VIP'>('ALL');

  // Modals & Drawers
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(InventoryItem & { description?: string; profile?: string; images?: string[] }) | null>(null);
  const [selectedInspectOrder, setSelectedInspectOrder] = useState<Order | null>(null);
  const [inspectCustomer, setInspectCustomer] = useState<(typeof registeredUsers)[0] | null>(null);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (item: InventoryItem) => {
    const matchingProd = products.find((p) => p.sku === item.sku || p.name.toLowerCase() === item.name.toLowerCase());
    setEditingProduct({
      ...item,
      description: matchingProd?.description,
      profile: matchingProd?.profile,
      images: matchingProd?.images,
    });
    setIsProductModalOpen(true);
  };

  // Copy feedback state
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Real-time operations clock ticker
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Contexts for Tickets & Currency
  const { tickets, updateTicketStatus, addReply } = useTickets();
  const { currency, exchangeRates, setExchangeRates, formatPrice } = useCurrency();

  // Support Desk state
  const [supportFilter, setSupportFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // AI Agent Config state
  const [aiConfig, setAiConfig] = useState<AIAgentConfig>(() => getAIAgentConfig());
  const [testAiQuery, setTestAiQuery] = useState('');
  const [testAiLoading, setTestAiLoading] = useState(false);
  const [testAiConversation, setTestAiConversation] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Raylux Intelligence Engine online. Connected to model: Gemini 3.8 Flash Preview. Ready to evaluate client requests.' },
  ]);

  // Exchange rate controller state (GBP and EUR)
  const [editGbpRate, setEditGbpRate] = useState(exchangeRates.GBP.toString());
  const [editEurRate, setEditEurRate] = useState(exchangeRates.EUR.toString());

  useEffect(() => {
    setEditGbpRate(exchangeRates.GBP.toString());
    setEditEurRate(exchangeRates.EUR.toString());
  }, [exchangeRates]);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopyOrderId = (orderNum: string) => {
    try {
      navigator.clipboard.writeText(orderNum);
      setCopiedOrderId(orderNum);
      showNotice(`Copied ${orderNum} to clipboard!`);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch {
      // fallback
    }
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

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (supportFilter !== 'ALL' && t.status !== supportFilter) return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const mId = t.id.toLowerCase().includes(q);
        const mSub = t.subject.toLowerCase().includes(q);
        const mEmail = t.customerEmail.toLowerCase().includes(q);
        const mName = t.customerName.toLowerCase().includes(q);
        const mOrder = t.orderNumber?.toLowerCase().includes(q);
        if (!mId && !mSub && !mEmail && !mName && !mOrder) return false;
      }
      return true;
    });
  }, [tickets, supportFilter, globalSearch]);

  const openTicketsCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  }, [tickets]);

  // AI Agent test query handler
  const handleTestAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testAiQuery.trim() || testAiLoading) return;
    const q = testAiQuery.trim();
    setTestAiQuery('');
    setTestAiConversation((prev) => [...prev, { role: 'user', text: q }]);
    setTestAiLoading(true);
    try {
      const resp = await askGeminiAgent(q, orders);
      setTestAiConversation((prev) => [...prev, { role: 'assistant', text: resp }]);
    } catch {
      setTestAiConversation((prev) => [...prev, { role: 'assistant', text: 'Error querying AI engine. Please verify system configuration.' }]);
    } finally {
      setTestAiLoading(false);
    }
  };

  const handleSaveAiConfig = () => {
    saveAIAgentConfig(aiConfig);
    showNotice('AI Agent parameters saved successfully!');
  };

  const handleSaveExchangeRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGbp = parseFloat(editGbpRate);
    const parsedEur = parseFloat(editEurRate);
    if (!isNaN(parsedGbp) && parsedGbp > 0 && !isNaN(parsedEur) && parsedEur > 0) {
      setExchangeRates({ GBP: parsedGbp, EUR: parsedEur });
      showNotice(`Exchange rates set: 1 USD = £${parsedGbp} GBP • €${parsedEur} EUR!`);
    } else {
      alert('Please enter valid positive numbers for both GBP and EUR exchange rates.');
    }
  };

  const handleAdminSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;
    addReply(selectedTicket.id, adminReplyText.trim(), 'admin', 'Marcus Vance (Raylux Support)');
    setAdminReplyText('');
    showNotice('Specialist response sent to customer!');
  };

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

  // 1. ADMIN AUTHENTICATION GATE (EXECUTIVE OBSIDIAN TERMINAL)
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0d] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#121216] border border-neutral-800 rounded-3xl p-8 sm:p-10 space-y-7 shadow-2xl relative z-10">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-white/5">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono font-bold tracking-widest text-neutral-300 uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SECURITY CLEARANCE // LEVEL 4</span>
              </div>
              <h2 className="font-nike text-4xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none">
                RAYLUX OPERATIONS
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
              Global fulfillment console, live dispatch waybills, and client care triage.
            </p>
          </div>

          {/* Clean Demo Credentials Pill */}
          <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <KeyRound size={14} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Demo Passcode</span>
                <span className="font-mono font-bold text-white tracking-wide">raylux2026</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-xs"
            >
              Quick Login
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-neutral-300 mb-1.5 tracking-wider text-[11px]">
                Operator Account
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1b1b22] border border-neutral-750 focus:border-white px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none rounded-xl transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-neutral-300 mb-1.5 tracking-wider text-[11px]">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter passcode..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1b1b22] border border-neutral-750 focus:border-white pl-4 pr-10 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none rounded-xl transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-400 font-semibold text-xs bg-red-950/60 p-3 rounded-xl border border-red-800">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-white text-black font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
            >
              AUTHENTICATE & ACCESS CONSOLE
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-2 text-center border-t border-neutral-850 flex items-center justify-center">
            <button
              onClick={goToHome}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>Return to Customer Storefront</span>
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

            {/* GROUP 3: CARE & INTELLIGENCE */}
            <div className="space-y-1 pt-1.5">
              <span className="px-3 text-[10px] font-sans font-bold tracking-widest text-neutral-400 uppercase">
                CARE & INTELLIGENCE
              </span>

              <button
                onClick={() => { setActiveTab('support'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'support'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LifeBuoy size={16} />
                  <span>Support Desk</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === 'support'
                      ? 'bg-white text-black'
                      : openTicketsCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-100 text-black border border-neutral-200'
                  }`}
                >
                  {tickets.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('ai_agent'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'ai_agent'
                    ? 'bg-black text-white shadow-sm font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bot size={16} />
                  <span>AI Agent Suite</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                    aiConfig.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {aiConfig.enabled ? 'Live' : 'Off'}
                </span>
              </button>
            </div>

            {/* GROUP 4: SYSTEM */}
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
                className="py-2 px-2 bg-black text-white hover:bg-neutral-800 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs"
                title="Return to Customer Storefront"
              >
                <ExternalLink size={12} />
                <span>Storefront</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="py-2 px-2 bg-white hover:bg-red-600 hover:text-white text-neutral-700 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-neutral-200 shadow-xs"
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
        
        {/* Top Header Utility Bar (Executive Flight Deck) */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-black hover:bg-neutral-100 rounded-lg"
              aria-label="Open Navigation Sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Hierarchy */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-sans">
              <span className="text-neutral-400 font-bold uppercase tracking-wider">RAYLUX</span>
              <span className="text-neutral-300 font-bold">/</span>
              <span className="text-neutral-400 font-bold uppercase tracking-wider">OPS</span>
              <span className="text-neutral-300 font-bold">/</span>
              <span className="text-black font-black uppercase tracking-wider">
                {activeTab.replace('_', ' ')}
              </span>
            </div>

            {/* Global Search Bar */}
            <div className="relative w-52 sm:w-72 md:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders, SKU specs, clients, waybills..."
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

          {/* Right Flight Deck Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Live Sync Indicator */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE SYNC</span>
            </div>

            {/* Real-time Clock */}
            <div className="hidden md:flex items-center gap-1 text-[11px] font-mono font-bold text-neutral-500 px-2.5 py-1 bg-neutral-100 rounded-full border border-neutral-200">
              <Clock size={12} className="text-neutral-400" />
              <span>{currentTime}</span>
            </div>

            {/* Currency Rate Widget */}
            <button
              onClick={() => setActiveTab('settings')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full text-[11px] font-bold text-neutral-700 transition-colors"
              title="Click to configure live exchange rates"
            >
              <Coins size={12} className="text-black" />
              <span>£{exchangeRates.GBP.toFixed(2)} GBP • €{exchangeRates.EUR.toFixed(2)} EUR</span>
            </button>

            {/* Prominent Live Storefront Button */}
            <button
              onClick={goToHome}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-200 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              title="Navigate to Customer Storefront"
            >
              <ExternalLink size={13} />
              <span>Storefront</span>
            </button>

            {/* Add Product Spec Button */}
            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Add Spec</span>
            </button>

            {/* Export Manifest CSV */}
            <button
              onClick={handleExportCSV}
              className="p-2 sm:px-4 sm:py-2 bg-white hover:border-black text-black border border-neutral-200 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              title="Export Orders Manifest CSV"
            >
              <Download size={13} />
              <span className="hidden xl:inline">Export</span>
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

              {/* Executive Quick Actions Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={handleOpenAddProduct}
                  className="p-3.5 bg-black text-white hover:bg-neutral-800 rounded-2xl text-left transition-all shadow-xs flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Product Spec</span>
                    <span className="font-nike text-lg font-black uppercase tracking-tight">+ Create SKU</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={15} />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-left transition-all shadow-xs flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Fulfillment</span>
                    <span className="font-nike text-lg font-black uppercase tracking-tight text-black">{orders.length} Dispatches</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag size={15} className="text-black" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className="p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-left transition-all shadow-xs flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Client Concierge</span>
                    <span className="font-nike text-lg font-black uppercase tracking-tight text-black">
                      {openTicketsCount} Open Tickets
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                    openTicketsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-black'
                  }`}>
                    <LifeBuoy size={15} />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('ai_agent')}
                  className="p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-left transition-all shadow-xs flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Gemini 3.8 AI</span>
                    <span className="font-nike text-lg font-black uppercase tracking-tight text-black">
                      {aiConfig.enabled ? 'Agent Active' : 'Agent Paused'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bot size={15} />
                  </div>
                </button>
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
                          {ord.currency === 'GBP' ? '£' : '$'}{ord.total.toFixed(2)} {ord.currency || 'USD'}
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
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-sm font-black text-black">
                                  {ord.orderNumber}
                                </span>
                                <button
                                  onClick={() => handleCopyOrderId(ord.orderNumber)}
                                  className="p-1 text-neutral-400 hover:text-black transition-colors rounded"
                                  title="Copy Order Reference"
                                >
                                  {copiedOrderId === ord.orderNumber ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                              <span className="text-[11px] text-neutral-400 font-sans font-medium mt-0.5 block">
                                {ord.date}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-black font-nike shrink-0">
                                  {ord.shippingAddress.fullName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-black">{ord.shippingAddress.fullName}</p>
                                  <p className="text-[11px] text-neutral-500">{ord.shippingAddress.city}, {ord.shippingAddress.country}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="space-y-1.5">
                                {ord.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    {item.image && (
                                      <img src={item.image} alt={item.productName} className="w-6 h-6 rounded object-cover border border-neutral-200 shrink-0" />
                                    )}
                                    <p className="text-neutral-700 text-xs leading-snug">
                                      <strong className="text-black">{item.quantity}x</strong> {item.productName}{' '}
                                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 ml-1">
                                        {item.size}
                                      </span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <p className="font-bold text-black">{ord.carrier}</p>
                              <p className="font-mono text-[11px] text-neutral-500 mt-0.5">{ord.trackingNumber}</p>
                            </td>

                            <td className="py-4 px-6 font-nike text-2xl font-black text-black whitespace-nowrap">
                              {ord.currency === 'GBP' ? '£' : '$'}{ord.total.toFixed(2)}
                            </td>

                            <td className="py-4 px-6">
                              <select
                                value={ord.status}
                                onChange={(e) => {
                                  updateOrderStatus(ord.id, e.target.value as Order['status']);
                                  showNotice(`Order ${ord.orderNumber} updated to ${e.target.value}!`);
                                }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer uppercase shadow-xs transition-colors ${
                                  ord.status === 'DELIVERED'
                                    ? 'bg-black text-white border-black'
                                    : ord.status === 'IN TRANSIT'
                                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                                    : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}
                              >
                                <option value="PROCESSING" className="bg-white text-black">Processing</option>
                                <option value="IN TRANSIT" className="bg-white text-black">In Transit</option>
                                <option value="DELIVERED" className="bg-white text-black">Delivered</option>
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
              
              {/* Header Title with Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    CATALOG & LOGISTICS MANAGEMENT
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    INVENTORY & SKU MATRIX
                  </h2>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">
                    Precision catalog specifications, in-place spec editing, warehouse quotas, and live drops.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    <Plus size={15} />
                    <span>Register New Spec</span>
                  </button>
                </div>
              </div>

              {/* 4 Inventory Operational KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
                    Total Active SKUs
                  </span>
                  <p className="font-nike text-2xl sm:text-3xl font-black text-black">
                    {inventory.length}
                  </p>
                  <span className="text-[11px] text-neutral-500 font-sans block">
                    All Categories Active
                  </span>
                </div>

                <div className="bg-white border border-neutral-200 p-4 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
                    Depot Stock Units
                  </span>
                  <p className="font-nike text-2xl sm:text-3xl font-black text-black">
                    {inventory.reduce((sum, i) => sum + i.stock, 0)}
                  </p>
                  <span className="text-[11px] text-neutral-500 font-sans block">
                    Tokyo & Berlin Hubs
                  </span>
                </div>

                <div className="bg-white border border-neutral-200 p-4 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
                    Low Stock Thresholds
                  </span>
                  <p className={`font-nike text-2xl sm:text-3xl font-black ${
                    inventory.filter((i) => i.stock <= i.reorderPoint).length > 0 ? 'text-amber-600' : 'text-black'
                  }`}>
                    {inventory.filter((i) => i.stock <= i.reorderPoint).length}
                  </p>
                  <span className="text-[11px] text-neutral-500 font-sans block">
                    Reorder Triggered
                  </span>
                </div>

                <div className="bg-white border border-neutral-200 p-4 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
                    Retail Asset Value
                  </span>
                  <p className="font-nike text-2xl sm:text-3xl font-black text-black">
                    {formatPrice(inventory.reduce((sum, i) => sum + i.stock * i.price, 0))}
                  </p>
                  <span className="text-[11px] text-neutral-500 font-sans block">
                    Real-time Valued
                  </span>
                </div>
              </div>

              {/* Category Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  {(['ALL', 'Heavy Twill', 'GORE-TEX', 'Cordura', 'Ripstop'] as const).map((cat) => {
                    const count = cat === 'ALL'
                      ? inventory.length
                      : inventory.filter((i) => i.material.toLowerCase().includes(cat.toLowerCase())).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setInventoryCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          inventoryCategoryFilter === cat
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          inventoryCategoryFilter === cat ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs text-neutral-500 font-sans">
                  Showing <strong>{filteredInventory.length}</strong> of {inventory.length} specs
                </span>
              </div>

              {/* MOBILE RESPONSIVE CARD VIEW (for small screens < lg) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3 relative hover:border-black transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                          {item.sku}
                        </span>
                        <h4 className="font-nike text-lg font-black uppercase text-black leading-tight mt-0.5">
                          {item.name}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex-shrink-0 ${
                          item.stock > item.reorderPoint
                            ? 'bg-neutral-100 text-black border border-neutral-200'
                            : item.stock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.stock > item.reorderPoint ? 'IN STOCK' : item.stock > 0 ? 'LOW STOCK' : 'OUT OF STOCK'}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400 font-bold uppercase text-[10px]">Textile</span>
                        <span className="font-semibold text-neutral-800">{item.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400 font-bold uppercase text-[10px]">Crown</span>
                        <span className="font-semibold text-neutral-800">{item.category}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-neutral-200">
                        <span className="text-neutral-400 font-bold uppercase text-[10px]">Price</span>
                        <span className="font-nike text-lg font-black text-black">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-neutral-400 font-bold uppercase text-[10px]">Available Units</span>
                        <span className="font-bold text-black text-sm">
                          {item.stock} units <span className="text-[10px] text-neutral-400 font-normal font-sans">(min: {item.reorderPoint})</span>
                        </span>
                      </div>
                    </div>

                    {/* Mobile Card Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleEditProduct(item)}
                        className="flex-1 py-2.5 bg-neutral-100 hover:bg-black hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit3 size={13} />
                        <span>Edit Spec</span>
                      </button>
                      <button
                        onClick={() => {
                          restockProduct(item.id, 25);
                          showNotice(`Restocked +25 units for ${item.name}!`);
                        }}
                        className="px-3.5 py-2.5 bg-neutral-100 hover:bg-black hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                        title="Restock +25 Units"
                      >
                        +25
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete SKU ${item.name} (${item.sku})?`)) {
                            deleteProduct(item.id);
                            showNotice(`Deleted ${item.name}`);
                          }
                        }}
                        className="p-2.5 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-neutral-100 transition-colors"
                        title="Delete Spec"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP INVENTORY DATA TABLE (for screens >= lg) */}
              <div className="hidden lg:block bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans min-w-[1050px]">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase font-sans text-[11px] font-bold tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-4.5 px-6 w-64">Product Silhouette</th>
                        <th className="py-4.5 px-6 w-36">SKU Spec</th>
                        <th className="py-4.5 px-6 min-w-[200px]">Textile / Material</th>
                        <th className="py-4.5 px-6 w-36">Unit Price</th>
                        <th className="py-4.5 px-6 w-44">Stock Allocation</th>
                        <th className="py-4.5 px-6 w-36">Status</th>
                        <th className="py-4.5 px-6 w-48 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-4.5 px-6">
                            <span className="font-bold text-black text-sm block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 block">
                              {item.category}
                            </span>
                          </td>

                          <td className="py-4.5 px-6">
                            <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-neutral-100 rounded-md text-neutral-700">
                              {item.sku}
                            </span>
                          </td>

                          <td className="py-4.5 px-6 text-neutral-600 font-medium">
                            {item.material}
                          </td>

                          <td className="py-4.5 px-6">
                            <span className="font-nike text-2xl font-black text-black block">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                              {formatPrice(item.price)}
                            </span>
                          </td>

                          <td className="py-4.5 px-6">
                            <span className="font-bold text-black text-sm block">
                              {item.stock} Units
                            </span>
                            <span className="text-[11px] text-neutral-400 font-sans block mt-0.5">
                              Reorder at {item.reorderPoint}
                            </span>
                          </td>

                          <td className="py-4.5 px-6">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                item.stock > item.reorderPoint
                                  ? 'bg-neutral-100 text-black border border-neutral-200'
                                  : item.stock > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.stock > item.reorderPoint ? 'IN STOCK' : item.stock > 0 ? 'LOW STOCK' : 'RESTOCK'}
                            </span>
                          </td>

                          <td className="py-4.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(item)}
                                className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                title="Edit Product Specification"
                              >
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  restockProduct(item.id, 25);
                                  showNotice(`Restocked +25 units for ${item.name}!`);
                                }}
                                className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                                title="Add 25 Units"
                              >
                                +25
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete SKU ${item.name} (${item.sku})?`)) {
                                    deleteProduct(item.id);
                                    showNotice(`Deleted ${item.name}`);
                                  }
                                }}
                                className="p-1.5 text-neutral-400 hover:text-red-600 rounded-full hover:bg-neutral-100 transition-colors"
                                title="Delete SKU"
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

          {/* TAB: SUPPORT DESK (CUSTOMER TICKETS) */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    CLIENT CARE OPERATIONS
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    SUPPORT DESK & TICKETS
                  </h2>
                </div>
                <div className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">
                  CONCIERGE TELEMETRY // ACTIVE
                </div>
              </div>

              {/* Support Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                    TOTAL INQUIRIES
                  </span>
                  <p className="font-nike text-3xl sm:text-4xl font-black text-black">
                    {tickets.length}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-bold uppercase">LIFETIME LOGGED INQUIRIES</p>
                </div>

                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-amber-600">
                    OPEN TICKETS
                  </span>
                  <p className="font-nike text-3xl sm:text-4xl font-black text-amber-600">
                    {tickets.filter((t) => t.status === 'OPEN').length}
                  </p>
                  <p className="text-[11px] text-amber-700 font-bold uppercase">AWAITING SPECIALIST TRIAGE</p>
                </div>

                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-blue-600">
                    IN PROGRESS
                  </span>
                  <p className="font-nike text-3xl sm:text-4xl font-black text-blue-600">
                    {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                  </p>
                  <p className="text-[11px] text-blue-700 font-bold uppercase">DISPATCH / INVESTIGATION</p>
                </div>

                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-2 shadow-xs">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-600">
                    RESOLVED
                  </span>
                  <p className="font-nike text-3xl sm:text-4xl font-black text-emerald-600">
                    {tickets.filter((t) => t.status === 'RESOLVED').length}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-bold uppercase">CLIENT SATISFACTION CONFIRMED</p>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSupportFilter(st)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      supportFilter === st
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-white text-neutral-600 hover:text-black border border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {st === 'ALL' ? 'ALL TICKETS' : st.replace('_', ' ')} (
                    {st === 'ALL'
                      ? tickets.length
                      : tickets.filter((t) => t.status === st).length}
                    )
                  </button>
                ))}
              </div>

              {/* Tickets Table */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs font-sans min-w-[700px]">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase text-[11px] font-bold tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-4 px-6">Ticket Ref</th>
                      <th className="py-4 px-6">Client</th>
                      <th className="py-4 px-6">Subject & Category</th>
                      <th className="py-4 px-6">Associated Order</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Updated</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400 font-medium">
                          No customer support tickets match the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-black text-sm">
                            {t.id}
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-bold text-black">{t.customerName}</p>
                            <p className="text-[11px] text-neutral-500">{t.customerEmail}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-black">{t.subject}</p>
                            <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                              {t.category}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {t.orderNumber ? (
                              <span className="font-mono font-bold text-xs bg-neutral-100 px-2.5 py-1 rounded-md text-black border border-neutral-200">
                                {t.orderNumber}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-xs italic">General Inquiry</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1 ${
                                t.status === 'OPEN'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : t.status === 'IN_PROGRESS'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  t.status === 'OPEN'
                                    ? 'bg-amber-500'
                                    : t.status === 'IN_PROGRESS'
                                    ? 'bg-blue-500 animate-pulse'
                                    : 'bg-emerald-500'
                                }`}
                              ></span>
                              <span>{t.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-neutral-500 font-sans text-xs">
                            {t.updatedAt}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedTicket(t)}
                              className="px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 shadow-xs"
                            >
                              <Eye size={12} />
                              <span>Triage & Reply</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB: AI AGENT SUITE (GEMINI INTELLIGENCE) */}
          {activeTab === 'ai_agent' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    GOOGLE GEMINI INTELLIGENCE
                  </span>
                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-0.5">
                    AI CUSTOMER CARE AGENT SUITE
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${aiConfig.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'}`}></span>
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-black">
                    {aiConfig.enabled ? 'AGENT ONLINE' : 'AGENT OFFLINE'}
                  </span>
                </div>
              </div>

              {/* Master Configuration Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Settings Form */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Status & Model Selection Card */}
                  <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-nike text-2xl font-black uppercase text-black">
                          RUNTIME ENGINE & STATUS
                        </h3>
                        <p className="text-xs text-neutral-500">Configure floating widget operational status and underlying model</p>
                      </div>
                      
                      {/* Active Toggle */}
                      <button
                        onClick={() => {
                          const updated = { ...aiConfig, enabled: !aiConfig.enabled };
                          setAiConfig(updated);
                          saveAIAgentConfig(updated);
                          showNotice(`AI Agent is now ${updated.enabled ? 'ENABLED' : 'DISABLED'}`);
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 ${
                          aiConfig.enabled
                            ? 'bg-black text-white hover:bg-neutral-800'
                            : 'bg-neutral-100 text-neutral-500 hover:text-black border border-neutral-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${aiConfig.enabled ? 'bg-emerald-400' : 'bg-neutral-400'}`}></span>
                        <span>{aiConfig.enabled ? 'Activated' : 'Disabled'}</span>
                      </button>
                    </div>

                    {/* Model Selector Buttons */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Select Google Gemini Model Architecture
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAiConfig((prev) => ({ ...prev, model: 'gemini-3.8-flash' }))}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            aiConfig.model === 'gemini-3.8-flash'
                              ? 'border-black bg-neutral-50 shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-nike text-lg font-bold uppercase text-black">Gemini 3.8 Flash</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white rounded-full uppercase">Ultra-Fast</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1">Recommended. Lowest latency responses for sizing and order tracking.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAiConfig((prev) => ({ ...prev, model: 'gemini-3.5-pro' }))}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            aiConfig.model === 'gemini-3.5-pro'
                              ? 'border-black bg-neutral-50 shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-nike text-lg font-bold uppercase text-black">Gemini 3.5 Pro</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded-full uppercase">Advanced</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1">Complex reasoning, multi-turn dialogue, and deep apparel advice.</p>
                        </button>
                      </div>
                    </div>

                    {/* API Key Configuration */}
                    <div className="space-y-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Google Gemini API Key
                        </label>
                        <span className="text-[10px] text-neutral-400 font-sans">
                          {aiConfig.apiKey ? 'Custom Key Configured' : 'Using Built-in Gemini Fallback'}
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder="AIzaSy... (Leave empty to use built-in store engine)"
                        value={aiConfig.apiKey}
                        onChange={(e) => setAiConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-black font-mono rounded-xl focus:outline-none focus:border-black"
                      />
                      <p className="text-[11px] text-neutral-500 font-sans">
                        Keys are stored securely in browser state and utilized directly for Gemini streaming endpoints.
                      </p>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Creativity & Precision (Temperature: {aiConfig.temperature})
                        </label>
                        <span className="text-[10px] text-neutral-400 font-sans">0.0 (Strict) to 1.0 (Creative)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={aiConfig.temperature}
                        onChange={(e) => setAiConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAiConfig}
                      className="w-full py-3 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      Save AI Parameters
                    </button>

                  </div>

                  {/* System Prompt / Brand Tone Editor */}
                  <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-4 shadow-xs">
                    <div>
                      <h3 className="font-nike text-2xl font-black uppercase text-black">
                        BRAND KNOWLEDGE & SYSTEM DIRECTIVE
                      </h3>
                      <p className="text-xs text-neutral-500">
                        System directives guiding tone, sizing recommendations, and GORE-TEX care specifications.
                      </p>
                    </div>
                    <textarea
                      rows={5}
                      value={aiConfig.systemPrompt}
                      onChange={(e) => setAiConfig((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                      className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-xs text-black font-mono rounded-xl focus:outline-none focus:border-black resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAiConfig}
                      className="px-5 py-2 bg-neutral-100 hover:bg-black hover:text-white border border-neutral-300 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Update Brand Directive
                    </button>
                  </div>

                </div>

                {/* Right Column: Live Testing Sandbox Chat */}
                <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col h-[650px]">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-nike font-bold text-sm">
                        R
                      </div>
                      <div>
                        <h4 className="font-nike text-xl font-bold uppercase text-black leading-none">
                          TEST SANDBOX // {aiConfig.model}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider">
                          Real-time AI query simulator
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setTestAiConversation([{ role: 'assistant', text: 'Chat history cleared. Intelligence engine ready.' }])}
                      className="text-[11px] font-bold text-neutral-400 hover:text-red-600 uppercase tracking-wider transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs font-sans">
                    {testAiConversation.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-neutral-400 font-mono uppercase mb-0.5 px-1">
                          {msg.role === 'user' ? 'Admin Inspector' : 'Raylux AI Specialist'}
                        </span>
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-black text-white rounded-br-none'
                              : 'bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {testAiLoading && (
                      <div className="flex items-center gap-2 text-neutral-400 text-xs italic p-2">
                        <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
                        <span>Evaluating via {aiConfig.model}...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Prompts Chips */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5 pb-2">
                    {[
                      'Where is order RLX-8921-EU?',
                      'What size for 59cm circumference?',
                      'How much is £ in USD right now?',
                      'How to clean GORE-TEX headwear?',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setTestAiQuery(chip)}
                        className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-200 border border-neutral-200 rounded-full text-[10px] text-neutral-600 font-medium transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleTestAiQuery} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type inquiry to test AI agent..."
                      value={testAiQuery}
                      onChange={(e) => setTestAiQuery(e.target.value)}
                      className="flex-1 bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-black font-sans rounded-xl focus:outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      disabled={testAiLoading || !testAiQuery.trim()}
                      className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Send size={13} />
                      <span>Send</span>
                    </button>
                  </form>

                </div>

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

              {/* TRI-CURRENCY MONETARY ENGINE CONTROLLER (USD $ / GBP £ / EUR €) */}
              <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                  <div>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                      INTERNATIONAL MONETARY CONTROLLER
                    </span>
                    <h3 className="font-nike text-2xl font-black uppercase text-black mt-0.5">
                      TRI-CURRENCY EXCHANGE ENGINE (USD • GBP • EUR)
                    </h3>
                    <p className="text-xs text-neutral-500 font-sans">
                      Configure synchronized live conversion rates between US Dollars ($), British Pounds (£), and Euros (€). Cascades to storefront catalog, bags, and checkout.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 bg-neutral-100 text-black border border-neutral-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Globe size={14} />
                      <span>Active Storefront: <strong>{currency} ({currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'})</strong></span>
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveExchangeRate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    
                    {/* GBP Rate */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        1 USD = ? GBP (£)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-500 text-sm">
                          £
                        </span>
                        <input
                          type="number"
                          step="0.001"
                          min="0.1"
                          max="5.0"
                          required
                          value={editGbpRate}
                          onChange={(e) => setEditGbpRate(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-300 pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-black rounded-xl focus:outline-none focus:border-black"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                        Inverse: 1 GBP = ${(parseFloat(editGbpRate) > 0 ? (1 / parseFloat(editGbpRate)).toFixed(4) : '0.0000')} USD
                      </span>
                    </div>

                    {/* EUR Rate */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        1 USD = ? EUR (€)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-500 text-sm">
                          €
                        </span>
                        <input
                          type="number"
                          step="0.001"
                          min="0.1"
                          max="5.0"
                          required
                          value={editEurRate}
                          onChange={(e) => setEditEurRate(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-300 pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-black rounded-xl focus:outline-none focus:border-black"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                        Inverse: 1 EUR = ${(parseFloat(editEurRate) > 0 ? (1 / parseFloat(editEurRate)).toFixed(4) : '0.0000')} USD
                      </span>
                    </div>

                    {/* Live Indicator */}
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-neutral-400 block">Baseline Base</span>
                      <p className="font-nike text-sm font-black text-black">1.00 USD ($)</p>
                      <span className="text-[11px] text-emerald-600 font-bold block">✓ Auto-synchronized</span>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2"
                      >
                        <Coins size={14} />
                        <span>Update Rates</span>
                      </button>
                    </div>

                  </div>
                </form>

                {/* Conversion Preview Matrix */}
                <div className="pt-4 border-t border-neutral-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                    REAL-TIME TRI-CURRENCY CONVERSION MATRIX
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'Technical Cap ($85)', usd: 85 },
                      { label: 'Architectural Cap ($95)', usd: 95 },
                      { label: 'Free Shipping ($150)', usd: 150 },
                      { label: 'GORE-TEX Shell ($220)', usd: 220 },
                    ].map((sample) => {
                      const gbpVal = (sample.usd * (parseFloat(editGbpRate) || 0.79)).toFixed(2);
                      const eurVal = (sample.usd * (parseFloat(editEurRate) || 0.92)).toFixed(2);
                      return (
                        <div key={sample.label} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase block truncate">{sample.label}</span>
                          <div className="space-y-1 font-mono text-xs">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">USD:</span>
                              <span className="font-bold text-black">${sample.usd.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">GBP:</span>
                              <span className="font-bold text-black">£{gbpVal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">EUR:</span>
                              <span className="font-bold text-black">€{eurVal}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                  {selectedInspectOrder.currency === 'GBP' ? '£' : '$'}{selectedInspectOrder.total.toFixed(2)} {selectedInspectOrder.currency || 'USD'}
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

      {/* INSPECT & REPLY TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                  CONCIERGE TICKET // {selectedTicket.createdAt}
                </span>
                <h3 className="font-nike text-3xl font-black text-black mt-0.5">
                  {selectedTicket.id}: {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                id="close-ticket-modal-btn"
                className="p-1.5 text-neutral-400 hover:text-black rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Client and Order Context */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-neutral-400 font-bold uppercase block text-[10px]">CLIENT INQUIRER</span>
                <p className="font-bold text-black">{selectedTicket.customerName}</p>
                <p className="text-neutral-500 font-mono text-[11px]">{selectedTicket.customerEmail}</p>
                {selectedTicket.orderNumber && (
                  <p className="text-black font-semibold mt-1">
                    Related Order: <span className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-200">{selectedTicket.orderNumber}</span>
                  </p>
                )}
              </div>

              {/* Status Selector */}
              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">TICKET STATUS</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    const st = e.target.value as SupportTicket['status'];
                    updateTicketStatus(selectedTicket.id, st);
                    setSelectedTicket({ ...selectedTicket, status: st });
                    showNotice(`Ticket status changed to ${st.replace('_', ' ')}!`);
                  }}
                  className="px-4 py-2 bg-white border border-neutral-300 text-black rounded-full font-bold uppercase text-xs focus:border-black focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {/* Message Thread History */}
            <div className="flex-1 overflow-y-auto max-h-72 space-y-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'admin' || m.sender === 'support' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      {m.senderName} {m.sender === 'admin' || m.sender === 'support' ? '(Staff Specialist)' : '(Customer)'}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{m.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'admin' || m.sender === 'support'
                        ? 'bg-black text-white rounded-br-none'
                        : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Status Action Pills */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Quick Status:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'OPEN');
                    setSelectedTicket({ ...selectedTicket, status: 'OPEN' });
                    showNotice('Ticket marked as OPEN');
                  }}
                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  Mark Open
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'IN_PROGRESS');
                    setSelectedTicket({ ...selectedTicket, status: 'IN_PROGRESS' });
                    showNotice('Ticket marked as IN PROGRESS');
                  }}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'RESOLVED');
                    setSelectedTicket({ ...selectedTicket, status: 'RESOLVED' });
                    showNotice('Ticket marked as RESOLVED');
                  }}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Admin Reply Form */}
            <form onSubmit={handleAdminSendReply} className="space-y-2 pt-2 border-t border-neutral-200">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Send Specialist Response to Client
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Type official reply to client thread..."
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  className="flex-1 bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs text-black font-sans rounded-xl focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={!adminReplyText.trim()}
                  className="px-6 py-3 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <Send size={13} />
                  <span>Transmit</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Product Spec Modal (Add & Edit Spec Mode) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        onSave={(data) => {
          if (editingProduct) {
            updateProduct(editingProduct.id, data);
            showNotice(`Updated product SKU ${data.sku}!`);
          } else {
            addProduct(data);
            showNotice(`Added product SKU ${data.sku}!`);
          }
          setEditingProduct(null);
        }}
      />

    </div>
  );
};
