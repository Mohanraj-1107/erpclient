import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import api from '@/api/axiosInstance';
import { getApiErrorMessage } from '@/lib/utils';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setError('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/v1/login', {
        org_email: formData.org_email,
        password: formData.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Left branding panel */}
      <div className="hidden w-1/3 flex-col items-center justify-center border-r border-slate-200/60 bg-slate-200/70 p-10 text-center md:flex">
        <div className="inline-flex items-center justify-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ERP Core
          </span>
        </div>

        <h2 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
          Sign in to your organization account to manage products, inventory,
          customers, suppliers, purchases, and sales.
        </p>

        <div className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200/70 bg-white/60 px-3 py-2 text-xs font-medium text-slate-600">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          Secure organization-centric access
        </div>

        <p className="mt-12 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          ERP Core v0.0.1
        </p>
      </div>

      {/* Right login form */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mx-auto mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                ERP Core
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your organization credentials below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert tone="error">{error}</Alert>}

            <div className="space-y-1.5">
              <label
                htmlFor="org_email"
                className="block text-xs font-medium text-slate-700"
              >
                Organization Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="org_email"
                  name="org_email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.org_email}
                  onChange={handleChange}
                  placeholder="org@example.com"
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border-0 p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-0"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            <p className="text-center text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <a
                href="#"
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Contact administrator
              </a>
            </p>
          </form>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-center text-xs leading-relaxed text-slate-500">
              ERP Core is built for small-scale businesses with organization-centric
              data isolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
