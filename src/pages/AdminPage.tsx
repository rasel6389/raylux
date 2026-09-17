import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation, AdminTab } from '../context/NavigationContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order, InventoryItem } from '../types/product';
import { ProductModal, ProductModalPayload } from '../components/admin/ProductModal';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Settings,
  Search,
  Plus,
  LogOut,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  X,
  ChevronRight,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Menu,
  Bot,
  LifeBuoy,
  Send,
  Coins,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { useCurrency } from '../context/CurrencyContext';
import { getAIAgentConfig, saveAIAgentConfig, askGeminiAgent } from '../services/aiAgent';
import { AIAgentConfig, SupportTicket } from '../types/ticket';

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
    addProduct,
    updateProduct,
    restockProduct,
    deleteProduct,
  } = useStore();
  const { registeredUsers } = useAuth();

  // Active Admin Tab & Mobile Sidebar
  const activeTab: AdminTab = adminTab || 'overview';
  const setActiveTab = (tab: AdminTab) => {
    setAdminTab(tab);
  };
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState('admin@raylux.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PROCESSING' | 'IN TRANSIT' | 'DELIVERED'>('ALL');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('ALL');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'GOOGLE' | 'EMAIL'>('ALL');

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

  // Helper to fetch image for an inventory item
  const getProductImage = (item: InventoryItem) => {
    const prod = products.find((p) => p.sku === item.sku || p.name.toLowerCase() === item.name.toLowerCase());
    return prod?.images?.[0] || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80';
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
  const { exchangeRates, setExchangeRates } = useCurrency();

  // Support Desk state
  const [supportFilter, setSupportFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // AI Agent Config state
  const [aiConfig] = useState<AIAgentConfig>(() => getAIAgentConfig());
  const [testAiQuery, setTestAiQuery] = useState('');
  const [testAiLoading, setTestAiLoading] = useState(false);
  const [testAiConversation, setTestAiConversation] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Raylux Intelligence Engine online. Connected to Gemini 3.8 Flash. Ready to assist with inventory, order tracking, and client concierge.' },
  ]);

  // Exchange rate controller state (GBP and EUR)
  const [editGbpRate, setEditGbpRate] = useState(exchangeRates.GBP.toString());
  const [editEurRate, setEditEurRate] = useState(exchangeRates.EUR.toString());

  useEffect(() => {
    setEditGbpRate(exchangeRates.GBP.toString());
    setEditEurRate(exchangeRates.EUR.toString());
  }, [exchangeRates]);

  // Notification Toast Banner
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
    return orders.reduce((sum, ord) => sum + ord.items.reduce((s, i) => s + i.quantity, 0), 953);
  }, [orders]);

  const totalDepotUnits = useMemo(() => {
    return inventory.reduce((sum, i) => sum + i.stock, 0);
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(i => i.stock <= (i.reorderPoint || 20));
  }, [inventory]);

  const totalAssetValue = useMemo(() => {
    return inventory.reduce((sum, i) => sum + (i.price * i.stock), 0);
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
      if (inventoryCategoryFilter !== 'ALL' && !item.material.toLowerCase().includes(inventoryCategoryFilter.toLowerCase()) && item.category !== inventoryCategoryFilter) {
        return false;
      }
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchMat = item.material.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchMat) return false;
      }
      return true;
    });
  }, [inventory, inventoryCategoryFilter, globalSearch]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return registeredUsers.filter((cust) => {
      if (customerFilter === 'GOOGLE' && cust.provider !== 'google') return false;
      if (customerFilter === 'EMAIL' && cust.provider !== 'email') return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matchName = cust.name.toLowerCase().includes(q);
        const matchEmail = cust.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [registeredUsers, customerFilter, globalSearch]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (supportFilter !== 'ALL' && t.status !== supportFilter) return false;
      return true;
    });
  }, [tickets, supportFilter]);

  const openTicketsCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  }, [tickets]);

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
    showNotice(`Promo code ${codeClean} created successfully!`);
  };

  const handleTogglePromoCode = (code: string) => {
    setPromoCodes(prev => prev.map(p => p.code === code ? { ...p, active: !p.active } : p));
  };

  const handleDeletePromoCode = (code: string) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code));
    showNotice(`Promo code ${code} deleted.`);
  };

  const handleSaveProductModal = (data: ProductModalPayload) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: data.name,
        sku: data.sku,
        category: data.category,
        material: data.material,
        price: data.price,
        stock: data.stock,
        reorderPoint: data.reorderPoint,
        status: data.status,
        profile: data.profile,
        images: data.images,
        description: data.description,
      });
      showNotice(`Product ${data.sku} updated successfully!`);
    } else {
      addProduct({
        name: data.name,
        sku: data.sku,
        category: data.category,
        material: data.material,
        price: data.price,
        stock: data.stock,
        reorderPoint: data.reorderPoint,
        status: data.status,
        images: data.images,
        profile: data.profile,
        description: data.description,
      });
      showNotice(`New product ${data.name} added to catalog!`);
    }
    setIsProductModalOpen(false);
  };

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
      showNotice(`Exchange rates updated: 1 USD = £${parsedGbp} GBP • €${parsedEur} EUR!`);
    } else {
      alert('Please enter valid positive numbers for both GBP and EUR exchange rates.');
    }
  };

  const handleAdminSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;
    addReply(selectedTicket.id, adminReplyText.trim(), 'admin', 'Marcus Vance (Raylux Support)');
    setAdminReplyText('');
    showNotice('Response sent to customer ticket!');
  };

  // ==========================================
  // VIEW 1: AUTHENTICATION LOGIN PORTAL
  // ==========================================
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-800 font-sans selection:bg-slate-900 selection:text-white relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 relative z-10 animate-fadeIn">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center shadow-lg shadow-slate-900/10">
              <span className="font-serif text-2xl font-black italic tracking-tighter">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Raylux Admin Portal</h1>
              <p className="text-xs text-slate-500 mt-1">Sign in to manage catalog, orders, and store operations.</p>
            </div>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600">
                <KeyRound size={14} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Demo Passcode</span>
                <span className="text-xs font-mono font-bold text-slate-800">raylux2026</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-900 rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Quick Login
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter passcode..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Sign In to Console
            </button>
          </form>

          {/* Return link */}
          <div className="mt-6 text-center pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={goToHome}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>← Return to Customer Storefront</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LOGGED-IN ADMIN CONSOLE WORKSPACE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-800 font-sans selection:bg-slate-900 selection:text-white antialiased">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-medium animate-fadeIn border border-slate-800">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* MOBILE TOP BAR (Hidden on Desktop) */}
      <div className="lg:hidden bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif text-sm font-bold italic">
              R
            </div>
            <span className="font-bold text-sm text-slate-900">Raylux Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToHome}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
          >
            <span>Store</span>
            <ExternalLink size={12} />
          </button>
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            MV
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif font-bold italic text-sm">
                    R
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">Raylux Store</h2>
                    <span className="text-[10px] font-semibold text-emerald-600">● Console Online</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <nav className="mt-5 space-y-1">
                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Main Menu</span>
                
                <button
                  onClick={() => { setActiveTab('overview'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard size={16} />
                    <span>Overview</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'orders' || activeTab === 'dispatches' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={16} />
                    <span>Orders</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('inventory'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'inventory' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} />
                    <span>Products & Stock</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {inventory.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('customers'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'customers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={16} />
                    <span>Customers</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {registeredUsers.length}
                  </span>
                </button>

                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-4 mb-2">Store Ops</span>

                <button
                  onClick={() => { setActiveTab('discounts'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'discounts' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tag size={16} />
                    <span>Promo Codes</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('support'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'support' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LifeBuoy size={16} />
                    <span>Support Desk</span>
                  </div>
                  {openTicketsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {openTicketsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('ai_agent'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'ai_agent' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bot size={16} />
                    <span>AI Assistant</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={16} />
                    <span>Store Settings</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={goToHome}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                <span>Customer Storefront</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-white border-r border-slate-200/80 p-5 sticky top-0 h-screen z-20 shrink-0">
        <div className="space-y-6">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif text-lg font-bold italic shadow-sm">
                R
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 leading-tight">Raylux Store</h2>
                <p className="text-[11px] text-slate-400 font-medium">Admin Workspace</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Store Active" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Main Menu</span>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={16} />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders' || activeTab === 'dispatches'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} />
                <span>Orders</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package size={16} />
                <span>Products & Stock</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {inventory.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>Customers</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {registeredUsers.length}
              </span>
            </button>

            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-5 mb-2">Store Ops</span>

            <button
              onClick={() => setActiveTab('discounts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'discounts'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag size={16} />
                <span>Promo Codes</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LifeBuoy size={16} />
                <span>Support Desk</span>
              </div>
              {openTicketsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ai_agent')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ai_agent'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bot size={16} />
                <span>AI Assistant</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={16} />
                <span>Store Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* User Card & Foot Actions */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              MV
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">Marcus Vance</p>
              <p className="text-[10px] text-slate-400 truncate">admin@raylux.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={goToHome}
              className="py-2 px-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Return to Storefront"
            >
              <ExternalLink size={13} />
              <span>Store</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* DESKTOP TOP BAR */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-8 items-center justify-between sticky top-0 z-10 shadow-xs">
          {/* Breadcrumb & Clock */}
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span>Raylux</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold capitalize">{activeTab}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Clock size={13} />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Search, Currency and Add Action */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, products, clients..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
              />
            </div>

            {/* Live Currency Pill */}
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Adjust Currency Exchange Rates"
            >
              <Coins size={13} className="text-slate-500" />
              <span>£{exchangeRates.GBP} GBP • €{exchangeRates.EUR} EUR</span>
            </button>

            {/* Quick Add Product Button */}
            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>

            {/* View Storefront Button */}
            <button
              onClick={goToHome}
              className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Storefront</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </header>

        {/* WORKSPACE VIEW CONTENT */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
          
          {/* ==========================================
              TAB: OVERVIEW
             ========================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
                  <p className="text-xs text-slate-500 mt-1">Real-time performance metrics, orders activity, and inventory health.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>New Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>View Orders</span>
                  </button>
                </div>
              </div>

              {/* 4 Fresh Clean KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Revenue */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Gross Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        <TrendingUp size={11} />
                        <span>+14.8%</span>
                      </span>
                      <span className="text-[11px] text-slate-400">vs last month</span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Orders */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShoppingBag size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{orders.length} Dispatches</h3>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {activeDispatchesCount} in transit
                      </span>
                      <span className="text-[11px] text-slate-400">active now</span>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Units Sold */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Catalog Units</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Package size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{totalDepotUnits} in Stock</h3>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center text-[11px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
                        {inventory.length} active SKUs
                      </span>
                      <span className="text-[11px] text-slate-400">across store</span>
                    </div>
                  </div>
                </div>

                {/* Metric 4: Registered Members */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Customers</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{registeredUsers.length} Members</h3>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        2 Google verified
                      </span>
                      <span className="text-[11px] text-slate-400">accounts</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Charts & Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Volume Activity (2 cols) */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Weekly Revenue Velocity</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Processed orders volume across global fulfillment hubs</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      Avg $12,125 / day
                    </span>
                  </div>

                  {/* Clean SVG/CSS Bar Graph */}
                  <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-slate-100 pb-3">
                    {[
                      { day: 'Mon', h: '60%', val: '$11.2k' },
                      { day: 'Tue', h: '80%', val: '$14.8k' },
                      { day: 'Wed', h: '45%', val: '$8.4k' },
                      { day: 'Thu', h: '90%', val: '$16.9k' },
                      { day: 'Fri', h: '100%', val: '$18.5k' },
                      { day: 'Sat', h: '75%', val: '$13.8k' },
                      { day: 'Sun', h: '68%', val: '$12.4k' },
                    ].map((bar) => (
                      <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[10px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.val}
                        </span>
                        <div
                          style={{ height: bar.h }}
                          className="w-full max-w-[36px] bg-slate-900 hover:bg-slate-800 rounded-t-lg transition-all"
                        />
                        <span className="text-xs font-semibold text-slate-500">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>* 100% Real-time database sync</span>
                    <span className="text-emerald-600 font-medium">99.8% On-time dispatch</span>
                  </div>
                </div>

                {/* Top Silhouette Allocation (1 col) */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Top Silhouettes</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Highest velocity catalog items ({totalUnitsSold} units sold)</p>

                    <div className="mt-5 space-y-4">
                      {[
                        { name: 'Monolith 01 // Onyx', units: 342, pct: 85 },
                        { name: 'Apex Storm // GORE-TEX', units: 218, pct: 65 },
                        { name: 'Archetype 03 // Bone', units: 164, pct: 45 },
                        { name: 'Cipher 04 // Cordura', units: 124, pct: 32 },
                      ].map((item) => (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-800">{item.name}</span>
                            <span className="text-slate-400 font-medium">{item.units} units</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-slate-900 h-full rounded-full transition-all"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-4"
                  >
                    <span>View Full Catalog</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>

              {/* Two Column Tables: Recent Orders & Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Orders Card */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
                      <p className="text-xs text-slate-500">Live incoming dispatches</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                            {ord.shippingAddress.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">{ord.orderNumber}</span>
                              <button
                                onClick={() => handleCopyOrderId(ord.orderNumber)}
                                className="text-slate-400 hover:text-slate-700"
                                title="Copy order number"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {ord.shippingAddress.fullName} • {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              ${ord.total.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400">{ord.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'DELIVERED'
                              ? 'bg-slate-100 text-slate-800'
                              : ord.status === 'IN TRANSIT'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Inventory Health Alerts</h3>
                      <p className="text-xs text-slate-500">Items nearing replenishment threshold</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      {lowStockItems.length} Low Stock
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {lowStockItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-semibold text-xs text-slate-900">{item.name}</h4>
                            <p className="text-[11px] font-mono text-slate-400">{item.sku} • {item.material}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold text-amber-600 block">{item.stock} left</span>
                            <span className="text-[10px] text-slate-400">Reorder at {item.reorderPoint}</span>
                          </div>
                          <button
                            onClick={() => {
                              restockProduct(item.id, 25);
                              showNotice(`Added +25 units to ${item.name}!`);
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Quick restock +25"
                          >
                            +25
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB: INVENTORY / PRODUCTS
             ========================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products & Inventory</h1>
                  <p className="text-xs text-slate-500 mt-1">Manage catalog specifications, update pricing, and monitor depot stock.</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>Register New Product</span>
                </button>
              </div>

              {/* 4 Inventory Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Total Products</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{inventory.length}</p>
                  <span className="text-[11px] text-slate-400">Active SKUs in store</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Depot Units</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalDepotUnits}</p>
                  <span className="text-[11px] text-slate-400">Total warehouse stock</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Low Stock Alerts</span>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockItems.length}</p>
                  <span className="text-[11px] text-slate-400">Needs replenishment</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Catalog Retail Value</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">${totalAssetValue.toLocaleString()}</p>
                  <span className="text-[11px] text-slate-400">Valued at USD list price</span>
                </div>
              </div>

              {/* Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['ALL', 'HEAVY TWILL', 'GORE-TEX', 'CORDURA', 'RIPSTOP'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setInventoryCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        inventoryCategoryFilter === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Products' : cat}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-500 font-medium shrink-0">
                  Showing <span className="font-bold text-slate-900">{filteredInventory.length}</span> of {inventory.length} products
                </div>
              </div>

              {/* DESKTOP INVENTORY TABLE */}
              <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Product</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Fabric / Material</th>
                      <th className="py-3.5 px-4">Unit Price</th>
                      <th className="py-3.5 px-4">Stock Level</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        
                        {/* Thumbnail & Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(item)}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm group-hover:text-black">{item.name}</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-4 px-4 font-mono font-medium text-slate-600">
                          <span className="px-2 py-1 bg-slate-100 rounded-md text-[11px]">
                            {item.sku}
                          </span>
                        </td>

                        {/* Material */}
                        <td className="py-4 px-4 text-slate-600 font-medium">
                          {item.material}
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 text-sm">
                            ${item.price.toFixed(2)}
                          </span>
                        </td>

                        {/* Stock Progress */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 w-28">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-bold text-slate-800">{item.stock} units</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.stock <= item.reorderPoint ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            item.stock <= item.reorderPoint
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.stock <= item.reorderPoint ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span>{item.stock <= item.reorderPoint ? 'Low Stock' : 'In Stock'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditProduct(item)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Edit product"
                            >
                              <Edit3 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                restockProduct(item.id, 25);
                                showNotice(`Added +25 units to ${item.name}!`);
                              }}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Quick restock +25"
                            >
                              +25
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                  deleteProduct(item.id);
                                  showNotice(`Product ${item.name} removed.`);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete product"
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

              {/* MOBILE RESPONSIVE INVENTORY CARDS */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{item.sku}</span>
                          <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                          <span className="text-xs font-bold text-slate-900 mt-0.5 block">${item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.stock <= item.reorderPoint ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.stock} in stock
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">{item.material}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(item)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            restockProduct(item.id, 25);
                            showNotice(`Added +25 units to ${item.name}!`);
                          }}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                        >
                          +25
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==========================================
              TAB: ORDERS & DISPATCHES
             ========================================== */}
          {(activeTab === 'orders' || activeTab === 'dispatches') && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders & Shipments</h1>
                  <p className="text-xs text-slate-500 mt-1">Review customer orders, update tracking numbers, and manage dispatch status.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Total Volume:</span>
                  <span className="text-sm font-bold text-slate-900">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
                {(['ALL', 'PROCESSING', 'IN TRANSIT', 'DELIVERED'] as const).map((status) => {
                  const count = status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        orderStatusFilter === status
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'ALL' ? 'All Orders' : status} ({count})
                    </button>
                  );
                })}
              </div>

              {/* ORDERS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Order #</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Items Summary</th>
                        <th className="py-3.5 px-4">Carrier & Tracking</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-5 text-right">Manifest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Order Number */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                              <button
                                onClick={() => handleCopyOrderId(ord.orderNumber)}
                                className="text-slate-400 hover:text-slate-700"
                                title="Copy order number"
                              >
                                {copiedOrderId === ord.orderNumber ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{ord.date}</span>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center shrink-0">
                                {ord.shippingAddress.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 leading-tight">{ord.shippingAddress.fullName}</p>
                                <p className="text-[11px] text-slate-400">{ord.shippingAddress.city}, {ord.shippingAddress.country}</p>
                              </div>
                            </div>
                          </td>

                          {/* Items */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              {ord.items.map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.image || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=200&q=80'}
                                  alt={item.productName}
                                  title={`${item.productName} (${item.quantity}x)`}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                />
                              ))}
                              <span className="text-[11px] text-slate-500 font-medium ml-1">
                                {ord.items.reduce((s, i) => s + i.quantity, 0)} item{ord.items.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>

                          {/* Courier & Tracking */}
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-slate-800 text-[11px]">{ord.carrier || 'DHL Express Global'}</p>
                              <p className="font-mono text-[11px] text-slate-400 mt-0.5">{ord.trackingNumber}</p>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900 text-sm">
                              ${ord.total.toFixed(2)}
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-4 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) => {
                                const newStat = e.target.value as Order['status'];
                                updateOrderStatus(ord.id, newStat);
                                showNotice(`Order ${ord.orderNumber} marked as ${newStat}`);
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border focus:outline-none cursor-pointer ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-slate-100 text-slate-800 border-slate-200'
                                  : ord.status === 'IN TRANSIT'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="IN TRANSIT">IN TRANSIT</option>
                              <option value="DELIVERED">DELIVERED</option>
                            </select>
                          </td>

                          {/* Action Details */}
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => setSelectedInspectOrder(ord)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              View Slip
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

          {/* ==========================================
              TAB: CUSTOMERS
             ========================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
                  <p className="text-xs text-slate-500 mt-1">Review registered store customers, authentication accounts, and order history.</p>
                </div>
                <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  Total Accounts: <span className="text-slate-900 font-bold">{registeredUsers.length}</span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                {(['ALL', 'GOOGLE', 'EMAIL'] as const).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setCustomerFilter(prov)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      customerFilter === prov
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {prov === 'ALL' ? 'All Accounts' : prov === 'GOOGLE' ? 'Google OAuth' : 'Email & Password'}
                  </button>
                ))}
              </div>

              {/* Customers List */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Customer</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Auth Method</th>
                        <th className="py-3.5 px-4">Member Since</th>
                        <th className="py-3.5 px-4">Lifetime Orders</th>
                        <th className="py-3.5 px-5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredCustomers.map((cust) => {
                        const custOrders = orders.filter(o => o.shippingAddress.fullName.toLowerCase() === cust.name.toLowerCase());
                        const totalSpent = custOrders.reduce((sum, o) => sum + o.total, 0);

                        return (
                          <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                            
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                                  {cust.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900">{cust.name}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-slate-600 font-medium">
                              {cust.email}
                            </td>

                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                cust.provider === 'google' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {cust.provider}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-slate-400">
                              {cust.joinedDate || '2026-09-01'}
                            </td>

                            <td className="py-4 px-4">
                              <div>
                                <span className="font-bold text-slate-900">{custOrders.length} order{custOrders.length !== 1 ? 's' : ''}</span>
                                {totalSpent > 0 && (
                                  <span className="text-[11px] text-slate-400 block">${totalSpent.toFixed(2)} spent</span>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => setInspectCustomer(cust)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                View Profile
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB: PROMO CODES & DISCOUNTS
             ========================================== */}
          {activeTab === 'discounts' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Promo Codes & Discounts</h1>
                <p className="text-xs text-slate-500 mt-1">Create promotional coupons, assign percentage discounts, and review voucher redemption.</p>
              </div>

              {/* Create Promo Code Card */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Create New Discount Voucher</h3>
                <form onSubmit={handleCreatePromoCode} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUMMER25"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Discount Percentage (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newPromoPercent}
                      onChange={(e) => setNewPromoPercent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      + Create Promo Code
                    </button>
                  </div>
                </form>
              </div>

              {/* Promo Codes Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Code</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Uses</th>
                      <th className="py-3.5 px-4">Expiry</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promoCodes.map((p) => (
                      <tr key={p.code} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{p.code}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">{p.percent}% OFF</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleTogglePromoCode(p.code)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                              p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {p.active ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{p.uses} redeemed</td>
                        <td className="py-3.5 px-4 text-slate-400">{p.expiry}</td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleDeletePromoCode(p.code)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB: SUPPORT CONCIERGE DESK
             ========================================== */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Concierge Desk</h1>
                  <p className="text-xs text-slate-500 mt-1">Review inquiries, respond to tickets, and track customer resolution status.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs">
                    {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setSupportFilter(st)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          supportFilter === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    {openTicketsCount} Open Tickets
                  </span>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Tickets List */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ticket Queue</h3>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {filteredTickets.map((t) => {
                      const isSelected = selectedTicket?.id === t.id;
                      const lastMessage = t.messages?.[t.messages.length - 1]?.message || 'No messages';
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-slate-100/80 border-l-4 border-slate-900' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{t.ticketNumber || t.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'RESOLVED'
                                ? 'bg-slate-100 text-slate-600'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs text-slate-900 mt-1">{t.subject}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{lastMessage}</p>
                          <span className="text-[10px] text-slate-400 block mt-2">{t.customerName} • {t.createdAt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ticket Details & Reply Area */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex flex-col justify-between">
                  {selectedTicket ? (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400 font-bold">{selectedTicket.ticketNumber || selectedTicket.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              selectedTicket.status === 'RESOLVED'
                                ? 'bg-slate-100 text-slate-600'
                                : selectedTicket.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {selectedTicket.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Client: <span className="font-semibold text-slate-800">{selectedTicket.customerName}</span> ({selectedTicket.customerEmail})
                          </p>
                        </div>

                        {/* Status Switcher */}
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => {
                            const newSt = e.target.value as SupportTicket['status'];
                            updateTicketStatus(selectedTicket.id, newSt);
                            setSelectedTicket({ ...selectedTicket, status: newSt });
                            showNotice(`Ticket status changed to ${newSt}`);
                          }}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value="OPEN">Mark OPEN</option>
                          <option value="IN_PROGRESS">Mark IN PROGRESS</option>
                          <option value="RESOLVED">Mark RESOLVED</option>
                        </select>
                      </div>

                      {/* Message Thread */}
                      <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                        {/* Messages in thread */}
                        {selectedTicket.messages?.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                              msg.sender === 'admin'
                                ? 'bg-slate-900 text-white border-slate-900 ml-6'
                                : 'bg-slate-50 border-slate-200 text-slate-800 mr-6'
                            }`}
                          >
                            <div className="flex justify-between text-[10px] opacity-75 mb-1">
                              <span className="font-semibold">{msg.senderName}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p>{msg.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply Box */}
                      <form onSubmit={handleAdminSendReply} className="pt-4 border-t border-slate-100 space-y-3">
                        <textarea
                          rows={3}
                          required
                          placeholder="Type response to client..."
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <Send size={13} />
                            <span>Send Reply</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <LifeBuoy size={32} className="stroke-[1.5]" />
                      <p className="text-xs font-medium">Select a support ticket to review conversation thread</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB: AI ASSISTANT SUITE
             ========================================== */}
          {activeTab === 'ai_agent' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Raylux Intelligence Suite</h1>
                <p className="text-xs text-slate-500 mt-1">Autonomous conversational assistant powered by Gemini 3.8 Flash.</p>
              </div>

              {/* Chat Test Console */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Gemini 3.8 Interactive Playground</h3>
                      <p className="text-[10px] text-slate-400">Live evaluation against current orders and catalog</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAiConfig}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg border border-slate-200"
                    >
                      Save Parameters
                    </button>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {aiConfig.enabled ? 'Agent Active' : 'Agent Paused'}
                    </span>
                  </div>
                </div>

                {/* Conversation Body */}
                <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {testAiConversation.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {testAiLoading && (
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Sparkles size={14} className="animate-spin text-slate-600" />
                      <span>Gemini evaluating query...</span>
                    </div>
                  )}
                </div>

                {/* Test Input */}
                <form onSubmit={handleTestAiQuery} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask e.g. 'What is the stock level of Monolith 01?' or 'Show order RLX-8921-EU status'..."
                    value={testAiQuery}
                    onChange={(e) => setTestAiQuery(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={testAiLoading}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>Run Query</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB: STORE SETTINGS
             ========================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
                <p className="text-xs text-slate-500 mt-1">Configure global monetary exchange rates, shipping policies, and operational rules.</p>
              </div>

              {/* TRI-CURRENCY CONTROLLER CARD */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Coins size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Tri-Currency Monetary Controller</h3>
                      <p className="text-xs text-slate-500">Universal store pricing for USD ($), GBP (£), and EUR (€)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    Active
                  </span>
                </div>

                {/* Form to update rates */}
                <form onSubmit={handleSaveExchangeRate} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* GBP Rate */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">🇬🇧 British Pound (GBP)</span>
                      <span className="text-xs font-mono font-bold text-slate-500">1 USD = £{exchangeRates.GBP}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">£</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        value={editGbpRate}
                        onChange={(e) => setEditGbpRate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Inverse: £1 GBP ≈ ${(1 / (parseFloat(editGbpRate) || 0.79)).toFixed(2)} USD
                    </span>
                  </div>

                  {/* EUR Rate */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">🇪🇺 European Euro (EUR)</span>
                      <span className="text-xs font-mono font-bold text-slate-500">1 USD = €{exchangeRates.EUR}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        value={editEurRate}
                        onChange={(e) => setEditEurRate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Inverse: €1 EUR ≈ ${(1 / (parseFloat(editEurRate) || 0.92)).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      Save Exchange Rates
                    </button>
                  </div>
                </form>

                {/* Sample Conversion Matrix */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Live Storefront Sample Matrix</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[85, 110, 145, 195].map((usdVal) => (
                      <div key={usdVal} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-900 block">${usdVal} USD</span>
                        <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                          <p>£{(usdVal * exchangeRates.GBP).toFixed(2)} GBP</p>
                          <p>€{(usdVal * exchangeRates.EUR).toFixed(2)} EUR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping & Delivery Settings */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Shipping Policies & Delivery Tiers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Free Shipping Over ($)</label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Standard Dispatch Fee ($)</label>
                    <input
                      type="number"
                      value={standardRate}
                      onChange={(e) => setStandardRate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Express Dispatch Fee ($)</label>
                    <input
                      type="number"
                      value={expressRate}
                      onChange={(e) => setExpressRate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Store Sales Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==========================================
          MODALS & DRAWERS
         ========================================== */}
      
      {/* 1. PRODUCT ADD & EDIT MODAL */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProductModal}
        initialData={editingProduct}
      />

      {/* 2. ORDER PACKING SLIP MODAL */}
      {selectedInspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Packing Slip Manifest</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedInspectOrder.orderNumber}</h3>
                <span className="text-xs text-slate-500">{selectedInspectOrder.date}</span>
              </div>
              <button
                onClick={() => setSelectedInspectOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Destination */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <span className="font-bold text-slate-700 block uppercase text-[10px]">Shipment Destination</span>
              <p className="font-semibold text-slate-900">{selectedInspectOrder.shippingAddress.fullName}</p>
              <p className="text-slate-500">{selectedInspectOrder.shippingAddress.street}</p>
              <p className="text-slate-500">{selectedInspectOrder.shippingAddress.city}, {selectedInspectOrder.shippingAddress.country}</p>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <span className="font-bold text-slate-700 block uppercase text-[10px]">Manifest Items</span>
              <div className="divide-y divide-slate-100">
                {selectedInspectOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=150&q=80'}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.productName}</h4>
                        <span className="text-[11px] text-slate-400">Qty: {item.quantity} • {item.size}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Total Charged:</span>
              <span className="text-base font-bold text-slate-900">${selectedInspectOrder.total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setSelectedInspectOrder(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close Manifest
            </button>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER DETAILS MODAL */}
      {inspectCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 relative">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {inspectCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{inspectCustomer.name}</h3>
                  <span className="text-xs text-slate-400">{inspectCustomer.email}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Provider</span>
                <span className="font-bold uppercase text-slate-800">{inspectCustomer.provider}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Member Since</span>
                <span className="font-semibold text-slate-800">{inspectCustomer.joinedDate || '2026-09-01'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Total Purchases</span>
                <span className="font-bold text-slate-900">
                  ${orders.filter(o => o.shippingAddress.fullName.toLowerCase() === inspectCustomer.name.toLowerCase()).reduce((s, o) => s + o.total, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setInspectCustomer(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
