'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Schedule, ScheduleStatus } from '@/types/schedule';
import { User, Car, Clock, MessageSquare, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  onAssignVehicle: () => void;
  onSendSMS: () => void;
  onChangeStatus: (status: ScheduleStatus) => void;
}

const statusConfig: Record<ScheduleStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-500' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-600' },
  completed: { label: 'Completed', className: 'bg-green-600' },
  cancelled: { label: 'Cancelled', className: 'bg-red-600' },
};

export function ScheduleDetailsDialog({
  open,
  onOpenChange,
  schedule,
  onAssignVehicle,
  onSendSMS,
  onChangeStatus,
}: ScheduleDetailsDialogProps) {
  if (!schedule) return null;

  const statusInfo = statusConfig[schedule.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Schedule Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            View and manage schedule information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Driver Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-700 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{schedule.driverName}</h3>
                <p className="text-sm text-gray-600 font-mono">{schedule.amazonId}</p>
              </div>
              <Badge className={`${statusInfo.className} text-white`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Schedule Time */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-gray-700 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Shift Time</p>
              <p className="text-base font-semibold text-gray-900">
                {format(schedule.startTime, 'EEEE, MMMM dd, yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {format(schedule.startTime, 'h:mm a')} - {format(schedule.endTime, 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Car className="h-5 w-5 text-blue-700 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Assigned Vehicle</p>
              {schedule.vehicleNumber ? (
                <p className="text-base font-semibold text-gray-900">{schedule.vehicleNumber}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No vehicle assigned</p>
              )}
            </div>
            <Button
              onClick={onAssignVehicle}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Edit className="h-3 w-3 mr-1" />
              {schedule.vehicleNumber ? 'Change' : 'Assign'}
            </Button>
          </div>

          {/* Status Management */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Update Status</p>
            <div className="flex gap-2">
              <Button
                onClick={() => onChangeStatus('pending')}
                variant={schedule.status === 'pending' ? 'default' : 'outline'}
                size="sm"
                className={
                  schedule.status === 'pending'
                    ? 'bg-gray-500 hover:bg-gray-600'
                    : 'border-gray-300'
                }
              >
                Pending
              </Button>
              <Button
                onClick={() => onChangeStatus('confirmed')}
                variant={schedule.status === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                className={
                  schedule.status === 'confirmed'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-blue-300 text-blue-700'
                }
              >
                Confirmed
              </Button>
              <Button
                onClick={() => onChangeStatus('completed')}
                variant={schedule.status === 'completed' ? 'default' : 'outline'}
                size="sm"
                className={
                  schedule.status === 'completed'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'border-green-300 text-green-700'
                }
              >
                Completed
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={onSendSMS}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send SMS Notification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
