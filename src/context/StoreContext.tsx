import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Product, InventoryItem } from '../types/product';
import { MOCK_ORDERS, MOCK_INVENTORY } from '../data/dashboard';
import { PRODUCTS } from '../data/products';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface StoreContextType {
  orders: Order[];
  products: Product[];
  inventory: InventoryItem[];
  wishlist: string[];
  placeOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>) => Order;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  updateOrderTracking: (orderId: string, carrier: string, trackingNumber: string) => void;
  addProduct: (itemData: Omit<InventoryItem, 'id'> & { images?: string[]; description?: string; profile?: string }) => void;
  updateProduct: (inventoryId: string, updatedData: Partial<InventoryItem> & { images?: string[]; description?: string; profile?: string }) => void;
  restockProduct: (inventoryId: string, amount?: number) => void;
  deleteProduct: (inventoryId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const ORDERS_KEY = 'raylux_orders_v2';
const PRODUCTS_KEY = 'raylux_products_v2';
const INVENTORY_KEY = 'raylux_inventory_v2';
const WISHLIST_KEY = 'raylux_wishlist_v2';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_ORDERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PRODUCTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_INVENTORY;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [PRODUCTS[0].id, PRODUCTS[1].id, PRODUCTS[3].id];
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    } catch {
      // ignore
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const placeOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const countryCode = orderData.shippingAddress.country === 'Japan' ? 'JP' : orderData.shippingAddress.country === 'Germany' ? 'EU' : 'US';
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `RLX-${randomNum}-${countryCode}`,
      date: new Date().toISOString().split('T')[0],
      status: 'PROCESSING',
    };

    // Prepend to local orders
    setOrders((prev) => [newOrder, ...prev]);

    // Sync to Cloud Firestore (background)
    try {
      setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((err) => {
        console.debug('Firestore order sync deferred:', err.message || err);
      });
    } catch {
      // ignore
    }

    // Deduct inventory and product stock
    orderData.items.forEach((item) => {
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.sku === item.sku || inv.name.toLowerCase() === item.productName.toLowerCase()) {
            const nextStock = Math.max(0, inv.stock - item.quantity);
            return {
              ...inv,
              stock: nextStock,
              status: nextStock <= inv.reorderPoint ? 'LOW STOCK' : 'IN STOCK',
            };
          }
          return inv;
        })
      );

      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.sku === item.sku || prod.name.toLowerCase() === item.productName.toLowerCase()) {
            return {
              ...prod,
              stockCount: Math.max(0, prod.stockCount - item.quantity),
            };
          }
          return prod;
        })
      );
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    // Sync to Cloud Firestore (background)
    try {
      updateDoc(doc(db, 'orders', orderId), { status: newStatus }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const updateOrderTracking = (orderId: string, carrier: string, trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, carrier, trackingNumber } : ord))
    );

    // Sync to Cloud Firestore (background)
    try {
      updateDoc(doc(db, 'orders', orderId), { carrier, trackingNumber }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const addProduct = (
    itemData: Omit<InventoryItem, 'id'> & { images?: string[]; description?: string; profile?: string }
  ) => {
    const id = `inv-${Date.now()}`;
    const newInventoryItem: InventoryItem = {
      id,
      name: itemData.name,
      sku: itemData.sku,
      category: itemData.category,
      material: itemData.material,
      price: itemData.price,
      stock: itemData.stock,
      reorderPoint: itemData.reorderPoint,
      status: itemData.stock <= itemData.reorderPoint ? 'LOW STOCK' : 'IN STOCK',
    };

    setInventory((prev) => [newInventoryItem, ...prev]);

    // Also add to storefront products
    const defaultImage = itemData.images?.[0] || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: itemData.name,
      series: 'SERIES 01 // ARCHITECTURAL',
      sku: itemData.sku,
      price: itemData.price,
      tagline: 'Engineered high-density technical headwear silhouette.',
      description: itemData.description || 'High-performance technical cap precision-crafted for endurance, architectural discipline, and structural permanence.',
      category: itemData.category,
      profile: (itemData.profile as any) || '6-PANEL HIGH',
      material: itemData.material as any,
      colors: [
        { name: 'Onyx Black', hex: '#0A0A0A' },
        { name: 'Cement Slate', hex: '#71717A' }
      ],
      sizes: ['S/M (54-57CM)', 'L/XL (58-61CM)', 'ONE SIZE'],
      images: itemData.images && itemData.images.length > 0 ? itemData.images : [defaultImage, defaultImage],
      badge: 'NEW DROP',
      specs: {
        material: itemData.material,
        weightGsm: '340 GSM',
        waterproofRating: '28,000mm DWR',
        closureSystem: 'Fidlock Magnetic Clasp',
        ventilation: 'Laser Perforated Crown',
        brimStructure: 'Structural Arch Pre-Curved',
        origin: 'Tokyo Assembly Lab',
      },
      featured: true,
      newArrival: true,
      stockCount: itemData.stock,
    };

    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (
    inventoryId: string,
    updatedData: Partial<InventoryItem> & { images?: string[]; description?: string; profile?: string }
  ) => {
    let matchedSku = '';
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === inventoryId) {
          matchedSku = item.sku;
          const nextStock = updatedData.stock !== undefined ? updatedData.stock : item.stock;
          const nextReorder = updatedData.reorderPoint !== undefined ? updatedData.reorderPoint : item.reorderPoint;
          return {
            ...item,
            ...updatedData,
            name: updatedData.name ? updatedData.name.toUpperCase().trim() : item.name,
            sku: updatedData.sku ? updatedData.sku.toUpperCase().trim() : item.sku,
            stock: nextStock,
            reorderPoint: nextReorder,
            status: nextStock <= nextReorder ? 'LOW STOCK' : 'IN STOCK',
          };
        }
        return item;
      })
    );

    // Synchronize matching storefront product
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.sku === matchedSku || (updatedData.sku && prod.sku === updatedData.sku)) {
          return {
            ...prod,
            name: updatedData.name ? updatedData.name.toUpperCase().trim() : prod.name,
            sku: updatedData.sku ? updatedData.sku.toUpperCase().trim() : prod.sku,
            price: updatedData.price !== undefined ? updatedData.price : prod.price,
            category: (updatedData.category as any) || prod.category,
            material: (updatedData.material as any) || prod.material,
            profile: (updatedData.profile as any) || prod.profile,
            description: updatedData.description || prod.description,
            stockCount: updatedData.stock !== undefined ? updatedData.stock : prod.stockCount,
            images: updatedData.images && updatedData.images.length > 0 ? updatedData.images : prod.images,
          };
        }
        return prod;
      })
    );
  };

  const restockProduct = (inventoryId: string, amount: number = 25) => {
    let affectedSku = '';
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === inventoryId) {
          affectedSku = item.sku;
          const newStock = item.stock + amount;
          return {
            ...item,
            stock: newStock,
            status: 'IN STOCK',
          };
        }
        return item;
      })
    );

    if (affectedSku) {
      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.sku === affectedSku) {
            return {
              ...prod,
              stockCount: prod.stockCount + amount,
            };
          }
          return prod;
        })
      );
    }
  };

  const deleteProduct = (inventoryId: string) => {
    const itemToDelete = inventory.find((i) => i.id === inventoryId);
    setInventory((prev) => prev.filter((i) => i.id !== inventoryId));
    if (itemToDelete) {
      setProducts((prev) => prev.filter((p) => p.sku !== itemToDelete.sku));
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <StoreContext.Provider
      value={{
        orders,
        products,
        inventory,
        wishlist,
        placeOrder,
        updateOrderStatus,
        updateOrderTracking,
        addProduct,
        updateProduct,
        restockProduct,
        deleteProduct,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
