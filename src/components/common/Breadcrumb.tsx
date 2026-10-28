import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Breadcrumb({ items, icon, action, className }: BreadcrumbProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-200/70 px-4 py-3 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-theme-primary text-theme-primary-fg shadow-sm shadow-theme-primary-soft">
            {icon}
          </div>
        )}
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li
                  key={`${item.label}-${index}`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  {item.to && !isLast ? (
                    <Link
                      to={item.to}
                      className="truncate rounded-md px-1 py-0.5 font-medium text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? 'page' : undefined}
                      className={cn(
                        'truncate px-1 py-0.5',
                        isLast
                          ? 'font-semibold text-slate-900'
                          : 'font-medium text-slate-500'
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-slate-300"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
