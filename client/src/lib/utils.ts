import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CONFIRMED: 'Confirmado',
    CANCELED: 'Cancelado',
    COMPLETED: 'Concluído',
  };
  return labels[status] || status;
}

export function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    CONFIRMED: 'status-confirmed',
    CANCELED: 'status-canceled',
    COMPLETED: 'status-completed',
  };
  return classes[status] || '';
}
