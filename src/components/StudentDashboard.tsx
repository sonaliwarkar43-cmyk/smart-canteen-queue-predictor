import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  TrendingUp,
  MessageSquare,
  Send,
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { QueueMetrics, FoodItem, Order, WaitingTimePrediction, User } from '../types';

interface StudentDashboardProps {
  queueMetrics: QueueMetrics | null;
  waitingPrediction: WaitingTimePrediction | null;
  popularItems: FoodItem[];
  userOrders: Order[];
  currentUser?: User | null;
  onAddToCart: (food: FoodItem) => void;
  onNavigate: (tab: string) => void;
  onTrackOrder: (orderId: number) => void;
  onOpenAssistant?: (prompt?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  queueMetrics,
  waitingPrediction,
  popularItems,
  userOrders,
  currentUser,
  onAddToCart,
  onNavigate,
  onTrackOrder,
  onOpenAssistant,
}) => {
  const [chatPrompt, setChatPrompt] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const activeUserOrders = userOrders.filter(
    (o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled'
  );
  const latestActiveOrder = activeUserOrders[0] || null;

  const queueLength = queueMetrics?.queue_length ?? 4;
  const waitTime = queueMetrics?.estimated_wait_time ?? 9;
  const trafficLevel = queueMetrics?.traffic_level ?? 'MODERATE';
  const counters = queueMetrics?.available_counters ?? 3;
  const avgPrepTime = queueMetrics?.average_preparation_time ?? 7.0;

  // Capacity calculation (assume max comfortable capacity is 25 students)
  const capacityPct = Math.min(100, Math.round((queueLength / 25) * 100));

  // Determine active order progress step (1 to 5)
  const getOrderStep = (status?: string) => {
    switch (status) {
      case 'Pending':
      case 'Order Placed': return 1;
      case 'Confirmed': return 2;
      case 'Preparing': return 3;
      case 'Ready': return 4;
      case 'Completed': return 5;
      default: return 1;
    }
  };
  const activeStep = latestActiveOrder ? getOrderStep(latestActiveOrder.order_status) : 0;

  const handleQuickChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOpenAssistant) {
      onOpenAssistant(chatPrompt || 'What is the fastest food to order right now?');
      setChatPrompt('');
    }
  };

  const handleAddWithFeedback = (item: FoodItem) => {
    onAddToCart(item);
    setAddedItemName(item.name);
    setTimeout(() => {
      setAddedItemName((curr) => (curr === item.name ? null : curr));
    }, 1500);
  };

  // Helper for category emoji
  const getCategoryEmoji = (category: string, name: string) => {
    const lower = (category + ' ' + name).toLowerCase();
    if (lower.includes('burger')) return '🍔';
    if (lower.includes('shake') || lower.includes('drink') || lower.includes('tea') || lower.includes('chai') || lower.includes('coffee')) return '🥤';
    if (lower.includes('thali') || lower.includes('meal') || lower.includes('rice')) return '🍛';
    if (lower.includes('sandwich') || lower.includes('toast')) return '🥪';
    if (lower.includes('pizza')) return '🍕';
    if (lower.includes('samosa') || lower.includes('vada')) return '🥟';
    return '🍽️';
  };

  return (
    <div className="space-y-6">
      {/* Toast confirmation for Bento Cart add */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-amber-400">✓</span>
          <span>Added <strong>{addedItemName}</strong> to pre-order cart</span>
        </div>
      )}

      {/* THE BENTO GRID LAYOUT */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* BENTO CARD 1: Live Queue (col-span-12 md:col-span-4) */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Live Queue</span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
              trafficLevel === 'HIGH' 
                ? 'bg-rose-100 text-rose-700' 
                : trafficLevel === 'MODERATE' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-green-100 text-green-700'
            }`}>
              {trafficLevel}
            </span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              {queueLength} <span className="text-base font-normal text-slate-400">people</span>
            </div>
            <div className="text-sm text-slate-600 font-medium mt-1">
              Estimated Wait: <span className="text-amber-600 font-bold">{waitTime} mins</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {queueMetrics?.orders_preparing ?? 3} preparing • {counters} counters active
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  trafficLevel === 'HIGH' ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (queueLength / 25) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Fast line</span>
              <button 
                onClick={() => onNavigate('queue')} 
                className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer inline-flex items-center gap-0.5"
              >
                Track Queue <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* BENTO CARD 2: AI Insights (Dark Slate Card) (col-span-12 md:col-span-4) */}
        <div className="col-span-12 md:col-span-4 bg-[#1E293B] text-white rounded-2xl p-5 flex flex-col justify-between shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Insights</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-blue-300 font-mono">
              Gemini 3.8
            </span>
          </div>

          <div className="text-base sm:text-lg font-medium leading-snug my-3 text-slate-100">
            {waitingPrediction?.recommendation ? (
              <span>"{waitingPrediction.recommendation}"</span>
            ) : (
              <span>
                "Canteen traffic will <span className="text-blue-400 font-semibold">spike by 30%</span> in the next 20 minutes. Order now for minimum delay."
              </span>
            )}
          </div>

          <button 
            onClick={() => onNavigate('predictions')}
            className="w-full bg-white/10 hover:bg-white/20 py-2.5 px-3 rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>View Full Prediction</span>
          </button>
        </div>

        {/* BENTO CARD 3: Active Order (col-span-12 md:col-span-4) */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
              {latestActiveOrder ? `Active Order #${latestActiveOrder.id}` : 'Active Order'}
            </span>
            {latestActiveOrder && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {latestActiveOrder.pickup_time}
              </span>
            )}
          </div>

          {latestActiveOrder ? (
            <div className="flex-1 flex flex-col justify-center my-3">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {latestActiveOrder.order_status}...
                </span>
                <span className="text-xs text-slate-400 italic font-medium">
                  {latestActiveOrder.order_status === 'Ready' ? 'Ready at Counter!' : 'Est: 4m left'}
                </span>
              </div>

              {/* 5-step progress line */}
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 rounded-full transition-all ${
                      step < activeStep
                        ? 'bg-green-500'
                        : step === activeStep
                          ? 'bg-amber-400'
                          : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>

              {/* Order item preview */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-base border border-amber-100">
                    {latestActiveOrder.items[0]?.food_name?.toLowerCase().includes('burger') ? '🍔' : '🥪'}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 line-clamp-1">
                      {latestActiveOrder.items[0]?.food_name || 'Canteen Meal'}
                    </div>
                    <div className="text-slate-400">
                      Qty: {latestActiveOrder.items[0]?.quantity || 1} • ₹{latestActiveOrder.total_amount}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onTrackOrder(latestActiveOrder.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                  title="Track Order"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center my-3 text-center py-2">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 text-slate-400">
                🥪
              </div>
              <p className="text-xs font-semibold text-slate-700">No active kitchen orders</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Order from class to skip waiting at recess!
              </p>
              <button
                onClick={() => onNavigate('menu')}
                className="mt-3 py-1.5 px-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs transition-colors self-center cursor-pointer"
              >
                + Order Now
              </button>
            </div>
          )}
        </div>

        {/* BENTO CARD 4: Peak Time Prediction (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Peak Time Prediction
                </span>
                <span className="text-[10px] text-slate-400">Hourly Rush Analysis</span>
              </div>
              <div className="flex gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-rose-500 rounded-full" /> Peak
                </span>
              </div>
            </div>

            {/* Dynamic visual rush distribution bars */}
            <div className="h-32 flex items-end gap-3 pb-2 pt-4">
              {[
                { time: '10:00', height: '20%', type: 'low', queue: '6 in line' },
                { time: '11:00', height: '35%', type: 'low', queue: '10 in line' },
                { time: '12:00', height: '55%', type: 'mod', queue: '16 in line' },
                { time: '13:00', height: '95%', type: 'peak', queue: '28 in line' },
                { time: '14:00', height: '80%', type: 'peak', queue: '24 in line' },
                { time: '15:00', height: '25%', type: 'low', queue: '8 in line' },
              ].map((bar) => (
                <div key={bar.time} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="w-full bg-slate-50 rounded-t-lg h-24 flex items-end overflow-hidden">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        bar.type === 'peak' 
                          ? 'bg-rose-500 group-hover:bg-rose-600' 
                          : bar.type === 'mod' 
                            ? 'bg-amber-400 group-hover:bg-amber-500' 
                            : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                      style={{ height: bar.height }}
                      title={`${bar.time}: ${bar.queue}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                    {bar.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optimal Ordering Window Banner */}
          <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-800">Optimal Ordering Window:</span>
              <span className="text-xs font-black text-blue-900">11:15 AM - 11:45 AM</span>
            </div>
            <button 
              onClick={() => onNavigate('predictions')}
              className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
            >
              View Full Forecast →
            </button>
          </div>
        </div>

        {/* BENTO CARD 5: Popular Today (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
              Popular Today
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Fresh Canteen Batch</span>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-2.5 overflow-hidden">
            {popularItems.slice(0, 4).map((food) => {
              const emoji = getCategoryEmoji(food.category, food.name);
              const isAvailable = food.availability;
              return (
                <div 
                  key={food.id}
                  className={`p-2.5 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100 transition-all ${
                    !isAvailable ? 'opacity-60' : 'hover:border-slate-200'
                  }`}
                >
                  <div className="text-2xl w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{food.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold tracking-tight">
                      {isAvailable ? `Ready in ${food.preparation_time} mins • ₹${food.price}` : 'Sold Out Today'}
                    </div>
                  </div>
                  <button 
                    onClick={() => isAvailable && handleAddWithFeedback(food)}
                    disabled={!isAvailable}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all shrink-0 cursor-pointer ${
                      isAvailable 
                        ? 'bg-[#F59E0B] text-white hover:bg-amber-600 shadow-2xs hover:scale-105 active:scale-95' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title={isAvailable ? 'Add to pre-order cart' : 'Sold Out'}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>

          <div 
            onClick={() => onNavigate('menu')}
            className="p-3.5 bg-slate-900 hover:bg-slate-800 text-center cursor-pointer transition-colors"
          >
            <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>View Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* BENTO CARD 6: Gemini AI Chat (Warm Gradient Card) (col-span-12 md:col-span-4) */}
        <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-xs backdrop-blur-xs">
                  🤖
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                  Gemini AI Chat
                </span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                Assistant
              </span>
            </div>

            <div className="bg-white/15 backdrop-blur-xs rounded-xl p-3 text-xs border border-white/20 text-white leading-relaxed mb-3">
              "Hey {currentUser?.name?.split(' ')[0] || 'there'}! The Samosas are fresh out of the fryer right now. Wait time is only {waitTime}m. Want one?"
            </div>
          </div>

          <form onSubmit={handleQuickChat} className="relative mt-2">
            <input 
              type="text" 
              placeholder="Ask Assistant (e.g. fastest snacks)..."
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-xl py-2 pl-3 pr-8 text-xs placeholder:text-white/70 text-white outline-none focus:bg-white/25 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white/30 hover:bg-white/40 flex items-center justify-center text-white cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* BENTO CARD 7: Queue Trends (col-span-12 md:col-span-4) */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Queue Trends</span>
            <span className="text-[10px] text-slate-400 font-medium">Efficiency KPI</span>
          </div>

          <div className="space-y-4 my-2">
            <div>
              <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                <span className="text-slate-400">Current Capacity</span>
                <span className="text-slate-800">{capacityPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                <span className="text-slate-400">Service Speed</span>
                <span className="text-slate-800">
                  {avgPrepTime <= 5 ? 'Very Fast' : avgPrepTime <= 8 ? 'Fast' : 'Moderate'} ({avgPrepTime}m/item)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-green-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(30, Math.min(95, 100 - (avgPrepTime - 4) * 10))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic pt-2 border-t border-slate-50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{counters} pickup counters active today</span>
          </div>
        </div>

        {/* BENTO CARD 8: Pre-Order Fast-Track (col-span-12 md:col-span-4) */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Pre-Order & Skip Waiting</h4>
                <p className="text-[11px] text-slate-400">Schedule pickup between lectures</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Order food from your seat in class, set pickup slot, and walk in when food is hot & ready!
            </p>
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
            <button
              onClick={() => onNavigate('preorder')}
              className="flex-1 py-2 px-3 rounded-xl bg-[#F59E0B] hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Start Pre-Order</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Live Queue
            </button>
          </div>
        </div>

      </div>

      {/* STUDENT PREVIOUS & ACTIVE ORDERS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Your Orders History & Active Tickets</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {userOrders.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400">Track current preparation status or review previous meals</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('active-orders')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer flex items-center gap-1"
            >
              <span>View All Active Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {userOrders.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-400">No orders placed yet. Try placing your first pre-order!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userOrders.slice(0, 6).map((order) => {
              const isFinished = order.order_status === 'Completed' || order.order_status === 'Cancelled';
              return (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono font-bold text-xs text-slate-900">#{order.id}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          order.order_status === 'Ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.order_status === 'Preparing'
                              ? 'bg-amber-100 text-amber-800'
                              : order.order_status === 'Completed'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium mb-2">
                      {order.items.map((i) => `${i.quantity}x ${i.food_name}`).join(', ')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">₹{order.total_amount}</span>
                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="text-amber-600 hover:text-amber-700 font-bold text-[11px] cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
