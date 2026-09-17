import React, { createContext, useContext, useState, useEffect } from 'react';

export type PageRoute = 'home' | 'shop' | 'pdp' | 'dashboard' | 'checkout' | 'lookbook' | 'admin';
export type DashboardTab = 'user' | 'wishlist' | 'addresses' | 'payments' | 'settings' | 'orders' | 'tickets';

interface NavigationContextType {
  currentPage: PageRoute;
  selectedProductId: string;
  dashboardTab: DashboardTab;
  shopCategoryFilter: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdminLoggedIn: boolean;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;
  navigateTo: (page: PageRoute, params?: { productId?: string; tab?: DashboardTab; category?: string; query?: string }) => void;
  goToProduct: (productId: string) => void;
  goToShop: (category?: string, query?: string) => void;
  goToDashboard: (tab?: DashboardTab) => void;
  goToCheckout: () => void;
  goToLookbook: () => void;
  goToAdmin: () => void;
  goToHome: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('rlx-01-onyx');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('user');
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('raylux_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Scroll to top on page change
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

  const navigateTo = (
    page: PageRoute,
    params?: { productId?: string; tab?: DashboardTab; category?: string; query?: string }
  ) => {
    if (params?.productId) setSelectedProductId(params.productId);
    if (params?.tab) setDashboardTab(params.tab);
    if (params?.category !== undefined) setShopCategoryFilter(params.category);
    if (params?.query !== undefined) setSearchQuery(params.query);
    setCurrentPage(page);
  };

  const goToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('pdp');
  };

  const goToShop = (category?: string, query?: string) => {
    setShopCategoryFilter(category || null);
    if (query !== undefined) setSearchQuery(query);
    setCurrentPage('shop');
  };

  const goToDashboard = (tab: DashboardTab = 'user') => {
    setDashboardTab(tab);
    setCurrentPage('dashboard');
  };

  const goToCheckout = () => {
    setCurrentPage('checkout');
  };

  const goToLookbook = () => {
    setCurrentPage('lookbook');
  };

  const goToAdmin = () => {
    setCurrentPage('admin');
  };

  const goToHome = () => {
    setCurrentPage('home');
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
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
