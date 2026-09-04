import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit3, 
  Sliders, 
  Search, 
  Filter,
  RefreshCw,
  BellRing,
  ChefHat
} from 'lucide-react';
import { FoodItem, Order, OrderStatus, QueueMetrics } from '../types';

interface AdminDashboardProps {
  orders: Order[];
  foodItems: FoodItem[];
  queueMetrics: QueueMetrics | null;
  onRefresh: () => void;
  onUpdateCounters: (counters: number) => void;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  foodItems,
  queueMetrics,
  onRefresh,
  onUpdateCounters,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'counters'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // New Food Item Form State
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    price: 30,
    category: 'Snacks',
    preparation_time: 5,
    availability: true,
    description: '',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    popular: false,
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.order_status !== 'Cancelled' ? o.total_amount : 0), 0);
  const activeOrdersCount = orders.filter((o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled').length;
  const completedOrdersCount = orders.filter((o) => o.order_status === 'Completed').length;

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    if (onUpdateStatus) {
      onUpdateStatus(orderId, nextStatus);
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleToggleAvailability = async (foodId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/foods/${foodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: !currentStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood),
      });
      if (!res.ok) throw new Error('Failed to create food');
      setShowAddFoodModal(false);
      setNewFood({
        name: '',
        price: 30,
        category: 'Snacks',
        preparation_time: 5,
        availability: true,
        description: '',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        popular: false,
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error creating food item');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.order_status === statusFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
              <span>Canteen Staff & Kitchen Operations</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                Admin
              </span>
            </h1>
            <p className="text-sm text-gray-500">Manage live kitchen tickets, counter assignments, and stock availability</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>Sync Operations</span>
        </button>
      </div>

      {/* TOP ANALYTICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Daily Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950">₹{totalRevenue}</p>
          <span className="text-[10px] text-gray-400">{orders.length} total orders processed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Active Kitchen Tickets</span>
            <ChefHat className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{activeOrdersCount}</p>
          <span className="text-[10px] text-gray-400">{queueMetrics?.orders_preparing ?? 0} on active stove</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{completedOrdersCount}</p>
          <span className="text-[10px] text-gray-400">Successfully served</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Pickup Counters</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600">
            {queueMetrics?.available_counters ?? 3} Active
          </p>
          <span className="text-[10px] text-gray-400">Wait est: ~{queueMetrics?.estimated_wait_time ?? 15}m</span>
        </div>
      </div>

      {/* TABS (Orders / Menu Management / Counter Config) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Kitchen Orders ({activeOrdersCount} Active)
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Menu & Stock Management ({foodItems.length})
        </button>

        <button
          onClick={() => setActiveTab('counters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'counters'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Counter Load & Formulas
        </button>
      </div>

      {/* TAB 1: KITCHEN ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Status:</span>
            {['All', 'Pending', 'Order Placed', 'Confirmed', 'Preparing', 'Ready', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5">Ticket #</th>
                    <th className="px-4 py-3.5">Student / Customer</th>
                    <th className="px-4 py-3.5">Ordered Items</th>
                    <th className="px-4 py-3.5">Pickup Slot</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Kitchen Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        No orders matching status "{statusFilter}"
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isUpdating = updatingOrderId === order.id;

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-gray-900">
                            #{order.id}
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-gray-900">{order.customer_name}</p>
                            <span className="text-[10px] text-gray-400">{order.customer_email}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5 max-w-xs">
                              {order.items.map((it) => (
                                <span key={it.id} className="inline-block mr-2 px-1.5 py-0.5 rounded bg-gray-100 text-[11px] text-gray-800">
                                  {it.quantity}x {it.food_name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-amber-800 font-bold">
                            {order.pickup_time}
                          </td>
                          <td className="px-4 py-3.5 font-black text-gray-900">
                            ₹{order.total_amount}
                            <span className="block text-[10px] text-gray-400 font-normal">{order.payment_method}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              order.order_status === 'Ready'
                                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                                : order.order_status === 'Preparing'
                                  ? 'bg-amber-100 text-amber-800'
                                  : order.order_status === 'Completed'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.order_status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {/* Action Buttons based on status */}
                            <div className="flex items-center justify-end gap-1.5">
                              {(order.order_status === 'Pending' || order.order_status === 'Order Placed') && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                                    disabled={isUpdating}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                                    disabled={isUpdating}
                                    className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 cursor-pointer"
                                  >
                                    Start Prep
                                  </button>
                                </>
                              )}

                              {order.order_status === 'Confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                                  disabled={isUpdating}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 cursor-pointer"
                                >
                                  Start Preparing
                                </button>
                              )}

                              {order.order_status === 'Preparing' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Ready')}
                                  disabled={isUpdating}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 animate-bounce cursor-pointer"
                                >
                                  Mark Ready for Pickup!
                                </button>
                              )}

                              {order.order_status === 'Ready' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Completed')}
                                  disabled={isUpdating}
                                  className="px-2.5 py-1 rounded-lg bg-gray-900 text-white font-bold text-[10px] hover:bg-gray-800 cursor-pointer"
                                >
                                  Complete & Handover
                                </button>
                              )}

                              {order.order_status === 'Completed' && (
                                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Delivered</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU & FOOD STOCK MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Toggle food availability or add new items to the campus canteen.</p>
            <button
              onClick={() => setShowAddFoodModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodItems.map((food) => (
              <div key={food.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex gap-3">
                <img
                  src={food.image}
                  alt={food.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover bg-gray-100 shrink-0"
                />
                <div className="grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">{food.category}</span>
                      <span className="font-black text-gray-900 text-sm">₹{food.price}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight mt-0.5">{food.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Prep: {food.preparation_time} min</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">Stock Status:</span>
                    <button
                      onClick={() => handleToggleAvailability(food.id, food.availability)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        food.availability
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {food.availability ? 'Available' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COUNTER LOAD & QUEUE CONFIG */}
      {activeTab === 'counters' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-950">Active Counter Load Management</h2>
            <p className="text-xs text-gray-500 mt-1">
              Adjusting the number of counters immediately updates the live waiting time equation for all student dashboards.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase">Current Service Desks</span>
              <p className="text-2xl font-black text-gray-950 mt-0.5">
                {queueMetrics?.available_counters ?? 3} Active Pickup Counters
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Wait Time formula: <strong>(Queue: {queueMetrics?.queue_length} × Avg Prep: {queueMetrics?.average_preparation_time}m) ÷ Counters: {queueMetrics?.available_counters} = ~{queueMetrics?.estimated_wait_time} min</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => onUpdateCounters(num)}
                  className={`w-11 h-11 rounded-xl font-black text-sm flex items-center justify-center transition-all cursor-pointer ${
                    queueMetrics?.available_counters === num
                      ? 'bg-amber-600 text-white shadow-md scale-105'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD FOOD MODAL */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-950 mb-4">Add New Food Item</h3>
            <form onSubmit={handleCreateFood} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  placeholder="e.g. Cheese Pav Bhaji"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newFood.price}
                    onChange={(e) => setNewFood({ ...newFood, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    required
                    value={newFood.preparation_time}
                    onChange={(e) => setNewFood({ ...newFood, preparation_time: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Category</label>
                <select
                  value={newFood.category}
                  onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="Snacks">Snacks</option>
                  <option value="Sandwiches">Sandwiches</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Meals">Meals</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newFood.description}
                  onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                  placeholder="Short description of ingredients"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={newFood.image}
                  onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
