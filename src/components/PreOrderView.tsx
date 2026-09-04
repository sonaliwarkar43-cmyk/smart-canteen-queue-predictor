import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Smartphone,
  Wallet,
  Coins
} from 'lucide-react';
import { CartItem, User, Order, QueueMetrics } from '../types';

interface PreOrderViewProps {
  cart: CartItem[];
  currentUser: User | null;
  queueMetrics: QueueMetrics | null;
  onUpdateQuantity: (foodId: number, delta: number) => void;
  onRemoveItem: (foodId: number) => void;
  onClearCart: () => void;
  onOrderPlacedSuccess: (order: Order) => void;
  onNavigateToMenu: () => void;
  onNavigateToTrack: (orderId: number) => void;
}

export const PreOrderView: React.FC<PreOrderViewProps> = ({
  cart,
  currentUser,
  queueMetrics,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlacedSuccess,
  onNavigateToMenu,
  onNavigateToTrack,
}) => {
  const [pickupTime, setPickupTime] = useState('Immediate (~15 min)');
  const [customTime, setCustomTime] = useState('');
  const [paymentOption, setPaymentOption] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedWaitTime, setConfirmedWaitTime] = useState<number>(15);
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');

  const totalAmount = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);

  // Suggested pickup time slots
  const pickupSlots = [
    'Immediate (~15 min)',
    '11:45 AM (Recess)',
    '12:30 PM (Lunch Slot 1)',
    '01:15 PM (Lunch Slot 2)',
    '04:30 PM (Evening Break)',
  ];

  const paymentMethods = [
    { id: 'UPI', label: 'UPI / Google Pay / PhonePe', icon: Smartphone, desc: 'Instant 1-click campus payment' },
    { id: 'Campus Wallet', label: 'College ID Card Wallet', icon: Wallet, desc: 'Deducts from registered campus balance' },
    { id: 'Pay on Counter', label: 'Cash on Counter', icon: Coins, desc: 'Pay when picking up order at counter' },
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const selectedPickup = pickupTime === 'Custom' && customTime ? customTime : pickupTime;

      const payload = {
        user_id: currentUser?.id || 1,
        customer_name: studentName.trim() || currentUser?.name || 'Student',
        customer_email: studentEmail.trim() || currentUser?.email || 'student@college.edu',
        items: cart.map((c) => ({
          food_id: c.food.id,
          quantity: c.quantity,
        })),
        pickup_time: selectedPickup,
        payment_method: paymentOption,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to place order');
      }

      const data = await res.json();
      setConfirmedOrder(data.order);
      setConfirmedWaitTime(data.estimated_wait_time || 15);
      onOrderPlacedSuccess(data.order);
      onClearCart();
    } catch (err) {
      console.error('Order submission error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ORDER CONFIRMATION VIEW
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-md text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            🎉
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Order Placed Successfully!
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-3">
            Order #{confirmedOrder.id}
          </h2>

          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
            Your ticket has been sent directly to the kitchen counter and entered into the active queue.
          </p>

          {/* Key Ticket Details */}
          <div className="my-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-left grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Estimated Wait</span>
              <p className="text-lg font-black text-amber-900 mt-0.5">~{confirmedWaitTime} minutes</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Pickup Slot</span>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{confirmedOrder.pickup_time}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Amount</span>
              <p className="text-base font-black text-gray-900 mt-0.5">₹{confirmedOrder.total_amount}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Payment Mode</span>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{confirmedOrder.payment_method}</p>
            </div>
          </div>

          {/* Items summary */}
          <div className="border-t border-gray-100 pt-4 mb-6 text-left">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items Ordered:</h4>
            <div className="space-y-1.5">
              {confirmedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-700">
                  <span>{item.quantity}x {item.food_name}</span>
                  <span className="font-semibold">₹{item.quantity * item.unit_price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onNavigateToTrack(confirmedOrder.id)}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                onNavigateToMenu();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition-all cursor-pointer"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART STATE
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 text-3xl">
          🛒
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Explore our tasty snacks, meals, and beverages to schedule a pre-order and skip the line!
        </p>
        <button
          onClick={onNavigateToMenu}
          className="mt-6 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Food Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950">Pre-Order Food</h1>
        <p className="text-sm text-gray-500">
          Review your items, choose your pickup schedule, and confirm your canteen order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items Review */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <span>Selected Items</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  {cart.length}
                </span>
              </h2>
              <button
                onClick={onClearCart}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {cart.map(({ food, quantity }) => (
                <div key={food.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={food.image}
                      alt={food.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-snug">{food.name}</h4>
                      <p className="text-xs text-gray-500">₹{food.price} each • {food.preparation_time} min prep</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(food.id, -1)}
                        className="w-6 h-6 rounded bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(food.id, 1)}
                        className="w-6 h-6 rounded bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="font-black text-gray-900 text-sm w-14 text-right">
                      ₹{food.price * quantity}
                    </p>

                    <button
                      onClick={() => onRemoveItem(food.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={onNavigateToMenu}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add more food items</span>
              </button>
              <div className="text-right">
                <span className="text-xs text-gray-500">Subtotal: </span>
                <span className="text-lg font-black text-gray-950">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Student Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Your Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">College Email / Roll No</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="e.g. aarav@college.edu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pickup Slot, Payment & Confirm */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {/* Pickup Slot Selection */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Select Pickup Time</span>
              </h3>

              <div className="space-y-2">
                {pickupSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      pickupTime === slot
                        ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="pickupTime"
                        value={slot}
                        checked={pickupTime === slot}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{slot}</span>
                    </div>
                    {slot.includes('Immediate') && queueMetrics && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900 font-semibold">
                        ~{queueMetrics.estimated_wait_time}m wait
                      </span>
                    )}
                  </label>
                ))}

                <label
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    pickupTime === 'Custom'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupTime"
                    value="Custom"
                    checked={pickupTime === 'Custom'}
                    onChange={() => setPickupTime('Custom')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Custom time:</span>
                  <input
                    type="text"
                    placeholder="e.g. 02:15 PM"
                    value={customTime}
                    onFocus={() => setPickupTime('Custom')}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="ml-auto w-32 px-2 py-1 text-xs rounded border border-gray-300 bg-white"
                  />
                </label>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment Option</span>
              </h3>

              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentOption === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        value={method.id}
                        checked={isSelected}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="grow">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-bold text-gray-900">{method.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{method.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Order Summary & Submit Button */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Items total</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Queue handling fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="font-bold text-gray-900 text-sm">Grand Total</span>
                  <span className="text-xl font-black text-gray-950">₹{totalAmount}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20'
                }`}
              >
                {isSubmitting ? (
                  <span>Generating Order ID & Adding to Queue...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Order & Pay ₹{totalAmount}</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Instant queue placement • Live countdown tracking enabled
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
