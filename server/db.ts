export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'staff';
  created_at: string;
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  preparation_time: number; // minutes
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
  estimated_prep_time?: number;
  pickup_time: string;
  payment_method: string;
  payment_status: 'Paid' | 'Pending';
  created_at: string;
  items: OrderItem[];
}

export interface QueueEntry {
  id: number;
  order_id: number;
  customer_name: string;
  items_summary: string;
  queue_position: number;
  estimated_time: number; // in minutes
  status: 'waiting' | 'preparing' | 'ready' | 'collected';
  created_at: string;
}

export interface Sale {
  id: number;
  order_id: number;
  amount: number;
  created_at: string;
}

export interface QueueConfig {
  available_counters: number;
  average_preparation_time: number; // minutes default
  canteen_name: string;
  is_canteen_open: boolean;
}

class CanteenDatabase {
  private users: User[] = [];
  private foodItems: FoodItem[] = [];
  private orders: Order[] = [];
  private queue: QueueEntry[] = [];
  private sales: Sale[] = [];
  private config: QueueConfig = {
    available_counters: 3,
    average_preparation_time: 4.5,
    canteen_name: "Campus Hub Smart Canteen",
    is_canteen_open: true,
  };

  private nextUserId = 5;
  private nextFoodId = 11;
  private nextOrderId = 108;
  private nextQueueId = 10;
  private nextSaleId = 10;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    this.users = [
      { id: 1, name: 'Aarav Sharma', email: 'aarav@college.edu', role: 'student', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, name: 'Priya Patel', email: 'priya@college.edu', role: 'student', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, name: 'Rohan Verma', email: 'rohan@college.edu', role: 'student', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 4, name: 'Canteen Admin', email: 'admin@canteen.edu', role: 'admin', created_at: new Date(Date.now() - 86400000).toISOString() },
    ];

    this.foodItems = [
      {
        id: 1,
        name: 'Vada Pav',
        category: 'Snacks',
        price: 20,
        preparation_time: 4,
        availability: true,
        popular: true,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60',
        description: 'Crispy spiced potato patty with roasted chili and garlic mint chutneys.',
      },
      {
        id: 2,
        name: 'Punjabi Samosa',
        category: 'Snacks',
        price: 25,
        preparation_time: 5,
        availability: true,
        popular: true,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
        description: 'Flaky pastry stuffed with cumin spiced potatoes, green peas and cashews.',
      },
      {
        id: 3,
        name: 'Veg Cheese Grilled Sandwich',
        category: 'Sandwiches',
        price: 60,
        preparation_time: 7,
        availability: true,
        popular: true,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60',
        description: 'Crispy butter toasted sandwich with crunchy veggies, green chutney and molten cheese.',
      },
      {
        id: 4,
        name: 'Crispy Veg Burger',
        category: 'Fast Food',
        price: 75,
        preparation_time: 8,
        availability: true,
        popular: false,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
        description: 'Golden herb patty, cheddar slice, fresh lettuce, and house mayo on toasted brioche.',
      },
      {
        id: 5,
        name: 'Paneer Tikka Pizza',
        category: 'Fast Food',
        price: 120,
        preparation_time: 12,
        availability: true,
        popular: false,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
        description: '7-inch personal crust with charred tandoori cottage cheese, onions and mozzarella.',
      },
      {
        id: 6,
        name: 'Special Masala Chai',
        category: 'Beverages',
        price: 15,
        preparation_time: 3,
        availability: true,
        popular: true,
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60',
        description: 'Hot brewed cutting tea infused with fresh crushed ginger and green cardamom.',
      },
      {
        id: 7,
        name: 'Filter Coffee',
        category: 'Beverages',
        price: 25,
        preparation_time: 3,
        availability: true,
        popular: false,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
        description: 'Authentic South Indian chicory decoction with frothy steamed whole milk.',
      },
      {
        id: 8,
        name: 'Chilled Cold Drink',
        category: 'Beverages',
        price: 30,
        preparation_time: 1,
        availability: true,
        popular: false,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
        description: 'Chilled 300ml glass bottle soda (Cola / Lemon / Mango).',
      },
      {
        id: 9,
        name: 'Student Thali Meal',
        category: 'Meals',
        price: 90,
        preparation_time: 10,
        availability: true,
        popular: true,
        image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=60',
        description: 'Wholesome student lunch: Dal tadka, Paneer butter masala, 3 phulkas, jeera rice & gulab jamun.',
      },
      {
        id: 10,
        name: 'Paneer Frankie Roll',
        category: 'Snacks',
        price: 65,
        preparation_time: 6,
        availability: true,
        popular: false,
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60',
        description: 'Soft roti wrap tossed with grilled cottage cheese cubes, secret spice and vinegar onions.',
      },
    ];

    const pastTime = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();

    this.orders = [
      {
        id: 101,
        user_id: 1,
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav@college.edu',
        total_amount: 85,
        order_status: 'Completed',
        pickup_time: '10:15 AM',
        payment_method: 'UPI',
        payment_status: 'Paid',
        created_at: pastTime(95),
        items: [
          { id: 1, order_id: 101, food_id: 1, food_name: 'Vada Pav', quantity: 2, unit_price: 20 },
          { id: 2, order_id: 101, food_id: 6, food_name: 'Special Masala Chai', quantity: 3, unit_price: 15 },
        ],
      },
      {
        id: 102,
        user_id: 2,
        customer_name: 'Priya Patel',
        customer_email: 'priya@college.edu',
        total_amount: 60,
        order_status: 'Completed',
        pickup_time: '10:35 AM',
        payment_method: 'Campus Wallet',
        payment_status: 'Paid',
        created_at: pastTime(75),
        items: [
          { id: 3, order_id: 102, food_id: 3, food_name: 'Veg Cheese Grilled Sandwich', quantity: 1, unit_price: 60 },
        ],
      },
      {
        id: 103,
        user_id: 3,
        customer_name: 'Rohan Verma',
        customer_email: 'rohan@college.edu',
        total_amount: 140,
        order_status: 'Completed',
        pickup_time: '11:10 AM',
        payment_method: 'UPI',
        payment_status: 'Paid',
        created_at: pastTime(22),
        items: [
          { id: 4, order_id: 103, food_id: 5, food_name: 'Paneer Tikka Pizza', quantity: 1, unit_price: 120 },
          { id: 5, order_id: 103, food_id: 1, food_name: 'Vada Pav', quantity: 1, unit_price: 20 },
        ],
      },
      {
        id: 104,
        user_id: 1,
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav@college.edu',
        total_amount: 105,
        order_status: 'Preparing',
        pickup_time: '11:20 AM',
        payment_method: 'Campus Card',
        payment_status: 'Paid',
        created_at: pastTime(14),
        items: [
          { id: 6, order_id: 104, food_id: 4, food_name: 'Crispy Veg Burger', quantity: 1, unit_price: 75 },
          { id: 7, order_id: 104, food_id: 8, food_name: 'Chilled Cold Drink', quantity: 1, unit_price: 30 },
        ],
      },
      {
        id: 105,
        user_id: 2,
        customer_name: 'Priya Patel',
        customer_email: 'priya@college.edu',
        total_amount: 60,
        order_status: 'Preparing',
        pickup_time: '11:25 AM',
        payment_method: 'UPI',
        payment_status: 'Paid',
        created_at: pastTime(9),
        items: [
          { id: 8, order_id: 105, food_id: 3, food_name: 'Veg Cheese Grilled Sandwich', quantity: 1, unit_price: 60 },
        ],
      },
      {
        id: 106,
        user_id: 3,
        customer_name: 'Rohan Verma',
        customer_email: 'rohan@college.edu',
        total_amount: 50,
        order_status: 'Pending',
        pickup_time: '11:30 AM',
        payment_method: 'UPI',
        payment_status: 'Paid',
        created_at: pastTime(5),
        items: [
          { id: 9, order_id: 106, food_id: 2, food_name: 'Punjabi Samosa', quantity: 1, unit_price: 25 },
          { id: 10, order_id: 106, food_id: 7, food_name: 'Filter Coffee', quantity: 1, unit_price: 25 },
        ],
      },
      {
        id: 107,
        user_id: 1,
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav@college.edu',
        total_amount: 75,
        order_status: 'Pending',
        pickup_time: '11:35 AM',
        payment_method: 'UPI',
        payment_status: 'Paid',
        created_at: pastTime(2),
        items: [
          { id: 11, order_id: 107, food_id: 4, food_name: 'Crispy Veg Burger', quantity: 1, unit_price: 75 },
        ],
      },
    ];

    this.sales = [
      { id: 1, order_id: 101, amount: 85, created_at: pastTime(95) },
      { id: 2, order_id: 102, amount: 60, created_at: pastTime(75) },
      { id: 3, order_id: 103, amount: 140, created_at: pastTime(22) },
      { id: 4, order_id: 104, amount: 105, created_at: pastTime(14) },
      { id: 5, order_id: 105, amount: 75, created_at: pastTime(9) },
      { id: 6, order_id: 106, amount: 45, created_at: pastTime(5) },
      { id: 7, order_id: 107, amount: 90, created_at: pastTime(2) },
    ];

    this.recalculateQueue();
  }

  public recalculateQueue() {
    // Active orders in queue are those not completed/cancelled
    const activeOrders = this.orders.filter(
      (o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled'
    );

    // Calculate dynamic average prep time across active orders
    let totalPrepTime = 0;
    let totalItemsCount = 0;

    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        const food = this.foodItems.find((f) => f.id === item.food_id);
        const prep = food ? food.preparation_time : 5;
        totalPrepTime += prep * item.quantity;
        totalItemsCount += item.quantity;
      });
    });

    if (totalItemsCount > 0) {
      this.config.average_preparation_time = Math.round((totalPrepTime / totalItemsCount) * 10) / 10;
    } else {
      this.config.average_preparation_time = 4.5;
    }

    // Build queue entries
    this.queue = [];
    let position = 1;

    // Ready orders come first at position 0
    activeOrders
      .filter((o) => o.order_status === 'Ready')
      .forEach((o) => {
        this.queue.push({
          id: o.id,
          order_id: o.id,
          customer_name: o.customer_name,
          items_summary: o.items.map((i) => `${i.quantity}x ${i.food_name}`).join(', '),
          queue_position: 0,
          estimated_time: 0,
          status: 'ready',
          created_at: o.created_at,
        });
      });

    // Orders in preparing / confirmed / placed
    const waitingOrders = activeOrders.filter((o) => o.order_status !== 'Ready');
    waitingOrders.forEach((o) => {
      const waitTime = Math.max(
        1,
        Math.round(
          (position * this.config.average_preparation_time) / Math.max(1, this.config.available_counters)
        )
      );

      this.queue.push({
        id: o.id,
        order_id: o.id,
        customer_name: o.customer_name,
        items_summary: o.items.map((i) => `${i.quantity}x ${i.food_name}`).join(', '),
        queue_position: position,
        estimated_time: waitTime,
        status: o.order_status === 'Preparing' ? 'preparing' : 'waiting',
        created_at: o.created_at,
      });

      position++;
    });
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.users.map(({ password, ...u }) => u as User);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(data: { name: string; email: string; password?: string; role?: 'student' | 'admin' }): User {
    const newUser: User = {
      id: this.nextUserId++,
      name: data.name,
      email: data.email,
      password: data.password || 'password123',
      role: data.role || 'student',
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Food Items ---
  public getFoodItems(): FoodItem[] {
    return [...this.foodItems];
  }

  public getFoodItemById(id: number): FoodItem | undefined {
    return this.foodItems.find((f) => f.id === id);
  }

  public createFoodItem(item: Omit<FoodItem, 'id'>): FoodItem {
    const newItem: FoodItem = {
      ...item,
      id: this.nextFoodId++,
    };
    this.foodItems.push(newItem);
    return newItem;
  }

  public updateFoodItem(id: number, updates: Partial<FoodItem>): FoodItem | null {
    const idx = this.foodItems.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.foodItems[idx] = { ...this.foodItems[idx], ...updates };
    return this.foodItems[idx];
  }

  public deleteFoodItem(id: number): boolean {
    const idx = this.foodItems.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.foodItems.splice(idx, 1);
    return true;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return [...this.orders].reverse();
  }

  public getOrderById(id: number): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public createOrder(data: {
    user_id?: number;
    customer_name: string;
    customer_email: string;
    items: { food_id: number; quantity: number }[];
    pickup_time?: string;
    payment_method?: string;
  }): Order {
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    data.items.forEach((item) => {
      const food = this.foodItems.find((f) => f.id === item.food_id);
      if (food) {
        const subtotal = food.price * item.quantity;
        totalAmount += subtotal;
        orderItems.push({
          id: Math.floor(Math.random() * 10000),
          order_id: this.nextOrderId,
          food_id: food.id,
          food_name: food.name,
          quantity: item.quantity,
          unit_price: food.price,
        });
      }
    });

    const newOrder: Order = {
      id: this.nextOrderId++,
      user_id: data.user_id || 1,
      customer_name: data.customer_name || 'Student',
      customer_email: data.customer_email || 'student@college.edu',
      total_amount: totalAmount,
      order_status: 'Order Placed',
      pickup_time: data.pickup_time || 'Immediate (~15 min)',
      payment_method: data.payment_method || 'UPI',
      payment_status: 'Paid',
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    this.orders.push(newOrder);

    // Record in sales
    this.sales.push({
      id: this.nextSaleId++,
      order_id: newOrder.id,
      amount: totalAmount,
      created_at: newOrder.created_at,
    });

    this.recalculateQueue();
    return newOrder;
  }

  public updateOrderStatus(id: number, status: OrderStatus): Order | null {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;

    order.order_status = status;
    this.recalculateQueue();
    return order;
  }

  // --- Queue & Metrics ---
  public getQueue() {
    this.recalculateQueue();
    const activeOrders = this.orders.filter((o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled');
    const waitingOrders = activeOrders.filter((o) => o.order_status !== 'Ready');
    const queueLength = waitingOrders.length;
    const preparingCount = activeOrders.filter((o) => o.order_status === 'Preparing').length;
    const readyCount = activeOrders.filter((o) => o.order_status === 'Ready').length;

    const availableCounters = Math.max(1, this.config.available_counters);
    const avgPrepTime = this.config.average_preparation_time;

    // Formula as requested in prompt:
    // estimated_wait_time = (queue_length * average_preparation_time) / available_counters
    const calculatedWaitTime = Math.round((queueLength * avgPrepTime) / availableCounters);

    let trafficLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    if (calculatedWaitTime >= 15 || queueLength >= 8) {
      trafficLevel = 'HIGH';
    } else if (calculatedWaitTime >= 8 || queueLength >= 4) {
      trafficLevel = 'MODERATE';
    }

    return {
      queue_entries: this.queue,
      queue_length: queueLength,
      total_active_orders: activeOrders.length,
      orders_preparing: preparingCount,
      orders_ready: readyCount,
      average_preparation_time: avgPrepTime,
      available_counters: availableCounters,
      estimated_wait_time: Math.max(1, calculatedWaitTime),
      traffic_level: trafficLevel,
      canteen_status: this.config.is_canteen_open ? 'Open' : 'Closed',
      last_updated: new Date().toISOString(),
    };
  }

  public updateQueueConfig(updates: Partial<QueueConfig>): QueueConfig {
    this.config = { ...this.config, ...updates };
    this.recalculateQueue();
    return this.config;
  }

  public getQueueConfig(): QueueConfig {
    return { ...this.config };
  }

  // --- Analytics ---
  public getAnalytics() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter((o) => o.order_status === 'Order Placed' || o.order_status === 'Confirmed').length;
    const preparing = this.orders.filter((o) => o.order_status === 'Preparing').length;
    const ready = this.orders.filter((o) => o.order_status === 'Ready').length;
    const completed = this.orders.filter((o) => o.order_status === 'Completed').length;
    const totalRevenue = this.sales.reduce((sum, s) => sum + s.amount, 0);

    // Item popularity
    const itemCounts: Record<string, { count: number; name: string; revenue: number }> = {};
    this.orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemCounts[item.food_name]) {
          itemCounts[item.food_name] = { count: 0, name: item.food_name, revenue: 0 };
        }
        itemCounts[item.food_name].count += item.quantity;
        itemCounts[item.food_name].revenue += item.quantity * item.unit_price;
      });
    });

    const popularItems = Object.values(itemCounts).sort((a, b) => b.count - a.count);

    return {
      totalOrders,
      pendingOrders,
      preparing,
      ready,
      completed,
      totalRevenue,
      popularItems,
      queue: this.getQueue(),
    };
  }
}

export const db = new CanteenDatabase();
