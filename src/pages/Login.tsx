import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertTriangle, Eye, EyeOff, Building2, ShieldCheck } from 'lucide-react';
import api from '@/api/axiosInstance';

interface LoginFormData {
  org_email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    org_email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/v1/login', {
        org_email: formData.org_email,
        password: formData.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.errorMessage ||
          err.response?.data?.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Left Branding Panel - centered, neat */}
      <div className="hidden md:flex w-1/3 bg-blue-600 p-10 flex-col justify-center items-center text-center">
        <div className="inline-flex items-center justify-center gap-2.5 mb-8">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">ERP Core</span>
        </div>
        <h2 className="text-white text-3xl font-bold mb-4">Welcome back</h2>
        <p className="text-blue-100 text-sm max-w-xs leading-relaxed mb-8">
          Sign in to your organization account to manage products, inventory,
          customers, suppliers, purchases, and sales.
        </p>
        <div className="inline-flex items-center justify-center gap-2.5 text-blue-100/90 text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure organization-centric access</span>
        </div>
        <div className="mt-12 text-blue-200 text-[10px] font-medium uppercase tracking-wider opacity-90">
          ERP Core v0.0.1
        </div>
      </div>

      {/* Right Login Form - centered card */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mx-auto mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ERP Core</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Sign in</h1>
            <p className="text-slate-500 text-sm text-center">
              Enter your organization credentials below
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="org_email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -mt-2 w-4 h-4 text-slate-400" />
                <input
                  id="org_email"
                  name="org_email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.org_email}
                  onChange={handleChange}
                  placeholder="org@example.com"
                  disabled={loading}
                  className="w-full pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -mt-2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 2 5.373 2 12h6zm2 12a8 8 0 00-8-8V0C5.373 0 2 5.373 2 12h6zm2 12a8 8 0 018-8V0c2.627 0 6 3.373 6 12h-6zm10-10a8 8 0 01-8 8v8a8 8 0 008-8z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

            <p className="text-xs text-slate-500 text-center mt-2">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact administrator
              </a>
            </p>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              ERP Core is built for small-scale businesses with organization-centric data isolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
