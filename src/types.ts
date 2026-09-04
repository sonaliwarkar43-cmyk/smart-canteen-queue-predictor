export type UserRole = 'student' | 'admin' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  preparation_time: number; // in minutes
  availability: boolean;
  image: string;
  description: string;
  popular?: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  food_id: number;
  food_name: string;
  quantity: number;
  unit_price: number;
}

export type OrderStatus = 'Pending' | 'Order Placed' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_status: OrderStatus;
  pickup_time: string;
  payment_method: string;
  payment_status: 'Paid' | 'Pending';
  created_at: string;
  items: OrderItem[];
  estimated_prep_time?: number;
}

export interface QueueEntry {
  id: number;
  order_id: number;
  customer_name: string;
  items_summary: string;
  queue_position: number;
  estimated_time: number;
  status: 'waiting' | 'preparing' | 'ready' | 'collected';
  created_at: string;
}

export interface QueueMetrics {
  queue_entries: QueueEntry[];
  queue_length: number;
  total_active_orders: number;
  orders_preparing: number;
  orders_ready: number;
  average_preparation_time: number;
  available_counters: number;
  estimated_wait_time: number;
  traffic_level: 'LOW' | 'MODERATE' | 'HIGH';
  canteen_status: 'Open' | 'Closed';
  last_updated: string;
}

export interface WaitingTimePrediction {
  predicted_waiting_time: number;
  predicted_queue_length: number;
  traffic_level: 'LOW' | 'MODERATE' | 'HIGH';
  peak_probability: number;
  confidence_score: number;
  factors: string[];
  recommendation: string;
  source: 'gemini-ai' | 'fallback-math-engine';
}

export interface PeakTimeHourForecast {
  time_slot: string;
  hour: number;
  traffic_level: 'Low' | 'Moderate' | 'HIGH PEAK';
  predicted_queue: number;
  expected_wait_minutes: number;
  peak_probability: number;
}

export interface PeakTimePredictionResult {
  hourly_forecast: PeakTimeHourForecast[];
  recommended_order_time: string;
  peak_hours_summary: string;
  best_window: string;
  busiest_window: string;
  source: 'gemini-ai' | 'fallback-math-engine';
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface AdminAnalytics {
  totalOrders: number;
  pendingOrders: number;
  preparing: number;
  ready: number;
  completed: number;
  totalRevenue: number;
  popularItems: { name: string; count: number; revenue: number }[];
  queue: QueueMetrics;
}
