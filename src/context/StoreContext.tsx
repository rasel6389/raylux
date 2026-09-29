import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Order,
  Product,
  InventoryItem,
  HeroBannerConfig,
  AnnouncementConfig,
  EditorialSectionConfig,
  MarqueeTickerConfig,
  PageSectionItem,
  PageSectionType,
  HeroBlockType,
} from '../types/product';
import { MOCK_ORDERS, MOCK_INVENTORY } from '../data/dashboard';
import { PRODUCTS } from '../data/products';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const DEFAULT_HERO_BLOCKS: { id: HeroBlockType; label: string; active: boolean }[] = [
  { id: 'badge', label: 'Floating Status Badge', active: true },
  { id: 'super_title', label: 'Category / Super Headline', active: true },
  { id: 'headline', label: 'Monumental Main Title', active: true },
  { id: 'description', label: 'Narrative Description', active: true },
  { id: 'buttons', label: 'Action CTA Buttons', active: true },
];

export const DEFAULT_HERO_CONFIG: HeroBannerConfig = {
  badgeText: 'NEW RELEASE // MONOLITH SERIES 2026',
  badgeActive: true,
  topRightCaptionLine1: 'ARCHITECTURAL TECHNICAL HEADWEAR',
  topRightCaptionLine2: 'DESIGNED FOR UNCOMPROMISED PRECISION',
  superTitle: 'RAYLUXX TECHNICAL HEADWEAR LAB',
  mainTitle: 'ENGINEERED TO LEAD',
  description: 'Series 01 Architectural Headwear. Bonded waterproof seams, genuine GORE-TEX 3L membranes, and high-density 340 GSM twills designed with relentless discipline.',
  imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=2400&q=85',
  primaryBtnText: 'SHOP THE COLLECTION',
  primaryBtnAction: 'shop',
  secondaryBtnText: 'VIEW 2026 LOOKBOOK',
  secondaryBtnAction: 'lookbook',
  secondaryBtnActive: true,
  layoutStyle: 'cinematic-fullscreen',
  heightMode: '90vh',
  contentAlignment: 'left',
  overlayDarkness: 40,
  overlayGradient: true,
  titleSize: 'monumental',
  primaryBtnStyle: 'white',
  secondaryBtnStyle: 'outline',
  blockOrder: ['badge', 'super_title', 'headline', 'description', 'buttons'],
};

export const DEFAULT_PAGE_SECTIONS: PageSectionItem[] = [
  {
    id: 'sec-hero',
    type: 'hero',
    title: 'Monumental Hero Canvas',
    active: true,
  },
  {
    id: 'sec-ticker',
    type: 'ticker',
    title: 'Scrolling Spec Ticker',
    active: true,
  },
  {
    id: 'sec-products-grid',
    type: 'products_grid',
    title: 'New Arrivals Product Grid',
    active: true,
    settings: {
      superTitle: 'THE LATEST DROPS',
      title: 'NEW ARRIVALS',
      productCount: 4,
      showExploreAll: true,
    },
  },
  {
    id: 'sec-editorial',
    type: 'editorial_split',
    title: 'Philosophy & Technical Specs',
    active: true,
  },
  {
    id: 'sec-spotlight',
    type: 'category_spotlight',
    title: 'Shop by Division (Curated Pillars)',
    active: true,
    settings: {
      superTitle: 'SHOP BY DIVISION',
      title: 'CURATED PILLARS',
    },
  },
  {
    id: 'sec-lookbook',
    type: 'lookbook_showcase',
    title: 'Cinematic Lookbook Showcase',
    active: true,
    settings: {
      tag: 'ARCHITECTURAL EDITORIAL // 2026',
      title: 'MONOLITH FIELD STUDY',
      subtitle: 'Engineered for high-altitude brutalist topography and extreme precipitation endurance.',
      buttonText: 'EXPLORE FULL LOOKBOOK',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85',
    },
  },
  {
    id: 'sec-testimonials',
    type: 'testimonials',
    title: 'Client Endorsements & Press',
    active: true,
    settings: {
      superTitle: 'VERIFIED DISPATCH CLIENTS',
      title: 'TESTED IN EXTREMES',
    },
  },
  {
    id: 'sec-newsletter',
    type: 'newsletter',
    title: 'VIP Vault Drops & Dispatch',
    active: true,
    settings: {
      superTitle: 'EXCLUSIVE ACCESS',
      title: 'JOIN THE RAYLUXX GUILD',
      subtitle: 'Receive priority allocation notices 48 hours prior to public drops.',
    },
  },
];

export const DEFAULT_ANNOUNCEMENT_CONFIG: AnnouncementConfig = {
  active: true,
  text: 'Members: Complimentary Worldwide Dispatch on orders over $150 • 30-Day Risk-Free Returns.',
  discountCode: 'MEMBER20',
  linkText: 'Join or Sign In',
};

export const DEFAULT_EDITORIAL_CONFIG: EditorialSectionConfig = {
  active: true,
  superTitle: 'PHILOSOPHY OF PERFORMANCE',
  title: 'DISCIPLINED FORM. ZERO COMPROMISE.',
  description: 'Traditional headwear relies on decorative crests, fragile crowns, and cheap synthetics. RAYLUXX discards ornament in favor of architectural purity. Engineered for endurance athletes, architects, and urban commuters who demand relentless quality.',
  imageUrl: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80',
  specBadgeTag: 'TEXTILE SPECIFICATION',
  specBadgeTitle: 'CORDURA® 500D + GORE-TEX HYBRID',
  specBadgeSub: '28,000MM HYDROSTATIC HEAD',
  pillar1Title: 'STORM PROOF',
  pillar1Desc: 'Seam-sealed tape blocks high-velocity precipitation.',
  pillar2Title: 'AERODYNAMIC PROFILE',
  pillar2Desc: 'Laser-cut ventilation prevents crown heat retention.',
  pillar3Title: 'ZERO DECORATIVE RIVETS',
  pillar3Desc: 'Stripped of non-functional hardware for ultralight feel.',
};

export const DEFAULT_TICKER_CONFIG: MarqueeTickerConfig = {
  active: true,
  items: [
    'GORE-TEX 3L MEMBRANE',
    'LASER-PERFORATED AERODYNAMIC VENTS',
    '340 GSM HIGH-DENSITY HEAVY TWILL',
    'CORDURA® 500D MIL-SPEC WEAVE',
    'COMPLIMENTARY EXPRESS DISPATCH OVER $150',
    'AUTHENTICATED SAME-DAY DISPATCH',
  ],
};

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
  heroConfig: HeroBannerConfig;
  updateHeroConfig: (config: Partial<HeroBannerConfig>) => void;
  resetHeroConfig: () => void;
  announcementConfig: AnnouncementConfig;
  updateAnnouncementConfig: (config: Partial<AnnouncementConfig>) => void;
  editorialConfig: EditorialSectionConfig;
  updateEditorialConfig: (config: Partial<EditorialSectionConfig>) => void;
  resetEditorialConfig: () => void;
  tickerConfig: MarqueeTickerConfig;
  updateTickerConfig: (config: Partial<MarqueeTickerConfig>) => void;
  resetTickerConfig: () => void;
  pageSections: PageSectionItem[];
  updatePageSections: (sections: PageSectionItem[]) => void;
  resetPageSections: () => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  toggleSectionActive: (id: string) => void;
  updateSectionSettings: (id: string, newSettings: Record<string, any>) => void;
  addSection: (type: PageSectionType, title?: string) => void;
  deleteSection: (id: string) => void;
}

const ORDERS_KEY = 'raylux_orders_v2';
const PRODUCTS_KEY = 'raylux_products_v2';
const INVENTORY_KEY = 'raylux_inventory_v2';
const WISHLIST_KEY = 'raylux_wishlist_v2';
const PAGE_SECTIONS_KEY = 'raylux_page_sections_v2';

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

  const HERO_CONFIG_KEY = 'raylux_hero_banner_config_v2';
  const ANNOUNCEMENT_CONFIG_KEY = 'raylux_announcement_config_v2';
  const EDITORIAL_CONFIG_KEY = 'raylux_editorial_config_v2';
  const TICKER_CONFIG_KEY = 'raylux_ticker_config_v2';

  const [heroConfig, setHeroConfig] = useState<HeroBannerConfig>(() => {
    try {
      const saved = localStorage.getItem(HERO_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.superTitle === 'RAYLUX TECHNICAL HEADWEAR LAB') {
          parsed.superTitle = 'RAYLUXX TECHNICAL HEADWEAR LAB';
        }
        return { ...DEFAULT_HERO_CONFIG, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_HERO_CONFIG;
  });

  const [announcementConfig, setAnnouncementConfig] = useState<AnnouncementConfig>(() => {
    try {
      const saved = localStorage.getItem(ANNOUNCEMENT_CONFIG_KEY);
      if (saved) return { ...DEFAULT_ANNOUNCEMENT_CONFIG, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_ANNOUNCEMENT_CONFIG;
  });

  const [editorialConfig, setEditorialConfig] = useState<EditorialSectionConfig>(() => {
    try {
      const saved = localStorage.getItem(EDITORIAL_CONFIG_KEY);
      if (saved) return { ...DEFAULT_EDITORIAL_CONFIG, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_EDITORIAL_CONFIG;
  });

  const [tickerConfig, setTickerConfig] = useState<MarqueeTickerConfig>(() => {
    try {
      const saved = localStorage.getItem(TICKER_CONFIG_KEY);
      if (saved) return { ...DEFAULT_TICKER_CONFIG, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_TICKER_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(HERO_CONFIG_KEY, JSON.stringify(heroConfig));
    } catch {
      // ignore
    }
  }, [heroConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(ANNOUNCEMENT_CONFIG_KEY, JSON.stringify(announcementConfig));
    } catch {
      // ignore
    }
  }, [announcementConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(EDITORIAL_CONFIG_KEY, JSON.stringify(editorialConfig));
    } catch {
      // ignore
    }
  }, [editorialConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(TICKER_CONFIG_KEY, JSON.stringify(tickerConfig));
    } catch {
      // ignore
    }
  }, [tickerConfig]);

  const [pageSections, setPageSections] = useState<PageSectionItem[]>(() => {
    try {
      const saved = localStorage.getItem(PAGE_SECTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_PAGE_SECTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PAGE_SECTIONS_KEY, JSON.stringify(pageSections));
    } catch {
      // ignore
    }
  }, [pageSections]);

  const updatePageSections = (newSections: PageSectionItem[]) => {
    setPageSections(newSections);
  };

  const resetPageSections = () => {
    setPageSections(DEFAULT_PAGE_SECTIONS);
    try {
      localStorage.removeItem(PAGE_SECTIONS_KEY);
    } catch {
      // ignore
    }
  };

  const reorderSections = (startIndex: number, endIndex: number) => {
    setPageSections((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const toggleSectionActive = (id: string) => {
    setPageSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, active: !sec.active } : sec))
    );
  };

  const updateSectionSettings = (id: string, newSettings: Record<string, any>) => {
    setPageSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? { ...sec, settings: { ...(sec.settings || {}), ...newSettings } }
          : sec
      )
    );
  };

  const addSection = (type: PageSectionType, title?: string) => {
    const newId = `sec-${type}-${Date.now().toString(36)}`;
    const titlesMap: Record<PageSectionType, string> = {
      hero: 'Monumental Hero Canvas',
      ticker: 'Scrolling Spec Ticker',
      products_grid: 'Product Catalog Grid',
      editorial_split: 'Philosophy & Technical Specs',
      category_spotlight: 'Curated Pillars Spotlight',
      lookbook_showcase: 'Cinematic Lookbook Showcase',
      testimonials: 'Client Testimonials & Press',
      newsletter: 'VIP Vault Dispatch Form',
      custom_banner: 'Custom Promotion Banner',
    };
    const defaultSettingsMap: Record<PageSectionType, Record<string, any>> = {
      hero: {},
      ticker: {},
      products_grid: {
        superTitle: 'THE LATEST DROPS',
        title: 'NEW ARRIVALS',
        productCount: 4,
        showExploreAll: true,
      },
      editorial_split: {},
      category_spotlight: {
        superTitle: 'SHOP BY DIVISION',
        title: 'CURATED PILLARS',
      },
      lookbook_showcase: {
        tag: 'ARCHITECTURAL EDITORIAL // 2026',
        title: 'MONOLITH FIELD STUDY',
        subtitle: 'Engineered for high-altitude brutalist topography and extreme precipitation endurance.',
        buttonText: 'EXPLORE FULL LOOKBOOK',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85',
      },
      testimonials: {
        superTitle: 'VERIFIED DISPATCH CLIENTS',
        title: 'TESTED IN EXTREMES',
      },
      newsletter: {
        superTitle: 'EXCLUSIVE ACCESS',
        title: 'JOIN THE RAYLUXX GUILD',
        subtitle: 'Receive priority allocation notices 48 hours prior to public drops.',
      },
      custom_banner: {
        superTitle: 'LIMITED ALLOCATION',
        title: 'GLOBAL COLD-CLIMATE ARCHIVE',
        subtitle: 'Bonded 3-layer seams rated for sub-zero wind chills.',
        buttonText: 'DISCOVER ARCHIVE',
        bgTheme: 'dark',
      },
    };

    const newSec: PageSectionItem = {
      id: newId,
      type,
      title: title || titlesMap[type] || 'New Section',
      active: true,
      settings: defaultSettingsMap[type] || {},
    };

    setPageSections((prev) => [...prev, newSec]);
  };

  const deleteSection = (id: string) => {
    setPageSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  const updateHeroConfig = (config: Partial<HeroBannerConfig>) => {
    setHeroConfig((prev) => ({ ...prev, ...config }));
  };

  const resetHeroConfig = () => {
    setHeroConfig(DEFAULT_HERO_CONFIG);
  };

  const updateAnnouncementConfig = (config: Partial<AnnouncementConfig>) => {
    setAnnouncementConfig((prev) => ({ ...prev, ...config }));
  };

  const updateEditorialConfig = (config: Partial<EditorialSectionConfig>) => {
    setEditorialConfig((prev) => ({ ...prev, ...config }));
  };

  const resetEditorialConfig = () => {
    setEditorialConfig(DEFAULT_EDITORIAL_CONFIG);
  };

  const updateTickerConfig = (config: Partial<MarqueeTickerConfig>) => {
    setTickerConfig((prev) => ({ ...prev, ...config }));
  };

  const resetTickerConfig = () => {
    setTickerConfig(DEFAULT_TICKER_CONFIG);
  };

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
        heroConfig,
        updateHeroConfig,
        resetHeroConfig,
        announcementConfig,
        updateAnnouncementConfig,
        editorialConfig,
        updateEditorialConfig,
        resetEditorialConfig,
        tickerConfig,
        updateTickerConfig,
        resetTickerConfig,
        pageSections,
        updatePageSections,
        resetPageSections,
        reorderSections,
        toggleSectionActive,
        updateSectionSettings,
        addSection,
        deleteSection,
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
