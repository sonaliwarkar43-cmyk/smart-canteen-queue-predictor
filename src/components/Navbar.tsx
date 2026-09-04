import React, { useState } from 'react';
import { 
  Utensils, 
  Home, 
  Menu as MenuIcon, 
  ShoppingBag, 
  MapPin, 
  Hourglass, 
  BarChart3, 
  User as UserIcon, 
  ShieldCheck, 
  X,
  Sparkles,
  Flame
} from 'lucide-react';
import { User, QueueMetrics } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  cartCount: number;
  queueMetrics: QueueMetrics | null;
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  cartCount,
  queueMetrics,
  onOpenAssistant,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'active-orders', label: 'Active Orders', icon: Flame },
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'preorder', label: 'Pre-Order', icon: ShoppingBag, badge: cartCount },
    { id: 'track', label: 'Track Order', icon: MapPin },
    { id: 'queue', label: 'Live Queue', icon: Hourglass },
    { id: 'predictions', label: 'AI Predictions', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.adminOnly || (currentUser && currentUser.role === 'admin')
  );

  return (
    <div className="md:hidden sticky top-0 z-40 bg-[#1E293B] text-white border-b border-slate-800">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Mobile Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F59E0B] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🍔
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight flex items-center gap-1">
              Smart Canteen
            </span>
            <p className="text-[10px] text-slate-400 leading-none">Bento Queue Predictor</p>
          </div>
        </div>

        {/* Live Wait badge + AI + Menu toggle */}
        <div className="flex items-center gap-2">
          {queueMetrics && (
            <div 
              onClick={() => setActiveTab('queue')}
              className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>~{queueMetrics.estimated_wait_time}m</span>
            </div>
          )}

          <button
            onClick={onOpenAssistant}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
            title="Ask AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-[#1E293B] px-4 py-3 space-y-1 shadow-xl">
          {filteredLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-[#F59E0B] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white text-slate-900">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Logged in as: <strong className="text-white">{currentUser?.name || 'Guest'}</strong></span>
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="text-amber-400 font-bold underline"
            >
              Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
