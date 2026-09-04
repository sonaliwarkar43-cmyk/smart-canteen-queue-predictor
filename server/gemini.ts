import { GoogleGenAI } from "@google/genai";

// Lazy initialize Gemini client to avoid crashes if GEMINI_API_KEY is not yet set
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export interface WaitingTimePrediction {
  predicted_waiting_time: number;
  predicted_queue_length: number;
  traffic_level: "LOW" | "MODERATE" | "HIGH";
  peak_probability: number;
  confidence_score: number;
  factors: string[];
  recommendation: string;
  source: "gemini-ai" | "fallback-math-engine";
}

export interface PeakTimeHourForecast {
  time_slot: string;
  hour: number;
  traffic_level: "Low" | "Moderate" | "HIGH PEAK";
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
  source: "gemini-ai" | "fallback-math-engine";
}

/**
 * Fallback mathematical prediction algorithm as required when Gemini is unavailable.
 */
function calculateFallbackWaitingTime(data: {
  queue_length: number;
  active_orders: number;
  average_prep_time: number;
  available_counters: number;
  current_time?: string;
}): WaitingTimePrediction {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Time-of-day traffic weighting: peak between 12:00-14:00 (lunch) and 16:30-17:30 (evening snacks)
  let timeWeight = 1.0;
  if (currentHour >= 12.0 && currentHour <= 14.0) {
    timeWeight = 1.55; // Peak Lunch rush
  } else if (currentHour >= 16.5 && currentHour <= 17.75) {
    timeWeight = 1.35; // Evening tea rush
  } else if (currentHour >= 10.75 && currentHour <= 11.75) {
    timeWeight = 1.15; // Pre-lunch buildup
  } else if (currentHour < 9.5 || currentHour > 19.5) {
    timeWeight = 0.6; // Off-hours
  }

  const counters = Math.max(1, data.available_counters || 3);
  const prepTime = data.average_prep_time || 4.5;
  const queueLength = data.queue_length || 5;

  // Mathematical queue projection
  const predictedQueueLength = Math.max(1, Math.round(queueLength * timeWeight + (data.active_orders > 8 ? 2 : 0)));
  const rawWait = (predictedQueueLength * prepTime) / counters;
  const predictedWaitTime = Math.max(2, Math.round(rawWait));

  let trafficLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
  let peakProb = 0.25;

  if (predictedWaitTime >= 15 || predictedQueueLength >= 12) {
    trafficLevel = "HIGH";
    peakProb = 0.88;
  } else if (predictedWaitTime >= 8 || predictedQueueLength >= 6) {
    trafficLevel = "MODERATE";
    peakProb = 0.55;
  }

  let rec = "Good time to order now. Queue is moving briskly.";
  if (trafficLevel === "HIGH") {
    rec = "Order now for pickup at 1:45 PM or pre-order to skip the lunch surge.";
  } else if (trafficLevel === "MODERATE") {
    rec = "Recommended time to order: next 10-15 minutes before crowd arrives.";
  }

  return {
    predicted_waiting_time: predictedWaitTime,
    predicted_queue_length: predictedQueueLength,
    traffic_level: trafficLevel,
    peak_probability: peakProb,
    confidence_score: 0.92,
    factors: [
      `Available pickup counters: ${counters}`,
      `Average preparation time per meal: ${prepTime} min`,
      `Current active orders in queue: ${queueLength}`,
      `Time slot load multiplier: ${(timeWeight * 100).toFixed(0)}%`,
    ],
    recommendation: rec,
    source: "fallback-math-engine",
  };
}

/**
 * AI Waiting Time Prediction using Gemini API
 */
// Helper to wrap promises with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number = 4500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)),
  ]);
}

export async function predictWaitingTime(data: {
  queue_length: number;
  active_orders: number;
  average_prep_time: number;
  available_counters: number;
  historical_summary?: string;
}): Promise<WaitingTimePrediction> {
  const fallback = calculateFallbackWaitingTime(data);
  const ai = getGeminiClient();

  if (!ai) {
    return fallback;
  }

  try {
    const now = new Date();
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
    const timeString = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const prompt = `
You are the AI Queue & Waiting Time Prediction Engine for a busy college canteen.
Analyze the following live canteen data and predict the waiting time and queue metrics:
- Current Queue Length: ${data.queue_length} people
- Active Orders being processed: ${data.active_orders}
- Available Serving/Pickup Counters: ${data.available_counters}
- Average Food Preparation Time: ${data.average_prep_time} minutes
- Current Day of Week: ${dayOfWeek}
- Current Local Time: ${timeString}
- Standard Base Waiting Formula: (queue_length * average_prep_time) / available_counters

Return a valid JSON object matching this schema exactly:
{
  "predicted_waiting_time": number (in minutes, integer),
  "predicted_queue_length": number (integer),
  "traffic_level": "LOW" | "MODERATE" | "HIGH",
  "peak_probability": number (between 0.0 and 1.0),
  "confidence_score": number (between 0.7 and 0.99),
  "factors": [string, string, string],
  "recommendation": string (short actionable advice like "Order before 12:15 PM to beat the rush")
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      3500
    );

    const text = response.text?.trim();
    if (!text) return fallback;

    const parsed = JSON.parse(text);
    return {
      predicted_waiting_time: Number(parsed.predicted_waiting_time) || fallback.predicted_waiting_time,
      predicted_queue_length: Number(parsed.predicted_queue_length) || fallback.predicted_queue_length,
      traffic_level: ["LOW", "MODERATE", "HIGH"].includes(parsed.traffic_level) ? parsed.traffic_level : fallback.traffic_level,
      peak_probability: Number(parsed.peak_probability) || fallback.peak_probability,
      confidence_score: Number(parsed.confidence_score) || fallback.confidence_score,
      factors: Array.isArray(parsed.factors) && parsed.factors.length > 0 ? parsed.factors : fallback.factors,
      recommendation: parsed.recommendation || fallback.recommendation,
      source: "gemini-ai",
    };
  } catch (error) {
    console.error("Gemini waiting time prediction error, falling back to math model:", error);
    return fallback;
  }
}

/**
 * Peak-time prediction analyzing hourly college rush patterns
 */
export async function predictPeakTimes(): Promise<PeakTimePredictionResult> {
  const fallbackSchedule: PeakTimeHourForecast[] = [
    { time_slot: "10:00 AM", hour: 10, traffic_level: "Low", predicted_queue: 5, expected_wait_minutes: 6, peak_probability: 0.2 },
    { time_slot: "11:00 AM", hour: 11, traffic_level: "Moderate", predicted_queue: 10, expected_wait_minutes: 11, peak_probability: 0.45 },
    { time_slot: "12:00 PM", hour: 12, traffic_level: "Moderate", predicted_queue: 18, expected_wait_minutes: 16, peak_probability: 0.72 },
    { time_slot: "01:00 PM", hour: 13, traffic_level: "HIGH PEAK", predicted_queue: 28, expected_wait_minutes: 24, peak_probability: 0.96 },
    { time_slot: "02:00 PM", hour: 14, traffic_level: "HIGH PEAK", predicted_queue: 20, expected_wait_minutes: 18, peak_probability: 0.75 },
    { time_slot: "03:00 PM", hour: 15, traffic_level: "Low", predicted_queue: 7, expected_wait_minutes: 7, peak_probability: 0.25 },
    { time_slot: "04:30 PM", hour: 16.5, traffic_level: "Moderate", predicted_queue: 14, expected_wait_minutes: 13, peak_probability: 0.6 },
    { time_slot: "05:30 PM", hour: 17.5, traffic_level: "Low", predicted_queue: 4, expected_wait_minutes: 5, peak_probability: 0.15 },
  ];

  const fallbackResult: PeakTimePredictionResult = {
    hourly_forecast: fallbackSchedule,
    recommended_order_time: "Recommended time to order: next 10–15 minutes before crowd arrives (11:15 AM - 11:45 AM).",
    peak_hours_summary: "Main peak occurs at 1:00 PM (College Lunch Break rush: 28 in line, ~24m wait).",
    best_window: "10:15 AM - 11:30 AM & 2:30 PM - 4:00 PM",
    busiest_window: "12:45 PM - 1:30 PM (Peak Hour: 1:00 PM)",
    source: "fallback-math-engine",
  };

  const ai = getGeminiClient();
  if (!ai) {
    return fallbackResult;
  }

  try {
    const prompt = `
You are an expert AI demand forecasting model for a university food court / college canteen.
Predict the peak-time curve throughout the campus day:
Standard historical patterns:
- 09:00 AM - 10:30 AM: Morning breakfast, Low to light moderate
- 11:00 AM: Pre-lunch crowd, Moderate
- 12:30 PM - 01:30 PM: HIGH PEAK (Class dismissal & lunch break)
- 03:00 PM: Post-lunch lull, Low
- 04:30 PM: Evening tea, samosa & sandwich surge, Moderate
- 05:30 PM: Closing hours, Low

Return a valid JSON object with the following structure:
{
  "hourly_forecast": [
    {
      "time_slot": "10:00 AM",
      "hour": 10,
      "traffic_level": "Low" | "Moderate" | "HIGH PEAK",
      "predicted_queue": number,
      "expected_wait_minutes": number,
      "peak_probability": number
    }
  ],
  "recommended_order_time": "Recommended time to order: 11:15 AM",
  "peak_hours_summary": string,
  "best_window": string,
  "busiest_window": string
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      3500
    );

    const text = response.text?.trim();
    if (!text) return fallbackResult;

    const parsed = JSON.parse(text);
    return {
      hourly_forecast: Array.isArray(parsed.hourly_forecast) && parsed.hourly_forecast.length > 0 ? parsed.hourly_forecast : fallbackResult.hourly_forecast,
      recommended_order_time: parsed.recommended_order_time || fallbackResult.recommended_order_time,
      peak_hours_summary: parsed.peak_hours_summary || fallbackResult.peak_hours_summary,
      best_window: parsed.best_window || fallbackResult.best_window,
      busiest_window: parsed.busiest_window || fallbackResult.busiest_window,
      source: "gemini-ai",
    };
  } catch (err) {
    console.error("Gemini peak time prediction error, using math fallback:", err);
    return fallbackResult;
  }
}

/**
 * Canteen AI Chatbot Assistant
 */
export async function chatWithCanteenAI(data: {
  message: string;
  history?: { role: "user" | "model"; text: string }[];
  canteenContext: {
    queueLength: number;
    estimatedWaitTime: number;
    trafficLevel: string;
    activeOrders: number;
    popularItems: { name: string; price: number; prepTime: number }[];
    recommendedTime: string;
  };
}): Promise<string> {
  const { message, canteenContext } = data;

  const popularItemsStr = canteenContext.popularItems
    .map((item) => `${item.name} (₹${item.price}, Prep: ${item.prepTime} min)`)
    .join(", ");

  const ai = getGeminiClient();

  if (!ai) {
    // Intelligent contextual fallback when Gemini API key is not supplied
    const lower = message.toLowerCase();
    if (lower.includes("what should i order") || lower.includes("suggest") || lower.includes("recommend")) {
      return `I highly recommend our top sellers today: **${popularItemsStr}**! If you're in a hurry, grab a **Vada Pav (₹20, ~4 min)** or a hot **Masala Chai (₹15, ~3 min)**. For a hearty meal, our **Special College Thali (₹90)** is fresh and filling!`;
    }
    if (lower.includes("queue") || lower.includes("wait") || lower.includes("how long")) {
      return `Right now there are **${canteenContext.queueLength} orders in the queue** with an estimated waiting time of **${canteenContext.estimatedWaitTime} minutes** (Traffic Status: **${canteenContext.trafficLevel}**). You can pre-order right now from the Pre-Order tab to skip the physical line!`;
    }
    if (lower.includes("best time") || lower.includes("when to order") || lower.includes("peak")) {
      return `The best recommended time to place orders without long waits is **${canteenContext.recommendedTime}**. Avoid 12:30 PM - 1:30 PM when the main campus lunch break takes place!`;
    }
    if (lower.includes("quick") || lower.includes("fast")) {
      return `For a speedy meal with minimum waiting time, try **Vada Pav** (4 min prep), **Masala Chai** (3 min), or a **Chilled Cold Drink** (1 min).`;
    }
    return `Hello! I am your Smart Canteen AI Assistant 🍔. Currently, our queue has ${canteenContext.queueLength} orders (~${canteenContext.estimatedWaitTime} min wait, ${canteenContext.trafficLevel} traffic). You can ask me what to order, queue wait times, peak hour recommendations, or quick food picks!`;
  }

  try {
    const systemInstruction = `
You are "Canteen AI Assistant", a smart, friendly, and efficient virtual assistant for a college canteen web application called "Smart Canteen Queue Predictor 🍔".
You assist college students, faculty, and canteen staff.

LIVE CANTEEN STATUS CONTEXT:
- Current Queue Length: ${canteenContext.queueLength} people waiting
- Current Estimated Waiting Time: ${canteenContext.estimatedWaitTime} minutes
- Canteen Traffic Level: ${canteenContext.trafficLevel}
- Active Orders in Progress: ${canteenContext.activeOrders}
- Available Popular Menu Items: ${popularItemsStr}
- Best Recommended Time to Order: ${canteenContext.recommendedTime}

GUIDELINES:
- Keep answers crisp, warm, helpful, and student-friendly with clear bullet points where helpful.
- Reference realistic prices in Indian Rupees (₹) and preparation times in minutes from the live menu context.
- If asked "What should I order?", suggest based on whether they want a snack, full meal, or quick bite.
- If asked about queue or wait times, give the real-time statistics from the context.
- Remind students they can use the "Pre-Order" tab to schedule pickups in advance.
`;

    const chat = ai.chats.create({
      model: "gemini-3.8-flash",
      config: {
        systemInstruction,
      },
    });

    const response = await withTimeout(
      chat.sendMessage({
        message,
      }),
      4000
    );

    return response.text?.trim() || "I'm here to help you skip the queue and grab delicious food! What can I help you with today?";
  } catch (error) {
    console.error("Gemini chatbot error:", error);
    return `Currently there are ${canteenContext.queueLength} orders waiting (${canteenContext.estimatedWaitTime} min wait time, ${canteenContext.trafficLevel} traffic). Top items today: ${popularItemsStr}. Try pre-ordering through the menu to skip the queue!`;
  }
}
