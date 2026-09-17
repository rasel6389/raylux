export type CapCategory = 'TECHNICAL' | 'STRUCTURED' | 'RUNNER' | 'CAMP_CAP' | 'COLLABORATION';

export type CapProfile = '5-PANEL LOW' | '6-PANEL HIGH' | 'UNSTRUCTURED RUNNER' | 'MODULAR CAMP';

export type CapMaterial = 'GORE-TEX 3L' | 'CORDURA® 500D' | 'HEAVY TWILL' | 'RIPSTOP NYLON' | 'TECHNICAL SOFTSHELL';

export interface CapColor {
  name: string;
  hex: string;
  image?: string;
}

export interface TechnicalSpecs {
  material: string;
  weightGsm: string;
  waterproofRating?: string;
  closureSystem: string;
  ventilation: string;
  brimStructure: string;
  origin: string;
}

export interface Product {
  id: string;
  name: string;
  series: string;
  sku: string;
  price: number;
  originalPrice?: number;
  tagline: string;
  description: string;
  category: CapCategory;
  profile: CapProfile;
  material: CapMaterial;
  colors: CapColor[];
  sizes: string[];
  images: string[];
  badge?: 'LIMITED' | 'NEW DROP' | 'GORE-TEX' | 'ARCHIVE' | 'SOLDOUT' | 'JUST IN' | 'BEST SELLER';
  specs: TechnicalSpecs;
  featured?: boolean;
  newArrival?: boolean;
  stockCount: number;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface FilterState {
  category: string;
  materials: string[];
  profiles: string[];
  colors: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  inStockOnly: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  joinedDate: string;
  role: 'customer' | 'admin';
  phone?: string;
  sizePreference?: string;
  status: 'ACTIVE' | 'VIP';
  totalOrders?: number;
  totalSpent?: number;
}

export interface OrderItem {
  productName: string;
  sku: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  userEmail?: string;
  date: string;
  status: 'DELIVERED' | 'IN TRANSIT' | 'PROCESSING' | 'PENDING';
  total: number;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: CapCategory;
  material: string;
  stock: number;
  reorderPoint: number;
  price: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'RESTOCK PENDING';
}

export interface KPIStats {
  grossRevenue: number;
  activeOrders: number;
  unitsSold: number;
  lowStockCount: number;
}

export interface LookbookItem {
  id: string;
  title: string;
  location: string;
  photographer: string;
  image: string;
  featuredProductId: string;
  quote: string;
  tags: string[];
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

