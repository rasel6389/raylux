import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types/product';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, selectedSize: string, selectedColor: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;
  freeShippingProgress: number;
  promoCode: string | null;
  discountAmount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 150;
const STORAGE_KEY = 'raylux_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, selectedSize: string, selectedColor: string, quantity: number = 1) => {
    const itemKey = `${product.id}__${selectedSize}__${selectedColor}`;
    
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemKey,
          product,
          selectedSize,
          selectedColor,
          quantity,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyPromoCode = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'RAYLUXX10' || cleaned === 'RAYLUX10' || cleaned === 'NIKE10') {
      setPromoCode(cleaned);
      setDiscountPercent(0.10);
      return { success: true, message: '10% ARCHIVE DISCOUNT APPLIED' };
    } else if (cleaned === 'MONOLITH20' || cleaned === 'MEMBER20') {
      setPromoCode(cleaned);
      setDiscountPercent(0.20);
      return { success: true, message: '20% MEMBER EXCLUSIVE DISCOUNT APPLIED' };
    } else {
      // Check dynamic promo codes from Admin Console
      try {
        const saved = localStorage.getItem('raylux_promo_codes_v2');
        if (saved) {
          const promoList: Array<{ code: string; percent: number; active: boolean }> = JSON.parse(saved);
          const found = promoList.find(p => p.code.toUpperCase() === cleaned && p.active);
          if (found) {
            setPromoCode(found.code);
            setDiscountPercent(found.percent / 100);
            return { success: true, message: `${found.percent}% PROMO CODE APPLIED` };
          }
        }
      } catch {
        // ignore
      }
      return { success: false, message: 'INVALID PROMO CODE' };
    }
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setDiscountPercent(0);
  };

  const discountAmount = subtotal * discountPercent;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountUntilFreeShipping,
        freeShippingProgress,
        promoCode,
        discountAmount,
        applyPromoCode,
        removePromoCode,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
