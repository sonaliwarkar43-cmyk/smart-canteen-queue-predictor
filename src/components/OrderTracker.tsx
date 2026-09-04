import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Hourglass, 
  Package, 
  ChefHat, 
  BellRing, 
  Check, 
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Order, OrderStatus, QueueMetrics } from '../types';

interface OrderTrackerProps {
  initialOrderId?: number | null;
  userOrders: Order[];
  queueMetrics: QueueMetrics | null;
  onRefresh: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  initialOrderId,
  userOrders,
  queueMetrics,
  onRefresh,
}) => {
  const [searchId, setSearchId] = useState<string>(initialOrderId ? String(initialOrderId) : '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statuses: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    { key: 'Order Placed', label: 'Order Placed', desc: 'Received in system', icon: Package },
    { key: 'Confirmed', label: 'Confirmed', desc: 'Accepted by kitchen', icon: CheckCircle2 },
    { key: 'Preparing', label: 'Preparing', desc: 'On stove / prep station', icon: ChefHat },
    { key: 'Ready', label: 'Ready for Pickup', desc: 'Collect at Counter', icon: BellRing },
    { key: 'Completed', label: 'Completed', desc: 'Enjoy your meal!', icon: Check },
  ];

  const fetchOrder = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        throw new Error('Order not found');
      }
      const data = await res.json();
      setActiveOrder(data.order);
    } catch (err) {
      setError(`Order #${id} not found. Please verify the order ID.`);
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchId(String(initialOrderId));
      fetchOrder(initialOrderId);
    } else if (userOrders.length > 0) {
      setActiveOrder(userOrders[0]);
      setSearchId(String(userOrders[0].id));
    }
  }, [initialOrderId, userOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(searchId.trim());
    if (id) {
      fetchOrder(id);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Confirmed': return 1;
      case 'Preparing': return 2;
      case 'Ready': return 3;
      case 'Completed': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = activeOrder ? getStepIndex(activeOrder.order_status) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">Live Order Tracking</h1>
          <p className="text-sm text-gray-500">
            Real-time kitchen progress indicator and pickup counter alert
          </p>
        </div>

        {/* Search Order ID input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">#</span>
            <input
              type="text"
              placeholder="Enter Order ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-40 pl-7 pr-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Track
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeOrder) fetchOrder(activeOrder.id);
              onRefresh();
            }}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            title="Refresh order status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {/* Quick Recent Order Pills */}
      {userOrders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Your Orders:</span>
          {userOrders.slice(0, 5).map((order) => (
            <button
              key={order.id}
              onClick={() => {
                setSearchId(String(order.id));
                fetchOrder(order.id);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeOrder?.id === order.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              #{order.id} ({order.order_status})
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Order Status Card */}
      {activeOrder && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-8">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-400">ORDER TICKET</span>
                <span className="text-xl sm:text-2xl font-black text-gray-950 font-mono">
                  #{activeOrder.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                  activeOrder.order_status === 'Ready'
                    ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                    : activeOrder.order_status === 'Preparing'
                      ? 'bg-amber-100 text-amber-800'
                      : activeOrder.order_status === 'Completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                }`}>
                  {activeOrder.order_status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ordered by {activeOrder.customer_name} • Placed {new Date(activeOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-500">Pickup Schedule</span>
                <p className="text-sm font-bold text-gray-900">{activeOrder.pickup_time}</p>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden sm:block" />
              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-500">Total Amount</span>
                <p className="text-base font-black text-gray-900">₹{activeOrder.total_amount}</p>
              </div>
            </div>
          </div>

          {/* 5-STEP VISUAL PROGRESS BAR */}
          <div>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, (currentStep / (statuses.length - 1)) * 100))}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative z-10 flex justify-between items-start">
                {statuses.map((step, idx) => {
                  const Icon = step.icon;
                  const isPassed = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center w-20 sm:w-28">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCurrent
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 scale-110 shadow-md'
                            : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold mt-2.5 leading-tight ${
                        isCurrent ? 'text-amber-800 font-extrabold' : isPassed ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="hidden sm:block text-[10px] text-gray-400 mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Pickup Alert Box if Ready */}
          {activeOrder.order_status === 'Ready' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3.5 shadow-2xs animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0">
                🔔
              </div>
              <div className="grow">
                <h4 className="font-extrabold text-sm sm:text-base">Order Ready for Collection!</h4>
                <p className="text-xs text-emerald-800">
                  Please proceed to <strong>Pickup Counter #1 or #2</strong> with your order ticket <strong>#{activeOrder.id}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Preparing Status Note */}
          {activeOrder.order_status === 'Preparing' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3 shadow-2xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="grow text-xs">
                <p className="font-bold">Your food is currently being prepared on the hot counter!</p>
                <p className="text-amber-800 mt-0.5">Estimated ready time: within 3-5 minutes.</p>
              </div>
            </div>
          )}

          {/* Items Breakdown */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Order Details</h3>
            <div className="space-y-2">
              {activeOrder.items.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-white border border-gray-200 font-bold text-gray-800 flex items-center justify-center text-[11px]">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-gray-900">{item.food_name}</span>
                  </div>
                  <span className="font-bold text-gray-800">₹{item.quantity * item.unit_price}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>Payment Mode: <strong>{activeOrder.payment_method}</strong> ({activeOrder.payment_status})</span>
              <span>Total Paid: <strong className="text-gray-950 text-sm font-black">₹{activeOrder.total_amount}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
