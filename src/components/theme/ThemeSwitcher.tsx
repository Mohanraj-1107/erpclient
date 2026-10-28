import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Palette } from 'lucide-react';
import { THEMES, getTheme } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { useTheme } from './useTheme';

interface ThemeSwitcherProps {
  variant?: 'navbar' | 'page';
  className?: string;
}

export function ThemeSwitcher({
  variant = 'navbar',
  className,
}: ThemeSwitcherProps) {
  const { theme: activeTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = getTheme(activeTheme);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Change theme. Current theme: ${current.name}`}
        title={`Theme: ${current.name}`}
        className={cn(
          'flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
          variant === 'navbar'
            ? 'border-theme-topbar-border bg-theme-topbar-hover text-theme-topbar-fg hover:bg-theme-topbar-border focus:ring-theme-topbar-icon'
            : 'border-theme-border bg-theme-surface/90 text-theme-text shadow-xs backdrop-blur-sm hover:bg-theme-surface focus:ring-theme-primary-ring'
        )}
      >
        <Palette className="h-4 w-4 shrink-0" />
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {current.shortName}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-150',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Application theme"
          className="animate-dropdown-in absolute right-0 z-50 mt-2 w-72 rounded-xl border border-theme-border bg-theme-surface p-1.5 shadow-lg shadow-black/10"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-theme-text-subtle">
            Appearance
          </p>

          {THEMES.map((theme) => {
            const isSelected = theme.id === activeTheme;
            const { navBg, primary, page, secondary } = theme.palette;

            return (
              <button
                key={theme.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setTheme(theme.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-ring focus-visible:ring-offset-1',
                  isSelected
                    ? 'bg-theme-secondary'
                    : 'hover:bg-theme-surface-hover focus:bg-theme-surface-hover'
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-14 shrink-0 items-center gap-0.5 overflow-hidden rounded-md p-0.5"
                >
                  <span
                    className="h-full w-3 rounded-[3px]"
                    style={{
                      backgroundColor: navBg,
                      boxShadow: 'inset 0 0 0 1px rgb(15 23 42 / 0.10)',
                    }}
                  />
                  <span
                    className="h-full flex-1 rounded-[3px]"
                    style={{ backgroundColor: primary }}
                  />
                  <span
                    className="h-full w-2 rounded-[3px]"
                    style={{
                      backgroundColor: page,
                      boxShadow: 'inset 0 0 0 1px rgb(15 23 42 / 0.10)',
                    }}
                  />
                  <span
                    className="h-full w-1.5 rounded-[3px]"
                    style={{ backgroundColor: secondary }}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-theme-text">
                    {theme.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-theme-text-subtle">
                    {theme.isDefault ? 'Existing default theme' : 'Application theme'}
                  </span>
                </span>

                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-theme-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
