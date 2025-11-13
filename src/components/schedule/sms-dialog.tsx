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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Schedule } from '@/types/schedule';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

interface SMSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  onSend: (scheduleId: string, message: string) => void;
}

export function SMSDialog({ open, onOpenChange, schedule, onSend }: SMSDialogProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const generateDefaultMessage = () => {
    if (!schedule) return '';
    const dateStr = format(schedule.startTime, 'MMM dd');
    const startTime = format(schedule.startTime, 'h:mm a');
    const endTime = format(schedule.endTime, 'h:mm a');
    const vehicleInfo = schedule.vehicleNumber ? ` Vehicle: ${schedule.vehicleNumber}` : '';
    return `Hi ${schedule.driverName}, your shift on ${dateStr} from ${startTime} to ${endTime} has been scheduled.${vehicleInfo}`;
  };

  const handleSend = async () => {
    if (schedule && message.trim()) {
      setIsSending(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      onSend(schedule.id, message);
      setIsSending(false);
      setMessage('');
      onOpenChange(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && schedule) {
      setMessage(generateDefaultMessage());
    }
    onOpenChange(isOpen);
  };

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[550px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-700" />
            Send SMS Notification
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Send a text message to {schedule.driverName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-semibold text-gray-900">{schedule.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amazon ID:</span>
                <span className="font-mono text-gray-900">{schedule.amazonId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shift:</span>
                <span className="text-gray-900">
                  {format(schedule.startTime, 'MMM dd, h:mm a')} -{' '}
                  {format(schedule.endTime, 'h:mm a')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px] resize-none"
              maxLength={160}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>SMS will be sent to driver's registered phone number</span>
              <span>{message.length}/160</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send SMS'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
