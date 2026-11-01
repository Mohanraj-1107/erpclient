import { cn } from '@/lib/utils';

export interface OrderFilterTab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface OrderFilterTabsProps<T extends string> {
  tabs: OrderFilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function OrderFilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
}: OrderFilterTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex items-center gap-1 overflow-x-auto px-3"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              // `focus:ring-0` cancels the app-wide button focus ring, which
              // otherwise outlines the whole tab on a mouse click.
              'relative shrink-0 rounded-none border-0 px-3 py-2.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0',
              active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ring-1 transition-colors duration-200',
                  active
                    ? 'bg-indigo-50 text-indigo-600 ring-indigo-100'
                    : 'bg-slate-50 text-slate-500 ring-slate-200'
                )}
              >
                {tab.count}
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-x-2 bottom-0 h-0.5 origin-left rounded-full bg-indigo-500 transition-transform duration-200 ease-out',
                active ? 'scale-x-100' : 'scale-x-0'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
