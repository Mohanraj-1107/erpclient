import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function AvatarDropdown({ onSignout }: { onSignout: () => void }) {
  const [open, setOpen] = useState(false);

  // Placeholder org info — wire this to useAuth once implemented.
  const orgName = 'Acme Corp';
  const orgEmail = 'org@example.com';
  const initial = orgName.charAt(0).toUpperCase();

  const itemClass =
    'w-full flex items-center justify-start gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors';

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none"
        aria-label="Organization account"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm ring-1 ring-white ring-offset-1 ring-offset-indigo-600">
          {initial}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="animate-in fade-in zoom-in absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 duration-150">
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
