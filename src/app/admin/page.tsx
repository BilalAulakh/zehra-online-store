'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, Package, Clock, Phone, MapPin, Search, RefreshCw, 
  Plus, Edit, Trash2, Image as ImageIcon, Lock, LogOut, CheckCircle, 
  AlertCircle, ChevronRight, Eye, Tag, DollarSign, Layers, Check, 
  UploadCloud, X, ArrowUpRight, ArrowRight, BarChart3, Filter, Copy, KeyRound, Sparkles,
  Loader2, AlertTriangle, Printer, MessageCircle, ExternalLink, Database, Server, Download
} from 'lucide-react';
import { 
  getProducts, getOrders, addProduct, updateProduct, deleteProduct, deleteAllProducts,
  updateOrderStatus, deleteOrder, deleteAllOrders, getStoredProducts, checkSupabaseHealth,
  seedProductsToSupabase, Product, Order 
} from '@/lib/supabase';
import { TableSkeleton, OrderSkeleton, ShimmerBox } from '@/components/Shimmer';

// Admin Official Credentials
const ADMIN_CREDENTIALS = {
  email: 'zehrastudio3322@gmail.com',
  altEmail: 'admin@zehrastudio.pk',
  password: 'zehra2026',
  altPassword: 'admin12345',
  pin: '7860'
};

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Tab State: 'orders' | 'products' | 'analytics'
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');

  // Data States (Instant zero-delay initial load)
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Custom Luxury Delete Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'product' | 'order' | 'all_products' | 'all_orders';
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
  } | null>(null);
  const [isDeletingTarget, setIsDeletingTarget] = useState(false);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    price: '',
    compare_at_price: '',
    unstitched_price: '',
    package_includes: '3PC (Shirt, Shalwar, Dupatta)',
    colors: '',
    category: 'Luxury Pret',
    fabric: 'Pure Silk & Handmade Adda Work',
    description: '',
    sizes: ['XS', 'Small', 'Medium', 'Large', 'XL'],
    images: [] as string[],
    is_featured: false,
    is_new: true,
    is_top_sale: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Order & Product Preview States
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedProductPreview, setSelectedProductPreview] = useState<Product | null>(null);
  const [previewActiveImageIdx, setPreviewActiveImageIdx] = useState(0);

  // Supabase Database Connection & Seeding States
  const [dbHealth, setDbHealth] = useState<{
    connected: boolean;
    productsTableExists: boolean;
    ordersTableExists: boolean;
    productsCount: number;
    ordersCount: number;
    message: string;
  } | null>(null);
  const [isSeedingDb, setIsSeedingDb] = useState(false);
  const [seedProgressText, setSeedProgressText] = useState('');
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Check Local Authentication Session
  useEffect(() => {
    try {
      const session = localStorage.getItem('zehra_admin_auth');
      if (session === 'authenticated_true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Load Data
  const loadData = async (isBackground = false) => {
    if (!isBackground && products.length === 0) setLoading(true);
    try {
      // 1. Fetch products independently
      try {
        const prodList = await getProducts();
        if (prodList && Array.isArray(prodList)) {
          setProducts(prodList);
        }
      } catch (e) {
        console.error('Products load error:', e);
      }

      // 2. Fetch orders independently
      try {
        const orderList = await getOrders();
        if (orderList && Array.isArray(orderList)) {
          setOrders(orderList);
        }
      } catch (e) {
        console.error('Orders load error:', e);
      }

      // 3. Fetch DB health independently
      try {
        const health = await checkSupabaseHealth();
        setDbHealth(health);
      } catch (e) {
        console.warn('DB health check notice:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle 1-Click Sync/Seed 191+ Catalog to Supabase
  const handleSeedProducts = async () => {
    setIsSeedingDb(true);
    setSeedProgressText('Connecting to Supabase...');
    try {
      const res = await seedProductsToSupabase((prog, total, msg) => {
        setSeedProgressText(msg);
      });
      if (res.success) {
        showFlash(`Successfully synced ${res.inserted} products to Supabase live DB!`);
        await loadData(true);
      } else {
        showFlash(`Seeding notice: ${res.error}`, 'error');
      }
    } catch (err: any) {
      showFlash(`Seeding failed: ${err.message}`, 'error');
    } finally {
      setIsSeedingDb(false);
      setSeedProgressText('');
    }
  };

  // Handle Export Full Database Backup as JSON
  const handleExportBackup = () => {
    try {
      const backupPayload = {
        backup_date: new Date().toISOString(),
        products_count: products.length,
        orders_count: orders.length,
        products,
        orders
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `zehra_store_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFlash('Database backup JSON exported and downloaded successfully!');
    } catch (err) {
      console.error('Export backup error:', err);
      showFlash('Failed to export backup', 'error');
    }
  };

  // Flash Notification Helper
  const showFlash = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle Login with Realistic Loading State
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Authentication delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (
      (cleanEmail === ADMIN_CREDENTIALS.email || cleanEmail === ADMIN_CREDENTIALS.altEmail || cleanEmail === 'admin' || cleanEmail === 'zehra' || cleanEmail === 'admin@zehra.com') &&
      (cleanPass === ADMIN_CREDENTIALS.password || cleanPass === ADMIN_CREDENTIALS.altPassword || cleanPass === ADMIN_CREDENTIALS.pin)
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('zehra_admin_auth', 'authenticated_true');
      showFlash('Welcome, Administrator! Authenticated successfully.');
    } else {
      setLoginError('Invalid administrator email or password.');
    }
    setIsLoggingIn(false);
  };

  // Quick 1-Click Login Helper
  const fillDemoCredentials = () => {
    setLoginEmail(ADMIN_CREDENTIALS.email);
    setLoginPassword(ADMIN_CREDENTIALS.password);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('zehra_admin_auth');
    showFlash('Signed out successfully.');
  };

  // Automatic High-Performance Image Compressor for Fast Supabase Storage
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // If already small svg or small file, read directly
      if (file.size < 60000 && !file.type.includes('image/heic')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }

      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 960;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to lightweight 78% JPEG for lightning fast loading
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(dataUrl);
        } else {
          resolve(img.src);
        }
      };
      img.onerror = () => {
        // Fallback to normal data URL
        const fallbackReader = new FileReader();
        fallbackReader.onloadend = () => resolve(fallbackReader.result as string);
        fallbackReader.readAsDataURL(file);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle File Upload (Auto Compressed Base64)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showFlash('Processing & optimizing image quality...', 'success');
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      try {
        const optimizedBase64 = await compressImage(file);
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, optimizedBase64]
        }));
      } catch (err) {
        console.error('Image compression error:', err);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove Image from Form
  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Open Modal for Create or Edit
  const openProductModal = (prodToEdit?: Product) => {
    if (prodToEdit) {
      setEditingProduct(prodToEdit);
      setProductForm({
        title: prodToEdit.title,
        slug: prodToEdit.slug,
        price: String(prodToEdit.price),
        compare_at_price: String(prodToEdit.compare_at_price || ''),
        unstitched_price: String(prodToEdit.unstitched_price || ''),
        package_includes: prodToEdit.package_includes || '3PC (Shirt, Shalwar, Dupatta)',
        colors: prodToEdit.colors ? prodToEdit.colors.join(', ') : '',
        category: prodToEdit.category,
        fabric: prodToEdit.fabric || '',
        description: prodToEdit.description || '',
        sizes: prodToEdit.sizes || ['XS', 'Small', 'Medium', 'Large', 'XL'],
        images: [...prodToEdit.images],
        is_featured: !!prodToEdit.is_featured,
        is_new: !!prodToEdit.is_new,
        is_top_sale: !!prodToEdit.is_top_sale
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: '',
        slug: '',
        price: '',
        compare_at_price: '',
        unstitched_price: '',
        package_includes: '3PC (Shirt, Shalwar, Dupatta)',
        colors: '',
        category: 'Luxury Pret',
        fabric: 'Pure Chermouse Silk & Adda Work',
        description: 'Exquisite handcrafted formal ensemble with intricate hand embroidery and fine silk finish.\n\nPackage Includes: 1PC Shirt, 1PC Trouser/Sharara, 1PC Dupatta.\nFabric Details: Pure Chiffon / Raw Silk.\nCare Instructions: Dry clean only.',
        sizes: ['XS', 'Small', 'Medium', 'Large', 'XL'],
        images: [],
        is_featured: true,
        is_new: true,
        is_top_sale: false
      });
    }
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      showFlash('Please enter a product title', 'error');
      return;
    }
    if (!productForm.price || isNaN(Number(productForm.price))) {
      showFlash('Please enter a valid price in PKR', 'error');
      return;
    }
    if (productForm.images.length === 0) {
      showFlash('Please add or upload at least 1 image for the product', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const finalSlug = editingProduct?.slug || productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Parse colors list
      const parsedColors = productForm.colors
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const productPayload: Product = {
        id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
        title: productForm.title.trim(),
        slug: finalSlug,
        price: parseFloat(productForm.price),
        compare_at_price: productForm.compare_at_price ? parseFloat(productForm.compare_at_price) : undefined,
        unstitched_price: productForm.unstitched_price ? parseFloat(productForm.unstitched_price) : undefined,
        package_includes: productForm.package_includes ? productForm.package_includes.trim() : undefined,
        colors: parsedColors.length > 0 ? parsedColors : undefined,
        category: productForm.category,
        fabric: productForm.fabric,
        description: productForm.description,
        sizes: productForm.sizes,
        images: productForm.images,
        is_featured: productForm.is_featured,
        is_new: productForm.is_new,
        is_top_sale: productForm.is_top_sale,
        rating: editingProduct?.rating || 4.9,
        reviews_count: editingProduct?.reviews_count || 12
      };

      if (editingProduct) {
        await updateProduct(productPayload);
        showFlash(`Product "${productPayload.title}" updated successfully!`);
      } else {
        await addProduct(productPayload);
        showFlash(`New product "${productPayload.title}" added to store catalog!`);
      }

      setIsProductModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving product:', err);
      showFlash('Failed to save product. Please try again.', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Trigger Delete Confirmation Modal for Product
  const promptDeleteProduct = (product: Product) => {
    setDeleteConfirmTarget({
      type: 'product',
      id: product.id,
      title: product.title,
      subtitle: `${product.category} • RS. ${product.price.toLocaleString()}`,
      image: product.images && product.images[0] ? product.images[0] : undefined
    });
  };

  // Trigger Delete All Products Confirmation Modal
  const promptDeleteAllProducts = () => {
    if (products.length === 0) {
      showFlash('No products in catalog to delete.', 'error');
      return;
    }
    setDeleteConfirmTarget({
      type: 'all_products',
      id: 'all',
      title: `All ${products.length} Products in Catalog`,
      subtitle: `Will permanently erase all ${products.length} articles from store & Supabase database`
    });
  };

  // Trigger Delete All Orders Confirmation Modal
  const promptDeleteAllOrders = () => {
    if (orders.length === 0) {
      showFlash('No orders to delete.', 'error');
      return;
    }
    setDeleteConfirmTarget({
      type: 'all_orders',
      id: 'all',
      title: `All ${orders.length} Orders & Sales Records`,
      subtitle: `Will permanently erase all ${orders.length} order history records and reset Gross Sales to RS. 0`
    });
  };

  // Trigger Delete Confirmation Modal for Order
  const promptDeleteOrder = (order: Order) => {
    if (!order.id) return;
    setDeleteConfirmTarget({
      type: 'order',
      id: order.id,
      title: `Order #${order.id}`,
      subtitle: `${order.customer_name} • ${order.city} • RS. ${(order.total_amount || 0).toLocaleString()}`,
      image: order.items && order.items[0] && order.items[0].image ? order.items[0].image : undefined
    });
  };

  // Handle Execute Delete from Modal
  const handleExecuteDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeletingTarget(true);
    try {
      if (deleteConfirmTarget.type === 'all_products') {
        await deleteAllProducts();
        showFlash(`All products have been permanently deleted from the store.`);
      } else if (deleteConfirmTarget.type === 'all_orders') {
        await deleteAllOrders();
        showFlash(`All orders and gross sales history have been cleared.`);
      } else if (deleteConfirmTarget.type === 'product') {
        setDeletingProductId(deleteConfirmTarget.id);
        await deleteProduct(deleteConfirmTarget.id);
        showFlash(`Product "${deleteConfirmTarget.title}" was permanently removed.`);
      } else {
        setDeletingOrderId(deleteConfirmTarget.id);
        await deleteOrder(deleteConfirmTarget.id);
        showFlash(`Order #${deleteConfirmTarget.id} was permanently removed.`);
      }
      await loadData();
      setDeleteConfirmTarget(null);
    } catch (err) {
      console.error(err);
      showFlash(`Failed to delete ${deleteConfirmTarget.type}. Please try again.`, 'error');
    } finally {
      setIsDeletingTarget(false);
      setDeletingProductId(null);
      setDeletingOrderId(null);
    }
  };

  // Handle Status Update
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    showFlash(`Order #${orderId} status updated to ${newStatus.toUpperCase()}`);
    loadData();
  };

  // Size toggle in Form
  const toggleSize = (size: string) => {
    setProductForm(prev => {
      const exists = prev.sizes.includes(size);
      if (exists) {
        return { ...prev, sizes: prev.sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || 
                            p.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filtered Orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer_phone.includes(searchTerm) ||
                          order.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || (order.status || 'pending').toLowerCase() === orderStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculations for Analytics
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const pendingOrdersCount = orders.filter(o => !o.status || o.status === 'pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;

  // Categories list
  const categoryOptions = [
    'Luxury Pret',
    'Ready To Wear',
    'Raw Silk & Chiffon',
    'Velvet Festive',
    'Bridal & Couture',
    'Top Sale & Clearance'
  ];

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#881337] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#F4EFE6] to-[#ECE3D2] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl border border-[#E8DFC8] shadow-2xl p-8 sm:p-10 space-y-8 animate-fade-in relative overflow-hidden">
          
          {/* Top Gold Ornament */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C7A76C] via-[#881337] to-[#C7A76C]" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#881337] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#881337]/20">
              <Lock className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-[#C7A76C] uppercase tracking-[0.3em] block">
              AUTHENTICATION REQUIRED
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B]">
              Store Admin Portal
            </h1>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Sign in with your master administrator credentials to manage products, images, and live customer orders.
            </p>
          </div>

          {/* Notification / Error */}
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="zehrastudio3322@gmail.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#881337] rounded-xl text-xs text-[#18181B] focus:outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                  Master Password / PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-[#881337] font-semibold hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#881337] rounded-xl text-xs text-[#18181B] focus:outline-none transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3.5 bg-[#881337] hover:bg-[#6b0f2b] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#881337]/30 flex items-center justify-center gap-2 ${
                isLoggingIn ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C7A76C]" />
                  <span>Authenticating Master Access...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In To Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-stone-500 hover:text-[#881337] font-medium transition-colors">
              &larr; Back to Online Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="bg-[#FAF9F6] text-[#18181B] min-h-screen font-sans pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-slide-down ${
          notification.type === 'success' 
            ? 'bg-[#18181B] text-white border border-[#C7A76C]' 
            : 'bg-rose-900 text-white border border-rose-600'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Admin Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#6B1D2F] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                ZS
              </div>
              <span className="font-bold text-base tracking-wider text-[#18181B] hidden sm:inline">
                ZEHRA STUDIO &bull; ADMIN
              </span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:border-[#6B1D2F] text-xs font-bold text-stone-700 hover:text-[#6B1D2F] flex items-center gap-1.5 transition-all bg-white shadow-2xs"
            >
              <span>View Storefront</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-stone-200"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="text-[10px] font-bold text-[#6B1D2F] uppercase tracking-[0.25em] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>COUTURE MANAGEMENT HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
              Store Administration &amp; Inventory
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            {activeTab === 'orders' && orders.length > 0 && (
              <button
                onClick={() => promptDeleteAllOrders()}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center gap-1.5 hover:scale-[1.02]"
                title="Clear all orders and sales records"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> 
                <span>Delete All Orders ({orders.length})</span>
              </button>
            )}

            <button
              onClick={() => loadData()}
              disabled={loading}
              className={`px-4 py-2 bg-white border border-stone-300 hover:border-[#C5A880] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#6B1D2F] ${loading ? 'animate-spin' : ''}`} /> 
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            {activeTab === 'products' && (
              <button
                onClick={() => openProductModal()}
                className="px-5 py-2.5 bg-[#6B1D2F] hover:bg-[#521323] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Add New Article
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center justify-between">
              <span>TOTAL PRODUCTS</span>
              <Package className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">{products.length}</div>
            <div className="text-[11px] text-stone-500 font-medium">Active in store catalog</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center justify-between">
              <span>TOTAL ORDERS</span>
              <div className="flex items-center gap-2">
                {orders.length > 0 && (
                  <button 
                    onClick={() => promptDeleteAllOrders()}
                    className="text-[9px] font-bold uppercase text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 flex items-center gap-1 transition-all"
                    title="Clear all orders & reset revenue"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Clear All
                  </button>
                )}
                <Layers className="w-4 h-4 text-[#6B1D2F]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">{orders.length}</div>
            <div className="text-[11px] text-stone-500 font-medium">{pendingOrdersCount} pending dispatch</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center justify-between">
              <span>GROSS SALES (PKR)</span>
              <div className="flex items-center gap-2">
                {orders.length > 0 && (
                  <button 
                    onClick={() => promptDeleteAllOrders()}
                    className="text-[9px] font-bold uppercase text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 flex items-center gap-1 transition-all"
                    title="Reset revenue history"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Reset
                  </button>
                )}
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 tracking-tight">
              RS. {totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">From received orders</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 gap-8 text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
            className={`pb-3 relative transition-colors flex items-center gap-2 ${
              activeTab === 'products' ? 'text-[#881337]' : 'text-stone-400 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog &amp; Images ({products.length})</span>
            {activeTab === 'products' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#881337]" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
            className={`pb-3 relative transition-colors flex items-center gap-2 ${
              activeTab === 'orders' ? 'text-[#881337]' : 'text-stone-400 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#881337] text-white text-[9px] flex items-center justify-center font-mono">
                {pendingOrdersCount}
              </span>
            )}
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#881337]" />
            )}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-stone-200 shadow-xs">
            <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={activeTab === 'products' ? "Search products by title, category, fabric, or slug..." : "Search orders by ID, customer name, phone, city..."}
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-xs text-[#18181B] focus:outline-none w-full font-medium"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {activeTab === 'products' && (
            <select
              value={selectedCategoryFilter}
              onChange={e => {
                setSelectedCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-stone-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#881337] shadow-xs"
            >
              <option value="all">All Categories ({products.length})</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {activeTab === 'orders' && (
            <select
              value={orderStatusFilter}
              onChange={e => setOrderStatusFilter(e.target.value)}
              className="bg-white border border-stone-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#881337] shadow-xs"
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: PRODUCT CATALOG & IMAGE MANAGEMENT                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {loading ? (
              <TableSkeleton rows={8} />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
                <Package className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="text-sm font-bold text-[#18181B]">No products match your search query</h3>
                <button
                  onClick={() => openProductModal()}
                  className="px-4 py-2 bg-[#881337] text-white text-xs font-bold rounded-xl"
                >
                  + Add First Product
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] border-b border-stone-200 text-stone-500 font-extrabold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-4 sm:px-6">Article</th>
                        <th className="py-4 px-4">Category &amp; Fabric</th>
                        <th className="py-4 px-4">Price (PKR)</th>
                        <th className="py-4 px-4">Gallery</th>
                        <th className="py-4 px-4">Badges</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {paginatedProducts.map(product => (
                        <tr key={product.id} className="hover:bg-stone-50/70 transition-colors group">
                          {/* Image & Title */}
                          <td 
                            className="py-3.5 px-4 sm:px-6 cursor-pointer"
                            onClick={() => { setSelectedProductPreview(product); setPreviewActiveImageIdx(0); }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-16 rounded-xl bg-stone-100 overflow-hidden relative border border-stone-200 flex-shrink-0 group-hover:border-[#881337] transition-colors">
                                {product.images && product.images[0] ? (
                                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-extrabold text-[#18181B] text-sm group-hover:text-[#881337] transition-colors">
                                  {product.title}
                                </div>
                                <div className="text-[10px] text-stone-400 font-mono">
                                  slug: {product.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category & Fabric */}
                          <td 
                            className="py-3.5 px-4 cursor-pointer"
                            onClick={() => { setSelectedProductPreview(product); setPreviewActiveImageIdx(0); }}
                          >
                            <div className="font-bold text-[#18181B]">{product.category}</div>
                            <div className="text-[11px] text-stone-500 line-clamp-1 max-w-[200px]">
                              {product.fabric || 'Pure Fabric'}
                            </div>
                          </td>

                          {/* Price */}
                          <td 
                            className="py-3.5 px-4 font-mono font-extrabold text-[#881337] cursor-pointer"
                            onClick={() => { setSelectedProductPreview(product); setPreviewActiveImageIdx(0); }}
                          >
                            <div>RS. {product.price.toLocaleString()}</div>
                            {product.compare_at_price && (
                              <div className="text-[10px] text-stone-400 line-through">
                                RS. {product.compare_at_price.toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Gallery count */}
                          <td 
                            className="py-3.5 px-4 cursor-pointer"
                            onClick={() => { setSelectedProductPreview(product); setPreviewActiveImageIdx(0); }}
                          >
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFC8] text-[10px] font-bold text-[#785E2F] flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                {product.images?.length || 0} photos
                              </span>
                            </div>
                          </td>

                          {/* Badges */}
                          <td className="py-3.5 px-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {product.is_featured && (
                                <span className="bg-[#FAF7F2] text-[#881337] border border-[#E8DFC8] text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                  Featured
                                </span>
                              )}
                              {product.is_new && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                  New
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => { setSelectedProductPreview(product); setPreviewActiveImageIdx(0); }}
                                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                                title="Quick View Product Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => openProductModal(product)}
                                className="p-1.5 text-stone-600 hover:text-[#881337] rounded-lg hover:bg-stone-100 transition-colors"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => promptDeleteProduct(product)}
                                disabled={deletingProductId === product.id || isDeletingTarget}
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                                title="Delete Product"
                              >
                                {deletingProductId === product.id ? (
                                  <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="bg-[#FAF7F2] px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-stone-600">
                    <div>
                      Showing <span className="text-[#18181B] font-extrabold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[#18181B] font-extrabold">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="text-[#881337] font-extrabold">{filteredProducts.length}</span> articles
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 transition-all font-bold"
                      >
                        &larr; Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum = i + 1;
                          if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                            if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${
                                currentPage === pageNum
                                  ? 'bg-[#881337] text-white shadow-xs'
                                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 transition-all font-bold"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: LIVE CUSTOMER ORDERS MANAGEMENT                        */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <OrderSkeleton count={4} />
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-3">
                <Package className="w-12 h-12 text-[#881337] mx-auto opacity-70" />
                <h3 className="text-sm font-extrabold text-[#18181B]">No orders found</h3>
                <p className="text-xs text-stone-500">
                  {searchTerm || orderStatusFilter !== 'all' ? 'Try adjusting your search filters.' : 'Orders placed on checkout will appear here in real time.'}
                </p>
                <Link href="/checkout" className="inline-block bg-[#881337] text-white text-xs font-black px-6 py-2.5 rounded-full uppercase tracking-wider shadow-md">
                  + Create Test Checkout Order
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, idx) => (
                  <div key={order.id || idx} className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-[#18181B]">
                          ORDER #{order.id}
                        </span>
                        <span className="text-xs text-stone-400">
                          {order.created_at ? new Date(order.created_at).toLocaleString() : 'Just now'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View Order Full Details Button */}
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white hover:bg-[#881337] text-[#881337] hover:text-white border border-[#C7A76C]/60 transition-all flex items-center gap-1 shadow-2xs"
                          title="Open Full Order Dossier"
                        >
                          <span>Full Details</span>
                          <Eye className="w-3 h-3" />
                        </button>

                        {/* Status update select */}
                        <select
                          value={order.status || 'pending'}
                          onChange={e => order.id && handleStatusChange(order.id, e.target.value)}
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF7F2] text-[#881337] border border-[#E8DFC8] focus:outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#881337] text-white">
                          {order.payment_method === 'cod' ? 'COD' : 'Bank Transfer'}
                        </span>

                        <button
                          onClick={() => promptDeleteOrder(order)}
                          disabled={deletingOrderId === order.id || isDeletingTarget}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                          title="Delete Order"
                        >
                          {deletingOrderId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-stone-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">Customer Details</div>
                        <div className="font-black text-[#18181B] text-sm">{order.customer_name}</div>
                        <div className="text-stone-700 flex items-center gap-1 mt-0.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#881337]" /> {order.customer_phone}
                        </div>
                        {order.customer_email && <div className="text-stone-500">{order.customer_email}</div>}
                      </div>

                      <div>
                        <div className="text-stone-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">Delivery Destination</div>
                        <div className="font-extrabold text-[#18181B] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#881337]" /> {order.city}, Pakistan
                        </div>
                        <div className="text-stone-600 mt-0.5 leading-tight font-light">{order.address}</div>
                      </div>

                      <div className="md:text-right">
                        <div className="text-stone-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">Total Payable Amount</div>
                        <div className="text-2xl font-serif font-black text-[#881337]">
                          RS. {order.total_amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-stone-500 font-black uppercase tracking-wider mt-0.5">
                          {order.items.length} Items Ordered
                        </div>
                      </div>
                    </div>

                    {/* Order Items Breakdown (Clickable to open Full Details) */}
                    <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {order.items.map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-3 bg-[#FAF7F2] hover:bg-rose-50/50 rounded-2xl border border-stone-200/80 hover:border-[#881337] text-xs flex gap-3 items-center cursor-pointer transition-all shadow-2xs group/item"
                          title="Click to view full order item details"
                        >
                          <div className="w-11 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 relative border border-stone-200 group-hover/item:border-[#881337] transition-colors">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-[#18181B] line-clamp-1 group-hover/item:text-[#881337] transition-colors">{item.title}</div>
                            <div className="text-[10px] text-stone-600 mt-0.5">
                              Size: <strong className="text-[#881337]">{item.selected_size}</strong> &bull; Qty: {item.quantity}
                            </div>
                            {item.price && (
                              <div className="text-[10px] font-mono font-bold text-[#881337]">
                                RS. {item.price.toLocaleString()}
                              </div>
                            )}
                            {item.custom_measurements && (
                              <div className="text-[9px] text-stone-500 italic truncate">Custom: {item.custom_measurements}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ADD / EDIT PRODUCT MODAL (WITH IMAGE UPLOAD)               */}
      {/* ------------------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-[#C7A76C] uppercase tracking-widest block">
                  {editingProduct ? 'EDIT ARTICLE' : 'NEW PRODUCT CREATION'}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#18181B]">
                  {editingProduct ? `Edit "${editingProduct.title}"` : 'Add New Couture Article'}
                </h2>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHAHEE BLUE"
                  value={productForm.title}
                  onChange={e => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-[#18181B] focus:border-[#881337] focus:outline-none transition-all"
                />
              </div>

              {/* Prices: Selling, Compare At, and Unstitched */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Stitched Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="10500"
                    value={productForm.price}
                    onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-[#6B1D2F] focus:border-[#6B1D2F] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Original (Compare At)
                  </label>
                  <input
                    type="number"
                    placeholder="18500"
                    value={productForm.compare_at_price}
                    onChange={e => setProductForm(prev => ({ ...prev, compare_at_price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-500 focus:border-[#6B1D2F] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Unstitched Price (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 9500)"
                    value={productForm.unstitched_price}
                    onChange={e => setProductForm(prev => ({ ...prev, unstitched_price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-emerald-700 font-bold focus:border-[#6B1D2F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Package Includes & Available Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Package Includes (What is in the box)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3PC (Shirt, Shalwar, Dupatta)"
                    value={productForm.package_includes}
                    onChange={e => setProductForm(prev => ({ ...prev, package_includes: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-[#18181B] focus:border-[#6B1D2F] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Available Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maroon, Emerald Green, Black, Royal Blue"
                    value={productForm.colors}
                    onChange={e => setProductForm(prev => ({ ...prev, colors: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-[#18181B] focus:border-[#6B1D2F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Fabric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Collection / Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-[#18181B] focus:border-[#6B1D2F] focus:outline-none"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Fabric &amp; Craft Details
                  </label>
                  <input
                    type="text"
                    placeholder="Pure Chermouse Silk & Handmade Adda Work"
                    value={productForm.fabric}
                    onChange={e => setProductForm(prev => ({ ...prev, fabric: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-[#18181B] focus:border-[#6B1D2F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Product Description &amp; Details
                  </label>
                  <span className="text-[10px] text-stone-400 font-normal">
                    (Linebreaks &amp; spacing are preserved on product page)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="DESIGN CODE: EVARA&#10;Package Includes: 1PC SHIRT, 1PC SHALWAR, 1PC DUPATTA&#10;FABRIC DETAILS: Pure Handcrafted Chiffon with Farshi Shalwar."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-[#18181B] focus:border-[#6B1D2F] focus:outline-none font-sans whitespace-pre-wrap"
                />
              </div>

              {/* Available Sizes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider block">
                  Available Sizes
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['UNSTITCHED', 'XS', 'Small', 'Medium', 'Large', 'XL', 'Custom Stitching'].map(size => {
                    const isSelected = productForm.sizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isSelected 
                            ? 'bg-[#881337] text-white border-[#881337]' 
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* IMAGE UPLOAD & GALLERY SECTION                                */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <label className="text-[11px] font-black text-[#881337] uppercase tracking-wider block flex items-center justify-between">
                  <span>Product Photos &amp; Image Gallery *</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {productForm.images.length} photos selected
                  </span>
                </label>

                {/* Full-width Local File Upload */}
                <div className="p-6 border-2 border-dashed border-stone-300 hover:border-[#881337] rounded-2xl text-center space-y-3 bg-[#FAF7F2]/60 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-[#881337]/10 text-[#881337] flex items-center justify-center mx-auto shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#18181B]">Upload High-Quality Article Photos</div>
                    <p className="text-[10px] text-stone-500 mt-0.5">Select one or multiple images from your device (JPG, PNG, WEBP)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="device-image-upload"
                  />
                  <label
                    htmlFor="device-image-upload"
                    className="inline-block px-5 py-2.5 bg-[#881337] hover:bg-[#6b0f2b] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Select Photos From Device
                  </label>
                </div>

                {/* Thumbnails Gallery Preview */}
                {productForm.images.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                    {productForm.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 group bg-stone-100 shadow-2xs">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#881337] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                            MAIN
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-stone-400 text-xs italic bg-stone-50 rounded-xl border border-stone-200">
                    No images added yet. Click &quot;Select Photos From Device&quot; above.
                  </div>
                )}
              </div>

              {/* Toggles (Featured, New Arrival, and Top Sale) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={e => setProductForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#881337] focus:ring-[#881337]"
                  />
                  <span>⭐ Hero / Spotlight</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={productForm.is_new}
                    onChange={e => setProductForm(prev => ({ ...prev, is_new: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#881337] focus:ring-[#881337]"
                  />
                  <span>✨ New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={productForm.is_top_sale}
                    onChange={e => setProductForm(prev => ({ ...prev, is_top_sale: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#881337] focus:ring-[#881337]"
                  />
                  <span>🔥 Top Sale / Best Seller</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isSavingProduct}
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className={`px-6 py-2.5 bg-[#881337] hover:bg-[#6b0f2b] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 ${
                    isSavingProduct ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.01]'
                  }`}
                >
                  {isSavingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C7A76C]" />
                      <span>{editingProduct ? 'Saving Changes...' : 'Publishing Article...'}</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Save Changes' : 'Publish Article'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. LUXURY DELETE CONFIRMATION POPUP MODAL                      */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-6 relative overflow-hidden animate-scale-in">
            
            {/* Top Alert Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-[#881337] to-amber-500" />
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isDeletingTarget && setDeleteConfirmTarget(null)}
              disabled={isDeletingTarget}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors disabled:opacity-40"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Luxury Icon */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-[0.25em] text-rose-700 uppercase block">
                  CONFIRM PERMANENT REMOVAL
                </span>
                <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-[#18181B] mt-0.5">
                  {deleteConfirmTarget.type === 'all_products' 
                    ? 'Delete All Products?' 
                    : deleteConfirmTarget.type === 'all_orders'
                    ? 'Clear All Orders?'
                    : deleteConfirmTarget.type === 'product' 
                    ? 'Remove Article?' 
                    : 'Delete Order Record?'}
                </h3>
              </div>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {deleteConfirmTarget.type === 'all_products'
                  ? 'Are you sure you want to permanently delete ALL products in your catalog? This action cannot be reversed.'
                  : deleteConfirmTarget.type === 'all_orders'
                  ? 'Are you sure you want to permanently erase ALL orders and sales history? Gross sales will reset to RS. 0.'
                  : deleteConfirmTarget.type === 'product'
                  ? 'Are you sure you want to remove this article from the store? This action cannot be reversed.'
                  : 'Are you sure you want to permanently delete this customer order record from database?'}
              </p>
            </div>

            {/* Target Item Card Preview */}
            <div className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-2xl p-3.5 flex items-center gap-3.5">
              {deleteConfirmTarget.image ? (
                <div className="w-12 h-16 rounded-xl bg-white border border-stone-200 overflow-hidden flex-shrink-0 shadow-xs">
                  <img 
                    src={deleteConfirmTarget.image} 
                    alt={deleteConfirmTarget.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-rose-100/60 border border-rose-200 text-rose-700 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
                  {deleteConfirmTarget.type === 'all_products'
                    ? 'BULK STORE CATALOG'
                    : deleteConfirmTarget.type === 'all_orders'
                    ? 'ALL ORDERS & SALES'
                    : deleteConfirmTarget.type === 'product'
                    ? 'CATALOG ARTICLE'
                    : 'STORE ORDER'}
                </div>
                <div className="font-extrabold text-[#18181B] text-sm truncate">
                  {deleteConfirmTarget.title}
                </div>
                {deleteConfirmTarget.subtitle && (
                  <div className="text-[11px] text-stone-600 font-medium truncate mt-0.5">
                    {deleteConfirmTarget.subtitle}
                  </div>
                )}
              </div>
            </div>

            {/* Warning Notice */}
            <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 leading-snug">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                {deleteConfirmTarget.type === 'all_products'
                  ? 'All products will be instantly removed from your online store, Supabase database, and local cache.'
                  : deleteConfirmTarget.type === 'all_orders'
                  ? 'All order transactions and revenue statistics will be permanently reset to zero.'
                  : deleteConfirmTarget.type === 'product'
                  ? 'This item will be instantly removed from your active online store & collections.'
                  : 'All order information, customer delivery address, and payment records will be erased.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isDeletingTarget}
                onClick={() => setDeleteConfirmTarget(null)}
                className="w-full py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel / Keep
              </button>

              <button
                type="button"
                disabled={isDeletingTarget}
                onClick={handleExecuteDelete}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 disabled:opacity-75 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isDeletingTarget ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. FULL ORDER DETAILS & INVOICE DOSSIER MODAL                 */}
      {/* ------------------------------------------------------------- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-[#881337] uppercase tracking-widest block">
                  ORDER DOSSIER &bull; {selectedOrderDetails.payment_method === 'cod' ? 'CASH ON DELIVERY' : 'BANK TRANSFER'}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#18181B] flex items-center gap-2">
                  <span>ORDER #{selectedOrderDetails.id}</span>
                </h2>
                <div className="text-xs text-stone-400 mt-0.5">
                  Placed on: {selectedOrderDetails.created_at ? new Date(selectedOrderDetails.created_at).toLocaleString() : 'Just now'}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Destination Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Card */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-2">
                <div className="text-[10px] font-black text-[#881337] uppercase tracking-wider">Customer Details</div>
                <div className="font-extrabold text-[#18181B] text-base">{selectedOrderDetails.customer_name}</div>
                
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-3.5 h-3.5 text-[#881337] flex-shrink-0" />
                    <a href={`tel:${selectedOrderDetails.customer_phone}`} className="font-bold hover:underline">
                      {selectedOrderDetails.customer_phone}
                    </a>
                    <a
                      href={`https://wa.me/${selectedOrderDetails.customer_phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded-md bg-[#25D366] text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-[#20ba5a] transition-colors"
                      title="Chat with customer on WhatsApp"
                    >
                      <MessageCircle className="w-2.5 h-2.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {selectedOrderDetails.customer_email && (
                    <div className="text-stone-500 text-[11px] truncate">
                      {selectedOrderDetails.customer_email}
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-2">
                <div className="text-[10px] font-black text-[#881337] uppercase tracking-wider">Shipping Destination</div>
                <div className="font-extrabold text-[#18181B] flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4 text-[#881337] flex-shrink-0" />
                  <span>{selectedOrderDetails.city}, Pakistan</span>
                </div>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  {selectedOrderDetails.address}
                </p>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                  ✓ Free Express Delivery
                </div>
              </div>
            </div>

            {/* Ordered Items Full Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-black text-[#18181B] uppercase tracking-wider flex items-center justify-between">
                <span>Ordered Articles ({selectedOrderDetails.items.length})</span>
                <span className="text-[10px] text-stone-400 font-normal">Review item specs &amp; sizes</span>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-4">
                    <div className="w-14 h-16 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-[#18181B] text-xs leading-snug truncate">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-600 mt-1">
                        <span>Size: <strong className="text-[#881337] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{item.selected_size}</strong></span>
                        <span>&bull;</span>
                        <span>Qty: <strong className="text-[#18181B]">{item.quantity}</strong></span>
                      </div>
                      {item.custom_measurements && (
                        <div className="text-[10px] text-stone-500 bg-stone-50 px-2 py-1 rounded-md border border-stone-200 mt-1.5 leading-tight">
                          <strong>Custom Stitching:</strong> {item.custom_measurements}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-black text-sm text-[#881337]">
                        RS. {((item.price || 0) * item.quantity).toLocaleString()}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-stone-400 font-mono">
                          (RS. {(item.price || 0).toLocaleString()} each)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Changer & Order Total */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Update Order Status</label>
                <select
                  value={selectedOrderDetails.status || 'pending'}
                  onChange={e => {
                    if (selectedOrderDetails.id) {
                      handleStatusChange(selectedOrderDetails.id, e.target.value);
                      setSelectedOrderDetails(prev => prev ? { ...prev, status: e.target.value } : null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white text-[#881337] border border-[#C7A76C]/60 focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Grand Total Payable</span>
                <span className="text-2xl sm:text-3xl font-serif font-black text-[#881337]">
                  RS. {selectedOrderDetails.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. FULL PRODUCT SPECIFICATIONS & GALLERY PREVIEW MODAL        */}
      {/* ------------------------------------------------------------- */}
      {selectedProductPreview && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-[#881337] uppercase tracking-widest block">
                  {selectedProductPreview.category} &bull; ARTICLE PREVIEW
                </span>
                <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#18181B]">
                  {selectedProductPreview.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProductPreview(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Image Gallery Preview */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-stone-200 shadow-xs">
                {selectedProductPreview.images && selectedProductPreview.images[previewActiveImageIdx] ? (
                  <img
                    src={selectedProductPreview.images[previewActiveImageIdx]}
                    alt={selectedProductPreview.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {selectedProductPreview.is_featured && (
                  <span className="absolute top-3 left-3 bg-[#881337] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-md shadow">
                    FEATURED COUTURE
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProductPreview.images && selectedProductPreview.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedProductPreview.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewActiveImageIdx(idx)}
                      className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        previewActiveImageIdx === idx ? 'border-[#881337] shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Specs */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Selling Price</span>
                <div className="text-2xl font-serif font-black text-[#881337]">
                  PKR {selectedProductPreview.price.toLocaleString()}
                </div>
                {selectedProductPreview.compare_at_price && (
                  <div className="text-xs text-stone-400 line-through">
                    PKR {selectedProductPreview.compare_at_price.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Fabric &amp; Craft</span>
                <div className="text-xs font-bold text-[#18181B] mt-0.5">
                  {selectedProductPreview.fabric || 'Pure Fabric'}
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Category: {selectedProductPreview.category}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider block">
                Description &amp; Package Inclusions
              </label>
              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200 font-light">
                {selectedProductPreview.description || 'Pure handcrafted couture ensemble designed with signature craftsmanship.'}
              </p>
            </div>

            {/* Sizes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider block">
                Available Sizes
              </label>
              <div className="flex gap-2 flex-wrap">
                {(selectedProductPreview.sizes || ['XS', 'Small', 'Medium', 'Large', 'XL']).map(sz => (
                  <span key={sz} className="px-3 py-1 bg-white border border-stone-300 text-stone-800 text-xs font-bold rounded-lg shadow-2xs">
                    {sz}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <Link
                href={`/product/${selectedProductPreview.slug}`}
                className="px-4 py-2.5 rounded-xl border border-stone-300 hover:border-[#881337] text-stone-700 hover:text-[#881337] text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>View on Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const prod = selectedProductPreview;
                  setSelectedProductPreview(null);
                  openProductModal(prod);
                }}
                className="px-5 py-2.5 bg-[#881337] hover:bg-[#6b0f2b] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL Setup Helper Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-black text-[#18181B]">
                    Supabase PostgreSQL Setup
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Run this SQL script in your Supabase SQL Editor to create tables.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <p className="font-bold text-amber-950">📋 Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-stone-600 font-medium">
                  <li>Open your Supabase Project Dashboard (<span className="font-mono text-[10px]">https://supabase.com/dashboard</span>).</li>
                  <li>Click on <strong>SQL Editor</strong> in the left sidebar.</li>
                  <li>Click <strong>New query</strong>, paste the SQL below, and click <strong>RUN</strong>.</li>
                  <li>Once run, click &ldquo;⚡ Sync 191+ Catalog to Supabase&rdquo; on this dashboard.</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-[#18181B] text-[#E4D5B7] p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 border border-stone-800">
{`-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  category TEXT NOT NULL DEFAULT 'Luxury Pret',
  fabric TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  sizes TEXT[] DEFAULT '{"XS", "S", "M", "L", "XL", "Custom"}',
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS and Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow all operations for anon on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public to insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow update on orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete on orders" ON public.orders FOR DELETE USING (true);`}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  category TEXT NOT NULL DEFAULT 'Luxury Pret',
  fabric TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  sizes TEXT[] DEFAULT '{"XS", "S", "M", "L", "XL", "Custom"}',
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow all operations for anon on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public to insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow update on orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete on orders" ON public.orders FOR DELETE USING (true);`);
                  showFlash('SQL Script copied to clipboard!');
                }}
                className="px-5 py-2.5 bg-[#881337] hover:bg-[#6b0f2b] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy SQL Query</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
