import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { AuthModal } from './components/common/AuthModal';
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
      <div className="min-h-screen bg-white text-black font-sans">
        <CheckoutPage />
        <AuthModal />
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
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <NavigationProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </NavigationProvider>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;

