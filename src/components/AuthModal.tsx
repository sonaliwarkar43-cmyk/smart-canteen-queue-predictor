import React, { useState } from 'react';
import { X, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister 
        ? { name, email, password, role } 
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const data = await res.json();
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      alert('Login error. You can also use the 1-Click Demo accounts below!');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Logins
  const handleQuickLogin = (demoRole: 'student' | 'admin') => {
    if (demoRole === 'student') {
      onLoginSuccess({
        id: 1,
        name: 'Aarav Sharma',
        email: 'aarav@college.edu',
        role: 'student',
      });
    } else {
      onLoginSuccess({
        id: 2,
        name: 'Canteen Kitchen Head',
        email: 'manager@canteen.college.edu',
        role: 'admin',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-950">
              {isRegister ? 'Create Campus Account' : 'Welcome to Smart Canteen'}
            </h2>
            <p className="text-xs text-gray-500">Sign in with student or staff credentials</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Demo Profiles for Hackathon Testing */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
          <span className="text-[11px] font-extrabold uppercase text-amber-900 tracking-wider block mb-2">
            🚀 1-Click Hackathon Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Student Profile</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin / Kitchen</span>
            </button>
          </div>
        </div>

        <div className="my-4 flex items-center gap-2 text-xs text-gray-400">
          <div className="h-px bg-gray-200 grow" />
          <span>or sign in manually</span>
          <div className="h-px bg-gray-200 grow" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-600 font-semibold mb-1">College Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aarav@college.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'admin')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white"
              >
                <option value="student">Student</option>
                <option value="admin">Canteen Staff / Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-amber-700 font-semibold hover:underline cursor-pointer"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
