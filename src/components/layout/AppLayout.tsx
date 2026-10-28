import { useState, type ComponentType, type SVGProps } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import api from '@/api/axiosInstance';
import { clearStoredOrgId } from '@/lib/authStorage';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { AvatarDropdown } from './AvatarDropdown';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
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

function resolveActiveKey(pathname: string): string {
  const match = navItems.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(item.href + '/') ||
      (item.href === '/dashboard' && pathname === '/dashboard')
  );
  return match?.key ?? '';
}

function resolveTitle(pathname: string): { label: string; Icon: NavItem['icon'] } {
  const active = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );
  if (active) return { label: active.label, Icon: active.icon };
  return { label: 'ERP Core', Icon: Building2 };
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeKey = resolveActiveKey(location.pathname);
  const { label: titleLabel, Icon: TitleIcon } = resolveTitle(location.pathname);

  const handleSignout = async () => {
    try {
      await api.post('/v1/logout');
    } catch {
      // Ignore logout errors; the local session is cleared below.
    } finally {
      queryClient.clear();
      clearStoredOrgId();
      navigate('/login', { replace: true });
    }
  };

  const handleNavClick = (href: string) => {
    navigate(href);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-theme-page font-sans text-theme-text">
      {/* ========== Left Sidebar ========== */}
      <aside
        className={`hidden lg:flex flex-col border-r border-theme-nav-border bg-theme-nav transition-all duration-200 select-none z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="flex h-16 items-center justify-between border-b border-theme-nav-border-subtle px-4 shrink-0">
            <div className="flex items-center space-x-3 min-w-0 shrink-0">
              <div className="w-9 h-9 bg-theme-primary flex items-center justify-center rounded-lg text-theme-primary-fg shadow-xs shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-[80px] max-w-[200px] truncate">
                  <span className="block truncate text-sm font-bold text-theme-nav-fg leading-tight">
                    ERP Core
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex h-7 w-7 p-0 items-center justify-center rounded-md text-theme-nav-subtle hover:bg-theme-nav-hover/80 hover:text-theme-nav-control-hover-fg transition-colors border-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronLeft className="h-4 w-4 shrink-0" />
              )}
            </button>
          </div>

          {/* Nav section */}
          <nav className="w-full space-y-1 px-3 py-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.href)}
                  className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-theme-nav-active-bg text-theme-nav-active-fg font-semibold shadow-2xs'
                      : 'text-theme-nav-item-fg hover:bg-theme-nav-hover/80 hover:text-theme-nav-item-hover-fg'
                  } ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}
                  title={item.label}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <item.icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-theme-nav-active-icon'
                          : 'text-theme-nav-icon group-hover:text-theme-nav-icon-hover'
                      }`}
                    />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 pb-8 px-6 border-t border-theme-nav-border-subtle">
            {!isSidebarCollapsed ? (
              <>
                <p className="text-xs text-theme-nav-muted font-medium uppercase tracking-wider">ERP Core v0.0.1</p>
                <p className="text-xs text-theme-nav-subtle mt-0.5">Organization-centric ERP</p>
              </>
            ) : (
              <div className="flex justify-center text-[10px] font-mono text-theme-nav-subtle">EC</div>
            )}
          </div>
        </div>
      </aside>

      {/* ========== Right Content ========== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-theme-topbar-border/80 bg-theme-topbar px-4 md:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <TitleIcon className="w-5 h-5 text-theme-topbar-icon" />
            <span className="text-base font-bold text-theme-topbar-fg tracking-tight">{titleLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <AvatarDropdown onSignout={handleSignout} />
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-theme-page/70 p-4 lg:p-6 xl:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
