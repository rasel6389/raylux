import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation, AdminTab } from '../context/NavigationContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order, InventoryItem, User } from '../types/product';
import { ProductModal, ProductModalPayload } from '../components/admin/ProductModal';
import { CustomerModal, CustomerModalPayload } from '../components/admin/CustomerModal';
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
  Sliders,
  RotateCcw,
  UserPlus,
  Phone,
  MapPin,
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

const PRESET_HERO_IMAGES = [
  { label: 'Streetwear Model', url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=2400&q=85' },
  { label: 'Studio Minimalist', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=2400&q=85' },
  { label: 'GORE-TEX Mountain', url: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=2400&q=85' },
  { label: 'Urban Dark Architecture', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=2400&q=85' },
  { label: 'Tokyo Monolith Night', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2400&q=85' },
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
    heroConfig,
    updateHeroConfig,
    resetHeroConfig,
    announcementConfig,
    updateAnnouncementConfig,
  } = useStore();
  const {
    registeredUsers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setCustomerStatus,
  } = useAuth();

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
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'VIP' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modals & Drawers
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(InventoryItem & { description?: string; profile?: string; images?: string[] }) | null>(null);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);

  const [selectedInspectOrder, setSelectedInspectOrder] = useState<Order | null>(null);
  const [inspectCustomer, setInspectCustomer] = useState<User | null>(null);

  // Hero CMS Editing State
  const [editHero, setEditHero] = useState(heroConfig);
  const [editAnnouncement, setEditAnnouncement] = useState(announcementConfig);

  useEffect(() => {
    setEditHero(heroConfig);
  }, [heroConfig]);

  useEffect(() => {
    setEditAnnouncement(announcementConfig);
  }, [announcementConfig]);

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

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (cust: User) => {
    setEditingCustomer(cust);
    setIsCustomerModalOpen(true);
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

  // Filtered Customers (CRM)
  const filteredCustomers = useMemo(() => {
    return registeredUsers.filter((cust) => {
      if (customerFilter === 'VIP' && cust.status !== 'VIP') return false;
      if (customerFilter === 'ACTIVE' && cust.status !== 'ACTIVE') return false;
      if (customerFilter === 'SUSPENDED' && cust.status !== 'SUSPENDED') return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matchName = cust.name.toLowerCase().includes(q);
        const matchEmail = cust.email.toLowerCase().includes(q);
        const matchPhone = cust.phone?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
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
      setErrorMsg('Invalid passcode. Use "raylux2026" or "admin".');
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
      showNotice(`Product ${data.sku} updated!`);
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
      showNotice(`New product ${data.name} added!`);
    }
    setIsProductModalOpen(false);
  };

  const handleSaveCustomerModal = (data: CustomerModalPayload) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        sizePreference: data.sizePreference,
        address: data.address,
        notes: data.notes,
        provider: data.provider,
      });
      showNotice(`Client record ${data.name} updated!`);
    } else {
      addCustomer({
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        sizePreference: data.sizePreference,
        address: data.address,
        notes: data.notes,
        provider: data.provider,
        role: 'customer',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        totalOrders: 0,
        totalSpent: 0,
      });
      showNotice(`New client ${data.name} registered!`);
    }
    setIsCustomerModalOpen(false);
  };

  const handleSaveHeroBanner = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroConfig(editHero);
    updateAnnouncementConfig(editAnnouncement);
    showNotice('Storefront Hero Banner and Announcement updated live!');
  };

  const handleResetHeroBanner = () => {
    if (confirm('Reset Storefront Hero Banner to factory defaults?')) {
      resetHeroConfig();
      showNotice('Hero banner reset to defaults.');
    }
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
    showNotice('AI Agent parameters saved!');
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
    showNotice('Response sent to customer!');
  };

  // ==========================================
  // VIEW 1: AUTHENTICATION LOGIN PORTAL (NIKE MONOCHROME)
  // ==========================================
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 sm:p-6 text-neutral-900 font-sans selection:bg-black selection:text-white">
        <div className="w-full max-w-md bg-white border border-neutral-200 p-8 sm:p-10 shadow-xl rounded-2xl relative">
          
          {/* Brand Header */}
          <div className="text-center space-y-2 mb-6">
            <span className="font-nike text-3xl font-black tracking-tighter uppercase block text-black">
              RAYLUX
            </span>
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
              OPERATIONS & STOREFRONT CMS
            </span>
            <p className="text-xs text-neutral-500">Sign in to manage catalog, hero banner, orders, and clients.</p>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="mb-5 p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={14} className="text-neutral-500" />
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Demo Key</span>
                <span className="text-xs font-mono font-bold text-black">raylux2026</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Quick Login
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={14} className="text-black shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter passcode..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl pl-4 pr-10 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              Sign In to Console
            </button>
          </form>

          {/* Return link */}
          <div className="mt-6 text-center pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={goToHome}
              className="text-xs font-bold text-neutral-500 hover:text-black transition-colors cursor-pointer"
            >
              ← Return to Customer Storefront
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LOGGED-IN NIKE ADMIN CONSOLE
  // ==========================================
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row text-neutral-900 font-sans selection:bg-black selection:text-white antialiased">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn border border-neutral-800">
          <CheckCircle2 size={16} className="text-white" />
          <span>{notification}</span>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-neutral-800 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-nike text-lg font-black tracking-tight uppercase">RAYLUX</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase">ADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToHome}
            className="px-3 py-1.5 rounded-full border border-neutral-300 text-black hover:bg-neutral-50 text-xs font-bold flex items-center gap-1"
          >
            <span>Store</span>
            <ExternalLink size={12} />
          </button>
          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            MV
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <span className="font-nike text-xl font-black uppercase tracking-tight">RAYLUX LAB</span>
                  <span className="text-[10px] font-bold text-neutral-400 block tracking-widest uppercase">Admin Workspace</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-black rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <nav className="mt-5 space-y-1">
                <span className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Workspace</span>
                
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
                  { id: 'inventory', label: 'Products & Stock', icon: Package, count: inventory.length },
                  { id: 'hero_cms', label: 'Hero & Storefront CMS', icon: Sliders },
                  { id: 'customers', label: 'Client Directory (CRM)', icon: Users, count: registeredUsers.length },
                  { id: 'discounts', label: 'Promo Vouchers', icon: Tag },
                  { id: 'support', label: 'Support Concierge', icon: LifeBuoy, count: openTicketsCount },
                  { id: 'ai_agent', label: 'AI Intelligence', icon: Bot },
                  { id: 'settings', label: 'Store Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id as AdminTab); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {Boolean(item.count) && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white text-black' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <button
                onClick={goToHome}
                className="w-full py-2.5 px-3 rounded-full border border-neutral-300 text-black hover:bg-neutral-50 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                <span>Customer Storefront</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="w-full py-2.5 px-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP PERMANENT SIDEBAR (NIKE MONOCHROME) */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#fcfcfc] border-r border-neutral-200 p-5 sticky top-0 h-screen z-20 shrink-0">
        <div className="space-y-6">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div>
              <span className="font-nike text-2xl font-black text-black tracking-tighter uppercase block">
                RAYLUX
              </span>
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
                FLAGSHIP OPERATIONS
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Store Live" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Dashboard</span>

            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag, count: orders.length },
              { id: 'inventory', label: 'Products & Stock', icon: Package, count: inventory.length },
              { id: 'hero_cms', label: 'Hero & Store CMS', icon: Sliders },
              { id: 'customers', label: 'Customer CRM', icon: Users, count: registeredUsers.length },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.count) && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-black' : 'bg-neutral-200/70 text-neutral-700'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            <span className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-5 mb-2">Commerce Ops</span>

            {[
              { id: 'discounts', label: 'Promo Vouchers', icon: Tag },
              { id: 'support', label: 'Support Concierge', icon: LifeBuoy, count: openTicketsCount },
              { id: 'ai_agent', label: 'AI Intelligence', icon: Bot },
              { id: 'settings', label: 'Store Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.count) && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-black' : 'bg-neutral-200/70 text-neutral-700'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Foot Actions */}
        <div className="space-y-3 pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-neutral-200">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
              MV
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-black truncate">Marcus Vance</p>
              <p className="text-[10px] text-neutral-400 truncate">Store Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={goToHome}
              className="py-2 px-2.5 rounded-full border border-neutral-300 text-black hover:bg-neutral-100 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Return to Storefront"
            >
              <ExternalLink size={13} />
              <span>Store</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="py-2 px-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* DESKTOP TOP BAR */}
        <header className="hidden lg:flex h-16 bg-white border-b border-neutral-200 px-8 items-center justify-between sticky top-0 z-10">
          {/* Breadcrumb & Clock */}
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold tracking-wider uppercase text-neutral-400 flex items-center gap-1.5">
              <span>Raylux</span>
              <span>/</span>
              <span className="text-black">{activeTab.replace('_', ' ')}</span>
            </div>
            <div className="h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
              <Clock size={13} />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Search, Currency and Add Action */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <Search size={14} className="absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders, products, clients..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-black placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black font-medium"
              />
            </div>

            {/* Live Currency Pill */}
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 hover:border-neutral-400 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Adjust Currency Exchange Rates"
            >
              <Coins size={13} className="text-neutral-500" />
              <span>£{exchangeRates.GBP} GBP • €{exchangeRates.EUR} EUR</span>
            </button>

            {/* Quick Add Product Button */}
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>

            {/* View Storefront Button */}
            <button
              onClick={goToHome}
              className="px-3.5 py-1.5 border border-neutral-300 hover:border-black rounded-full text-black hover:bg-neutral-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                    EXECUTIVE TELEMETRY
                  </span>
                  <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">Overview Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('hero_cms')}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders size={14} />
                    <span>Edit Hero Banner</span>
                  </button>
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>New Product</span>
                  </button>
                </div>
              </div>

              {/* 4 Clean Nike Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Revenue */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Gross Revenue</span>
                    <span className="p-1.5 rounded-full bg-neutral-100 text-black">
                      <DollarSign size={14} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-nike text-3xl font-black text-black tracking-tight">
                      ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-neutral-500">
                      <span className="text-black">↑ 14.8%</span>
                      <span>vs previous month</span>
                    </p>
                  </div>
                </div>

                {/* Metric 2: Orders */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Orders</span>
                    <span className="p-1.5 rounded-full bg-neutral-100 text-black">
                      <ShoppingBag size={14} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-nike text-3xl font-black text-black tracking-tight">{orders.length} Dispatches</h3>
                    <p className="mt-1 text-[11px] font-bold text-neutral-500">
                      {activeDispatchesCount} active in transit
                    </p>
                  </div>
                </div>

                {/* Metric 3: Units Sold */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Depot Units</span>
                    <span className="p-1.5 rounded-full bg-neutral-100 text-black">
                      <Package size={14} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-nike text-3xl font-black text-black tracking-tight">{totalDepotUnits} in Stock</h3>
                    <p className="mt-1 text-[11px] font-bold text-neutral-500">
                      {inventory.length} active SKUs
                    </p>
                  </div>
                </div>

                {/* Metric 4: Registered Members */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Roster</span>
                    <span className="p-1.5 rounded-full bg-neutral-100 text-black">
                      <Users size={14} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-nike text-3xl font-black text-black tracking-tight">{registeredUsers.length} Clients</h3>
                    <p className="mt-1 text-[11px] font-bold text-neutral-500">
                      {registeredUsers.filter(u => u.status === 'VIP').length} VIP members
                    </p>
                  </div>
                </div>

              </div>

              {/* Charts & Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Volume Activity (2 cols) */}
                <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 rounded-2xl space-y-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-black">Weekly Revenue Velocity</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">Processed orders volume across global fulfillment hubs</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-black">
                      Avg $12,125 / day
                    </span>
                  </div>

                  {/* Clean Bar Graph */}
                  <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-neutral-200 pb-3">
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
                        <span className="text-[10px] text-neutral-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.val}
                        </span>
                        <div
                          style={{ height: bar.h }}
                          className="w-full max-w-[34px] bg-black hover:bg-neutral-800 rounded-t transition-all"
                        />
                        <span className="text-xs font-bold text-neutral-500 uppercase">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>* 100% Real-time database sync</span>
                    <span className="text-black font-bold">99.8% On-time dispatch</span>
                  </div>
                </div>

                {/* Top Silhouettes */}
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-5 flex flex-col justify-between shadow-xs">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-black">Top Silhouettes</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Highest velocity catalog items ({totalUnitsSold} units sold)</p>

                    <div className="mt-5 space-y-4">
                      {[
                        { name: 'Monolith 01 // Onyx', units: 342, pct: 85 },
                        { name: 'Apex Storm // GORE-TEX', units: 218, pct: 65 },
                        { name: 'Archetype 03 // Bone', units: 164, pct: 45 },
                        { name: 'Cipher 04 // Cordura', units: 124, pct: 32 },
                      ].map((item) => (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-black">{item.name}</span>
                            <span className="text-neutral-400 font-mono text-[11px]">{item.units} units</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-black h-full rounded-full transition-all"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="w-full py-2.5 rounded-full border border-neutral-300 hover:border-black text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-4"
                  >
                    <span>View Full Catalog</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>

              {/* Lower Panels: Recent Orders & Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Orders Card */}
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-black">Recent Dispatches</h3>
                      <p className="text-xs text-neutral-400">Live incoming client orders</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs text-black">
                            {ord.shippingAddress.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-black">{ord.orderNumber}</span>
                              <button
                                onClick={() => handleCopyOrderId(ord.orderNumber)}
                                className="text-neutral-400 hover:text-black"
                                title="Copy order number"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {ord.shippingAddress.fullName} • {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="font-bold text-xs text-black block">
                              ${ord.total.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-neutral-400">{ord.date}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'DELIVERED'
                              ? 'bg-neutral-100 text-black'
                              : ord.status === 'IN TRANSIT'
                              ? 'bg-black text-white'
                              : 'bg-neutral-200 text-neutral-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-black">Stock Threshold Alerts</h3>
                      <p className="text-xs text-neutral-400">Replenishment required</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-black">
                      {lowStockItems.length} Low Stock
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {lowStockItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-black">{item.name}</h4>
                            <p className="text-[11px] font-mono text-neutral-400">{item.sku} • {item.material}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold text-black block">{item.stock} left</span>
                            <span className="text-[10px] text-neutral-400">Reorder at {item.reorderPoint}</span>
                          </div>
                          <button
                            onClick={() => {
                              restockProduct(item.id, 25);
                              showNotice(`Added +25 units to ${item.name}!`);
                            }}
                            className="px-3 py-1 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
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
              TAB: HERO & STOREFRONT CMS (NEW!)
             ========================================== */}
          {activeTab === 'hero_cms' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                    STOREFRONT ARCHITECTURE CMS
                  </span>
                  <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">
                    Hero Banner & Announcement CMS
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Modify headlines, imagery, CTA buttons, and top promotional banner in real-time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetHeroBanner}
                    className="px-4 py-2 border border-neutral-300 hover:border-black rounded-full text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    id="save-hero-cms-btn"
                    onClick={handleSaveHeroBanner}
                    className="px-6 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Save & Publish Live</span>
                  </button>
                </div>
              </div>

              {/* LIVE MINI HERO PREVIEW CARD */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-black" />
                  <span>Real-Time Storefront Hero Preview</span>
                </span>
                <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-black text-white p-6 sm:p-10 flex flex-col justify-between shadow-2xl border border-neutral-800 select-none">
                  {/* Background Image */}
                  <img
                    src={editHero.imageUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-75 contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Top Bar Preview */}
                  <div className="relative z-10 flex justify-between items-start">
                    {editHero.badgeActive ? (
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-xs border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                        ● {editHero.badgeText}
                      </span>
                    ) : <div />}
                    <div className="text-right text-[10px] text-white/75 font-mono hidden sm:block">
                      {editHero.topRightCaptionLine1}
                      <br />
                      <strong className="text-white">{editHero.topRightCaptionLine2}</strong>
                    </div>
                  </div>

                  {/* Bottom Typography & CTAs */}
                  <div className="relative z-10 space-y-3">
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest block">
                      {editHero.superTitle}
                    </span>
                    <h2 className="font-nike text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-white">
                      {editHero.mainTitle}
                    </h2>
                    <p className="text-xs text-white/80 max-w-xl line-clamp-2">
                      {editHero.description}
                    </p>
                    <div className="flex gap-2.5 pt-2">
                      <span className="px-5 py-2 bg-white text-black font-bold text-xs uppercase rounded-full tracking-wider">
                        {editHero.primaryBtnText}
                      </span>
                      {editHero.secondaryBtnActive && (
                        <span className="px-5 py-2 bg-transparent border border-white text-white font-bold text-xs uppercase rounded-full tracking-wider">
                          {editHero.secondaryBtnText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* EDIT FORM ACCORDION/GRID */}
              <form onSubmit={handleSaveHeroBanner} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel 1: Hero Typography & Content */}
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-3">
                    Typography & Editorial Copy
                  </h3>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Main Display Headline
                    </label>
                    <input
                      id="hero-main-title-input"
                      type="text"
                      required
                      value={editHero.mainTitle}
                      onChange={(e) => setEditHero({ ...editHero, mainTitle: e.target.value.toUpperCase() })}
                      placeholder="e.g. ENGINEERED TO LEAD"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-black font-nike uppercase font-black tracking-tight focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Super-Title (Lab Category Tag)
                    </label>
                    <input
                      type="text"
                      value={editHero.superTitle}
                      onChange={(e) => setEditHero({ ...editHero, superTitle: e.target.value.toUpperCase() })}
                      placeholder="e.g. RAYLUX TECHNICAL HEADWEAR LAB"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-black uppercase font-bold tracking-widest focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Manifesto / Sub-Description
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={editHero.description}
                      onChange={(e) => setEditHero({ ...editHero, description: e.target.value })}
                      placeholder="Series 01 Architectural Headwear. Bonded waterproof seams..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                          Floating Badge
                        </label>
                        <input
                          type="checkbox"
                          checked={editHero.badgeActive}
                          onChange={(e) => setEditHero({ ...editHero, badgeActive: e.target.checked })}
                          className="rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={editHero.badgeText}
                        onChange={(e) => setEditHero({ ...editHero, badgeText: e.target.value.toUpperCase() })}
                        placeholder="e.g. NEW DROP // SUMMER 2026"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black font-bold uppercase focus:bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                        Top Right Caption (Line 1 & 2)
                      </label>
                      <input
                        type="text"
                        value={editHero.topRightCaptionLine1}
                        onChange={(e) => setEditHero({ ...editHero, topRightCaptionLine1: e.target.value.toUpperCase() })}
                        placeholder="Line 1"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black uppercase mb-1.5 focus:outline-none focus:border-black"
                      />
                      <input
                        type="text"
                        value={editHero.topRightCaptionLine2}
                        onChange={(e) => setEditHero({ ...editHero, topRightCaptionLine2: e.target.value.toUpperCase() })}
                        placeholder="Line 2"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black uppercase font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel 2: Background Media & Buttons */}
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-5 shadow-xs">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-3">
                    Hero Media & Action Directives
                  </h3>

                  {/* Preset Image Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Editorial Photography Presets
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PRESET_HERO_IMAGES.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setEditHero({ ...editHero, imageUrl: img.url })}
                          className={`aspect-video rounded-xl overflow-hidden border-2 relative group cursor-pointer ${
                            editHero.imageUrl === img.url ? 'border-black ring-2 ring-black' : 'border-neutral-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[9px] text-white font-bold text-center p-1">
                            {img.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div>
                      <input
                        type="url"
                        placeholder="Or paste custom photography URL..."
                        value={editHero.imageUrl}
                        onChange={(e) => setEditHero({ ...editHero, imageUrl: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-black focus:bg-white focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Buttons Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black block">Primary Button (Solid)</span>
                      <input
                        type="text"
                        value={editHero.primaryBtnText}
                        onChange={(e) => setEditHero({ ...editHero, primaryBtnText: e.target.value.toUpperCase() })}
                        placeholder="e.g. SHOP THE COLLECTION"
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-black font-bold uppercase focus:outline-none focus:border-black"
                      />
                      <select
                        value={editHero.primaryBtnAction}
                        onChange={(e) => setEditHero({ ...editHero, primaryBtnAction: e.target.value as 'shop' | 'lookbook' })}
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none"
                      >
                        <option value="shop">Destination: Storefront Catalog</option>
                        <option value="lookbook">Destination: 2026 Lookbook</option>
                      </select>
                    </div>

                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-black">Secondary Button</span>
                        <input
                          type="checkbox"
                          checked={editHero.secondaryBtnActive}
                          onChange={(e) => setEditHero({ ...editHero, secondaryBtnActive: e.target.checked })}
                          className="rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={editHero.secondaryBtnText}
                        onChange={(e) => setEditHero({ ...editHero, secondaryBtnText: e.target.value.toUpperCase() })}
                        placeholder="e.g. VIEW 2026 LOOKBOOK"
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-black font-bold uppercase focus:outline-none focus:border-black"
                      />
                      <select
                        value={editHero.secondaryBtnAction}
                        onChange={(e) => setEditHero({ ...editHero, secondaryBtnAction: e.target.value as 'shop' | 'lookbook' })}
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none"
                      >
                        <option value="lookbook">Destination: 2026 Lookbook</option>
                        <option value="shop">Destination: Storefront Catalog</option>
                      </select>
                    </div>
                  </div>

                  {/* Announcement Bar Settings */}
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Top Announcement Bar (With Dismiss 'X' Button)
                      </span>
                      <input
                        type="checkbox"
                        checked={editAnnouncement.active}
                        onChange={(e) => setEditAnnouncement({ ...editAnnouncement, active: e.target.checked })}
                        className="rounded cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={editAnnouncement.text}
                      onChange={(e) => setEditAnnouncement({ ...editAnnouncement, text: e.target.value })}
                      placeholder="e.g. Members: Complimentary Worldwide Dispatch on orders over $150..."
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editAnnouncement.discountCode || ''}
                        onChange={(e) => setEditAnnouncement({ ...editAnnouncement, discountCode: e.target.value.toUpperCase() })}
                        placeholder="Voucher Code: MEMBER20"
                        className="w-1/2 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-black"
                      />
                      <input
                        type="text"
                        value={editAnnouncement.linkText || ''}
                        onChange={(e) => setEditAnnouncement({ ...editAnnouncement, linkText: e.target.value })}
                        placeholder="Link Text: Join or Sign In"
                        className="w-1/2 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                  >
                    Publish All Changes to Storefront
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ==========================================
              TAB: INVENTORY / PRODUCTS
             ========================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                    CATALOGUE INVENTORY
                  </span>
                  <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">Products & Inventory</h1>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>Register Product</span>
                </button>
              </div>

              {/* 4 Inventory Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Products</span>
                  <p className="font-nike text-3xl font-black text-black mt-1">{inventory.length}</p>
                  <span className="text-[11px] text-neutral-400">Active catalog items</span>
                </div>
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Depot Units</span>
                  <p className="font-nike text-3xl font-black text-black mt-1">{totalDepotUnits}</p>
                  <span className="text-[11px] text-neutral-400">Warehouse inventory</span>
                </div>
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Low Stock</span>
                  <p className="font-nike text-3xl font-black text-black mt-1">{lowStockItems.length}</p>
                  <span className="text-[11px] text-neutral-400">Under reorder threshold</span>
                </div>
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-xs">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Catalog Asset Value</span>
                  <p className="font-nike text-3xl font-black text-black mt-1">${totalAssetValue.toLocaleString()}</p>
                  <span className="text-[11px] text-neutral-400">List asset valuation</span>
                </div>
              </div>

              {/* Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['ALL', 'HEAVY TWILL', 'GORE-TEX', 'CORDURA', 'RIPSTOP'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setInventoryCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                        inventoryCategoryFilter === cat
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:border-black'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Products' : cat}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-neutral-500 font-medium shrink-0">
                  Showing <span className="font-bold text-black">{filteredInventory.length}</span> of {inventory.length} items
                </div>
              </div>

              {/* DESKTOP INVENTORY TABLE */}
              <div className="hidden lg:block bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      <th className="py-3.5 px-5">Product Silhouette</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Textile Material</th>
                      <th className="py-3.5 px-4">Unit Price</th>
                      <th className="py-3.5 px-4">Depot Stock</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors group">
                        
                        {/* Thumbnail & Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(item)}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-black text-sm group-hover:text-black">{item.name}</h4>
                              <p className="text-[11px] text-neutral-400 uppercase tracking-wider">{item.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-4 px-4 font-mono font-bold text-neutral-700">
                          <span className="px-2 py-1 bg-neutral-100 rounded text-[11px]">
                            {item.sku}
                          </span>
                        </td>

                        {/* Material */}
                        <td className="py-4 px-4 text-neutral-700 font-medium">
                          {item.material}
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-black text-sm">
                            ${item.price.toFixed(2)}
                          </span>
                        </td>

                        {/* Stock Progress */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 w-28">
                            <span className="font-bold text-black text-xs">{item.stock} units</span>
                            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.stock <= item.reorderPoint ? 'bg-amber-500' : 'bg-black'
                                }`}
                                style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            item.stock <= item.reorderPoint
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-neutral-100 text-black border border-neutral-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.stock <= item.reorderPoint ? 'bg-amber-500' : 'bg-black'}`} />
                            <span>{item.stock <= item.reorderPoint ? 'Low Stock' : 'In Stock'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditProduct(item)}
                              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Edit product specification"
                            >
                              <Edit3 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                restockProduct(item.id, 25);
                                showNotice(`Added +25 units to ${item.name}!`);
                              }}
                              className="px-2.5 py-1.5 border border-neutral-300 hover:border-black text-black rounded-full text-xs font-bold transition-colors cursor-pointer"
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
                              className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer"
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
                  <div key={item.id} className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-mono text-neutral-400 uppercase">{item.sku}</span>
                          <h4 className="font-bold text-sm text-black">{item.name}</h4>
                          <span className="text-xs font-bold text-black mt-0.5 block">${item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.stock <= item.reorderPoint ? 'bg-amber-100 text-amber-800' : 'bg-black text-white'
                      }`}>
                        {item.stock} left
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-neutral-500">{item.material}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(item)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-full text-xs font-bold flex items-center gap-1"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            restockProduct(item.id, 25);
                            showNotice(`Added +25 units to ${item.name}!`);
                          }}
                          className="px-3.5 py-1.5 bg-black text-white rounded-full text-xs font-bold"
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
              TAB: ORDERS & SHIPMENTS
             ========================================== */}
          {(activeTab === 'orders' || activeTab === 'dispatches') && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                    ORDER DISPATCHES
                  </span>
                  <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">Orders & Fulfillment</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Total Volume:</span>
                  <span className="text-sm font-bold text-black font-nike">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 overflow-x-auto">
                {(['ALL', 'PROCESSING', 'IN TRANSIT', 'DELIVERED'] as const).map((status) => {
                  const count = status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                        orderStatusFilter === status
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:text-black'
                      }`}
                    >
                      {status === 'ALL' ? 'All Orders' : status} ({count})
                    </button>
                  );
                })}
              </div>

              {/* ORDERS TABLE */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        <th className="py-3.5 px-5">Order Reference</th>
                        <th className="py-3.5 px-4">Client Destination</th>
                        <th className="py-3.5 px-4">Items Manifest</th>
                        <th className="py-3.5 px-4">Carrier & Tracking</th>
                        <th className="py-3.5 px-4">Billed Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-5 text-right">Manifest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-neutral-50/70 transition-colors">
                          
                          {/* Order Number */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black">{ord.orderNumber}</span>
                              <button
                                onClick={() => handleCopyOrderId(ord.orderNumber)}
                                className="text-neutral-400 hover:text-black"
                                title="Copy order number"
                              >
                                {copiedOrderId === ord.orderNumber ? <Check size={12} className="text-black" /> : <Copy size={12} />}
                              </button>
                            </div>
                            <span className="text-[11px] text-neutral-400 mt-0.5 block">{ord.date}</span>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-neutral-100 font-bold text-xs text-black flex items-center justify-center shrink-0">
                                {ord.shippingAddress.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-black leading-tight">{ord.shippingAddress.fullName}</p>
                                <p className="text-[11px] text-neutral-400">{ord.shippingAddress.city}, {ord.shippingAddress.country}</p>
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
                                  className="w-8 h-8 rounded-lg object-cover border border-neutral-200"
                                />
                              ))}
                              <span className="text-[11px] text-neutral-500 font-bold ml-1">
                                {ord.items.reduce((s, i) => s + i.quantity, 0)} item{ord.items.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>

                          {/* Courier & Tracking */}
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-black text-[11px]">{ord.carrier || 'DHL Express Global'}</p>
                              <p className="font-mono text-[11px] text-neutral-400 mt-0.5">{ord.trackingNumber}</p>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-black text-sm">
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
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-neutral-100 text-black border-neutral-300'
                                  : ord.status === 'IN TRANSIT'
                                  ? 'bg-black text-white border-black'
                                  : 'bg-neutral-200 text-neutral-800 border-neutral-300'
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
                              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-full text-xs font-bold transition-colors cursor-pointer"
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
              TAB: CUSTOMER CRM (EXPANDED!)
             ========================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                    CLIENT RELATIONSHIP MANAGEMENT (CRM)
                  </span>
                  <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">Customer Directory</h1>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    id="register-client-btn"
                    onClick={handleOpenAddCustomer}
                    className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus size={15} />
                    <span>Register Client</span>
                  </button>
                </div>
              </div>

              {/* CRM Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Clients</span>
                  <p className="font-nike text-3xl font-black text-black mt-1">{registeredUsers.length}</p>
                  <span className="text-[11px] text-neutral-400">Registered on store</span>
                </div>
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">VIP Concierge</span>
                  <p className="font-nike text-3xl font-black text-black mt-1">{registeredUsers.filter(u => u.status === 'VIP').length}</p>
                  <span className="text-[11px] text-neutral-400">High lifetime value</span>
                </div>
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Active Members</span>
                  <p className="font-nike text-3xl font-black text-black mt-1">{registeredUsers.filter(u => u.status === 'ACTIVE').length}</p>
                  <span className="text-[11px] text-neutral-400">Good standing</span>
                </div>
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Suspended</span>
                  <p className="font-nike text-3xl font-black text-neutral-400 mt-1">{registeredUsers.filter(u => u.status === 'SUSPENDED').length}</p>
                  <span className="text-[11px] text-neutral-400">Restricted access</span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                {(['ALL', 'VIP', 'ACTIVE', 'SUSPENDED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setCustomerFilter(st)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      customerFilter === st
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:text-black'
                    }`}
                  >
                    {st === 'ALL' ? 'All Clients' : st}
                  </button>
                ))}
              </div>

              {/* Customers List Table */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        <th className="py-3.5 px-5">Client Profile</th>
                        <th className="py-3.5 px-4">Contact & Phone</th>
                        <th className="py-3.5 px-4">Status Tier</th>
                        <th className="py-3.5 px-4">Cap Size Pref</th>
                        <th className="py-3.5 px-4">Total Orders</th>
                        <th className="py-3.5 px-4">Lifetime Spend</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredCustomers.map((cust) => {
                        const custOrders = orders.filter(o => o.shippingAddress.fullName.toLowerCase() === cust.name.toLowerCase());
                        const totalSpent = custOrders.reduce((sum, o) => sum + o.total, cust.totalSpent || 0);

                        return (
                          <tr key={cust.id} className="hover:bg-neutral-50/70 transition-colors">
                            
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
                                  {cust.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-bold text-black text-sm block">{cust.name}</span>
                                  <span className="text-[11px] text-neutral-400">{cust.email}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-neutral-600 font-mono text-[11px]">
                              {cust.phone || 'No phone on file'}
                            </td>

                            {/* Status Pill */}
                            <td className="py-4 px-4">
                              <select
                                value={cust.status || 'ACTIVE'}
                                onChange={(e) => {
                                  const newSt = e.target.value as 'ACTIVE' | 'VIP' | 'SUSPENDED';
                                  setCustomerStatus(cust.id, newSt);
                                  showNotice(`${cust.name} set to ${newSt}!`);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                                  cust.status === 'VIP'
                                    ? 'bg-black text-white border-black'
                                    : cust.status === 'SUSPENDED'
                                    ? 'bg-neutral-200 text-neutral-600 border-neutral-300'
                                    : 'bg-neutral-100 text-black border-neutral-200'
                                }`}
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="VIP">VIP</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                              </select>
                            </td>

                            <td className="py-4 px-4 text-neutral-600 font-bold text-[11px]">
                              {cust.sizePreference || 'L/XL (58-61CM)'}
                            </td>

                            <td className="py-4 px-4 font-bold text-black">
                              {custOrders.length || cust.totalOrders || 0} orders
                            </td>

                            <td className="py-4 px-4 font-bold text-black">
                              ${totalSpent.toFixed(2)}
                            </td>

                            <td className="py-4 px-5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  id={`inspect-cust-${cust.id}`}
                                  onClick={() => setInspectCustomer(cust)}
                                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-full text-xs font-bold transition-colors cursor-pointer inspect-customer-btn"
                                >
                                  Profile
                                </button>
                                <button
                                  onClick={() => handleEditCustomer(cust)}
                                  className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer"
                                  title="Edit client"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove client record for ${cust.name}?`)) {
                                      deleteCustomer(cust.id);
                                      showNotice(`Client ${cust.name} deleted.`);
                                    }
                                  }}
                                  className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer"
                                  title="Delete client"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
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
              <div className="pb-4 border-b border-neutral-200">
                <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                  COMMERCE PROMOTIONS
                </span>
                <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">Promo Codes & Discounts</h1>
              </div>

              {/* Create Promo Code Card */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-4">Create Discount Voucher</h3>
                <form onSubmit={handleCreatePromoCode} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUMMER25"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono uppercase focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">Discount %</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newPromoPercent}
                      onChange={(e) => setNewPromoPercent(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                    >
                      + Create Voucher
                    </button>
                  </div>
                </form>
              </div>

              {/* Promo Codes Table */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      <th className="py-3.5 px-5">Code</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Uses</th>
                      <th className="py-3.5 px-4">Expiry</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {promoCodes.map((p) => (
                      <tr key={p.code} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-black">{p.code}</td>
                        <td className="py-3.5 px-4 font-bold text-black">{p.percent}% OFF</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleTogglePromoCode(p.code)}
                            className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                              p.active ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {p.active ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500">{p.uses} redeemed</td>
                        <td className="py-3.5 px-4 text-neutral-400">{p.expiry}</td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleDeletePromoCode(p.code)}
                            className="text-neutral-400 hover:text-black p-1 rounded transition-colors"
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
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                    CLIENT CARE
                  </span>
                  <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">Support Concierge Desk</h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-1 text-xs">
                    {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setSupportFilter(st)}
                        className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider transition-all ${
                          supportFilter === st ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
                    {openTicketsCount} Open
                  </span>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Tickets List */}
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                    <h3 className="text-xs font-bold text-black uppercase tracking-wider">Ticket Queue</h3>
                  </div>
                  <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
                    {filteredTickets.map((t) => {
                      const isSelected = selectedTicket?.id === t.id;
                      const lastMessage = t.messages?.[t.messages.length - 1]?.message || 'No messages';
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-neutral-100 border-l-4 border-black' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-neutral-400 font-bold">{t.ticketNumber || t.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.status === 'RESOLVED'
                                ? 'bg-neutral-200 text-neutral-700'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-black text-white'
                                : 'bg-neutral-100 text-black border border-neutral-300'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-black mt-1">{t.subject}</h4>
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{lastMessage}</p>
                          <span className="text-[10px] text-neutral-400 block mt-2">{t.customerName} • {t.createdAt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ticket Details & Reply Area */}
                <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl shadow-xs p-6 flex flex-col justify-between">
                  {selectedTicket ? (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-400 font-bold">{selectedTicket.ticketNumber || selectedTicket.id}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black text-white">
                              {selectedTicket.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-black mt-1">{selectedTicket.subject}</h3>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Client: <span className="font-bold text-black">{selectedTicket.customerName}</span> ({selectedTicket.customerEmail})
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
                          className="px-3 py-1.5 bg-neutral-100 border border-neutral-300 rounded-full text-xs font-bold text-black focus:outline-none"
                        >
                          <option value="OPEN">Mark OPEN</option>
                          <option value="IN_PROGRESS">Mark IN PROGRESS</option>
                          <option value="RESOLVED">Mark RESOLVED</option>
                        </select>
                      </div>

                      {/* Message Thread */}
                      <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                        {selectedTicket.messages?.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-2xl text-xs leading-relaxed ${
                              msg.sender === 'admin'
                                ? 'bg-black text-white ml-6'
                                : 'bg-neutral-100 text-black mr-6'
                            }`}
                          >
                            <div className="flex justify-between text-[10px] opacity-75 mb-1 font-bold">
                              <span>{msg.senderName}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p>{msg.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply Box */}
                      <form onSubmit={handleAdminSendReply} className="pt-4 border-t border-neutral-200 space-y-3">
                        <textarea
                          rows={3}
                          required
                          placeholder="Type response to client..."
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-black placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black font-medium"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <Send size={13} />
                            <span>Send Reply</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-neutral-400 space-y-2">
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
              <div className="pb-4 border-b border-neutral-200">
                <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                  INTELLIGENCE RUNTIME
                </span>
                <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">AI Concierge & Runtime</h1>
              </div>

              {/* Chat Test Console */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-black uppercase tracking-wider">Gemini 3.8 Flash Playground</h3>
                      <p className="text-[10px] text-neutral-400">Live evaluation against catalog and orders</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveAiConfig}
                    className="text-xs font-bold text-black px-4 py-1.5 rounded-full border border-neutral-300 hover:border-black"
                  >
                    Save Parameters
                  </button>
                </div>

                {/* Conversation Body */}
                <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  {testAiConversation.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-black text-white'
                            : 'bg-white border border-neutral-200 text-black shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {testAiLoading && (
                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      <Sparkles size={14} className="animate-spin text-black" />
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
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2.5 text-xs text-black focus:bg-white focus:outline-none focus:border-black font-medium"
                  />
                  <button
                    type="submit"
                    disabled={testAiLoading}
                    className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>Query</span>
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
              <div className="pb-4 border-b border-neutral-200">
                <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                  CONFIGURATION
                </span>
                <h1 className="font-nike text-3xl font-black text-black tracking-tight uppercase">Store Settings & Currencies</h1>
              </div>

              {/* TRI-CURRENCY CONTROLLER CARD */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                      <Coins size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-black">Tri-Currency Monetary Controller</h3>
                      <p className="text-xs text-neutral-400">Universal store pricing for USD ($), GBP (£), and EUR (€)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
                    Active
                  </span>
                </div>

                {/* Form to update rates */}
                <form onSubmit={handleSaveExchangeRate} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* GBP Rate */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">🇬🇧 British Pound (GBP)</span>
                      <span className="text-xs font-mono font-bold text-neutral-500">1 USD = £{exchangeRates.GBP}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold text-xs">£</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        value={editGbpRate}
                        onChange={(e) => setEditGbpRate(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-black focus:outline-none focus:border-black"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-400 block font-mono">
                      Inverse: £1 GBP ≈ ${(1 / (parseFloat(editGbpRate) || 0.79)).toFixed(2)} USD
                    </span>
                  </div>

                  {/* EUR Rate */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">🇪🇺 European Euro (EUR)</span>
                      <span className="text-xs font-mono font-bold text-neutral-500">1 USD = €{exchangeRates.EUR}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold text-xs">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        value={editEurRate}
                        onChange={(e) => setEditEurRate(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-black focus:outline-none focus:border-black"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-400 block font-mono">
                      Inverse: €1 EUR ≈ ${(1 / (parseFloat(editEurRate) || 0.92)).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Save Exchange Rates
                    </button>
                  </div>
                </form>

                {/* Sample Conversion Matrix */}
                <div className="pt-4 border-t border-neutral-200 space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">Live Storefront Sample Matrix</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[85, 110, 145, 195].map((usdVal) => (
                      <div key={usdVal} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <span className="font-bold text-black block">${usdVal} USD</span>
                        <div className="mt-1 space-y-0.5 text-[11px] text-neutral-500 font-medium">
                          <p>£{(usdVal * exchangeRates.GBP).toFixed(2)} GBP</p>
                          <p>€{(usdVal * exchangeRates.EUR).toFixed(2)} EUR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping & Delivery Settings */}
              <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">Shipping Policies & Delivery Tiers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">Free Shipping Over ($)</label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">Standard Dispatch ($)</label>
                    <input
                      type="number"
                      value={standardRate}
                      onChange={(e) => setStandardRate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">Express Dispatch ($)</label>
                    <input
                      type="number"
                      value={expressRate}
                      onChange={(e) => setExpressRate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">Sales Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-black"
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

      {/* 2. CUSTOMER ADD & EDIT MODAL (CRM) */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomerModal}
        initialData={editingCustomer}
      />

      {/* 3. ORDER PACKING SLIP MODAL */}
      {selectedInspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Packing Slip Manifest</span>
                <h3 className="text-xl font-nike font-black uppercase text-black mt-0.5">{selectedInspectOrder.orderNumber}</h3>
                <span className="text-xs text-neutral-500 font-medium">{selectedInspectOrder.date}</span>
              </div>
              <button
                onClick={() => setSelectedInspectOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Destination */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
              <span className="font-bold text-neutral-400 block uppercase text-[10px] tracking-wider">Shipment Destination</span>
              <p className="font-bold text-black text-sm">{selectedInspectOrder.shippingAddress.fullName}</p>
              <p className="text-neutral-600">{selectedInspectOrder.shippingAddress.street}</p>
              <p className="text-neutral-600">{selectedInspectOrder.shippingAddress.city}, {selectedInspectOrder.shippingAddress.country}</p>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <span className="font-bold text-neutral-400 block uppercase text-[10px] tracking-wider">Manifest Items</span>
              <div className="divide-y divide-neutral-100">
                {selectedInspectOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=150&q=80'}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                      />
                      <div>
                        <h4 className="font-bold text-black">{item.productName}</h4>
                        <span className="text-[11px] text-neutral-400">Qty: {item.quantity} • {item.size}</span>
                      </div>
                    </div>
                    <span className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-500 uppercase tracking-wider">Total Charged:</span>
              <span className="text-lg font-bold text-black font-nike">${selectedInspectOrder.total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setSelectedInspectOrder(null)}
              className="w-full py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-neutral-800 transition-colors"
            >
              Close Manifest
            </button>
          </div>
        </div>
      )}

      {/* 4. COMPREHENSIVE CUSTOMER PROFILE CRM MODAL */}
      {inspectCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                  {inspectCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-black text-base">{inspectCustomer.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      inspectCustomer.status === 'VIP' ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                    }`}>
                      {inspectCustomer.status || 'ACTIVE'}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 block">{inspectCustomer.email}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectCustomer(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Overview Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Spent</span>
                <span className="font-nike text-lg font-black text-black block mt-0.5">
                  ${orders.filter(o => o.shippingAddress.fullName.toLowerCase() === inspectCustomer.name.toLowerCase()).reduce((s, o) => s + o.total, inspectCustomer.totalSpent || 0).toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Orders Placed</span>
                <span className="font-nike text-lg font-black text-black block mt-0.5">
                  {orders.filter(o => o.shippingAddress.fullName.toLowerCase() === inspectCustomer.name.toLowerCase()).length || inspectCustomer.totalOrders || 0}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Preferred Size</span>
                <span className="text-xs font-bold text-black block mt-1">
                  {inspectCustomer.sizePreference || 'L/XL'}
                </span>
              </div>
            </div>

            {/* Address & Contact Info */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
              <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider block">Delivery & Contact</span>
              <div className="flex items-center gap-2 text-neutral-700">
                <Phone size={13} className="text-neutral-400" />
                <span>{inspectCustomer.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-700">
                <MapPin size={13} className="text-neutral-400 shrink-0 mt-0.5" />
                <span>{inspectCustomer.address || 'Standard dispatch addresses on file'}</span>
              </div>
            </div>

            {/* Past Orders for this Customer */}
            <div className="space-y-3">
              <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider block">Past Order History</span>
              {orders.filter(o => o.shippingAddress.fullName.toLowerCase() === inspectCustomer.name.toLowerCase()).length > 0 ? (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {orders
                    .filter(o => o.shippingAddress.fullName.toLowerCase() === inspectCustomer.name.toLowerCase())
                    .map((ord) => (
                      <div key={ord.id} className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50">
                        <div>
                          <span className="font-bold text-black block">{ord.orderNumber}</span>
                          <span className="text-[10px] text-neutral-400">{ord.date} • {ord.items.length} items</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-black block">${ord.total.toFixed(2)}</span>
                          <span className="text-[10px] font-bold uppercase">{ord.status}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic p-3 bg-neutral-50 rounded-xl">No prior order waybills recorded for this client.</p>
              )}
            </div>

            {/* Concierge Notes */}
            {inspectCustomer.notes && (
              <div className="p-4 bg-neutral-100 rounded-xl text-xs space-y-1">
                <span className="font-bold text-black uppercase text-[10px] tracking-wider block">Internal Concierge Notes</span>
                <p className="text-neutral-700 leading-relaxed">{inspectCustomer.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                onClick={() => {
                  const cust = inspectCustomer;
                  setInspectCustomer(null);
                  handleEditCustomer(cust);
                }}
                className="px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
              >
                Edit Client Profile
              </button>
              <button
                onClick={() => setInspectCustomer(null)}
                className="px-5 py-2.5 border border-neutral-300 text-black rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
