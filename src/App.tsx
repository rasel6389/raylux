import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { TicketProvider } from './context/TicketContext';
import { CartProvider } from './context/CartContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { AuthModal } from './components/common/AuthModal';
import { AIAgentWidget } from './components/common/AIAgentWidget';
import { CurrencyModal } from './components/common/CurrencyModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LookbookPage } from './pages/LookbookPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { currentPage } = useNavigation();

  if (currentPage === 'checkout') {
    return (
      <div className="min-h-screen bg-white text-black font-sans relative">
        <CheckoutPage />
        <AuthModal />
        <CurrencyModal />
        <AIAgentWidget />
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-white text-black font-sans">
        <AdminPage />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans relative">
      <Navbar />
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'pdp' && <ProductDetailPage />}
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'lookbook' && <LookbookPage />}
      </main>
      <CartDrawer />
      <Footer />
      <AuthModal />
      <CurrencyModal />
      <AIAgentWidget />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <TicketProvider>
          <StoreProvider>
            <NavigationProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </NavigationProvider>
          </StoreProvider>
        </TicketProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
