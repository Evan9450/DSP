'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockSMSHistory } from '@/lib/mock-data';
import { SMSHistory } from '@/types/schedule';
import { MessageSquare, Send, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MessagesPage() {
  const [messages] = useState<SMSHistory[]>(mockSMSHistory);

  const statusConfig = {
    sent: { label: 'Sent', icon: Send, className: 'bg-blue-600' },
    delivered: { label: 'Delivered', icon: CheckCircle2, className: 'bg-green-600' },
    failed: { label: 'Failed', icon: XCircle, className: 'bg-red-600' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Message History</h1>
          <p className="text-gray-600 mt-1">View all SMS notifications sent to drivers</p>
        </div>

        <div className="mb-6">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send New Message
          </Button>
        </div>

        <div className="space-y-4">
          {messages.map((message) => {
            const statusInfo = statusConfig[message.deliveryStatus];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={message.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-orange-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">To: {message.recipient}</h3>
                        <Badge className={`${statusInfo.className} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(message.sentAt, 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{message.message}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    View Schedule
                  </Button>
                  {message.deliveryStatus === 'failed' && (
                    <Button variant="outline" size="sm" className="text-orange-700 border-orange-300">
                      Resend
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
