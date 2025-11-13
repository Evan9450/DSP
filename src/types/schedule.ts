export type ScheduleStatus = 'pending' | 'confirmed' | 'completed';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  status: 'available' | 'in-use' | 'maintenance';
}

export interface Driver {
  id: string;
  name: string;
  amazonId: string;
  phone?: string;
}

export interface Schedule {
  id: string;
  driverId: string;
  driverName: string;
  amazonId: string;
  vehicleId?: string;
  vehicleNumber?: string;
  status: ScheduleStatus;
  startTime: Date;
  endTime: Date;
  isNew?: boolean;
  isModified?: boolean;
}

export interface SMSHistory {
  id: string;
  scheduleId: string;
  recipient: string;
  message: string;
  sentAt: Date;
  deliveryStatus: 'sent' | 'delivered' | 'failed';
}

export interface DeputySync {
  lastSyncTime: Date | null;
  isSyncing: boolean;
}
