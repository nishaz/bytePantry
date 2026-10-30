import type { ExpiryStatus } from '../types/fridge';

export function getExpiryStatus(daysUntilExpiry: number): ExpiryStatus {
  if (daysUntilExpiry <= 0) return 'old';
  if (daysUntilExpiry <= 2) return 'soon';
  return 'fresh';
}

export function getExpiryLabel(daysUntilExpiry: number): string {
  if (daysUntilExpiry <= 0) return 'Expired';
  if (daysUntilExpiry === 1) return '1 day left';
  return `${daysUntilExpiry} days left`;
}

export function getExpiryColor(status: ExpiryStatus): string {
  switch (status) {
    case 'fresh':
      return '#7FA46B';
    case 'soon':
      return '#C79637';
    case 'old':
      return '#C1626A';
  }
}
