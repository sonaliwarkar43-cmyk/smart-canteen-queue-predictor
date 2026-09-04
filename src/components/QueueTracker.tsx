import React from 'react';
import { 
  Users, 
  Clock, 
  ChefHat, 
  BellRing, 
  Zap, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { QueueMetrics, User } from '../types';

interface QueueTrackerProps {
  queueMetrics: QueueMetrics | null;
  currentUser: User | null;
  onRefresh: () => void;
  onUpdateCounters: (counters: number) => void;
}

export const QueueTracker: React.FC<QueueTrackerProps> = ({
  queueMetrics,
  currentUser,
  onRefresh,
  onUpdateCounters,
}) => {
  if (!queueMetrics) {
    return (
      <div className="text-center py-16">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading live queue status...</p>
      </div>
    );
  }

  const {
    queue_entries,
    queue_length,
    average_preparation_time,
    available_counters,
    orders_preparing,
    orders_ready,
    estimated_wait_time,
    traffic_level,
  } = queueMetrics;

  const readyOrders = queue_entries.filter((q) => q.status === 'ready');
  const preparingOrders = queue_entries.filter((q) => q.status === 'preparing');
  const waitingOrders = queue_entries.filter((q) => q.status === 'waiting');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">Live Queue Tracking</h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Real-time queue monitoring, counter load balancing & dynamic wait prediction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC FORMULA EXPLANATION CARD */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-white p-5 rounded-2xl border border-amber-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">
              Dynamic Queue Formula
            </span>
            <div className="font-mono font-bold text-gray-900 text-sm sm:text-base flex flex-wrap items-center gap-1.5">
              <span className="text-amber-700">estimated_wait_time</span>
              <span>=</span>
              <span>(</span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800">
                queue_length: <strong>{queue_length}</strong>
              </span>
              <span>×</span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800">
                avg_prep: <strong>{average_preparation_time} min</strong>
              </span>
              <span>)</span>
              <span>/</span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800">
                counters: <strong>{available_counters}</strong>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Calculates dynamic waiting time based on active ticket complexity and service desks.
            </p>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl border border-amber-200 shadow-2xs text-center shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Calculated Wait</span>
            <p className="text-2xl font-black text-amber-700 leading-tight">~{estimated_wait_time} min</p>
          </div>
        </div>

        {/* Counter quick adjuster for testing/demo */}
        <div className="mt-4 pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-gray-600 font-medium">Test Counter Load Balancing:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((cnt) => (
              <button
                key={cnt}
                onClick={() => onUpdateCounters(cnt)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  available_counters === cnt
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cnt} {cnt === 1 ? 'Counter' : 'Counters'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 MAIN QUEUE METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Queue Length</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{queue_length}</p>
          <span className="text-[10px] text-gray-400">waiting in line</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Avg Prep Time</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{average_preparation_time}m</p>
          <span className="text-[10px] text-gray-400">per meal order</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Being Prepared</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{orders_preparing}</p>
          <span className="text-[10px] text-gray-400">on kitchen stove</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Orders Ready</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{orders_ready}</p>
          <span className="text-[10px] text-gray-400">at pickup counter</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Active Counters</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{available_counters}</p>
          <span className="text-[10px] text-gray-400">service windows</span>
        </div>
      </div>

      {/* LIVE QUEUE COLUMNS (Ready / Preparing / In Line) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Ready for Pickup */}
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-emerald-600" />
              <span>Ready for Pickup</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold">
              {readyOrders.length}
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6 italic">No orders ready right now</p>
          ) : (
            <div className="space-y-2.5">
              {readyOrders.map((entry) => (
                <div key={entry.id} className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs animate-pulse">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-emerald-800 text-sm">#{entry.order_id}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      COUNTER 1/2
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mt-1">{entry.customer_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{entry.items_summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: In Kitchen / Preparing */}
        <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <h3 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-amber-600" />
              <span>Currently Preparing</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
              {preparingOrders.length}
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6 italic">No orders being prepared</p>
          ) : (
            <div className="space-y-2.5">
              {preparingOrders.map((entry) => (
                <div key={entry.id} className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-amber-800 text-sm">#{entry.order_id}</span>
                    <span className="text-[11px] font-bold text-gray-500">~{entry.estimated_time}m remaining</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mt-1">{entry.customer_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{entry.items_summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: In Queue / Waiting */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-600" />
              <span>Waiting in Queue</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 text-xs font-bold">
              {waitingOrders.length}
            </span>
          </div>

          {waitingOrders.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6 italic">Queue is clear!</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {waitingOrders.map((entry) => (
                <div key={entry.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900 text-sm">#{entry.order_id}</span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Pos #{entry.queue_position} (~{entry.estimated_time}m)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mt-1">{entry.customer_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{entry.items_summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
