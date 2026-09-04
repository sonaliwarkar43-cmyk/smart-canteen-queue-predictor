import React from 'react';
import { 
  ArrowRight, 
  Hourglass, 
  Sparkles, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { QueueMetrics } from '../types';

interface LandingHeroProps {
  onOrderNow: () => void;
  onViewQueue: () => void;
  onViewPredictions: () => void;
  onOpenAssistant: () => void;
  queueMetrics: QueueMetrics | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOrderNow,
  onViewQueue,
  onViewPredictions,
  onOpenAssistant,
  queueMetrics,
}) => {
  return (
    <div className="space-y-12">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-white border border-amber-200/70 p-6 sm:p-10 lg:p-12 shadow-sm">
        {/* Subtle Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI-Driven College Canteen Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-700">Powered by Gemini</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.1] mb-5">
            Skip the Queue. <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              Enjoy Your Food.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mb-8">
            Smart Canteen uses AI to predict waiting time and help students order food smarter. 
            Pre-order ahead between lectures, get live queue updates, and collect hot meals without standing in long lines.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={onOrderNow}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 hover:translate-y-[-1px] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewQueue}
              className="px-5 py-3.5 rounded-xl bg-white text-gray-800 font-semibold text-sm border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Hourglass className="w-4 h-4 text-amber-600" />
              <span>View Live Queue</span>
            </button>

            <button
              onClick={onOpenAssistant}
              className="px-4 py-3.5 rounded-xl bg-violet-50 text-violet-800 font-semibold text-sm border border-violet-200 hover:bg-violet-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Ask Canteen AI</span>
            </button>
          </div>

          {/* Live Quick Stats Strip */}
          {queueMetrics && (
            <div className="mt-8 pt-6 border-t border-amber-200/60 flex flex-wrap items-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Canteen Status: <strong className="text-gray-900">{queueMetrics.canteen_status}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Current Est. Wait: <strong className="text-gray-900 font-bold">{queueMetrics.estimated_wait_time} mins</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-orange-600" />
                <span>Active Counters: <strong className="text-gray-900">{queueMetrics.available_counters} Serving</strong></span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4 Main Core Feature Cards */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Why Use Smart Canteen?</h2>
            <p className="text-sm text-gray-500">Engineered for college rush hours and quick break times</p>
          </div>
          <button 
            onClick={onViewPredictions}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div 
            onClick={onViewQueue}
            className="group p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
                <Hourglass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">Live Queue Tracking</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                See exact order volume in real-time. Transparent counter allocations and live countdowns.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>View live queue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2 */}
          <div 
            onClick={onViewPredictions}
            className="group p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">AI Wait Prediction</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Gemini AI dynamically evaluates time-of-day traffic, meal preparation complexity, and active kitchen load.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-violet-600">
              <span>See AI forecast</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3 */}
          <div 
            onClick={onOrderNow}
            className="group p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">Smart Pre-Ordering</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Select your favorite snacks and lunch thalis, set your preferred pickup slot, and pay effortlessly.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Browse menu</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 4 */}
          <div 
            onClick={onViewPredictions}
            className="group p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">Peak-Time Prediction</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Interactive hourly charts pinpoint high peak rush (12:30 & 1:30 PM) so you can plan orders beforehand.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-orange-600">
              <span>Check peak hours</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
