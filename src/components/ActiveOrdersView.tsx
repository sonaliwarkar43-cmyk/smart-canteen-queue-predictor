import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Filter, 
  RefreshCw,
  ExternalLink,
  Flame,
  BellRing
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface ActiveOrdersViewProps {
  orders: Order[];
  onTrackOrder: (orderId: number) => void;
  onNavigateToPreOrder: () => void;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => void;
  isStaff?: boolean;
}

export const ActiveOrdersView: React.FC<ActiveOrdersViewProps> = ({
  orders,
  onTrackOrder,
  onNavigateToPreOrder,
  onUpdateStatus,
  isStaff = false,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for active orders (not completed or cancelled by default)
  const activeOrders = orders.filter((o) => {
    if (filter === 'all') return o.order_status !== 'Cancelled';
    return o.order_status.toLowerCase() === filter.toLowerCase();
  });

  const filteredOrders = activeOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesId = String(o.id).includes(q);
    const matchesName = o.customer_name.toLowerCase().includes(q);
    const matchesItem = o.items.some((item) => item.food_name.toLowerCase().includes(q));
    return matchesId || matchesName || matchesItem;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200 animate-pulse">
            <BellRing className="w-3 h-3" /> Ready for Pickup
          </span>
        );
      case 'Preparing':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
            <Flame className="w-3 h-3 text-amber-600" /> Preparing in Kitchen
          </span>
        );
      case 'Pending':
      case 'Order Placed':
      case 'Confirmed':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> Pending Confirmation
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Active Kitchen Orders</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {activeOrders.filter((o) => o.order_status !== 'Completed').length} in progress
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time queue tickets, food preparation times, and instant status updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToPreOrder}
            className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Place Pre-Order</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Active' },
            { id: 'pending', label: 'Pending' },
            { id: 'preparing', label: 'Preparing' },
            { id: 'ready', label: 'Ready' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-3">
            🍔
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching active orders</h3>
          <p className="text-xs text-slate-500 mt-1">All current student orders have been served or none match your filter.</p>
          <button
            onClick={onNavigateToPreOrder}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            Create Pre-Order Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const prepTime = order.estimated_prep_time || 7;
            const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Row: Order ID and Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        #{order.id}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {order.customer_name}
                      </span>
                    </div>
                    {getStatusBadge(order.order_status)}
                  </div>

                  {/* Food items list */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Food Items ({totalQty} total)
                    </span>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {item.quantity}x {item.food_name}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            ₹{item.unit_price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Metrics: Prep Time & Pickup */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-amber-50/50 border border-amber-100/80 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Est. Prep Time</span>
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {prepTime} mins
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Pickup Slot</span>
                      <span className="font-bold text-slate-800">{order.pickup_time}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block">Total Price</span>
                      <span className="font-black text-slate-900">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Track Status</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {/* Staff Quick Actions if applicable */}
                  {onUpdateStatus && (
                    <div className="flex items-center gap-1.5">
                      {order.order_status === 'Pending' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'Preparing')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Start Prep
                        </button>
                      )}
                      {order.order_status === 'Preparing' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'Ready')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.order_status === 'Ready' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
