import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  'aria-invalid'?: boolean;
}

export function Select({
  id,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select an option',
  className,
  'aria-invalid': ariaInvalid,
}: SelectProps) {
  const reactId = useId();
  const baseId = reactId.replace(/:/g, '');
  const buttonId = id ?? `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
    } else {
      openList();
    }
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((index) => Math.max(index - 1, 0));
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          commit(activeIndex);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-invalid={ariaInvalid}
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-normal text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-slate-50',
          open && 'border-transparent ring-2 ring-indigo-500',
          className
        )}
      >
        <span className={cn('truncate', !selected && 'text-slate-400')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150',
            open && 'rotate-180 text-indigo-500'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className="animate-dropdown-in absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-300/40"
        >
          {options.length === 0 ? (
            <li className="px-2.5 py-2 text-sm text-slate-400">No options</li>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(index);
                  }}
                  className={cn(
                    'flex cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700',
                    isSelected && 'bg-indigo-50 font-medium text-indigo-700'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-indigo-600"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
