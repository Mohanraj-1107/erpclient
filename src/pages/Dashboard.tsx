import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  Building2,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', href: '/products', icon: Box },
  { key: 'inventory', label: 'Inventory', href: '/inventory', icon: Package },
  { key: 'customers', label: 'Customers', href: '/customers', icon: Users },
  { key: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: Truck },
  { key: 'purchases', label: 'Purchases', href: '/purchases', icon: ShoppingCart },
  { key: 'sales', label: 'Sales', href: '/sales', icon: CreditCard },
];

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgClass: string;
}

const statCards: StatCard[] = [
  { label: 'Total Products', value: 0, icon: Box, bgClass: 'bg-blue-50 text-blue-600' },
  { label: 'Inventory Items', value: 0, icon: Package, bgClass: 'bg-emerald-50 text-emerald-600' },
  { label: 'Customers', value: 0, icon: Users, bgClass: 'bg-indigo-50 text-indigo-600' },
  { label: 'Suppliers', value: 0, icon: Truck, bgClass: 'bg-amber-50 text-amber-600' },
  { label: 'Pending Purchases', value: 0, icon: ShoppingCart, bgClass: 'bg-purple-50 text-purple-600' },
  { label: "Today's Sales", value: '$0.00', icon: CreditCard, bgClass: 'bg-rose-50 text-rose-600' },
];

const quickActions = [
  { label: 'Products', href: '/products', icon: <Box className="w-4 h-4" /> },
  { label: 'Inventory', href: '/inventory', icon: <Package className="w-4 h-4" /> },
  { label: 'Customers', href: '/customers', icon: <Users className="w-4 h-4" /> },
  { label: 'Suppliers', href: '/suppliers', icon: <Truck className="w-4 h-4" /> },
  { label: 'Purchases', href: '/purchases', icon: <ShoppingCart className="w-4 h-4" /> },
  { label: 'Sales', href: '/sales', icon: <CreditCard className="w-4 h-4" /> },
];

// ---- Avatar dropdown (org info + signout) ----
function AvatarDropdown({ onSignout }: { onSignout: () => void }) {
  const [open, setOpen] = useState(false);

  // Placeholder org info — wire this to useAuth once implemented (Phase 2).
  const orgName = 'Acme Corp';
  const orgEmail = 'org@example.com';
  const initial = orgName.charAt(0).toUpperCase();

  const itemClass =
    'w-full flex items-center justify-start gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors';

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
        aria-label="Organization account"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {/* Avatar: org name first letter */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm ring-1 ring-white ring-offset-1 ring-offset-blue-600">
          {initial}
        </div>
        {/* Down arrow embedded beside the avatar */}
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 z-50 animate-in fade-in zoom-in duration-150">
          {/* Uniform list — same font, size, indentation for every option */}
          <div className="py-1">
            <div className={itemClass} title={orgName}>
              {orgName}
            </div>
            <div className={itemClass} title={orgEmail}>
              {orgEmail}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onSignout();
              }}
              className={itemClass}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  const handleSignout = () => {
    navigate('/login', { replace: true });
  };

  const handleNavClick = (href: string, key: string) => {
    setActiveNav(key);
    navigate(href);
  };

  const handleQuickAction = (href: string) => {
    // Module pages are built in the next phase per the development plan.
    navigate(href);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* ========== Left Sidebar (Blue) ========== */}
      <aside className="hidden lg:flex w-64 bg-blue-600 flex-col shrink-0 border-r border-blue-700/40">
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">ERP Core</span>
            </div>
          </div>

          {/* Nav section - hover spans full width */}
          <nav className="w-full space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.href, item.key)}
                  className={`w-full flex items-center justify-start gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100/80 hover:bg-blue-700/40 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 pb-8 px-6 border-t border-blue-700/40">
            <p className="text-xs text-blue-200 font-medium uppercase tracking-wider">ERP Core v0.0.1</p>
            <p className="text-xs text-blue-200/70 mt-0.5">Organization-centric ERP</p>
          </div>
        </div>
      </aside>

      {/* Vertical divider for mobile/tablet when sidebar is hidden */}
      <div className="lg:hidden w-px bg-slate-200 shrink-0 hidden" />

      {/* ========== Right Content (White) ========== */}
      <div className="flex-1 flex flex-col bg-white min-h-0 relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <AvatarDropdown onSignout={handleSignout} />
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 mt-1">
                Welcome back. Here&apos;s what&apos;s happening with your organization today.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bgClass}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions block */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  Quick actions
                </h2>
                <p className="text-xs text-slate-400">Jump to a module</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.href)}
                    className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 text-sm text-slate-700 bg-slate-50 rounded-lg border border-transparent hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-colors"
                  >
                    {action.icon}
                    <span className="font-medium leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-xs text-slate-400 text-center">
                Module pages are built in the next development phase.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
