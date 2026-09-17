import { Order, InventoryItem, KPIStats } from '../types/product';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-8921',
    orderNumber: 'RLX-8921-EU',
    date: '2026-09-14',
    status: 'IN TRANSIT',
    total: 195.00,
    trackingNumber: '1Z9999999999999999',
    carrier: 'DHL Express Global',
    estimatedDelivery: 'Sep 18, 2026',
    shippingAddress: {
      fullName: 'Marcus Vance',
      street: '450 West 33rd Street, Fl 14',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    items: [
      {
        productName: 'MONOLITH 01 // ONYX',
        sku: 'RLX-SPEC-091',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80',
        price: 85.00,
        size: 'L/XL (58-61CM)',
        color: 'Onyx Black',
        quantity: 1
      },
      {
        productName: 'APEX STORM // GORE-TEX 3L',
        sku: 'RLX-SPEC-104',
        image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=400&q=80',
        price: 110.00,
        size: 'ONE SIZE',
        color: 'Cement Slate',
        quantity: 1
      }
    ]
  },
  {
    id: 'ord-8874',
    orderNumber: 'RLX-8874-US',
    date: '2026-09-02',
    status: 'DELIVERED',
    total: 95.00,
    trackingNumber: '9400111899562839210291',
    carrier: 'FedEx Priority',
    estimatedDelivery: 'Delivered on Sep 05, 2026',
    shippingAddress: {
      fullName: 'Marcus Vance',
      street: '450 West 33rd Street, Fl 14',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    items: [
      {
        productName: 'CIPHER 04 // CORDURA® 5-PANEL',
        sku: 'RLX-SPEC-118',
        image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=400&q=80',
        price: 95.00,
        size: 'ONE SIZE (ADJUSTABLE)',
        color: 'Obsidian Pitch',
        quantity: 1
      }
    ]
  },
  {
    id: 'ord-8712',
    orderNumber: 'RLX-8712-JP',
    date: '2026-08-19',
    status: 'DELIVERED',
    total: 160.00,
    trackingNumber: '78291039481029',
    carrier: 'DHL Express Direct',
    estimatedDelivery: 'Delivered on Aug 23, 2026',
    shippingAddress: {
      fullName: 'Marcus Vance',
      street: '450 West 33rd Street, Fl 14',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    items: [
      {
        productName: 'ARCHETYPE 03 // BONE',
        sku: 'RLX-SPEC-072',
        image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=400&q=80',
        price: 80.00,
        size: 'S/M (54-57CM)',
        color: 'Bone Off-White',
        quantity: 2
      }
    ]
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'MONOLITH 01 // ONYX',
    sku: 'RLX-SPEC-091',
    category: 'STRUCTURED',
    material: 'HEAVY TWILL',
    stock: 42,
    reorderPoint: 20,
    price: 85,
    status: 'IN STOCK'
  },
  {
    id: 'inv-2',
    name: 'APEX STORM // GORE-TEX 3L',
    sku: 'RLX-SPEC-104',
    category: 'TECHNICAL',
    material: 'GORE-TEX 3L',
    stock: 18,
    reorderPoint: 25,
    price: 110,
    status: 'LOW STOCK'
  },
  {
    id: 'inv-3',
    name: 'ARCHETYPE 03 // BONE',
    sku: 'RLX-SPEC-072',
    category: 'STRUCTURED',
    material: 'HEAVY TWILL',
    stock: 12,
    reorderPoint: 15,
    price: 80,
    status: 'LOW STOCK'
  },
  {
    id: 'inv-4',
    name: 'CIPHER 04 // CORDURA® 5-PANEL',
    sku: 'RLX-SPEC-118',
    category: 'CAMP_CAP',
    material: 'CORDURA® 500D',
    stock: 24,
    reorderPoint: 15,
    price: 95,
    status: 'IN STOCK'
  },
  {
    id: 'inv-5',
    name: 'AERORUNNER 05 // RIPSTOP',
    sku: 'RLX-SPEC-132',
    category: 'RUNNER',
    material: 'RIPSTOP NYLON',
    stock: 35,
    reorderPoint: 20,
    price: 75,
    status: 'IN STOCK'
  },
  {
    id: 'inv-6',
    name: 'DELTA THERMAL // SOFTSHELL',
    sku: 'RLX-SPEC-150',
    category: 'TECHNICAL',
    material: 'TECHNICAL SOFTSHELL',
    stock: 4,
    reorderPoint: 15,
    price: 105,
    status: 'RESTOCK PENDING'
  }
];

export const MOCK_KPIS: KPIStats = {
  grossRevenue: 84320,
  activeOrders: 14,
  unitsSold: 948,
  lowStockCount: 3
};
