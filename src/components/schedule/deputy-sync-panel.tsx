'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface DeputySyncPanelProps {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  onSync: () => void;
}

export function DeputySyncPanel({ lastSyncTime, isSyncing, onSync }: DeputySyncPanelProps) {
  return (
    <Card className="p-4 bg-white border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Deputy Sync</h3>
            <p className="text-xs text-gray-500">
              {lastSyncTime
                ? `Last synced: ${format(lastSyncTime, 'MMM dd, yyyy HH:mm')}`
                : 'Never synced'}
            </p>
          </div>
        </div>
        <Button
          onClick={onSync}
          disabled={isSyncing}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>
    </Card>
  );
}
