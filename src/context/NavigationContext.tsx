import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PageRoute = 'home' | 'shop' | 'pdp' | 'dashboard' | 'checkout' | 'lookbook' | 'admin';
export type DashboardTab = 'user' | 'wishlist' | 'addresses' | 'payments' | 'settings' | 'orders' | 'tickets';
export type AdminTab = 'overview' | 'orders' | 'inventory' | 'hero_cms' | 'customers' | 'dispatches' | 'discounts' | 'support' | 'ai_agent' | 'settings';

interface NavigationContextType {
  currentPage: PageRoute;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  selectedProductId: string;
  dashboardTab: DashboardTab;
  shopCategoryFilter: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdminLoggedIn: boolean;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;
  navigateTo: (page: PageRoute, params?: { productId?: string; tab?: DashboardTab; adminTab?: AdminTab; category?: string; query?: string }) => void;
  goToProduct: (productId: string) => void;
  goToShop: (category?: string, query?: string) => void;
  goToDashboard: (tab?: DashboardTab) => void;
  goToCheckout: () => void;
  goToLookbook: () => void;
  goToAdmin: (tab?: AdminTab | React.MouseEvent) => void;
  goToHome: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Helper to parse initial route from URL (pathname, search query, or hash)
const parseInitialRoute = (): {
  page: PageRoute;
  adminTab: AdminTab;
  dashboardTab: DashboardTab;
  productId: string;
  category: string | null;
} => {
  let page: PageRoute = 'home';
  let adminTab: AdminTab = 'overview';
  let dashboardTab: DashboardTab = 'user';
  let productId = 'rlx-01-onyx';
  let category: string | null = null;

  try {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    // Check for Admin URL: /admin or #admin or #/admin
    if (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash.startsWith('#admin') ||
      hash.startsWith('#/admin')
    ) {
      page = 'admin';
      const qTab = (searchParams.get('tab') || '').toLowerCase();
      const validAdminTabs: AdminTab[] = [
        'overview',
        'orders',
        'inventory',
        'hero_cms',
        'customers',
        'dispatches',
        'discounts',
        'support',
        'ai_agent',
        'settings',
      ];
      if (validAdminTabs.includes(qTab as AdminTab)) {
        adminTab = qTab as AdminTab;
      }
    } else if (path === '/shop' || hash === '#shop' || hash.startsWith('#/shop')) {
      page = 'shop';
      category = searchParams.get('category') || null;
    } else if (path === '/checkout' || hash === '#checkout' || hash.startsWith('#/checkout')) {
      page = 'checkout';
    } else if (path === '/dashboard' || hash === '#dashboard' || hash.startsWith('#/dashboard')) {
      page = 'dashboard';
      const dTab = (searchParams.get('tab') || '').toLowerCase();
      const validDashboardTabs: DashboardTab[] = [
        'user',
        'wishlist',
        'addresses',
        'payments',
        'settings',
        'orders',
        'tickets',
      ];
      if (validDashboardTabs.includes(dTab as DashboardTab)) {
        dashboardTab = dTab as DashboardTab;
      }
    } else if (path === '/lookbook' || hash === '#lookbook' || hash.startsWith('#/lookbook')) {
      page = 'lookbook';
    } else if (path.startsWith('/product/') || path.startsWith('/p/')) {
      page = 'pdp';
      const segs = path.split('/');
      const lastSeg = segs[segs.length - 1];
      if (lastSeg) productId = lastSeg;
    }
  } catch {
    // fallback
  }

  return { page, adminTab, dashboardTab, productId, category };
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = parseInitialRoute();

  const [currentPage, setCurrentPage] = useState<PageRoute>(initial.page);
  const [adminTab, setAdminTabState] = useState<AdminTab>(initial.adminTab);
  const [selectedProductId, setSelectedProductId] = useState<string>(initial.productId);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>(initial.dashboardTab);
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string | null>(initial.category);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('raylux_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // URL synchronization using HTML5 History API
  const syncBrowserUrl = useCallback((
    page: PageRoute,
    params?: { adminTab?: AdminTab; dashboardTab?: DashboardTab; productId?: string; category?: string | null }
  ) => {
    try {
      let targetPath = '/';
      if (page === 'admin') {
        const tab = params?.adminTab || adminTab;
        targetPath = tab && tab !== 'overview' ? `/admin?tab=${tab}` : '/admin';
      } else if (page === 'shop') {
        targetPath = params?.category ? `/shop?category=${encodeURIComponent(params.category)}` : '/shop';
      } else if (page === 'dashboard') {
        const dTab = params?.dashboardTab || dashboardTab;
        targetPath = dTab && dTab !== 'user' ? `/dashboard?tab=${dTab}` : '/dashboard';
      } else if (page === 'checkout') {
        targetPath = '/checkout';
      } else if (page === 'lookbook') {
        targetPath = '/lookbook';
      } else if (page === 'pdp') {
        const pid = params?.productId || selectedProductId;
        targetPath = `/product/${pid}`;
      }

      const currentPathAndSearch = window.location.pathname + window.location.search;
      if (currentPathAndSearch !== targetPath) {
        window.history.pushState({ page, ...params }, '', targetPath);
      }
    } catch {
      // ignore
    }
  }, [adminTab, dashboardTab, selectedProductId]);

  // Handle browser Back & Forward button events
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseInitialRoute();
      setCurrentPage(parsed.page);
      setAdminTabState(parsed.adminTab);
      setDashboardTab(parsed.dashboardTab);
      setSelectedProductId(parsed.productId);
      setShopCategoryFilter(parsed.category);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ensure initial URL matches the state if user loaded on /admin etc.
  useEffect(() => {
    syncBrowserUrl(currentPage, { adminTab, dashboardTab, productId: selectedProductId, category: shopCategoryFilter });
  }, []);

  // Scroll to top on page or product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedProductId]);

  const loginAdmin = (pass: string) => {
    const cleaned = pass.trim();
    if (cleaned === 'raylux2026' || cleaned === 'admin') {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem('raylux_admin_auth', 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('raylux_admin_auth');
    } catch {
      // ignore
    }
  };

  const setAdminTab = (tab: AdminTab) => {
    setAdminTabState(tab);
    if (currentPage === 'admin') {
      syncBrowserUrl('admin', { adminTab: tab });
    }
  };

  const navigateTo = (
    page: PageRoute,
    params?: { productId?: string; tab?: DashboardTab; adminTab?: AdminTab; category?: string; query?: string }
  ) => {
    if (params?.productId) setSelectedProductId(params.productId);
    if (params?.tab) setDashboardTab(params.tab);
    if (params?.adminTab) setAdminTabState(params.adminTab);
    if (params?.category !== undefined) setShopCategoryFilter(params.category);
    if (params?.query !== undefined) setSearchQuery(params.query);
    setCurrentPage(page);
    syncBrowserUrl(page, {
      adminTab: params?.adminTab,
      dashboardTab: params?.tab,
      productId: params?.productId,
      category: params?.category,
    });
  };

  const goToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('pdp');
    syncBrowserUrl('pdp', { productId });
  };

  const goToShop = (category?: string, query?: string) => {
    setShopCategoryFilter(category || null);
    if (query !== undefined) setSearchQuery(query);
    setCurrentPage('shop');
    syncBrowserUrl('shop', { category: category || null });
  };

  const goToDashboard = (tab: DashboardTab = 'user') => {
    setDashboardTab(tab);
    setCurrentPage('dashboard');
    syncBrowserUrl('dashboard', { dashboardTab: tab });
  };

  const goToCheckout = () => {
    setCurrentPage('checkout');
    syncBrowserUrl('checkout');
  };

  const goToLookbook = () => {
    setCurrentPage('lookbook');
    syncBrowserUrl('lookbook');
  };

  const goToAdmin = (tab?: AdminTab | React.MouseEvent) => {
    const resolvedTab: AdminTab = typeof tab === 'string' ? tab : 'overview';
    setAdminTabState(resolvedTab);
    setCurrentPage('admin');
    syncBrowserUrl('admin', { adminTab: resolvedTab });
  };

  const goToHome = () => {
    setCurrentPage('home');
    syncBrowserUrl('home');
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        adminTab,
        setAdminTab,
        selectedProductId,
        dashboardTab,
        shopCategoryFilter,
        searchQuery,
        setSearchQuery,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        navigateTo,
        goToProduct,
        goToShop,
        goToDashboard,
        goToCheckout,
        goToLookbook,
        goToAdmin,
        goToHome,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

