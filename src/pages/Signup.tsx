import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import type { Organization } from '@/types/organization';
import { orgApi } from '@/api/org';
import { refreshSession } from '@/api/axiosInstance';
import { getStoredOrgId, setStoredOrgId, clearStoredOrgId } from '@/lib/authStorage';
import { getApiErrorMessage } from '@/lib/utils';
import { Alert } from '@/components/common/Alert';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface SignupFormData {
  org_name: string;
  org_email: string;
  mobile_no: string;
  password: string;
  confirm_password: string;
  address_street: string;
  address_city: string;
  address_district: string;
  address_pincode: string;
  address_state: string;
  address_country: string;
}

type Step = 1 | 2;

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const submittedRef = useRef(false);
  const [formData, setFormData] = useState<SignupFormData>({
    org_name: '',
    org_email: '',
    mobile_no: '',
    password: '',
    confirm_password: '',
    address_street: '',
    address_city: '',
    address_district: '',
    address_pincode: '',
    address_state: '',
    address_country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(getStoredOrgId() !== null);

  useEffect(() => {
    if (!checkingSession) return;

    void refreshSession()
      .then((orgId) => {
        if (orgId != null) {
          navigate('/dashboard', { replace: true });
        } else {
          clearStoredOrgId();
          setCheckingSession(false);
        }
      })
      .catch(() => {
        clearStoredOrgId();
        setCheckingSession(false);
      });
  }, [checkingSession, navigate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setError('');
    setSuccess('');
  };

  const goToStep2 = () => {
    setError('');
    setSuccess('');

    if (!formData.org_name || !formData.org_email || !formData.mobile_no) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.password || !formData.confirm_password) {
      setError('Please set a password and confirm it.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Prevent double submission after a successful org creation
    if (submittedRef.current) return;

    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.address_street || !formData.address_city || !formData.address_district) {
      setError('Please fill in all required address fields.');
      setLoading(false);
      return;
    }

    try {
      const data: Organization = await orgApi.create({
        orgName: formData.org_name,
        orgEmail: formData.org_email,
        orgPassword: formData.password,
        mobileNo: formData.mobile_no,
        address: [
          {
            street: formData.address_street,
            city: formData.address_city,
            district: formData.address_district,
            pincode: formData.address_pincode,
            state: formData.address_state,
            country: formData.address_country,
          },
        ],
      });

      if (!data || (data as unknown as { orgId?: number }).orgId == null) {
        throw new Error('Signup failed. Please try again.');
      }

      submittedRef.current = true;
      const orgId = (data as unknown as { orgId: number }).orgId;
      setStoredOrgId(orgId);
      navigate('/dashboard', { replace: true });
      return;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-theme-page font-sans">
      <div className="absolute right-4 top-4 z-30">
        <ThemeSwitcher variant="page" />
      </div>

      {/* Left branding panel */}
      <div className="hidden w-1/3 flex-col items-center justify-center border-r border-slate-200/60 bg-slate-200/70 p-10 text-center md:flex">
        <div className="inline-flex items-center justify-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-theme-primary text-theme-primary-fg shadow-sm shadow-theme-primary-soft">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ERP Core
          </span>
        </div>

        <h2 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
          Create your organization
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
          Set up your organization account to manage products, inventory,
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

      {/* Right signup form */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        {checkingSession ? (
          <div className="w-full max-w-md mx-auto text-center">
            <Spinner className="h-6 w-6 text-theme-primary" />
            <p className="mt-3 text-sm text-slate-600">Creating your account...</p>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mx-auto mb-10 text-center">
              <div className="mb-4 flex items-center justify-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-theme-primary text-theme-primary-fg shadow-sm shadow-theme-primary-soft">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  ERP Core
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {step === 1 ? 'Organization details' : 'Organization address'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {step === 1 ? 'Tell us about your organization' : 'Where is your organization located?'}
              </p>
            </div>

            {/* Step progress bar */}
            <div className="relative w-full mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-1 z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shadow-sm z-20 ${
                      step === 1
                        ? 'bg-theme-primary text-theme-primary-fg border-2 border-theme-primary-ring'
                        : 'bg-theme-surface text-theme-text-muted border border-theme-border'
                    }`}
                  >
                    1
                  </div>
                  <span className={`text-[10px] font-medium ${
                    step === 1 ? 'text-theme-primary' : 'text-theme-text-muted'
                  }`}>Basic details</span>
                </div>
                <div className="h-0.5 w-full flex-grow self-center z-0">
                  <div
                    className={`h-0.5 w-full ${
                      step === 2 ? 'bg-theme-primary' : 'bg-theme-border'
                    }`}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shadow-sm z-20 ${
                      step === 2
                        ? 'bg-theme-primary text-theme-primary-fg border-2 border-theme-primary-ring'
                        : 'bg-theme-surface text-theme-text-muted border border-theme-border'
                    }`}
                  >
                    2
                  </div>
                  <span className={`text-[10px] font-medium ${
                    step === 2 ? 'text-theme-primary' : 'text-theme-text-muted'
                  }`}>Address</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert tone="error">{error}</Alert>}
              {success && <Alert tone="success">{success}</Alert>}

              {step === 1 ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="org_name"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Organization Name
                      </label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="org_name"
                          name="org_name"
                          type="text"
                          autoComplete="organization"
                          required
                          value={formData.org_name}
                          onChange={handleChange}
                          placeholder="Acme Corporation"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>
                    </div>

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
                        htmlFor="mobile_no"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="mobile_no"
                          name="mobile_no"
                          type="tel"
                          autoComplete="tel"
                          required
                          value={formData.mobile_no}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
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
                          autoComplete="new-password"
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

                    <div className="space-y-1.5">
                      <label
                        htmlFor="confirm_password"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={formData.confirm_password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          disabled={loading}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((visible) => !visible)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border-0 p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-0"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-theme-border flex justify-end">
                    <Button
                      type="button"
                      onClick={goToStep2}
                      disabled={loading}
                      className="gap-2"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Organization Address
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="address_street"
                          className="block text-xs font-medium text-slate-700"
                        >
                          Street
                        </label>
                        <div className="relative">
                          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="address_street"
                            name="address_street"
                            type="text"
                            autoComplete="street-address"
                            required
                            value={formData.address_street}
                            onChange={handleChange}
                            placeholder="123 Main Street"
                            disabled={loading}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="address_city"
                          className="block text-xs font-medium text-slate-700"
                        >
                          City
                        </label>
                        <Input
                          id="address_city"
                          name="address_city"
                          type="text"
                          autoComplete="address-level2"
                          required
                          value={formData.address_city}
                          onChange={handleChange}
                          placeholder="Mumbai"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="address_district"
                          className="block text-xs font-medium text-slate-700"
                        >
                          District
                        </label>
                        <Input
                          id="address_district"
                          name="address_district"
                          type="text"
                          autoComplete="address-level1"
                          required
                          value={formData.address_district}
                          onChange={handleChange}
                          placeholder="Mumbai"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="address_pincode"
                          className="block text-xs font-medium text-slate-700"
                        >
                          Pincode
                        </label>
                        <Input
                          id="address_pincode"
                          name="address_pincode"
                          type="text"
                          autoComplete="postal-code"
                          required
                          value={formData.address_pincode}
                          onChange={handleChange}
                          placeholder="400001"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="address_state"
                          className="block text-xs font-medium text-slate-700"
                        >
                          State
                        </label>
                        <Input
                          id="address_state"
                          name="address_state"
                          type="text"
                          autoComplete="address-level1"
                          required
                          value={formData.address_state}
                          onChange={handleChange}
                          placeholder="Maharashtra"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="address_country"
                          className="block text-xs font-medium text-slate-700"
                        >
                          Country
                        </label>
                        <Input
                          id="address_country"
                          name="address_country"
                          type="text"
                          autoComplete="country"
                          required
                          value={formData.address_country}
                          onChange={handleChange}
                          placeholder="India"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-theme-border flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && success ? (
                <p className="text-center text-xs text-slate-500 mt-4">
                  Account created successfully. Redirecting...
                </p>
              ) : (
                <p className="text-center text-xs text-slate-500 mt-8">
                  Already have an account?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/login', { replace: true });
                    }}
                    className="font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                  >
                    Sign in
                  </a>
                </p>
              )}
            </form>

            <div className="mt-12 border-t border-theme-border pt-8">
              <p className="text-center text-xs leading-relaxed text-slate-500">
                ERP Core is built for small-scale businesses with organization-centric
                data isolation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
