import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://satlkkoaqocikfwkmmdu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdGxra29hcW9jaWtmd2ttbWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzM1MjcsImV4cCI6MjEwMjU0OTUyN30.zSWUegpFlzISksyRN-vkTbjiUN72fjywTfDJWMl6-gc';

function sanitizeUrl(rawUrl?: string): string {
  if (!rawUrl) return DEFAULT_SUPABASE_URL;
  const clean = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return DEFAULT_SUPABASE_URL;
  }
  return clean;
}

function sanitizeKey(rawKey?: string): string {
  if (!rawKey) return DEFAULT_SUPABASE_ANON_KEY;
  const clean = rawKey.trim().replace(/^["']|["']$/g, '');
  if (clean.length < 20) {
    return DEFAULT_SUPABASE_ANON_KEY;
  }
  return clean;
}

const supabaseUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  unstitched_price?: number;
  package_includes?: string;
  colors?: string[];
  category: string;
  fabric: string;
  images: string[];
  description: string;
  sizes: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_top_sale?: boolean;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  item_count: number;
}

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  selected_size: string;
  selected_color?: string;
  stitching_type?: string;
  custom_measurements?: string;
  image: string;
}

export interface Order {
  id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address: string;
  city: string;
  payment_method: 'cod' | 'bank_transfer';
  total_amount: number;
  items: OrderItem[];
  created_at?: string;
  status?: string;
  notes?: string;
}

import STATIC_PRODUCTS from './products.json';

// Default static fallback products matching local image files
export const MOCK_PRODUCTS: Product[] = STATIC_PRODUCTS as Product[];

export const MOCK_CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Luxury Pret', 
    slug: 'luxury-pret', 
    image: '', 
    item_count: 0 
  },
  { 
    id: '2', 
    name: 'Ready To Wear', 
    slug: 'ready-to-wear', 
    image: '', 
    item_count: 0 
  },
  { 
    id: '3', 
    name: 'Raw Silk & Chiffon', 
    slug: 'raw-silk-chiffon', 
    image: '', 
    item_count: 0 
  },
  { 
    id: '4', 
    name: 'Velvet Festive', 
    slug: 'velvet-festive', 
    image: '', 
    item_count: 0 
  },
  { 
    id: '5', 
    name: 'Bridal & Couture', 
    slug: 'bridal-couture', 
    image: '', 
    item_count: 0 
  },
  { 
    id: '6', 
    name: 'Top Sale & Clearance', 
    slug: 'sale-clearance', 
    image: '', 
    item_count: 0 
  }
];

// In-memory runtime cache for high performance
let memoryProductsCache: Product[] | null = null;
let inMemoryOrders: Order[] = [];

// Helper to get stored products (only real user created products)
export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return memoryProductsCache || MOCK_PRODUCTS;
  }
  try {
    const custom = localStorage.getItem('zehra_custom_products');
    const deleted = localStorage.getItem('zehra_deleted_products');
    const deletedIds: string[] = deleted ? JSON.parse(deleted) : [];
    const customList: Product[] = custom ? JSON.parse(custom) : [];
    
    const combined = [...customList, ...MOCK_PRODUCTS];
    return combined.filter(p => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));
  } catch {
    return MOCK_PRODUCTS;
  }
}

// -----------------------------------------------------------------------------
// PRODUCTS API (MATCHED CANBEERA PRODUCTS WITH LOCAL IMAGES)
// -----------------------------------------------------------------------------

export async function getProducts(
  categorySlug?: string,
  onPartialLoad?: (products: Product[]) => void
): Promise<Product[]> {
  // 1. If memory cache already exists, serve instantly
  if (memoryProductsCache && memoryProductsCache.length > 0) {
    if (onPartialLoad) onPartialLoad(memoryProductsCache);
    if (categorySlug && categorySlug !== 'all') {
      const term = categorySlug.toLowerCase().replace(/-/g, ' ');
      return memoryProductsCache.filter(p => 
        p.category?.toLowerCase().includes(term) || 
        p.category?.toLowerCase().replace(/\s+/g, '-').includes(categorySlug.toLowerCase())
      );
    }
    return memoryProductsCache;
  }

  // 2. Hydrate from localStorage cache if available (v4)
  if (typeof window !== 'undefined') {
    try {
      // Clear legacy stale cache keys
      localStorage.removeItem('zehra_live_supabase_v2');
      localStorage.removeItem('zehra_live_supabase_products');
      localStorage.removeItem('zehra_custom_products');

      const cached = localStorage.getItem('zehra_live_supabase_v4');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryProductsCache = parsed;
          if (onPartialLoad) onPartialLoad(parsed);
        }
      }
    } catch (e) {
      console.warn('Cache parse notice:', e);
    }
  }

  // 3. Fetch all live products from Supabase
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const fetchedLiveList = data as Product[];
      memoryProductsCache = fetchedLiveList;

      if (onPartialLoad) {
        onPartialLoad(fetchedLiveList);
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zehra_live_supabase_v4', JSON.stringify(fetchedLiveList));
        } catch (e) {
          console.warn('Storage quota notice:', e);
        }
      }

      if (categorySlug && categorySlug !== 'all') {
        const term = categorySlug.toLowerCase().replace(/-/g, ' ');
        return fetchedLiveList.filter(p => 
          p.category?.toLowerCase().includes(term) || 
          p.category?.toLowerCase().replace(/\s+/g, '-').includes(categorySlug.toLowerCase())
        );
      }
      return fetchedLiveList;
    }
  } catch (err) {
    console.warn('Supabase getProducts notice:', err);
  }

  // 4. Fallback to static matched products
  const localList = memoryProductsCache || getStoredProducts();
  if (localList && localList.length > 0) {
    if (onPartialLoad) onPartialLoad(localList);
    if (categorySlug && categorySlug !== 'all') {
      const term = categorySlug.toLowerCase().replace(/-/g, ' ');
      return localList.filter(p => 
        p.category?.toLowerCase().includes(term) || 
        p.category?.toLowerCase().replace(/\s+/g, '-').includes(categorySlug.toLowerCase())
      );
    }
    return localList;
  }

  return MOCK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // First check memory cache
  if (memoryProductsCache && memoryProductsCache.length > 0) {
    const found = memoryProductsCache.find(p => p.slug === slug || p.id === slug);
    if (found) return found;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as Product;
    }
  } catch (err) {
    console.warn('Supabase getProductBySlug notice:', err);
  }

  // Check locally stored products
  const allProds = memoryProductsCache && memoryProductsCache.length > 0 ? memoryProductsCache : getStoredProducts();
  const found = allProds.find(p => p.slug === slug || p.id === slug);
  return found || null;
}

export async function addProduct(product: Product): Promise<{ success: boolean; product: Product; error?: string }> {
  const newProduct: Product = {
    ...product,
    id: product.id || 'prod-' + Date.now(),
    slug: product.slug || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    rating: product.rating || 5.0,
    reviews_count: product.reviews_count || 1,
    is_new: product.is_new ?? true,
    created_at: product.created_at || new Date().toISOString()
  };

  // 1. Save directly to Supabase
  try {
    const { data, error } = await supabase.from('products').upsert([newProduct], { onConflict: 'id' }).select().single();
    if (error) {
      console.error('Supabase product save error:', error.message);
    } else if (data) {
      memoryProductsCache = null;
      return { success: true, product: data as Product };
    }
  } catch (err: any) {
    console.error('Supabase addProduct exception:', err);
  }

  // 2. LocalStorage sync backup
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('zehra_custom_products');
      const list: Product[] = existing ? JSON.parse(existing) : [];
      const filtered = list.filter(p => p.id !== newProduct.id);
      filtered.unshift(newProduct);
      localStorage.setItem('zehra_custom_products', JSON.stringify(filtered));
    } catch (e) {
      console.warn('LocalStorage backup quota notice:', e);
    }
  }

  return { success: true, product: newProduct };
}

export async function updateProduct(product: Product): Promise<{ success: boolean; product: Product }> {
  // 1. Update in Supabase
  try {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id);
    
    if (error) {
      console.warn('Supabase product update notice:', error.message);
    } else {
      memoryProductsCache = null;
    }
  } catch (err) {
    console.warn('Supabase updateProduct error:', err);
  }

  // 2. Update in LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('zehra_custom_products');
      let list: Product[] = existing ? JSON.parse(existing) : [];
      const index = list.findIndex(p => p.id === product.id || p.slug === product.slug);
      if (index !== -1) {
        list[index] = { ...list[index], ...product };
      } else {
        list.unshift(product);
      }
      localStorage.setItem('zehra_custom_products', JSON.stringify(list));
    } catch (e) {
      console.error('LocalStorage product update error:', e);
    }
  }

  return { success: true, product };
}

export async function deleteProduct(idOrSlug: string): Promise<{ success: boolean }> {
  // 1. Delete from Supabase
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
    
    if (error) {
      console.warn('Supabase product delete notice:', error.message);
    } else {
      memoryProductsCache = null;
    }
  } catch (err) {
    console.warn('Supabase deleteProduct error:', err);
  }

  // 2. Delete from LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('zehra_custom_products');
      if (custom) {
        let list: Product[] = JSON.parse(custom);
        list = list.filter(p => p.id !== idOrSlug && p.slug !== idOrSlug);
        localStorage.setItem('zehra_custom_products', JSON.stringify(list));
      }

      const deleted = localStorage.getItem('zehra_deleted_products');
      const deletedList: string[] = deleted ? JSON.parse(deleted) : [];
      if (!deletedList.includes(idOrSlug)) {
        deletedList.push(idOrSlug);
        localStorage.setItem('zehra_deleted_products', JSON.stringify(deletedList));
      }
    } catch (e) {
      console.error('LocalStorage product delete error:', e);
    }
  }

  return { success: true };
}

export async function deleteAllProducts(): Promise<{ success: boolean; error?: string }> {
  // 1. Delete all rows from Supabase
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .neq('id', '___non_existent_id___');

    if (error) {
      console.warn('Supabase deleteAllProducts notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase deleteAllProducts error:', err);
  }

  // 2. Clear memory and local storage
  memoryProductsCache = [];
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('zehra_custom_products');
      localStorage.removeItem('zehra_deleted_products');
    } catch (e) {
      console.error('LocalStorage clear products error:', e);
    }
  }

  return { success: true };
}

// -----------------------------------------------------------------------------
// ORDERS API (SUPABASE REAL-TIME DATABASE)
// -----------------------------------------------------------------------------

export async function createOrder(order: Order): Promise<{ success: boolean; orderId: string; error?: string }> {
  const generatedId = 'ZS-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder: Order = {
    ...order,
    id: generatedId,
    status: order.status || 'pending',
    created_at: new Date().toISOString()
  };

  // 1. Primary: Save directly to Supabase orders table
  let supabaseSuccess = false;
  try {
    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) {
      console.warn('Supabase orders insert notice:', error.message);
    } else {
      supabaseSuccess = true;
    }
  } catch (err) {
    console.warn('Supabase createOrder fallback:', err);
  }

  // 2. Memory & LocalStorage sync
  inMemoryOrders.unshift(newOrder);
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('zehra_orders');
      const ordersList: Order[] = existing ? JSON.parse(existing) : [];
      ordersList.unshift(newOrder);
      localStorage.setItem('zehra_orders', JSON.stringify(ordersList));
    } catch (err) {
      console.error('LocalStorage order save error:', err);
    }
  }

  return { success: true, orderId: generatedId };
}

export async function getOrders(): Promise<Order[]> {
  // 1. Try Supabase live fetch
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('zehra_orders', JSON.stringify(data));
      }
      inMemoryOrders = data as Order[];
      return data as Order[];
    }
  } catch (err) {
    console.warn('Supabase getOrders fetch notice:', err);
  }

  // 2. Fallback to LocalStorage / Memory
  let localOrders: Order[] = inMemoryOrders;
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('zehra_orders');
      if (existing) {
        localOrders = JSON.parse(existing);
      }
    } catch (err) {
      console.error('LocalStorage order read error:', err);
    }
  }
  return localOrders;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean }> {
  // 1. Update in Supabase
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) {
      console.warn('Supabase update order status error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase update order error:', err);
  }

  // 2. Update local state
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('zehra_orders');
      if (existing) {
        const ordersList: Order[] = JSON.parse(existing);
        const updated = ordersList.map(o => o.id === orderId ? { ...o, status } : o);
        localStorage.setItem('zehra_orders', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Update order error:', err);
    }
  }

  inMemoryOrders = inMemoryOrders.map(o => o.id === orderId ? { ...o, status } : o);
  return { success: true };
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean }> {
  // 1. Delete from Supabase
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) {
      console.warn('Supabase delete order error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete order error:', err);
  }

  // 2. Delete from local state
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('zehra_orders');
      if (existing) {
        const ordersList: Order[] = JSON.parse(existing);
        const filtered = ordersList.filter(o => o.id !== orderId);
        localStorage.setItem('zehra_orders', JSON.stringify(filtered));
      }
    } catch (err) {
      console.error('Delete order error:', err);
    }
  }

  inMemoryOrders = inMemoryOrders.filter(o => o.id !== orderId);
  return { success: true };
}

export async function deleteAllOrders(): Promise<{ success: boolean }> {
  // 1. Delete from Supabase
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', '___non_existent_id___');
    
    if (error) {
      console.warn('Supabase deleteAllOrders error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase deleteAllOrders error:', err);
  }

  // 2. Delete from local state
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('zehra_orders');
    } catch (err) {
      console.error('Delete orders error:', err);
    }
  }

  inMemoryOrders = [];
  return { success: true };
}

// -----------------------------------------------------------------------------
// SUPABASE HEALTH CHECK & SEEDING UTILITIES
// -----------------------------------------------------------------------------

export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  productsTableExists: boolean;
  ordersTableExists: boolean;
  productsCount: number;
  ordersCount: number;
  message: string;
}> {
  let productsTableExists = false;
  let ordersTableExists = false;
  let productsCount = 0;
  let ordersCount = 0;

  try {
    const pCheck = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (!pCheck.error) {
      productsTableExists = true;
      productsCount = pCheck.count || 0;
    }
  } catch (e) {
    console.warn('Products check error:', e);
  }

  try {
    const oCheck = await supabase.from('orders').select('*', { count: 'exact', head: true });
    if (!oCheck.error) {
      ordersTableExists = true;
      ordersCount = oCheck.count || 0;
    }
  } catch (e) {
    console.warn('Orders check error:', e);
  }

  const connected = productsTableExists || ordersTableExists;
  let message = 'Connected to Supabase';
  if (!productsTableExists || !ordersTableExists) {
    message = 'Tables not found. Please run supabase_schema.sql in Supabase SQL Editor.';
  } else {
    message = `Live connected! Database has ${productsCount} products and ${ordersCount} orders.`;
  }

  return {
    connected,
    productsTableExists,
    ordersTableExists,
    productsCount,
    ordersCount,
    message
  };
}

export async function seedProductsToSupabase(
  onProgress?: (progress: number, total: number, message: string) => void
): Promise<{ success: boolean; inserted: number; error?: string }> {
  try {
    const total = MOCK_PRODUCTS.length;
    const chunkSize = 40;
    let inserted = 0;

    for (let i = 0; i < total; i += chunkSize) {
      const chunk = MOCK_PRODUCTS.slice(i, i + chunkSize);
      
      const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
      
      if (error) {
        throw new Error(error.message);
      }
      
      inserted += chunk.length;
      if (onProgress) {
        onProgress(Math.min(inserted, total), total, `Synced ${Math.min(inserted, total)} of ${total} products...`);
      }
    }

    memoryProductsCache = null;
    return { success: true, inserted };
  } catch (err: any) {
    console.error('Seed products error:', err);
    return { success: false, inserted: 0, error: err.message || 'Seeding failed' };
  }
}

export async function getCategories(): Promise<Category[]> {
  const prods = await getProducts();
  
  // Extract all unique categories present in products
  const categoryMap = new Map<string, Product[]>();
  
  prods.forEach(p => {
    const catName = p.category?.trim() || 'Luxury Pret';
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, []);
    }
    categoryMap.get(catName)!.push(p);
  });

  const list: Category[] = [];
  let idx = 1;
  for (const [name, catProds] of categoryMap.entries()) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const firstImg = catProds.find(p => p.images && p.images.length > 0 && p.images[0])?.images[0] || '/images/a1.webp';
    list.push({
      id: String(idx++),
      name,
      slug,
      image: firstImg,
      item_count: catProds.length
    });
  }

  return list;
}
