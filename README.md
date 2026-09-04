# Smart Canteen Queue Predictor 🍔

A modern, responsive, full-stack college canteen management and queue prediction system. Designed to reduce student wait times during peak rush hours via dynamic queue estimation, smart pre-ordering, historical demand analytics, and Google Gemini AI insights.

---

## 🚀 Key Features

1. **Student Dashboard**: Live queue length, wait times, active order count, peak status indicator, and trending food items.
2. **Dynamic Queue Tracking**: Real-time queue formula calculation:
   $$\text{Estimated Wait Time} = \frac{\text{Queue Length} \times \text{Average Preparation Time}}{\text{Available Counters}}$$
3. **AI Waiting Time & Traffic Prediction**: Powered by Google Gemini (`gemini-3.8-flash`) with automatic mathematical algorithm fallback.
4. **Peak-Time Prediction Chart**: Visual hourly campus surge analysis (10:00 AM Low, 12:30 PM High Peak, 1:30 PM High Peak, 4:30 PM Snack rush) with optimal order window recommendations.
5. **Smart Pre-Ordering**: Interactive cart, custom pickup slot selection, order ID generation, and automatic placement into the active queue.
6. **Live Order Tracking**: Visual 5-step status progression (*Order Placed* $\to$ *Confirmed* $\to$ *Preparing* $\to$ *Ready* $\to$ *Completed*).
7. **Canteen AI Assistant**: Gemini chatbot for instant recommendations, queue checks, and fast meal ideas.
8. **Admin / Canteen Staff Dashboard**: Manage menu items & availability, adjust active serving counters, update order progress in real-time, view sales & queue analytics.
9. **Role-Based Access**: Seamless student and canteen manager login/registration.

---

## 📁 Project Structure

```
smart-canteen/
│
├── database/
│   └── schema.sql              # MySQL DDL schema and sample seed data
│
├── server/
│   ├── db.ts                   # In-memory relational database & queue calculation engine
│   └── gemini.ts               # Google Gemini AI prediction & chatbot integration
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Responsive navigation & role badge
│   │   ├── StudentDashboard.tsx# Core metrics, status, popular items
│   │   ├── FoodMenu.tsx        # Visual food menu with filter & cart
│   │   ├── PreOrderModal.tsx   # Checkout & pickup time picker
│   │   ├── OrderTracker.tsx    # 5-step live order tracker
│   │   ├── QueueView.tsx       # Live queue board & counter management
│   │   ├── PredictionsView.tsx # Chart.js peak hours & AI recommendations
│   │   ├── AiAssistantModal.tsx# Gemini-powered chatbot
│   │   ├── AdminDashboard.tsx  # Canteen operations, status controls, sales analytics
│   │   ├── LandingPage.tsx     # Hero banner and feature highlights
│   │   └── AuthModal.tsx       # Student & admin login/register
│   ├── types.ts                # TypeScript data contracts & models
│   ├── App.tsx                 # Main application state and routing
│   ├── main.tsx                # React 19 entry point
│   └── index.css               # Tailwind CSS styles
│
├── server.ts                   # Express server + REST APIs + Vite middleware
├── .env.example                # Environment variable documentation
├── package.json                # Dependencies and build scripts
└── README.md                   # Setup guide and documentation
```

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Zero-Configuration Run
This project runs directly out of the box with zero external database configuration required. Data is managed with persistent local storage and an in-memory real-time service:
```bash
npm run dev
```

The server boots on `http://0.0.0.0:3000` with hot Vite compilation.

### 2. Optional Google Gemini API Key
The application features a built-in mathematical & contextual queue prediction engine that runs fully offline without any API keys. If you want to enable advanced generative conversational AI via Gemini, you can optionally provide `GEMINI_API_KEY`:
```env
GEMINI_API_KEY="AIzaSy..."
```

### 3. Open the Application
Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 👥 Demo Accounts
- **Student**: `aarav@college.edu` (Password: `student123`)
- **Admin / Staff**: `admin@canteen.edu` (Password: `admin123`)
*(You can also quickly switch roles or create custom accounts directly in the UI)*
