import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { StudentDashboard } from './components/StudentDashboard';
import { FoodMenu } from './components/FoodMenu';
import { PreOrderView } from './components/PreOrderView';
import { OrderTracker } from './components/OrderTracker';
import { QueueTracker } from './components/QueueTracker';
import { PredictionsView } from './components/PredictionsView';
import { AdminDashboard } from './components/AdminDashboard';
import { ActiveOrdersView } from './components/ActiveOrdersView';
import { AiAssistant } from './components/AiAssistant';
import { AuthModal } from './components/AuthModal';
import { 
  User, 
  FoodItem, 
  CartItem, 
  Order, 
  OrderStatus,
  QueueMetrics, 
  WaitingTimePrediction, 
  PeakTimePredictionResult 
} from './types';
import { 
  Sparkles, 
  Utensils, 
  Clock, 
  Users, 
  ShieldAlert, 
  Heart,
  Home,
  ShoppingBag,
  MapPin,
  Hourglass,
  BarChart3,
  ShieldCheck,
  Bot,
  Flame
} from 'lucide-react';
import {
  loadStoredOrders,
  saveStoredOrders,
  loadStoredFoods,
  saveStoredFoods,
  loadStoredCounters,
  saveStoredCounters,
  calculateQueueMetrics,
  getWaitingTimePrediction,
  getPeakTimePrediction,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isHeroDismissed, setIsHeroDismissed] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@college.edu',
    role: 'student',
  });

  // Data states with persistent fallback defaults
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => loadStoredFoods());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => loadStoredOrders());
  const [availableCounters, setAvailableCounters] = useState<number>(() => loadStoredCounters());
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics>(() => 
    calculateQueueMetrics(loadStoredOrders(), loadStoredCounters())
  );
  const [waitingPrediction, setWaitingPrediction] = useState<WaitingTimePrediction>(() => 
    getWaitingTimePrediction(calculateQueueMetrics(loadStoredOrders(), loadStoredCounters()))
  );
  const [peakPrediction, setPeakPrediction] = useState<PeakTimePredictionResult>(() => 
    getPeakTimePrediction()
  );
  
  // UI & Dialog states
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // 1. Fetch Food Menu
  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/foods');
      if (res.ok) {
        const data = await res.json();
        if (data.foods && data.foods.length > 0) {
          setFoodItems(data.foods);
          saveStoredFoods(data.foods);
        }
      }
    } catch (err) {
      console.error('Error loading foods:', err);
    }
  };

  // 2. Fetch Queue Metrics
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const data = await res.json();
        setQueueMetrics(data);
        if (data.available_counters) {
          setAvailableCounters(data.available_counters);
          saveStoredCounters(data.available_counters);
        }
      }
    } catch (err) {
      console.error('Error loading queue:', err);
    }
  }, []);

  // 3. Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const url = currentUser?.role === 'admin' 
        ? '/api/orders' 
        : `/api/orders?user_id=${currentUser?.id || 1}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          setOrders(data.orders);
          saveStoredOrders(data.orders);
          setQueueMetrics((curr) => calculateQueueMetrics(data.orders, curr?.available_counters || 3));
        }
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }, [currentUser]);

  // 4. Fetch AI Predictions
  const fetchPredictions = useCallback(async () => {
    try {
      const [waitRes, peakRes] = await Promise.all([
        fetch('/api/ai/predict-wait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
        fetch('/api/ai/peak-prediction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      ]);

      if (waitRes.ok) {
        const waitData = await waitRes.json();
        setWaitingPrediction(waitData);
      }
      if (peakRes.ok) {
        const peakData = await peakRes.json();
        setPeakPrediction(peakData);
      }
    } catch (err) {
      console.error('Error fetching AI predictions:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFoods();
    fetchQueue();
    fetchOrders();
    fetchPredictions();

    // Auto-polling for queue updates every 12 seconds
    const interval = setInterval(() => {
      fetchQueue();
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchQueue, fetchOrders, fetchPredictions]);

  // Cart operations
  const handleAddToCart = (food: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { food, quantity: 1 }];
    });
    showToast(`Added ${food.name} to cart!`);
  };

  const handleUpdateQuantity = (foodId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.food.id === foodId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (foodId: number) => {
    setCart((prev) => prev.filter((item) => item.food.id !== foodId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order Lifecycle Management
  const handleOrderPlaced = (newOrder: Order) => {
    setTrackedOrderId(newOrder.id);
    setOrders((prev) => {
      const updated = [newOrder, ...prev.filter((o) => o.id !== newOrder.id)];
      saveStoredOrders(updated);
      const newMetrics = calculateQueueMetrics(updated, availableCounters);
      setQueueMetrics(newMetrics);
      return updated;
    });
    fetchOrders();
    fetchQueue();
    showToast(`Order #${newOrder.id} placed! Kitchen ticket created.`);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    // 1. Update React state and localStorage immediately for instant reactive UI
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o));
      saveStoredOrders(updated);
      const newMetrics = calculateQueueMetrics(updated, availableCounters);
      setQueueMetrics(newMetrics);
      return updated;
    });

    // 2. Sync with backend API
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
        fetchQueue();
      }
    } catch (err) {
      console.warn('Backend sync deferred, local state updated successfully:', err);
    }
    showToast(`Order #${orderId} marked as ${status}!`);
  };

  const handleUpdateCounters = async (counters: number) => {
    setAvailableCounters(counters);
    saveStoredCounters(counters);
    setQueueMetrics((curr) => {
      if (!curr) return null;
      return calculateQueueMetrics(orders, counters);
    });

    try {
      const res = await fetch('/api/admin/counters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counters }),
      });
      if (res.ok) {
        fetchQueue();
        showToast(`Updated active counters to ${counters}! Dynamic wait times updated.`);
      }
    } catch (err) {
      console.error('Error updating counters:', err);
    }
  };

  const activeOrdersCount = orders.filter(
    (o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled'
  ).length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'active-orders', label: 'Active Orders', icon: Flame, badge: activeOrdersCount },
    { id: 'menu', label: 'Food Menu', icon: Utensils },
    { id: 'preorder', label: 'Pre-Order', icon: ShoppingBag, badge: cart.reduce((s, i) => s + i.quantity, 0) },
    { id: 'track', label: 'Track Order', icon: MapPin },
    { id: 'queue', label: 'Live Queue', icon: Hourglass },
    { id: 'predictions', label: 'AI Predictions', icon: BarChart3 },
    { id: 'admin', label: 'Kitchen Admin', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleNavLinks = navLinks.filter(
    (link) => !link.adminOnly || (currentUser && currentUser.role === 'admin')
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col md:flex-row font-sans antialiased selection:bg-amber-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E293B] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* DESKTOP BENTO SIDEBAR RAIL (hidden on mobile) */}
      <aside className="hidden md:flex w-16 bg-[#1E293B] flex-col items-center py-6 gap-7 border-r border-slate-800 text-slate-400 shrink-0 sticky top-0 h-screen z-40">
        {/* Burger Logo */}
        <div 
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:scale-105 transition-transform shadow-md shadow-amber-500/20"
          title="Smart Canteen Predictor"
        >
          🍔
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-4 text-slate-400">
          {visibleNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-2.5 rounded-xl cursor-pointer transition-all relative group flex items-center justify-center ${
                  isActive 
                    ? 'bg-white/15 text-white shadow-xs' 
                    : 'hover:text-white hover:bg-white/5 text-slate-400'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {/* Tooltip */}
                <span className="absolute left-16 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Rail Controls */}
        <div className="mt-auto flex flex-col items-center gap-4 text-slate-400">
          {/* AI Assistant Launcher */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="p-2.5 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors relative group"
            title="Ask Gemini Assistant"
          >
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />
            <span className="absolute left-16 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
              Gemini AI Chat
            </span>
          </button>

          {/* User Avatar */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center border border-slate-600 cursor-pointer transition-colors shadow-2xs"
            title={currentUser?.name || 'Account'}
          >
            {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
          </button>
        </div>
      </aside>

      {/* MAIN APP CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* MOBILE TOP BAR (hidden on desktop) */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            setCurrentUser(null);
            showToast('Signed out successfully.');
          }}
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          queueMetrics={queueMetrics}
          onOpenAssistant={() => setIsAiAssistantOpen(true)}
        />

        {/* BENTO HEADER */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 px-6 py-5 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Smart Canteen Predictor
            </h1>
            <p className="text-slate-500 text-sm italic">
              Ready to help you skip the line, {currentUser?.name?.split(' ')[0] || 'Alex'}.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Live Queue Pill */}
            {queueMetrics && (
              <div 
                onClick={() => {
                  setActiveTab('queue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs text-slate-700 cursor-pointer hover:border-amber-300 transition-colors"
                title="Click to view live queue tracking"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="font-semibold text-slate-600">
                  Live Queue: <strong className="text-slate-900">{queueMetrics.queue_length}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-bold">~{queueMetrics.estimated_wait_time}m</span>
              </div>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setCurrentUser({
                    id: 1,
                    name: 'Alex Johnson',
                    email: 'alex@college.edu',
                    role: 'student',
                  });
                  setActiveTab('dashboard');
                  showToast('Switched to Student view (Alex Johnson)');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  currentUser?.role === 'student' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  setCurrentUser({
                    id: 2,
                    name: 'Kitchen Staff',
                    email: 'staff@canteen.college.edu',
                    role: 'admin',
                  });
                  setActiveTab('admin');
                  showToast('Switched to Kitchen Staff & Admin view');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  currentUser?.role === 'admin' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kitchen Staff
              </button>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-semibold text-slate-900 leading-tight">
                  {currentUser?.name || 'Alex Johnson'}
                </span>
                <span className="text-xs text-slate-500">
                  ID: {currentUser?.role === 'admin' ? 'STAFF-KITCHEN-01' : 'CSC-2024-089'}
                </span>
              </div>
              <div 
                onClick={() => setIsAuthOpen(true)}
                className="w-10 h-10 bg-slate-300 rounded-full border-2 border-white shadow-xs flex items-center justify-center font-bold text-slate-700 text-sm cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all"
                title="Account profile"
              >
                {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Views Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {/* Optional Hero toggle button if on dashboard */}
          {activeTab === 'dashboard' && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Campus Canteen Bento Dashboard
              </span>
              <button
                onClick={() => setIsHeroDismissed(!isHeroDismissed)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {isHeroDismissed ? 'Show Introduction' : 'Hide Introduction'}
              </button>
            </div>
          )}

          {/* Introductory Hero (if expanded) */}
          {activeTab === 'dashboard' && !isHeroDismissed && (
            <div className="mb-6">
              <LandingHero
                onOrderNow={() => setActiveTab('menu')}
                onViewQueue={() => setActiveTab('queue')}
                onViewPredictions={() => setActiveTab('predictions')}
                onOpenAssistant={() => setIsAiAssistantOpen(true)}
                queueMetrics={queueMetrics}
              />
            </div>
          )}

          {/* TAB 1: Student Dashboard (Bento Grid) */}
          {activeTab === 'dashboard' && (
            <StudentDashboard
              queueMetrics={queueMetrics}
              waitingPrediction={waitingPrediction}
              popularItems={foodItems.filter((f) => f.popular)}
              userOrders={orders}
              currentUser={currentUser}
              onAddToCart={handleAddToCart}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTrackOrder={(orderId) => {
                setTrackedOrderId(orderId);
                setActiveTab('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAssistant={(prompt) => {
                setIsAiAssistantOpen(true);
              }}
            />
          )}

          {/* TAB 1.5: Active Orders */}
          {activeTab === 'active-orders' && (
            <ActiveOrdersView
              orders={orders}
              onTrackOrder={(orderId) => {
                setTrackedOrderId(orderId);
                setActiveTab('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToPreOrder={() => {
                setActiveTab('preorder');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onUpdateStatus={handleUpdateOrderStatus}
              isStaff={currentUser?.role === 'admin'}
            />
          )}

          {/* TAB 2: Food Menu */}
          {activeTab === 'menu' && (
            <FoodMenu
              foodItems={foodItems}
              cart={cart}
              onAddToCart={handleAddToCart}
              onNavigateToCart={() => {
                setActiveTab('preorder');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* TAB 3: Pre-Order */}
          {activeTab === 'preorder' && (
            <PreOrderView
              cart={cart}
              currentUser={currentUser}
              queueMetrics={queueMetrics}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onOrderPlacedSuccess={handleOrderPlaced}
              onNavigateToMenu={() => setActiveTab('menu')}
              onNavigateToTrack={(orderId) => {
                setTrackedOrderId(orderId);
                setActiveTab('track');
              }}
            />
          )}

          {/* TAB 4: Live Order Tracking */}
          {activeTab === 'track' && (
            <OrderTracker
              initialOrderId={trackedOrderId}
              userOrders={orders}
              queueMetrics={queueMetrics}
              onRefresh={() => {
                fetchOrders();
                fetchQueue();
              }}
            />
          )}

          {/* TAB 5: Live Queue Monitoring */}
          {activeTab === 'queue' && (
            <QueueTracker
              queueMetrics={queueMetrics}
              currentUser={currentUser}
              onRefresh={fetchQueue}
              onUpdateCounters={handleUpdateCounters}
            />
          )}

          {/* TAB 6: AI Predictions */}
          {activeTab === 'predictions' && (
            <PredictionsView
              queueMetrics={queueMetrics}
              waitingPrediction={waitingPrediction}
              peakPrediction={peakPrediction}
              onRefreshPredictions={fetchPredictions}
            />
          )}

          {/* TAB 7: Admin Dashboard */}
          {activeTab === 'admin' && (
            <AdminDashboard
              orders={orders}
              foodItems={foodItems}
              queueMetrics={queueMetrics}
              onRefresh={() => {
                fetchOrders();
                fetchFoods();
                fetchQueue();
              }}
              onUpdateCounters={handleUpdateCounters}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}
        </main>

        {/* Bento Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🍔</span>
              <div>
                <p className="font-bold text-slate-900 text-sm">Smart Canteen Queue Predictor</p>
                <p className="text-[11px] text-slate-400">Campus Food Operations • Block B Ground Floor • Bento Grid Edition</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Gemini AI Driven</span>
              </span>
              <span>•</span>
              <span>Express & MySQL REST API</span>
              <span>•</span>
              <span>Real-Time Queue Engine</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Canteen AI Assistant Modal */}
      <AiAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        queueMetrics={queueMetrics}
        onNavigateToPreOrder={() => {
          setIsAiAssistantOpen(false);
          setActiveTab('preorder');
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />
    </div>
  );
}
