'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { View } from 'react-big-calendar';
import { Schedule, ScheduleStatus, Vehicle } from '@/types/schedule';
import { mockSchedules, mockVehicles } from '@/lib/mock-data';
import { DeputySyncPanel } from '@/components/schedule/deputy-sync-panel';
import { ScheduleDetailsDialog } from '@/components/schedule/schedule-details-dialog';
import { VehicleAssignmentDialog } from '@/components/schedule/vehicle-assignment-dialog';
import { SMSDialog } from '@/components/schedule/sms-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ScheduleCalendar = dynamic(
  () => import('@/components/schedule/schedule-calendar').then((mod) => mod.ScheduleCalendar),
  { ssr: false }
);

export default function ScheduleManagementPage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  
  const [calendarView, setCalendarView] = useState<View>('week');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const newSchedule: Schedule = {
      id: 's' + (schedules.length + 1),
      driverId: 'd5',
      driverName: 'Michael Brown',
      amazonId: 'AMZ-1005',
      status: 'pending',
      startTime: new Date(2024, 0, 17, 8, 0),
      endTime: new Date(2024, 0, 17, 16, 0),
      isNew: true,
    };
    
    setSchedules((prev) => [...prev, newSchedule]);
    setLastSyncTime(new Date());
    setIsSyncing(false);
    
    toast({
      title: 'Sync Successful',
      description: '1 new schedule imported from Deputy',
    });
  };

  const handleSelectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDetailsDialogOpen(true);
  };

  const handleAssignVehicle = (scheduleId: string, vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? { ...s, vehicleId: vehicle.id, vehicleNumber: vehicle.vehicleNumber }
          : s
      )
    );

    toast({
      title: 'Vehicle Assigned',
      description: `${vehicle.vehicleNumber} assigned successfully`,
    });
  };

  const handleSendSMS = (scheduleId: string, message: string) => {
    toast({
      title: 'SMS Sent',
      description: 'Notification sent successfully',
    });
  };

  const handleChangeStatus = (status: ScheduleStatus) => {
    if (!selectedSchedule) return;

    setSchedules((prev) =>
      prev.map((s) => (s.id === selectedSchedule.id ? { ...s, status } : s))
    );

    setSelectedSchedule({ ...selectedSchedule, status });

    toast({
      title: 'Status Updated',
      description: `Schedule status changed to ${status}`,
    });
  };

  const openVehicleDialog = () => {
    setDetailsDialogOpen(false);
    setVehicleDialogOpen(true);
  };

  const openSMSDialog = () => {
    setDetailsDialogOpen(false);
    setSmsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">Manage driver schedules, assign vehicles, and send notifications</p>
        </div>

        <div className="mb-6">
          <DeputySyncPanel
            lastSyncTime={lastSyncTime}
            isSyncing={isSyncing}
            onSync={handleSync}
          />
        </div>

        <div className="mb-6 flex gap-3">
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
        </div>

        <Card className="shadow-lg">
          <ScheduleCalendar
            schedules={schedules}
            onSelectSchedule={handleSelectSchedule}
            view={calendarView}
            onViewChange={setCalendarView}
            date={calendarDate}
            onNavigate={setCalendarDate}
          />
        </Card>

        <Card className="mt-6 p-4 bg-white">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-500"></div>
              <span className="text-sm text-gray-700">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-sm text-gray-700">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-orange-500"></div>
              <span className="text-sm text-gray-700">New/Modified from Deputy</span>
            </div>
          </div>
        </Card>

        <ScheduleDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          schedule={selectedSchedule}
          onAssignVehicle={openVehicleDialog}
          onSendSMS={openSMSDialog}
          onChangeStatus={handleChangeStatus}
        />

        <VehicleAssignmentDialog
          open={vehicleDialogOpen}
          onOpenChange={setVehicleDialogOpen}
          schedule={selectedSchedule}
          vehicles={vehicles}
          onAssign={handleAssignVehicle}
        />

        <SMSDialog
          open={smsDialogOpen}
          onOpenChange={setSmsDialogOpen}
          schedule={selectedSchedule}
          onSend={handleSendSMS}
        />
      </div>
    </div>
  );
}