import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

interface ApiErrorBody {
  errorMessage?: string;
  message?: string;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const error = err as AxiosError<ApiErrorBody>;
  return (
    error?.response?.data?.errorMessage ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}
