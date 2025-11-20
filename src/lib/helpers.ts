import { DocumentStatus, VehicleCondition } from '@/types/schedule';
import { differenceInDays, format } from 'date-fns';

/**
 * Calculate document status based on expiry date and reminder days threshold
 */
export function calculateDocumentStatus(
  expiryDate: Date,
  reminderDays: number = 30
): DocumentStatus {
  const today = new Date();
  const daysUntilExpiry = differenceInDays(expiryDate, today);

  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry <= reminderDays) {
    return 'expiring';
  } else {
    return 'valid';
  }
}

/**
 * Get days remaining until expiry
 */
export function getDaysUntilExpiry(expiryDate: Date): number {
  const today = new Date();
  return differenceInDays(expiryDate, today);
}

/**
 * Format expiry date with status text
 */
export function formatExpiryStatus(expiryDate: Date): string {
  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) {
    return `Expired ${Math.abs(days)} days ago`;
  } else if (days === 0) {
    return 'Expires today';
  } else if (days === 1) {
    return 'Expires tomorrow';
  } else if (days <= 30) {
    return `Expires in ${days} days`;
  } else {
    return `Expires ${format(expiryDate, 'MMM d, yyyy')}`;
  }
}

/**
 * Get color class for document status
 */
export function getDocumentStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'valid':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'expiring':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'expired':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

/**
 * Get color class for vehicle condition
 */
export function getVehicleConditionColor(condition: VehicleCondition): string {
  switch (condition) {
    case 'green':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'yellow':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'red':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

/**
 * Get badge color for vehicle condition indicator
 */
export function getVehicleConditionBadge(condition: VehicleCondition): string {
  switch (condition) {
    case 'green':
      return 'bg-green-500';
    case 'yellow':
      return 'bg-yellow-500';
    case 'red':
      return 'bg-red-500';
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Simple formatting - can be enhanced based on region
  if (phone.startsWith('+61')) {
    // Australian number
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+61 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
  }
  return phone;
}

/**
 * Calculate days until maintenance
 */
export function getDaysUntilMaintenance(nextMaintenanceDate?: Date): number {
  if (!nextMaintenanceDate) return -1;
  const today = new Date();
  return differenceInDays(nextMaintenanceDate, today);
}

/**
 * Check if maintenance is overdue
 */
export function isMaintenanceOverdue(nextMaintenanceDate?: Date): boolean {
  if (!nextMaintenanceDate) return false;
  return getDaysUntilMaintenance(nextMaintenanceDate) < 0;
}

/**
 * Check if maintenance is due soon (within reminder days)
 */
export function isMaintenanceDueSoon(
  nextMaintenanceDate?: Date,
  reminderDays: number = 7
): boolean {
  if (!nextMaintenanceDate) return false;
  const days = getDaysUntilMaintenance(nextMaintenanceDate);
  return days >= 0 && days <= reminderDays;
}

/**
 * Format currency (AUD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

/**
 * Generate a simple ID (for demo purposes - use UUID in production)
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if asset is low stock
 */
export function isLowStock(availableQuantity: number, minThreshold: number): boolean {
  return availableQuantity < minThreshold;
}

/**
 * Format date and time for schedules
 */
export function formatScheduleTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatScheduleDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function formatScheduleDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a');
}
