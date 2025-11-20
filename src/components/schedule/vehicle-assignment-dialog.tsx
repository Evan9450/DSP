'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Schedule, Vehicle } from '@/types/schedule';
import { Car, CheckCircle2, AlertCircle } from 'lucide-react';

interface VehicleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  vehicles: Vehicle[];
  onAssign: (scheduleId: string, vehicleId: string) => void;
}

export function VehicleAssignmentDialog({
  open,
  onOpenChange,
  schedule,
  vehicles,
  onAssign,
}: VehicleAssignmentDialogProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Only show vehicles that are available AND in green condition (per PRD requirements)
  const availableVehicles = vehicles.filter(
    (v) => v.status === 'available' && v.condition === 'green'
  );

  const handleAssign = () => {
    if (schedule && selectedVehicleId) {
      onAssign(schedule.id, selectedVehicleId);
      setSelectedVehicleId('');
      onOpenChange(false);
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Assign Vehicle
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select an available vehicle for {schedule.driverName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Driver:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {schedule.driverName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Amazon ID:</span>
                <span className="text-sm font-mono text-gray-900">{schedule.amazonId}</span>
              </div>
              {schedule.vehicleNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Vehicle:</span>
                  <Badge className="bg-blue-600 text-white">
                    {schedule.vehicleNumber}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Select Vehicle
              <span className="text-xs text-gray-500 ml-2">
                ({availableVehicles.length} ready)
              </span>
            </label>
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a vehicle..." />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <Car className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{vehicle.vehicleNumber}</span>
                      {vehicle.brand && (
                        <span className="text-xs text-gray-500">
                          ({vehicle.brand} {vehicle.model})
                        </span>
                      )}
                      <CheckCircle2 className="h-3 w-3 text-green-600 ml-auto" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableVehicles.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">No vehicles available</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    Only vehicles with green status can be assigned. Check vehicle conditions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedVehicleId}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            Assign Vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
