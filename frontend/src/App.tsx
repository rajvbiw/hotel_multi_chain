import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Utensils, Store, ChefHat, ClipboardList, Award, BarChart3, ShoppingCart, 
  MapPin, Phone, Clock, Plus, Minus, User, History, Gift, Tag, Check, 
  AlertTriangle, Truck, Compass, Flame, Star, Sparkles, LogIn, Bell, CheckCircle2, ChevronRight
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// =========================================================================
// API & GATEWAY UTILS
// =========================================================================
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8000';

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'kitchen' | 'superadmin';
  branchId?: string | null;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// =========================================================================
// STATE CONTEXTS
// =========================================================================
interface AuthContextType {
  token: string | null;
  user: UserPayload | null;
  login: (email: string, role: string) => Promise<boolean>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  selectedBranch: any | null;
  setSelectedBranch: (branch: any) => void;
  coupon: any | null;
  setCoupon: (coupon: any) => void;
  discount: number;
  tableNumber: string | null;
  setTableNumber: (tbl: string | null) => void;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  setOrderType: (type: 'dine-in' | 'takeaway' | 'delivery') => void;
}
const CartContext = createContext<CartContextType | null>(null);

// Custom mock hooks to handle fetch requests locally or gracefully hit backend microservices
const fetchAPI = async (endpoint: string, options: any = {}, token: string | null = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, { ...options, headers });
    return await res.json();
  } catch (err) {
    console.warn(`[Gateway Fallback] Failed fetching ${endpoint}, using static/fallback data.`);
    return { success: false };
  }
};

// =========================================================================
// MAIN FRONTEND COMPONENT
// =========================================================================
export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'landing' | 'menu' | 'cart' | 'customer' | 'admin' | 'kds' | 'inventory'>('landing');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeBranch, setActiveBranch] = useState<any | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [orderTracking, setOrderTracking] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBranch, setSelectedBranchState] = useState<any | null>(null);
  const [coupon, setCoupon] = useState<any | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');

  // Admin stats
  const [adminStats, setAdminStats] = useState<any>({
    totals: { orders: 8, revenue: 114.92, avgOrderValue: 14.36 },
    branches: [
      { _id: 'Downtown Bistro', revenue: 78.94, count: 5 },
      { _id: 'Uptown Lounge & Grill', revenue: 35.98, count: 3 }
    ],
    orderTypes: [{ _id: 'dine-in', count: 4 }, { _id: 'delivery', count: 2 }, { _id: 'takeaway', count: 2 }]
  });

  // Inventory state
  const [inventory, setInventory] = useState<any[]>([]);

  // Sound effects
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
    playAlertSound();
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Initial configuration loading
  useEffect(() => {
    loadBranches();
    loadMenuItems();
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  // 2. WebSocket Real-time listeners setup
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8000';
    console.log(`[WebSocket] Connecting client socket...`);
    const newSocket = io(socketUrl, {
      query: {
        userId: user.id,
        role: user.role,
        branchId: user.branchId || '',
      }
    });

    setSocket(newSocket);

    newSocket.on('order_created', (payload) => {
      showToast(`🍳 New Order Placed in Branch! Order ID: #${payload.orderId.slice(-6)}`, 'success');
      loadActiveOrders();
    });

    newSocket.on('order_status_changed', (payload) => {
      showToast(`🔔 Order #${payload.orderId.slice(-6)} is now: ${payload.status}!`, 'info');
      loadActiveOrders();
    });

    newSocket.on('low_stock_alert', (payload) => {
      showToast(`⚠️ Low Stock Alert: "${payload.name}" is at ${payload.quantity}${payload.unit}!`, 'warning');
      loadInventory();
    });

    newSocket.on('notification_received', (payload) => {
      setNotifications(prev => [payload, ...prev]);
      showToast(`⭐ ${payload.title}: ${payload.message}`, 'success');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch branches helper
  const loadBranches = async () => {
    const res = await fetchAPI('/api/v1/menu/branches');
    if (res.success && res.data) {
      setBranches(res.data);
      if (res.data.length > 0) {
        setSelectedBranchState(res.data[0]);
        setActiveBranch(res.data[0]);
      }
    } else {
      // Offline fallback
      const fallbackBranches = [
        { _id: 'b1', name: 'Downtown Bistro', address: '102 Grand Avenue, Suite B', city: 'San Francisco', phone: '+1 (415) 555-0192', isActive: true, coords: { lat: 37.7749, lng: -122.4194 } },
        { _id: 'b2', name: 'Uptown Lounge & Grill', address: '888 Broadway St', city: 'New York', phone: '+1 (212) 555-0453', isActive: true, coords: { lat: 40.7128, lng: -74.0060 } }
      ];
      setBranches(fallbackBranches);
      setSelectedBranchState(fallbackBranches[0]);
      setActiveBranch(fallbackBranches[0]);
    }
  };

  // Fetch menus helper
  const loadMenuItems = async () => {
    const res = await fetchAPI('/api/v1/menu/items');
    if (res.success && res.data) {
      setMenuItems(res.data);
    } else {
      // Offline fallback menu items
      const fallbackItems = [
        { _id: 'm1', name: 'Classic Cheese Burger', description: 'Juicy grass-fed beef patty, cheddar, lettuce, organic house sauce.', price: 11.99, category: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', isVegetarian: false, isAvailable: true, branchIds: ['b1', 'b2'], nutritionalInfo: { calories: 650, protein: 32, carbs: 45, fat: 28 } },
        { _id: 'm2', name: 'Double Smash Burger', description: 'Double smash patty, caramelized onions, pickles, burger sauce.', price: 14.99, category: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80', isVegetarian: false, isAvailable: true, branchIds: ['b1'], nutritionalInfo: { calories: 880, protein: 48, carbs: 46, fat: 44 } },
        { _id: 'm3', name: 'Margherita Pizza', description: 'Neapolitan crust, rich San Marzano tomato sauce, fresh buffalo mozzarella, aromatic fresh basil leaves.', price: 13.99, category: 'Pizzas', imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80', isVegetarian: true, isAvailable: true, branchIds: ['b1', 'b2'], nutritionalInfo: { calories: 720, protein: 24, carbs: 90, fat: 18 } },
        { _id: 'm4', name: 'Organic Lemonade', description: 'Freshly squeezed lemons, organic cane sugar, soda water, fresh mint leaves.', price: 4.99, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', isVegetarian: true, isAvailable: true, branchIds: ['b1', 'b2'], nutritionalInfo: { calories: 110, protein: 0, carbs: 28, fat: 0 } },
        { _id: 'm5', name: 'Chocolate Fudge Brownie', description: 'Warm gooey chocolate brownie topped with chocolate drizzle.', price: 6.99, category: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80', isVegetarian: true, isAvailable: true, branchIds: ['b1', 'b2'], nutritionalInfo: { calories: 420, protein: 5, carbs: 54, fat: 19 } }
      ];
      setMenuItems(fallbackItems);
    }
  };

  const loadUserProfile = async () => {
    const res = await fetchAPI('/api/v1/auth/me', {}, token);
    if (res.success && res.data) {
      setUser(res.data);
      // Automatically load specific data depending on user role
      loadActiveOrders();
      loadInventory();
      loadNotifications();
    } else {
      logout();
    }
  };

  const loadActiveOrders = async () => {
    const res = await fetchAPI('/api/v1/orders', {}, token);
    if (res.success && res.data) {
      setOrderTracking(res.data);
    } else {
      // Mock history orders for beautiful rendering
      setOrderTracking([
        { _id: 'ord_1', items: [{ name: 'Classic Cheese Burger', quantity: 2, price: 11.99 }], total: 25.18, status: 'PREPARING', orderType: 'dine-in', tableNumber: 'Table 4', branchName: 'Downtown Bistro', createdAt: new Date().toISOString() },
        { _id: 'ord_2', items: [{ name: 'Margherita Pizza', quantity: 1, price: 13.99 }], total: 14.69, status: 'DELIVERED', orderType: 'delivery', deliveryAddress: '42 Main St', branchName: 'Downtown Bistro', createdAt: new Date(Date.now() - 3600000).toISOString() }
      ]);
    }
  };

  const loadInventory = async () => {
    const bId = user?.branchId || activeBranch?._id || 'b1';
    const res = await fetchAPI(`/api/v1/inventory?branchId=${bId}`, {}, token);
    if (res.success && res.data) {
      setInventory(res.data);
    } else {
      // Mock ingredients lists
      setInventory([
        { _id: 'i1', name: 'Beef Patty', quantity: 48, unit: 'pcs', minThreshold: 10, supplier: 'Sysco Premium Foods' },
        { _id: 'i2', name: 'Cheese Slice', quantity: 146, unit: 'pcs', minThreshold: 20, supplier: 'Sysco Premium Foods' },
        { _id: 'i3', name: 'Burger Bun', quantity: 58, unit: 'pcs', minThreshold: 12, supplier: 'Sysco Premium Foods' },
        { _id: 'i4', name: 'Pizza Dough', quantity: 8, unit: 'pcs', minThreshold: 10, supplier: 'Sysco Premium Foods' }, // Under threshold!
        { _id: 'i5', name: 'Mozzarella Cheese', quantity: 5600, unit: 'g', minThreshold: 1000, supplier: 'Sysco Premium Foods' },
        { _id: 'i6', name: 'Lemons', quantity: 76, unit: 'pcs', minThreshold: 15, supplier: 'Sysco Premium Foods' }
      ]);
    }
  };

  const loadNotifications = async () => {
    const res = await fetchAPI('/api/v1/notifications', {}, token);
    if (res.success && res.data) {
      setNotifications(res.data);
    } else {
      setNotifications([
        { _id: 'n1', title: 'Welcome Reward Applied!', message: 'Use WELCOME10 on checkouts to claim 10% off items!', type: 'loyalty', isRead: false }
      ]);
    }
  };

  // Fetch recommendations helper
  const loadAIRecommendations = async (bId: string) => {
    const res = await fetchAPI(`/api/v1/menu/recommendations?branchId=${bId}`);
    if (res.success && res.data) {
      setAiRecommendations(res.data);
    } else {
      // Mock AI items
      setAiRecommendations([
        { item: menuItems[0] || { name: 'Classic Cheese Burger', price: 11.99, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' }, aiScore: 98, aiReason: 'Highly matching with your profile burger preferences!' },
        { item: menuItems[2] || { name: 'Margherita Pizza', price: 13.99, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80' }, aiScore: 94, aiReason: 'Trending dynamic dinner selection today' }
      ]);
    }
  };

  const handleBranchSelect = (branch: any) => {
    setActiveBranch(branch);
    setSelectedBranchState(branch);
    loadAIRecommendations(branch._id);
    showToast(`📍 Selected branch: ${branch.name}`, 'info');
  };

  // Authentication controllers
  const login = async (email: string, role: string) => {
    try {
      const res = await fetchAPI('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'password123' })
      });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(`🔑 Logged in successfully as ${res.data.user.name}!`, 'success');
        return true;
      } else {
        // Fallback simulate login (for direct testing without backend online!)
        const mockNameMap: any = {
          'superadmin@restaurant.com': 'CEO Michael Scott',
          'admin@restaurant.com': 'Manager Pam Beesly',
          'kitchen@restaurant.com': 'Chef Dwight Schrute',
          'customer@restaurant.com': 'Jim Halpert'
        };
        const simulatedUser: UserPayload = {
          id: `usr_${Math.random().toString(36).substr(2, 9)}`,
          name: mockNameMap[email] || 'Valued Customer',
          email,
          role: role as any,
          branchId: role !== 'customer' && role !== 'superadmin' ? (branches[0]?._id || 'b1') : null
        };
        setUser(simulatedUser);
        setToken('simulated-token');
        showToast(`🔑 [SIMULATED] Logged in as ${simulatedUser.name}!`, 'success');
        return true;
      }
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
    setNotifications([]);
    setActiveTab('landing');
    showToast('🚪 Logged out successfully.', 'info');
  };

  // Cart operations
  const addToCart = (menuItem: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.menuItemId === menuItem._id);
      if (exists) {
        return prev.map(item => item.menuItemId === menuItem._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1, imageUrl: menuItem.imageUrl }];
    });
    showToast(`🛒 Added "${menuItem.name}" to cart!`, 'success');
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== itemId));
    showToast('Removed item from cart.', 'info');
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => item.menuItemId === itemId ? { ...item, quantity: qty } : item));
  };

  const checkout = async () => {
    if (!token) {
      showToast('🔑 Please log in to complete checkout!', 'warning');
      return;
    }

    const branch = selectedBranch || branches[0];
    const orderPayload = {
      branchId: branch._id,
      branchName: branch.name,
      items: cart,
      orderType,
      tableNumber,
      deliveryAddress: orderType === 'delivery' ? '42 Park Avenue' : null,
      paymentMethod: 'CARD',
      discountAmount: discountVal,
    };

    const res = await fetchAPI('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    }, token);

    if (res.success) {
      showToast('🚀 Order placed successfully!', 'success');
      setCart([]);
      setCoupon(null);
      setTableNumber(null);
      loadActiveOrders();
      loadInventory();
      setActiveTab('customer');
    } else {
      // Simulated checkout success (fallback)
      showToast('🚀 [SIMULATED] Order placed successfully! Live status updates starting...', 'success');
      
      const newOrder = {
        _id: `ord_${Math.floor(Math.random() * 1000000)}`,
        items: cart,
        total: checkoutTotal,
        discount: discountVal,
        status: 'PLACED',
        orderType,
        tableNumber,
        branchName: branch.name,
        createdAt: new Date().toISOString()
      };

      setOrderTracking(prev => [newOrder, ...prev]);
      setCart([]);
      setCoupon(null);
      setTableNumber(null);
      
      // Simulate kitchen workflow automatically in mock mode!
      setTimeout(() => {
        setOrderTracking(prev => prev.map(o => o._id === newOrder._id ? { ...o, status: 'CONFIRMED' } : o));
        showToast(`🍳 Order #${newOrder._id.slice(-4)} has been Confirmed by Chefs!`, 'info');
      }, 5000);

      setTimeout(() => {
        setOrderTracking(prev => prev.map(o => o._id === newOrder._id ? { ...o, status: 'PREPARING' } : o));
        showToast(`🔥 Order #${newOrder._id.slice(-4)} is now Preparing...`, 'info');
        
        // Mock inventory stock depletion on KDS start!
        setInventory(prev => prev.map(inv => {
          if (inv.name === 'Pizza Dough' || inv.name === 'Burger Bun') {
            return { ...inv, quantity: Math.max(0, inv.quantity - 1) };
          }
          return inv;
        }));
      }, 12000);

      setTimeout(() => {
        setOrderTracking(prev => prev.map(o => o._id === newOrder._id ? { ...o, status: 'READY' } : o));
        showToast(`📦 Order #${newOrder._id.slice(-4)} is Ready!`, 'success');
      }, 20000);

      setActiveTab('customer');
    }
  };

  // Coupon handling
  const applyCoupon = async (code: string) => {
    if (!code) return;
    const res = await fetchAPI('/api/v1/loyalty/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderValue: cartSubtotal })
    });
    if (res.success && res.data) {
      setCoupon(res.data);
      showToast(`🏷️ Coupon "${code}" applied successfully!`, 'success');
    } else {
      // Mock validation
      if (code.toUpperCase() === 'WELCOME10') {
        setCoupon({ code: 'WELCOME10', discountType: 'percentage', value: 10, discountAmount: Math.round(cartSubtotal * 0.1 * 100) / 100 });
        showToast('🏷️ [SIMULATED] Welcome coupon applied! 10% Off', 'success');
      } else {
        showToast('❌ Invalid coupon code or minimum purchase amount not met.', 'warning');
      }
    }
  };

  // KDS transitions
  const advanceOrderStatus = async (orderId: string, nextStatus: string) => {
    const res = await fetchAPI(`/api/v1/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    }, token);

    if (res.success) {
      showToast(`Chef updated order state to ${nextStatus}`, 'success');
      loadActiveOrders();
    } else {
      // Simulated state transitions
      setOrderTracking(prev => prev.map(ord => ord._id === orderId ? { ...ord, status: nextStatus } : ord));
      showToast(`[SIMULATED] Order progressed to ${nextStatus}`, 'success');
    }
  };

  // Supplier restock
  const restockItem = async (itemId: string) => {
    const res = await fetchAPI(`/api/v1/inventory/${itemId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: 50 })
    }, token);

    if (res.success) {
      showToast('Supplier restock completed +50 units.', 'success');
      loadInventory();
    } else {
      setInventory(prev => prev.map(item => item._id === itemId ? { ...item, quantity: item.quantity + 50 } : item));
      showToast('[SIMULATED] Supplier restock completed +50 units.', 'success');
    }
  };

  // Add dynamic review
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewItemId, setReviewItemId] = useState('');

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetchAPI('/api/v1/menu/reviews', {
      method: 'POST',
      body: JSON.stringify({ menuItemId: reviewItemId, rating: reviewRating, comment: reviewComment })
    }, token);
    if (res.success) {
      showToast('⭐ Review submitted! Thank you.', 'success');
      setReviewComment('');
      setReviewItemId('');
      loadMenuItems();
    } else {
      showToast('⭐ [SIMULATED] Review saved locally.', 'success');
      setReviewComment('');
      setReviewItemId('');
    }
  };

  // Financial calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountVal = coupon ? (coupon.discountType === 'percentage' ? (cartSubtotal * (coupon.value / 100)) : coupon.value) : 0;
  const cartTax = Math.round((cartSubtotal - discountVal) * 0.05 * 100) / 100;
  const checkoutTotal = Math.max(0, Math.round((cartSubtotal - discountVal + cartTax) * 100) / 100);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      <CartContext.Provider value={{ 
        cart, addToCart, removeFromCart, updateQuantity, clearCart: () => setCart([]), 
        selectedBranch, setSelectedBranch: setSelectedBranchState, coupon, setCoupon, 
        discount: discountVal, tableNumber, setTableNumber, orderType, setOrderType 
      }}>
        
        {/* Core Layout Wrapper */}
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-accent selection:text-white overflow-x-hidden">
          
          {/* TOAST PANEL */}
          {toast && (
            <div className="fixed top-6 right-6 z-50 animate-bounce glass-panel px-6 py-4 rounded-xl border border-brand-accent shadow-accent flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="text-brand-success w-6 h-6 animate-pulse" />}
              {toast.type === 'info' && <Bell className="text-brand-accent w-6 h-6 animate-pulse" />}
              {toast.type === 'warning' && <AlertTriangle className="text-brand-warning w-6 h-6 animate-pulse" />}
              <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
            </div>
          )}

          {/* HEADER NAV */}
          <header className="sticky top-0 z-40 bg-brand-bg/85 backdrop-blur-md border-b border-brand-border px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="bg-gradient-to-tr from-brand-accent to-emerald-400 p-2 rounded-xl shadow-glow">
                <Utensils className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-brand-accentGlow to-brand-accent bg-clip-text text-transparent">OMNIBITE</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-textMuted">Enterprise Monorepo</p>
              </div>
            </div>

            {/* Global User Info / Point indicator / Logs */}
            <div className="flex items-center gap-6">
              
              {/* Branch Indicator */}
              <div className="hidden md:flex items-center gap-2 bg-brand-card px-4 py-2 rounded-xl border border-brand-border text-xs">
                <MapPin className="text-brand-accent w-4 h-4" />
                <span className="font-semibold text-brand-textMuted">Branch:</span>
                <span className="text-white font-bold">{activeBranch?.name || 'Downtown Bistro'}</span>
              </div>

              {/* Point Indicator */}
              {user?.role === 'customer' && (
                <div className="bg-brand-card hover:shadow-accent transition-all duration-300 border border-brand-border px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('customer')}>
                  <Gift className="text-brand-success w-4 h-4 animate-bounce" />
                  <span className="text-xs font-semibold text-brand-textMuted">Loyalty Points:</span>
                  <span className="text-brand-success font-bold text-sm">180 pts</span>
                  <span className="text-[9px] bg-brand-success/15 text-brand-success px-1.5 py-0.5 rounded font-bold">SILVER</span>
                </div>
              )}

              {/* Notifications bell */}
              <div className="relative">
                <button className="p-2.5 rounded-xl bg-brand-card border border-brand-border hover:bg-brand-border text-brand-textMuted hover:text-white transition-all cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-accent w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center text-white border-2 border-brand-bg animate-pulse">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-brand-card rounded-2xl border border-brand-border shadow-accent p-4 z-50 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-brand-border pb-2 mb-2">
                      <span className="font-bold text-xs tracking-wider uppercase text-brand-textMuted">Notifications</span>
                      <button className="text-[10px] text-brand-accent hover:underline font-semibold" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}>Mark all read</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-brand-textMuted">No notifications available.</div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map(notif => (
                          <div key={notif._id || Math.random()} className={`p-3 rounded-xl border transition-all ${notif.isRead ? 'bg-transparent border-transparent' : 'bg-brand-accent/5 border-brand-accent/20'}`}>
                            <h4 className="text-xs font-bold text-white mb-0.5">{notif.title}</h4>
                            <p className="text-[11px] text-brand-textMuted leading-relaxed">{notif.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auth Button */}
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <span className="text-[9px] bg-brand-accent/20 text-brand-accentGlow px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{user.role}</span>
                  </div>
                  <button className="px-4 py-2 bg-brand-card hover:bg-brand-danger/10 hover:border-brand-danger hover:text-brand-danger border border-brand-border text-xs font-bold rounded-xl transition-all cursor-pointer" onClick={logout}>Sign Out</button>
                </div>
              ) : (
                <button className="px-4 py-2 bg-gradient-to-r from-brand-accent to-purple-600 hover:from-purple-600 hover:to-brand-accent text-white text-xs font-bold rounded-xl shadow-glow hover:shadow-accent transition-all duration-300 flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
                  <LogIn className="w-4 h-4" />
                  <span>Interactive Login</span>
                </button>
              )}

            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <div className="flex-1 flex flex-col md:flex-row">
            
            {/* SIDEBAR NAVIGATION */}
            <nav className="w-full md:w-64 bg-brand-bg border-b md:border-b-0 md:border-r border-brand-border p-6 flex flex-row md:flex-col gap-3 justify-center md:justify-start overflow-x-auto md:overflow-x-visible shrink-0">
              <button onClick={() => setActiveTab('landing')} className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shrink-0 ${activeTab === 'landing' ? 'bg-brand-accent text-white shadow-glow' : 'bg-transparent text-brand-textMuted hover:bg-brand-card hover:text-white'}`}>
                <Store className="w-4 h-4" />
                <span>Store Hub</span>
              </button>
              <button onClick={() => setActiveTab('menu')} className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shrink-0 ${activeTab === 'menu' ? 'bg-brand-accent text-white shadow-glow' : 'bg-transparent text-brand-textMuted hover:bg-brand-card hover:text-white'}`}>
                <Utensils className="w-4 h-4" />
                <span>Menu board</span>
              </button>
              <button onClick={() => setActiveTab('cart')} className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer relative shrink-0 ${activeTab === 'cart' ? 'bg-brand-accent text-white shadow-glow' : 'bg-transparent text-brand-textMuted hover:bg-brand-card hover:text-white'}`}>
                <ShoppingCart className="w-4 h-4" />
                <span>Checkout</span>
                {cart.length > 0 && (
                  <span className="bg-brand-success text-white w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce ml-auto">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              {token && (
                <button onClick={() => setActiveTab('customer')} className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shrink-0 ${activeTab === 'customer' ? 'bg-brand-accent text-white shadow-glow' : 'bg-transparent text-brand-textMuted hover:bg-brand-card hover:text-white'}`}>
                  <User className="w-4 h-4" />
                  <span>My Tracker</span>
                </button>
              )}

              {/* Roles Protected Sidebar dividers */}
              <div className="hidden md:block my-4 border-t border-brand-border"></div>

              {(user?.role === 'kitchen' || user?.role === 'admin' || user?.role === 'superadmin' || !token) && (
                <button onClick={() => { 
                  if(!token) login('kitchen@restaurant.com', 'kitchen');
                  setActiveTab('kds'); 
                }} className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shrink-0 ${activeTab === 'kds' ? 'bg-emerald-600 text-white shadow-success' : 'bg-transparent text-brand-textMuted hover:bg-brand-card hover:text-white'}`}>
                  <ChefHat className="w-4 h-4 text-brand-success" />
                  <span>Live KDS</span>
                </button>
              )}

              {(user?.role === 'admin' || user?.role === 'superadmin' || !token) && (
                <>
                  <button onClick={() => {
                    if(!token) login('admin@restaurant.com', 'admin');
                    setActiveTab('inventory');
                  }} className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shrink-0 ${activeTab === 'inventory' ? 'bg-brand-accent text-white shadow-glow' : 'bg-transparent text-brand-textMuted hover:bg-brand-card hover:text-white'}`}>
                    <ClipboardList className="w-4 h-4 text-yellow-500" />
                    <span>Stocks</span>
                  </button>
                  <button onClick={() => {
                    if(!token) login('superadmin@restaurant.com', 'superadmin');
                    setActiveTab('admin');
                  }} className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shrink-0 ${activeTab === 'admin' ? 'bg-brand-accent text-white shadow-glow' : 'bg-transparent text-brand-textMuted hover:bg-brand-card hover:text-white'}`}>
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>Analytics</span>
                  </button>
                </>
              )}
            </nav>

            {/* TAB BODY INTERFACES */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">

              {/* =========================================================================
                  TAB 1: LANDING PAGE
                  ========================================================================= */}
              {activeTab === 'landing' && (
                <div className="space-y-12">
                  
                  {/* Hero banner */}
                  <div className="relative glass-panel rounded-3xl p-8 md:p-12 overflow-hidden border border-brand-border shadow-accent">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-accent/20 rounded-full filter blur-[100px] animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[100px] animate-pulse"></div>
                    
                    <div className="max-w-2xl space-y-6 relative z-10">
                      <span className="text-xs bg-brand-accent/15 text-brand-accentGlow px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest border border-brand-accent/30 flex items-center gap-2 w-max">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI-Recommendation Powered
                      </span>
                      <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
                        Multi-Cloud <br />
                        <span className="bg-gradient-to-r from-brand-accentGlow via-brand-accent to-emerald-400 bg-clip-text text-transparent">Restaurant Chain</span> Platform
                      </h2>
                      <p className="text-brand-textMuted text-sm md:text-base leading-relaxed">
                        Experience the state of the art in high-fidelity microservice architectures. Route requests seamlessly, deduce raw stock in real-time, track loyalty cards, and view live order states on the kitchen display board instantly!
                      </p>
                      
                      <div className="flex flex-wrap gap-4 pt-4">
                        <button onClick={() => setActiveTab('menu')} className="px-6 py-3.5 bg-gradient-to-r from-brand-accent to-purple-600 hover:from-purple-600 hover:to-brand-accent text-white font-extrabold rounded-xl shadow-glow hover:shadow-accent transition-all duration-300 flex items-center gap-3 cursor-pointer">
                          <span>Browse Menu Items</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => { login('customer@restaurant.com', 'customer'); }} className="px-6 py-3.5 bg-brand-card hover:bg-brand-border border border-brand-border text-white font-bold rounded-xl transition-all cursor-pointer">
                          Simulate Customer Account
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Branch selector */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-extrabold text-white">Active Branches & Outlets</h3>
                      <p className="text-brand-textMuted text-xs mt-1">Select a branch location to view catalogs and local menu specialties.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {branches.map(branch => (
                        <div key={branch._id} onClick={() => handleBranchSelect(branch)} className={`glass-panel p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${activeBranch?._id === branch._id ? 'border-brand-accent shadow-accent scale-[1.01]' : 'border-brand-border hover:border-brand-accent/40'}`}>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-extrabold text-lg text-white">{branch.name}</h4>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold tracking-wider uppercase ${branch.isActive ? 'bg-brand-success/10 text-brand-success border border-brand-success/35' : 'bg-brand-danger/10 text-brand-danger'}`}>
                                {branch.isActive ? 'ONLINE' : 'OFFLINE'}
                              </span>
                            </div>
                            <p className="text-xs text-brand-textMuted flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /> {branch.address}</p>
                            <p className="text-xs text-brand-textMuted flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> {branch.phone}</p>
                            <p className="text-xs text-brand-textMuted flex items-center gap-2"><Clock className="w-3.5 h-3.5 shrink-0" /> Open: 9:00 AM - 10:00 PM</p>
                          </div>
                          <div className="mt-6 flex justify-between items-center border-t border-brand-border pt-4">
                            <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider">Lat: {branch.coords.lat} / Lng: {branch.coords.lng}</span>
                            <span className="text-brand-accent font-extrabold text-xs flex items-center gap-1.5">
                              <span>Enter branch menu</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dev profile switcher mock */}
                  <div className="space-y-6 bg-brand-card/45 border border-brand-border p-6 rounded-2xl">
                    <div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-brand-accentGlow">Interactive Role Playgrounds</h4>
                      <p className="text-brand-textMuted text-xs mt-1">Switch user context profiles with a single click to test different endpoints of our monorepo!</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <button onClick={() => login('customer@restaurant.com', 'customer')} className="flex flex-col items-center gap-2 p-4 bg-brand-card hover:bg-brand-border border border-brand-border rounded-xl transition-all text-center">
                        <div className="bg-brand-accent/15 p-2.5 rounded-full text-brand-accentGlow"><User className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-white">Jim (Customer)</span>
                        <span className="text-[9px] text-brand-textMuted">Test Rewards & Cart</span>
                      </button>
                      
                      <button onClick={() => login('kitchen@restaurant.com', 'kitchen')} className="flex flex-col items-center gap-2 p-4 bg-brand-card hover:bg-brand-border border border-brand-border rounded-xl transition-all text-center">
                        <div className="bg-brand-success/15 p-2.5 rounded-full text-brand-success"><ChefHat className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-white">Dwight (Chef)</span>
                        <span className="text-[9px] text-brand-textMuted">Test Live KDS Board</span>
                      </button>

                      <button onClick={() => login('admin@restaurant.com', 'admin')} className="flex flex-col items-center gap-2 p-4 bg-brand-card hover:bg-brand-border border border-brand-border rounded-xl transition-all text-center">
                        <div className="bg-yellow-500/15 p-2.5 rounded-full text-yellow-500"><ClipboardList className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-white">Pam (Branch Admin)</span>
                        <span className="text-[9px] text-brand-textMuted">Test Stock Controls</span>
                      </button>

                      <button onClick={() => login('superadmin@restaurant.com', 'superadmin')} className="flex flex-col items-center gap-2 p-4 bg-brand-card hover:bg-brand-border border border-brand-border rounded-xl transition-all text-center">
                        <div className="bg-purple-500/15 p-2.5 rounded-full text-purple-400"><BarChart3 className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-white">Michael (CEO)</span>
                        <span className="text-[9px] text-brand-textMuted">Test Admin Analytics</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* =========================================================================
                  TAB 2: MENU & ORDER BOARD
                  ========================================================================= */}
              {activeTab === 'menu' && (
                <div className="space-y-8">
                  
                  {/* Title & branch header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">Chef's Catalog Menu</h2>
                      <p className="text-brand-textMuted text-xs mt-1">Viewing items available at <span className="text-white font-bold">{activeBranch?.name || 'Downtown Bistro'}</span></p>
                    </div>

                    {/* QR table ordering simulator */}
                    <div className="bg-brand-card border border-brand-border px-4 py-3 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-brand-accent/15 p-1.5 rounded-lg text-brand-accentGlow">
                          <Compass className="w-5 h-5 animate-spin" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-extrabold tracking-wider text-brand-textMuted">QR Seating simulator</p>
                          <p className="text-xs font-bold text-white">{tableNumber ? `Seated at ${tableNumber}` : 'Browse as Dine-in Customer'}</p>
                        </div>
                      </div>
                      {!tableNumber ? (
                        <button onClick={() => {
                          setTableNumber('Table #4');
                          setOrderType('dine-in');
                          showToast('🍳 Seated successfully at Table #4! dine-in checkout active.', 'success');
                        }} className="px-3 py-1.5 bg-brand-accent hover:bg-purple-600 text-white text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer">
                          Scan QR #4
                        </button>
                      ) : (
                        <button onClick={() => {
                          setTableNumber(null);
                          setOrderType('delivery');
                          showToast('Fulfillment updated to delivery.', 'info');
                        }} className="text-[10px] font-bold text-brand-danger hover:underline">Leave table</button>
                      )}
                    </div>
                  </div>

                  {/* AI Recommendations panel */}
                  <div className="glass-panel p-6 rounded-2xl border border-brand-accent/20 relative overflow-hidden shadow-glow">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full filter blur-xl"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-brand-accentGlow w-5 h-5 animate-pulse shrink-0" />
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">AI Recommendation Engine</h3>
                      <span className="text-[9px] bg-brand-accent/15 text-brand-accentGlow px-2 py-0.5 rounded font-extrabold uppercase ml-2 animate-bounce">MOCKED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiRecommendations.length === 0 ? (
                        <div className="col-span-2 py-4 text-center text-xs text-brand-textMuted">Select a branch to initialize AI recommendation pairings.</div>
                      ) : (
                        aiRecommendations.map((rec, idx) => (
                          <div key={idx} className="flex gap-4 p-3 bg-brand-card/60 rounded-xl border border-brand-border hover:border-brand-accent/25 transition-all">
                            <img src={rec.item?.imageUrl} alt={rec.item?.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-xs text-white">{rec.item?.name}</h4>
                                  <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5"><Star className="w-3 h-3 fill-emerald-400" /> {rec.aiScore}% Match</span>
                                </div>
                                <p className="text-[10px] text-brand-textMuted leading-relaxed line-clamp-1 mt-0.5">{rec.aiReason}</p>
                              </div>
                              <button onClick={() => addToCart(rec.item)} className="w-max text-[10px] bg-brand-accent hover:bg-purple-600 text-white font-bold px-2 py-1 rounded transition-all cursor-pointer">Add to Cart</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {menuItems.map(item => (
                      <div key={item._id} className="glass-panel rounded-2xl overflow-hidden border border-brand-border flex flex-col justify-between hover:shadow-accent transition-all duration-300">
                        <div className="relative">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-44 object-cover" />
                          <div className="absolute top-3 right-3 bg-brand-bg/75 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-brand-border">
                            ${item.price}
                          </div>
                          {item.isVegetarian && (
                            <span className="absolute top-3 left-3 bg-emerald-500/85 backdrop-blur-sm text-[9px] font-extrabold uppercase px-2 py-1 rounded text-white tracking-widest">
                              VEG
                            </span>
                          )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-brand-accentGlow tracking-wider">{item.category}</span>
                            <h4 className="font-bold text-md text-white">{item.name}</h4>
                            <p className="text-xs text-brand-textMuted leading-relaxed line-clamp-3">{item.description}</p>
                          </div>

                          {/* Nutrition stats */}
                          <div className="bg-brand-card/45 border border-brand-border p-3 rounded-xl grid grid-cols-4 gap-1.5 text-center text-[10px]">
                            <div>
                              <p className="text-brand-textMuted uppercase font-bold text-[8px]">Calories</p>
                              <span className="text-white font-bold">{item.nutritionalInfo?.calories}</span>
                            </div>
                            <div>
                              <p className="text-brand-textMuted uppercase font-bold text-[8px]">Protein</p>
                              <span className="text-white font-bold">{item.nutritionalInfo?.protein}g</span>
                            </div>
                            <div>
                              <p className="text-brand-textMuted uppercase font-bold text-[8px]">Carbs</p>
                              <span className="text-white font-bold">{item.nutritionalInfo?.carbs}g</span>
                            </div>
                            <div>
                              <p className="text-brand-textMuted uppercase font-bold text-[8px]">Fat</p>
                              <span className="text-white font-bold">{item.nutritionalInfo?.fat}g</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => addToCart(item)} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-brand-accent to-purple-600 hover:from-purple-600 hover:to-brand-accent text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-glow">
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to cart</span>
                            </button>
                            
                            <button onClick={() => {
                              setReviewItemId(item._id);
                              showToast(`⭐ Review form active for "${item.name}"!`, 'info');
                            }} className="p-2.5 rounded-xl border border-brand-border text-brand-textMuted hover:text-white hover:bg-brand-border transition-all cursor-pointer">
                              <Star className="w-4 h-4 shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Review overlay submit form */}
                  {reviewItemId && (
                    <div className="glass-panel p-6 rounded-2xl border border-brand-accent shadow-accent max-w-md">
                      <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4">Leave Food Review</h4>
                      <form onSubmit={submitReview} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-textMuted mb-2">Rating</label>
                          <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full bg-brand-card border border-brand-border p-2.5 rounded-xl text-white font-bold text-xs outline-none">
                            <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                            <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                            <option value={3}>⭐⭐⭐ (3/5)</option>
                            <option value={2}>⭐⭐ (2/5)</option>
                            <option value={1}>⭐ (1/5)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-textMuted mb-2">Review Comment</label>
                          <textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="How was the flavor, texture, and packaging?" className="w-full bg-brand-card border border-brand-border p-3 rounded-xl text-white text-xs outline-none" required />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setReviewItemId('')} className="px-4 py-2 border border-brand-border text-brand-textMuted hover:text-white rounded-xl text-xs">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-brand-accent hover:bg-purple-600 text-white rounded-xl text-xs font-bold">Submit Review</button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* =========================================================================
                  TAB 3: CART & CHECKOUT
                  ========================================================================= */}
              {activeTab === 'cart' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white">Cart & Checkout Summary</h2>
                    <p className="text-brand-textMuted text-xs mt-1">Review items, apply promo codes, and finalize payment.</p>
                  </div>

                  {cart.length === 0 ? (
                    <div className="glass-panel p-12 text-center rounded-2xl border border-brand-border space-y-4">
                      <ShoppingCart className="w-16 h-16 text-brand-textMuted mx-auto animate-bounce" />
                      <h4 className="font-extrabold text-lg text-white">Your Shopping Cart is empty.</h4>
                      <p className="text-brand-textMuted text-xs max-w-sm mx-auto">Explore our menu dashboard and select delicious fresh items to load them into your checkout.</p>
                      <button onClick={() => setActiveTab('menu')} className="px-6 py-2.5 bg-brand-accent hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Browse Menu</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left: Cart Items lists */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel rounded-2xl border border-brand-border p-6 space-y-4">
                          <h3 className="font-extrabold text-md text-white uppercase tracking-wider pb-2 border-b border-brand-border">Order Items</h3>
                          
                          {cart.map(item => (
                            <div key={item.menuItemId} className="flex justify-between items-center py-2 border-b border-brand-border/40 last:border-b-0">
                              <div className="flex gap-4 items-center">
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                <div>
                                  <h4 className="font-bold text-xs text-white">{item.name}</h4>
                                  <span className="text-[10px] text-brand-textMuted">${item.price} each</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center bg-brand-card border border-brand-border rounded-xl overflow-hidden">
                                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="p-2 hover:bg-brand-border text-brand-textMuted hover:text-white transition-all"><Minus className="w-3.5 h-3.5" /></button>
                                  <span className="px-3 font-bold text-xs text-white">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="p-2 hover:bg-brand-border text-brand-textMuted hover:text-white transition-all"><Plus className="w-3.5 h-3.5" /></button>
                                </div>
                                <span className="font-bold text-xs text-white min-w-[50px] text-right">${Math.round(item.price * item.quantity * 100) / 100}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Type selectors */}
                        <div className="glass-panel rounded-2xl border border-brand-border p-6 space-y-4">
                          <h3 className="font-extrabold text-md text-white uppercase tracking-wider pb-2 border-b border-brand-border">Fulfillment Details</h3>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => { setOrderType('dine-in'); setTableNumber('Table #4'); }} className={`p-4 rounded-xl border font-bold text-xs transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${orderType === 'dine-in' ? 'border-brand-accent bg-brand-accent/5 text-white shadow-glow' : 'border-brand-border bg-brand-card hover:bg-brand-border text-brand-textMuted'}`}>
                              <Store className="w-5 h-5" />
                              <span>Dine-in (QR)</span>
                            </button>
                            <button onClick={() => { setOrderType('takeaway'); setTableNumber(null); }} className={`p-4 rounded-xl border font-bold text-xs transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${orderType === 'takeaway' ? 'border-brand-accent bg-brand-accent/5 text-white shadow-glow' : 'border-brand-border bg-brand-card hover:bg-brand-border text-brand-textMuted'}`}>
                              <Utensils className="w-5 h-5" />
                              <span>Takeaway</span>
                            </button>
                            <button onClick={() => { setOrderType('delivery'); setTableNumber(null); }} className={`p-4 rounded-xl border font-bold text-xs transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${orderType === 'delivery' ? 'border-brand-accent bg-brand-accent/5 text-white shadow-glow' : 'border-brand-border bg-brand-card hover:bg-brand-border text-brand-textMuted'}`}>
                              <Truck className="w-5 h-5" />
                              <span>Delivery</span>
                            </button>
                          </div>

                          {orderType === 'dine-in' && (
                            <div className="p-3 bg-brand-card border border-brand-border rounded-xl text-xs flex justify-between items-center">
                              <span className="text-brand-textMuted">QR Seating session context:</span>
                              <span className="font-extrabold text-brand-accentGlow">{tableNumber || 'Table #4'}</span>
                            </div>
                          )}
                          {orderType === 'delivery' && (
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-brand-textMuted">Delivery Destination Address</label>
                              <input type="text" defaultValue="42 Park Avenue, San Francisco, CA" className="w-full bg-brand-card border border-brand-border p-3 rounded-xl text-white text-xs outline-none" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Payment details, Coupon, placing order */}
                      <div className="space-y-6">
                        
                        {/* Coupon codes panel */}
                        <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
                          <h3 className="font-extrabold text-md text-white uppercase tracking-wider pb-2 border-b border-brand-border">Vouchers</h3>
                          <div className="flex gap-2">
                            <input type="text" id="couponInput" placeholder="WELCOME10" className="flex-1 bg-brand-card border border-brand-border px-3.5 py-2.5 rounded-xl text-xs text-white uppercase font-bold outline-none" />
                            <button onClick={() => {
                              const codeVal = (document.getElementById('couponInput') as HTMLInputElement)?.value;
                              applyCoupon(codeVal || 'WELCOME10');
                            }} className="px-4 py-2.5 bg-brand-card border border-brand-border hover:bg-brand-border text-xs font-bold text-white rounded-xl transition-all cursor-pointer">Apply</button>
                          </div>
                          <div className="text-[10px] text-brand-textMuted flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Try: <span className="text-white font-bold hover:underline cursor-pointer" onClick={() => applyCoupon('WELCOME10')}>WELCOME10</span></div>
                        </div>

                        {/* Payment Breakdown panel */}
                        <div className="glass-panel p-6 rounded-2xl border border-brand-accent/20 space-y-4 shadow-glow">
                          <h3 className="font-extrabold text-md text-white uppercase tracking-wider pb-2 border-b border-brand-border">Total checkout</h3>
                          
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-brand-textMuted">Subtotal</span>
                              <span className="text-white font-semibold">${cartSubtotal.toFixed(2)}</span>
                            </div>
                            {coupon && (
                              <div className="flex justify-between text-brand-success font-bold">
                                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Promo ({coupon.code})</span>
                                <span>-${discountVal.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-brand-textMuted">Taxes (5% VAT)</span>
                              <span className="text-white font-semibold">${cartTax.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-brand-border/60 my-2 pt-2 flex justify-between text-base font-extrabold">
                              <span className="text-white">Total due</span>
                              <span className="text-brand-accentGlow">${checkoutTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="space-y-3 pt-4">
                            <button onClick={checkout} className="w-full py-4 bg-gradient-to-r from-brand-accent to-purple-600 hover:from-purple-600 hover:to-brand-accent text-white font-extrabold rounded-xl transition-all shadow-glow hover:shadow-accent flex items-center justify-center gap-2.5 cursor-pointer">
                              <CheckCircle2 className="w-5 h-5 animate-pulse" />
                              <span>Complete Checkout Order</span>
                            </button>
                            <p className="text-[10px] text-brand-textMuted text-center">By clicking, you acknowledge this is a high-fidelity checkout simulation.</p>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* =========================================================================
                  TAB 4: MY TRACKER (CUSTOMER DASHBOARD)
                  ========================================================================= */}
              {activeTab === 'customer' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white">Customer Account Tracker</h2>
                    <p className="text-brand-textMuted text-xs mt-1">Monitor live kitchen prep, checkout receipts, and rewards.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Live order stepper tracker */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-panel p-6 rounded-2xl border border-brand-accent/20 space-y-6 shadow-glow">
                        <div className="flex justify-between items-center">
                          <h3 className="font-extrabold text-md text-white uppercase tracking-wider">Live Order Status Tracker</h3>
                          <span className="text-[9px] bg-brand-success/15 text-brand-success px-2 py-0.5 rounded font-extrabold tracking-wider animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" /> REAL-TIME CONNECTED
                          </span>
                        </div>

                        {orderTracking.length === 0 ? (
                          <div className="text-center py-10 text-xs text-brand-textMuted">You have no active orders. Head to the menu catalog to place your first checkout!</div>
                        ) : (
                          orderTracking.map(order => (
                            <div key={order._id} className="p-4 bg-brand-card rounded-xl border border-brand-border space-y-4">
                              <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                                <div>
                                  <h4 className="font-extrabold text-xs text-white">Order ID: #{order._id.slice(-6)}</h4>
                                  <p className="text-[10px] text-brand-textMuted mt-0.5">Outlet: {order.branchName} • Type: {order.orderType}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded font-extrabold uppercase shrink-0 ${order.status === 'READY' || order.status === 'DELIVERED' ? 'bg-brand-success/15 text-brand-success' : 'bg-brand-accent/15 text-brand-accentGlow animate-pulse'}`}>
                                  {order.status}
                                </span>
                              </div>

                              {/* Live Stepper design */}
                              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] relative mt-4">
                                <div className={`space-y-1 ${order.status !== 'CANCELLED' ? 'text-brand-success' : 'text-brand-textMuted'}`}>
                                  <div className="w-4 h-4 rounded-full bg-brand-success text-white font-bold flex items-center justify-center mx-auto text-[8px] animate-pulse">✓</div>
                                  <p className="font-bold">Placed</p>
                                </div>
                                <div className={`space-y-1 ${['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'].includes(order.status) ? 'text-brand-success' : 'text-brand-textMuted'}`}>
                                  <div className={`w-4 h-4 rounded-full font-bold flex items-center justify-center mx-auto text-[8px] ${['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'].includes(order.status) ? 'bg-brand-success text-white animate-pulse' : 'bg-brand-border text-brand-textMuted'}`}>2</div>
                                  <p className="font-bold">Confirmed</p>
                                </div>
                                <div className={`space-y-1 ${['PREPARING', 'READY', 'DELIVERED'].includes(order.status) ? 'text-brand-success' : 'text-brand-textMuted'}`}>
                                  <div className={`w-4 h-4 rounded-full font-bold flex items-center justify-center mx-auto text-[8px] ${['PREPARING', 'READY', 'DELIVERED'].includes(order.status) ? 'bg-brand-success text-white animate-pulse' : 'bg-brand-border text-brand-textMuted'}`}>3</div>
                                  <p className="font-bold">Preparing</p>
                                </div>
                                <div className={`space-y-1 ${['READY', 'DELIVERED'].includes(order.status) ? 'text-brand-success' : 'text-brand-textMuted'}`}>
                                  <div className={`w-4 h-4 rounded-full font-bold flex items-center justify-center mx-auto text-[8px] ${['READY', 'DELIVERED'].includes(order.status) ? 'bg-brand-success text-white animate-pulse' : 'bg-brand-border text-brand-textMuted'}`}>4</div>
                                  <p className="font-bold">Ready</p>
                                </div>
                                <div className={`space-y-1 ${['DELIVERED'].includes(order.status) ? 'text-brand-success' : 'text-brand-textMuted'}`}>
                                  <div className={`w-4 h-4 rounded-full font-bold flex items-center justify-center mx-auto text-[8px] ${['DELIVERED'].includes(order.status) ? 'bg-brand-success text-white animate-pulse' : 'bg-brand-border text-brand-textMuted'}`}>5</div>
                                  <p className="font-bold">Completed</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right: Loyalty tier progress metrics */}
                    <div className="space-y-6">
                      <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
                        <h3 className="font-extrabold text-md text-white uppercase tracking-wider">Membership Perks</h3>
                        
                        <div className="space-y-4 text-xs">
                          <div className="flex gap-3 items-center">
                            <div className="bg-brand-success/15 p-2 rounded-lg text-brand-success"><Check className="w-4 h-4" /></div>
                            <div>
                              <p className="font-bold text-white">Double Loyalty Points</p>
                              <span className="text-[10px] text-brand-textMuted">Earn points twice as fast at top branches.</span>
                            </div>
                          </div>
                          <div className="flex gap-3 items-center">
                            <div className="bg-brand-success/15 p-2 rounded-lg text-brand-success"><Check className="w-4 h-4" /></div>
                            <div>
                              <p className="font-bold text-white">Free Dine-in Beverages</p>
                              <span className="text-[10px] text-brand-textMuted">Show silver card level to servers for rewards.</span>
                            </div>
                          </div>
                          <div className="flex gap-3 items-center">
                            <div className="bg-brand-success/15 p-2 rounded-lg text-brand-success"><Check className="w-4 h-4" /></div>
                            <div>
                              <p className="font-bold text-white">Express Delivery Priorities</p>
                              <span className="text-[10px] text-brand-textMuted">Auto-promoted in checkout schedules.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 5: ANALYTICS (ADMIN DASHBOARD)
                  ========================================================================= */}
              {activeTab === 'admin' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white">Super Admin Analytics</h2>
                    <p className="text-brand-textMuted text-xs mt-1">Multi-branch aggregate statistics, receipts totals, and outlet breakdowns.</p>
                  </div>

                  {/* Standard cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-2">
                      <p className="text-[11px] uppercase font-bold tracking-wider text-brand-textMuted">Aggregate Platform Sales</p>
                      <h3 className="text-3xl font-extrabold text-brand-accentGlow">${adminStats.totals.revenue.toFixed(2)}</h3>
                      <span className="text-[9px] bg-brand-success/15 text-brand-success px-2 py-0.5 rounded font-extrabold">+14% vs yesterday</span>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-2">
                      <p className="text-[11px] uppercase font-bold tracking-wider text-brand-textMuted">Platform Orders Tally</p>
                      <h3 className="text-3xl font-extrabold text-white">{adminStats.totals.orders} active</h3>
                      <span className="text-[9px] bg-brand-success/15 text-brand-success px-2 py-0.5 rounded font-extrabold">100% successful fulfillment</span>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-2">
                      <p className="text-[11px] uppercase font-bold tracking-wider text-brand-textMuted">Average Order Checkout Size</p>
                      <h3 className="text-3xl font-extrabold text-brand-success">${adminStats.totals.avgOrderValue.toFixed(2)}</h3>
                      <span className="text-[9px] bg-brand-success/15 text-brand-success px-2 py-0.5 rounded font-extrabold">Target $15.00</span>
                    </div>
                  </div>

                  {/* Visual SVG charts bar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-6">
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Branch Revenue Shares</h3>
                      
                      <div className="space-y-4">
                        {adminStats.branches.map((branch: any) => (
                          <div key={branch._id} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-white">
                              <span>{branch._id} ({branch.count} orders)</span>
                              <span>${branch.revenue.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-brand-border h-3 rounded-full overflow-hidden">
                              <div className="bg-brand-accent h-full rounded-full" style={{ width: `${Math.min(100, (branch.revenue / adminStats.totals.revenue) * 100)}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-6">
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Checkout Types Breakdown</h3>
                      
                      <div className="space-y-4">
                        {adminStats.orderTypes.map((type: any) => (
                          <div key={type._id} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-white">
                              <span className="capitalize">{type._id}</span>
                              <span>{type.count} sessions</span>
                            </div>
                            <div className="w-full bg-brand-border h-3 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (type.count / adminStats.totals.orders) * 100)}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* =========================================================================
                  TAB 6: KITCHEN DISPLAY SCREEN (KDS)
                  ========================================================================= */}
              {activeTab === 'kds' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">Live Kitchen Display Screen</h2>
                      <p className="text-brand-textMuted text-xs mt-1">Real-time KDS board managing food preparation and pickup columns.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 bg-brand-success rounded-full animate-ping"></span>
                      <span className="text-xs font-bold text-white">WS CONNECTED</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Column 1: Placed / To Prepare */}
                    <div className="glass-panel p-4 rounded-2xl border border-brand-border bg-brand-bg/40 space-y-4">
                      <div className="flex justify-between items-center border-b border-brand-border pb-2">
                        <span className="font-bold text-xs text-brand-textMuted uppercase tracking-wider">To Prepare (PLACED)</span>
                        <span className="bg-brand-border text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {orderTracking.filter(o => o.status === 'PLACED').length}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {orderTracking.filter(o => o.status === 'PLACED').map(order => (
                          <div key={order._id} className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-xs text-white">Order #{order._id.slice(-6)}</h4>
                                <p className="text-[10px] text-brand-textMuted mt-0.5">{order.orderType} • {order.tableNumber || 'Fulfillment'}</p>
                              </div>
                            </div>
                            <div className="border-t border-brand-border/60 pt-2 space-y-1">
                              {order.items.map((item: any, idx: number) => (
                                <p key={idx} className="text-[11px] font-semibold text-white">🍖 {item.quantity}x {item.name}</p>
                              ))}
                            </div>
                            <button onClick={() => advanceOrderStatus(order._id, 'CONFIRMED')} className="w-full py-2 bg-brand-accent hover:bg-purple-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer">
                              Accept & Confirm
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: In Cooking (CONFIRMED / PREPARING) */}
                    <div className="glass-panel p-4 rounded-2xl border border-brand-border bg-brand-bg/40 space-y-4">
                      <div className="flex justify-between items-center border-b border-brand-border pb-2">
                        <span className="font-bold text-xs text-brand-textMuted uppercase tracking-wider">Preparing (COOKING)</span>
                        <span className="bg-brand-accent/20 text-brand-accentGlow text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {orderTracking.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.status)).length}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {orderTracking.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.status)).map(order => (
                          <div key={order._id} className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-xs text-white">Order #{order._id.slice(-6)}</h4>
                                <p className="text-[10px] text-brand-textMuted mt-0.5">{order.orderType} • {order.tableNumber || 'Fulfillment'}</p>
                              </div>
                            </div>
                            <div className="border-t border-brand-border/60 pt-2 space-y-1">
                              {order.items.map((item: any, idx: number) => (
                                <p key={idx} className="text-[11px] font-semibold text-white">🔥 {item.quantity}x {item.name}</p>
                              ))}
                            </div>
                            {order.status === 'CONFIRMED' ? (
                              <button onClick={() => advanceOrderStatus(order._id, 'PREPARING')} className="w-full py-2 bg-brand-accent hover:bg-purple-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 animate-pulse text-orange-400" />
                                <span>Start Cooking</span>
                              </button>
                            ) : (
                              <button onClick={() => advanceOrderStatus(order._id, 'READY')} className="w-full py-2 bg-brand-success hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer">
                                Mark Ready (Assemble)
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Assembly & Completion (READY / OUT_FOR_DELIVERY / DELIVERED) */}
                    <div className="glass-panel p-4 rounded-2xl border border-brand-border bg-brand-bg/40 space-y-4">
                      <div className="flex justify-between items-center border-b border-brand-border pb-2">
                        <span className="font-bold text-xs text-brand-textMuted uppercase tracking-wider">Ready (SERVED / PICKUP)</span>
                        <span className="bg-brand-success/20 text-brand-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {orderTracking.filter(o => ['READY', 'OUT_FOR_DELIVERY'].includes(o.status)).length}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {orderTracking.filter(o => ['READY', 'OUT_FOR_DELIVERY'].includes(o.status)).map(order => (
                          <div key={order._id} className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-xs text-white">Order #{order._id.slice(-6)}</h4>
                                <p className="text-[10px] text-brand-textMuted mt-0.5">{order.orderType} • {order.tableNumber || 'Fulfillment'}</p>
                              </div>
                            </div>
                            <div className="border-t border-brand-border/60 pt-2 space-y-1">
                              {order.items.map((item: any, idx: number) => (
                                <p key={idx} className="text-[11px] font-semibold text-white">📦 {item.quantity}x {item.name}</p>
                              ))}
                            </div>
                            <button onClick={() => advanceOrderStatus(order._id, 'DELIVERED')} className="w-full py-2 bg-brand-card border border-brand-success hover:bg-brand-success hover:text-white text-brand-success font-bold text-xs rounded-lg transition-all cursor-pointer">
                              Mark Completed (Delivered)
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 7: INVENTORY DASHBOARD
                  ========================================================================= */}
              {activeTab === 'inventory' && (
                <div className="space-y-8">
                  
                  {/* Title & recipe helper header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">Branch Inventory Stocks</h2>
                      <p className="text-brand-textMuted text-xs mt-1">Viewing raw ingredient stocks and recipe mappings for <span className="text-white font-bold">{activeBranch?.name || 'Downtown Bistro'}</span></p>
                    </div>

                    <button onClick={() => loadInventory()} className="px-4 py-2 border border-brand-border hover:bg-brand-card text-xs font-bold rounded-xl transition-all cursor-pointer">
                      Synchronize stock levels
                    </button>
                  </div>

                  {/* Stock Levels progress bars */}
                  <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-6">
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Raw Ingredient Stocks</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {inventory.map(item => {
                        const lowStock = item.quantity <= item.minThreshold;
                        // Calculate a nice slider percentage for display
                        const maxVal = item.minThreshold * 4;
                        const percentage = Math.min(100, Math.round((item.quantity / maxVal) * 100));

                        return (
                          <div key={item._id} className="p-4 bg-brand-card/65 border border-brand-border rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-xs text-white">{item.name}</h4>
                                <p className="text-[10px] text-brand-textMuted mt-0.5">Supplier: {item.supplier}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`text-xs font-extrabold ${lowStock ? 'text-brand-danger' : 'text-brand-success'}`}>
                                  {item.quantity} {item.unit}
                                </span>
                                <p className="text-[9px] text-brand-textMuted mt-0.5">Min req: {item.minThreshold}</p>
                              </div>
                            </div>

                            <div className="w-full bg-brand-border h-2.5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${lowStock ? 'bg-brand-danger animate-pulse' : 'bg-brand-success'}`} style={{ width: `${percentage}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              {lowStock ? (
                                <span className="text-[9px] bg-brand-danger/10 text-brand-danger px-2 py-0.5 rounded font-extrabold uppercase animate-pulse flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> LOW STOCK ALARM
                                </span>
                              ) : (
                                <span className="text-[9px] text-brand-success font-semibold">Stock level healthy</span>
                              )}
                              <button onClick={() => restockItem(item._id)} className="text-[10px] bg-brand-border hover:bg-brand-accent hover:text-white px-2 py-1 rounded transition-all cursor-pointer font-bold">
                                Restock +50
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recipe Links Helper */}
                  <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Recipe Composition & Autodeductions Mapping</h3>
                    <p className="text-brand-textMuted text-xs leading-relaxed">
                      Our system links menu orders to automated recipe ingredient deductions per branch. Every time a customer places an order, the EventBus triggers stock decrements instantly!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 bg-brand-card/45 border border-brand-border rounded-xl space-y-2">
                        <h4 className="font-bold text-xs text-white">Classic Cheese Burger</h4>
                        <div className="text-[10px] text-brand-textMuted space-y-1">
                          <p>🥩 Beef Patty: 1 pcs</p>
                          <p>🧀 Cheese Slice: 1 pcs</p>
                          <p>🍔 Burger Bun: 1 pcs</p>
                          <p>🥬 Lettuce: 20g</p>
                        </div>
                      </div>
                      <div className="p-4 bg-brand-card/45 border border-brand-border rounded-xl space-y-2">
                        <h4 className="font-bold text-xs text-white">Margherita Pizza</h4>
                        <div className="text-[10px] text-brand-textMuted space-y-1">
                          <p>🍞 Dough: 1 pcs</p>
                          <p>🥫 Tomato Sauce: 100ml</p>
                          <p>🧀 Mozzarella: 150g</p>
                          <p>🌿 Basil: 10g</p>
                        </div>
                      </div>
                      <div className="p-4 bg-brand-card/45 border border-brand-border rounded-xl space-y-2">
                        <h4 className="font-bold text-xs text-white">Organic Lemonade</h4>
                        <div className="text-[10px] text-brand-textMuted space-y-1">
                          <p>🍋 Lemons: 2 pcs</p>
                          <p>🥤 Soda Can: 1 pcs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </main>

          </div>

          {/* SYSTEM FOOTER */}
          <footer className="bg-brand-bg border-t border-brand-border px-6 py-6 text-center text-xs text-brand-textMuted">
            <p className="font-semibold">OmniBite Platform © 2026 • Build Production Grade Multi-Cloud Monorepos</p>
            <p className="text-[10px] mt-1">Configured for Google Cloud, AWS, & Azure Multi-Tenant Deployments. Developed Pair-Programmed with Antigravity.</p>
          </footer>

        </div>

      </CartContext.Provider>
    </AuthContext.Provider>
  );
}
