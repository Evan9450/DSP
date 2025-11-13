import { Vehicle, Driver, Schedule, SMSHistory } from '@/types/schedule';

export const mockVehicles: Vehicle[] = [
  { id: 'v1', vehicleNumber: 'VAN-001', status: 'available' },
  { id: 'v2', vehicleNumber: 'VAN-002', status: 'available' },
  { id: 'v3', vehicleNumber: 'VAN-003', status: 'in-use' },
  { id: 'v4', vehicleNumber: 'VAN-004', status: 'available' },
  { id: 'v5', vehicleNumber: 'VAN-005', status: 'maintenance' },
  { id: 'v6', vehicleNumber: 'VAN-006', status: 'available' },
];

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'John Smith', amazonId: 'AMZ-1001', phone: '+1234567890' },
  { id: 'd2', name: 'Maria Garcia', amazonId: 'AMZ-1002', phone: '+1234567891' },
  { id: 'd3', name: 'David Chen', amazonId: 'AMZ-1003', phone: '+1234567892' },
  { id: 'd4', name: 'Sarah Johnson', amazonId: 'AMZ-1004', phone: '+1234567893' },
  { id: 'd5', name: 'Michael Brown', amazonId: 'AMZ-1005', phone: '+1234567894' },
];

export const mockSchedules: Schedule[] = [
  {
    id: 's1',
    driverId: 'd1',
    driverName: 'John Smith',
    amazonId: 'AMZ-1001',
    vehicleId: 'v1',
    vehicleNumber: 'VAN-001',
    status: 'confirmed',
    startTime: new Date(2024, 0, 15, 8, 0),
    endTime: new Date(2024, 0, 15, 16, 0),
  },
  {
    id: 's2',
    driverId: 'd2',
    driverName: 'Maria Garcia',
    amazonId: 'AMZ-1002',
    vehicleId: 'v2',
    vehicleNumber: 'VAN-002',
    status: 'pending',
    startTime: new Date(2024, 0, 15, 9, 0),
    endTime: new Date(2024, 0, 15, 17, 0),
  },
  {
    id: 's3',
    driverId: 'd3',
    driverName: 'David Chen',
    amazonId: 'AMZ-1003',
    vehicleId: 'v4',
    vehicleNumber: 'VAN-004',
    status: 'completed',
    startTime: new Date(2024, 0, 14, 8, 0),
    endTime: new Date(2024, 0, 14, 16, 0),
  },
  {
    id: 's4',
    driverId: 'd4',
    driverName: 'Sarah Johnson',
    amazonId: 'AMZ-1004',
    status: 'pending',
    startTime: new Date(2024, 0, 16, 8, 0),
    endTime: new Date(2024, 0, 16, 16, 0),
  },
];

export const mockSMSHistory: SMSHistory[] = [
  {
    id: 'sms1',
    scheduleId: 's1',
    recipient: '+1234567890',
    message: 'Your shift on Jan 15 from 8:00 AM to 4:00 PM has been confirmed. Vehicle: VAN-001',
    sentAt: new Date(2024, 0, 14, 10, 0),
    deliveryStatus: 'delivered',
  },
  {
    id: 'sms2',
    scheduleId: 's2',
    recipient: '+1234567891',
    message: 'Your shift on Jan 15 from 9:00 AM to 5:00 PM is pending confirmation.',
    sentAt: new Date(2024, 0, 14, 11, 0),
    deliveryStatus: 'delivered',
  },
];
