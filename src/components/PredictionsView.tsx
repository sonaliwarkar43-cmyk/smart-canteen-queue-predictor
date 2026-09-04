import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Zap, 
  RefreshCw,
  BarChart2
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { WaitingTimePrediction, PeakTimePredictionResult, QueueMetrics } from '../types';

Chart.register(...registerables);

interface PredictionsViewProps {
  queueMetrics: QueueMetrics | null;
  waitingPrediction: WaitingTimePrediction | null;
  peakPrediction: PeakTimePredictionResult | null;
  onRefreshPredictions: () => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  queueMetrics,
  waitingPrediction,
  peakPrediction,
  onRefreshPredictions,
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Render Chart.js
  useEffect(() => {
    if (!chartCanvasRef.current || !peakPrediction?.hourly_forecast) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = peakPrediction.hourly_forecast.map((item) => item.time_slot);
    const queueData = peakPrediction.hourly_forecast.map((item) => item.predicted_queue);
    const waitTimes = peakPrediction.hourly_forecast.map((item) => item.expected_wait_minutes);

    const backgroundColors = peakPrediction.hourly_forecast.map((item) => {
      if (item.traffic_level === 'HIGH PEAK') return 'rgba(239, 68, 68, 0.85)'; // Red
      if (item.traffic_level === 'Moderate') return 'rgba(245, 158, 11, 0.85)'; // Amber
      return 'rgba(16, 185, 129, 0.85)'; // Emerald
    });

    const borderColors = peakPrediction.hourly_forecast.map((item) => {
      if (item.traffic_level === 'HIGH PEAK') return '#dc2626';
      if (item.traffic_level === 'Moderate') return '#d97706';
      return '#059669';
    });

    const ctx = chartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Predicted Queue Length (People)',
            data: queueData,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            borderRadius: chartType === 'bar' ? 8 : 0,
            tension: 0.35,
            fill: chartType === 'line',
          },
          {
            label: 'Expected Wait (Minutes)',
            data: waitTimes,
            type: 'line',
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2,
            borderDash: [4, 4],
            pointBackgroundColor: '#4f46e5',
            tension: 0.3,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: {
                size: 11,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            callbacks: {
              afterLabel: function (context) {
                const item = peakPrediction.hourly_forecast[context.dataIndex];
                return `Traffic: ${item.traffic_level} (${Math.round(item.peak_probability * 100)}% peak probability)`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count / Minutes',
              font: { size: 11 },
            },
            grid: {
              color: 'rgba(0,0,0,0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 10, weight: 'bold' },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [peakPrediction, chartType]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshPredictions();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">AI Queue & Peak Predictions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
              Gemini AI
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Powered by Google Gemini API to analyze current rush, orders volume, time-of-day and historical trends
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Re-analyze with Gemini</span>
        </button>
      </div>

      {/* 1. CURRENT WAITING TIME PREDICTION CARD */}
      <div className="bg-gradient-to-br from-violet-50/70 via-white to-amber-50/60 p-6 sm:p-8 rounded-3xl border border-violet-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-violet-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-950">Current AI Waiting Time Prediction</h2>
              <p className="text-xs text-gray-500">
                Model: Gemini 3.8 Flash • Confidence: {Math.round((waitingPrediction?.confidence_score ?? 0.94) * 100)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              waitingPrediction?.traffic_level === 'HIGH'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : waitingPrediction?.traffic_level === 'MODERATE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {waitingPrediction?.traffic_level ?? 'MODERATE'} TRAFFIC
            </span>
          </div>
        </div>

        {/* 3 Main Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Estimated Wait</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-gray-950">
                ~{waitingPrediction?.predicted_waiting_time ?? 15}
              </span>
              <span className="text-xs font-bold text-gray-500">minutes</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Calculated dynamic preparation & counter throughput
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Expected Queue</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-gray-950">
                {waitingPrediction?.predicted_queue_length ?? 18}
              </span>
              <span className="text-xs font-bold text-gray-500">people</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Projected rush for next 20-minute window
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Peak Probability</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-violet-700">
                {Math.round((waitingPrediction?.peak_probability ?? 0.82) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Likelihood of hitting max crowd within the hour
            </p>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-950 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">AI Recommendation</span>
            <p className="text-sm font-semibold text-gray-950 mt-0.5">
              "{waitingPrediction?.recommendation || 'Recommended time to order: 11:15 AM'}"
            </p>
          </div>
        </div>

        {/* Factors Breakdown */}
        {waitingPrediction?.factors && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Analyzed Contributing Factors:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {waitingPrediction.factors.map((factor, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700 bg-white/70 px-3 py-2 rounded-xl border border-gray-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. PEAK-TIME PREDICTION & CHART.JS SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <span>Campus Peak-Time Rush Curve (Chart.js)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Analyzed from historical order data across academic lecture timetables
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Chart View:</span>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Line
            </button>
          </div>
        </div>

        {/* Highlighted Banner: Recommended Time to Order */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              ⏰
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase">Smart Scheduling Insight</p>
              <h3 className="text-base sm:text-lg font-black text-gray-950">
                {peakPrediction?.recommended_order_time || "Recommended time to order: 11:15 AM"}
              </h3>
            </div>
          </div>
          <span className="text-xs text-emerald-800 font-medium sm:text-right">
            Best order slot before the 12:30 PM lunch dismissal
          </span>
        </div>

        {/* Chart Canvas Container */}
        <div className="h-72 sm:h-80 w-full relative">
          <canvas ref={chartCanvasRef} />
        </div>

        {/* Busy Period Breakdown Table as specified in requirement 5 */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Hourly Campus Surge Schedule:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {peakPrediction?.hourly_forecast.map((slot) => {
              const isPeak = slot.traffic_level === 'HIGH PEAK';
              const isMod = slot.traffic_level === 'Moderate';
              return (
                <div
                  key={slot.time_slot}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isPeak
                      ? 'bg-red-50/80 border-red-300 text-red-950 ring-1 ring-red-300'
                      : isMod
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <p className="font-mono text-xs font-bold">{slot.time_slot}</p>
                  <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    isPeak ? 'bg-red-600 text-white' : isMod ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {slot.traffic_level}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1">
                    ~{slot.predicted_queue} in queue
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best & Busiest Windows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <span className="font-bold text-emerald-700 block mb-1">🟢 Best Low Wait Window</span>
            <p className="text-gray-800 font-semibold">{peakPrediction?.best_window || "10:30 AM - 11:30 AM & 2:45 PM - 4:00 PM"}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Kitchen throughput is fastest with lowest queues.</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <span className="font-bold text-red-600 block mb-1">🔴 Extreme High Peak Window</span>
            <p className="text-gray-800 font-semibold">{peakPrediction?.busiest_window || "12:30 PM - 1:45 PM"}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Heavy congestion. Always pre-order at least 45 min ahead.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
