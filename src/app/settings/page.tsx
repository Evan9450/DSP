'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage system preferences and configurations</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-gray-900">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Send SMS to drivers for schedule updates</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-gray-900">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email notifications to administrators</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-gray-900">Deputy Sync Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when Deputy sync completes</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="h-5 w-5 text-orange-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Deputy Integration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter Deputy API key"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="sync-interval">Auto Sync Interval (minutes)</Label>
                <Input
                  id="sync-interval"
                  type="number"
                  defaultValue="30"
                  className="mt-2"
                />
              </div>

              <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                Save Integration Settings
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-gray-900">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-gray-900">Session Timeout</Label>
                  <p className="text-sm text-gray-500">Auto logout after 30 minutes of inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
