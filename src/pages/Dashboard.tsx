import type { ComponentType, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  CreditCard,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  bgClass: string;
}

const statCards: StatCard[] = [
  { label: 'Total Products', value: 0, icon: Box, bgClass: 'bg-indigo-50 text-indigo-600' },
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

export default function Dashboard() {
  const navigate = useNavigate();

  const handleQuickAction = (href: string) => {
    navigate(href);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your organization today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  <div className="mt-1 flex items-center text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{card.label}</span>
                    <span className="ml-1">record(s)</span>
                  </div>
                </div>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgClass}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions block */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-indigo-600" />
            Quick actions
          </h2>
          <p className="text-xs text-slate-400">Jump to a module</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.href)}
              className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 text-sm text-slate-700 bg-slate-50 rounded-lg border border-transparent hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-colors"
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
  );
}
