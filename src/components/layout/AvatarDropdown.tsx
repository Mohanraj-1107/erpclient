import { useState } from 'react';
import { Building2, ChevronDown, LogOut, Mail } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { Skeleton } from '@/components/ui/skeleton';

export function AvatarDropdown({ onSignout }: { onSignout: () => void }) {
  const [open, setOpen] = useState(false);
  const { organization, isLoading } = useOrganization();

  const orgEmail = organization?.org_email?.trim() ?? '';
  const initial = orgEmail.charAt(0).toUpperCase();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg px-2 py-2 text-theme-topbar-muted transition-colors hover:bg-theme-topbar-hover focus:outline-none"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        title={orgEmail || 'Account menu'}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-primary text-xs font-semibold text-theme-primary-fg shadow-sm ring-1 ring-theme-topbar ring-offset-1 ring-offset-theme-primary">
          {orgEmail ? initial : <Building2 className="h-4 w-4" />}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-theme-topbar-subtle" />
      </button>

      {open && (
        <div className="animate-in fade-in zoom-in absolute right-0 z-50 mt-2 w-72 rounded-xl border border-theme-border bg-theme-surface p-1.5 shadow-lg shadow-theme-overlay duration-150">
          <div className="grid grid-cols-[14px_minmax(0,1fr)] items-center gap-2 rounded-lg bg-theme-surface-hover px-3 py-2.5 ring-1 ring-theme-border">
            <Mail className="h-3.5 w-3.5 text-theme-text-muted" />
            {isLoading ? (
              <Skeleton className="h-3 w-40" />
            ) : (
              <p
                className="min-w-0 truncate text-xs font-medium text-theme-text"
                title={orgEmail}
              >
                {orgEmail || '—'}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              onSignout();
            }}
            className="mt-1 grid w-full grid-cols-[14px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-theme-text-muted transition-colors hover:bg-theme-surface-hover hover:text-theme-text"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="truncate">Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
