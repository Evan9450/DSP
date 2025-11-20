'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Bell, Shield, Database, Clock, FileText, Wrench, Package, Save } from 'lucide-react';
import { mockSystemSettings } from '@/lib/mock-data';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
	const { toast } = useToast();
	const [settings, setSettings] = useState(mockSystemSettings);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		await new Promise(resolve => setTimeout(resolve, 1000));
		toast({
			title: 'Settings Saved',
			description: 'System settings have been updated successfully',
		});
		setIsSaving(false);
	};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
					<div>
          	<h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          	<p className="text-gray-600 mt-1">Configure global system parameters and preferences</p>
					</div>
					<Button
						onClick={handleSave}
						disabled={isSaving}
						className="bg-blue-600 hover:bg-blue-700"
					>
						<Save className="h-4 w-4 mr-2" />
						{isSaving ? 'Saving...' : 'Save All Changes'}
					</Button>
        </div>

        <div className="space-y-6">
					{/* Admin Contact & Notifications */}
					<Card className="p-6 bg-white">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Bell className="h-5 w-5 text-blue-700" />
							</div>
							<h2 className="text-xl font-bold text-gray-900">Admin Notifications</h2>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="adminPhone">Admin Notification Phone</Label>
									<Input
										id="adminPhone"
										type="tel"
										value={settings.adminNotificationPhone}
										onChange={(e) => setSettings({ ...settings, adminNotificationPhone: e.target.value })}
										placeholder="+61400000000"
										className="mt-2"
									/>
									<p className="text-xs text-gray-500 mt-1">Receive SMS alerts for critical issues</p>
								</div>
							</div>

							<div className="flex items-center justify-between pt-2">
								<div>
									<Label className="text-base font-medium text-gray-900">Low Stock Notifications</Label>
									<p className="text-sm text-gray-500">Send SMS when inventory falls below threshold</p>
								</div>
								<Switch
									checked={settings.lowStockNotificationEnabled}
									onCheckedChange={(checked) => setSettings({ ...settings, lowStockNotificationEnabled: checked })}
								/>
							</div>
						</div>
					</Card>

					{/* Reminder Settings */}
					<Card className="p-6 bg-white">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-orange-100 rounded-lg">
								<Clock className="h-5 w-5 text-orange-700" />
							</div>
							<h2 className="text-xl font-bold text-gray-900">Reminder Settings</h2>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="documentExpiryDays">Document Expiry Reminder (Days Before)</Label>
									<Select
										value={settings.documentExpiryReminderDays.toString()}
										onValueChange={(value) => setSettings({ ...settings, documentExpiryReminderDays: parseInt(value) })}
									>
										<SelectTrigger className="mt-2">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="10">10 days</SelectItem>
											<SelectItem value="15">15 days</SelectItem>
											<SelectItem value="30">30 days</SelectItem>
											<SelectItem value="60">60 days</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-xs text-gray-500 mt-1">Remind drivers before license/visa expiry</p>
								</div>

								<div>
									<Label htmlFor="maintenanceReminderDays">Vehicle Maintenance Reminder (Days Before)</Label>
									<Input
										id="maintenanceReminderDays"
										type="number"
										min="1"
										max="30"
										value={settings.maintenanceReminderDays}
										onChange={(e) => setSettings({ ...settings, maintenanceReminderDays: parseInt(e.target.value) || 7 })}
										className="mt-2"
									/>
									<p className="text-xs text-gray-500 mt-1">Alert before scheduled maintenance</p>
								</div>
							</div>

							<div>
								<Label htmlFor="smsTime">Driver Confirmation SMS Time</Label>
								<Input
									id="smsTime"
									type="time"
									value={settings.driverConfirmationSMSTime}
									onChange={(e) => setSettings({ ...settings, driverConfirmationSMSTime: e.target.value })}
									className="mt-2 max-w-xs"
								/>
								<p className="text-xs text-gray-500 mt-1">Daily schedule reminder time (e.g., 08:00 for 8 AM)</p>
							</div>
						</div>
					</Card>

					{/* SMS/Email Templates */}
					<Card className="p-6 bg-white">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-green-100 rounded-lg">
								<FileText className="h-5 w-5 text-green-700" />
							</div>
							<h2 className="text-xl font-bold text-gray-900">Message Templates</h2>
						</div>

						<div className="space-y-4">
							<div>
								<Label htmlFor="scheduleTemplate">Schedule Reminder Template</Label>
								<Textarea
									id="scheduleTemplate"
									value={settings.scheduleReminderTemplate}
									onChange={(e) => setSettings({ ...settings, scheduleReminderTemplate: e.target.value })}
									rows={3}
									className="mt-2 font-mono text-sm"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Variables: {'{driverName}'}, {'{date}'}, {'{startTime}'}, {'{endTime}'}, {'{vehicleNumber}'}
								</p>
							</div>

							<div>
								<Label htmlFor="vehicleAssignmentTemplate">Vehicle Assignment Template</Label>
								<Textarea
									id="vehicleAssignmentTemplate"
									value={settings.vehicleAssignmentTemplate}
									onChange={(e) => setSettings({ ...settings, vehicleAssignmentTemplate: e.target.value })}
									rows={2}
									className="mt-2 font-mono text-sm"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Variables: {'{vehicleNumber}'}, {'{date}'}
								</p>
							</div>

							<div>
								<Label htmlFor="documentExpiryTemplate">Document Expiry Template</Label>
								<Textarea
									id="documentExpiryTemplate"
									value={settings.documentExpiryTemplate}
									onChange={(e) => setSettings({ ...settings, documentExpiryTemplate: e.target.value })}
									rows={2}
									className="mt-2 font-mono text-sm"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Variables: {'{documentType}'}, {'{expiryDate}'}
								</p>
							</div>
						</div>
					</Card>

					{/* Deputy Integration */}
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-5 w-5 text-purple-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Deputy Integration</h2>
            </div>

            <div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-base font-medium text-gray-900">Enable Deputy Sync</Label>
									<p className="text-sm text-gray-500">Automatically sync drivers and schedules</p>
								</div>
								<Switch
									checked={settings.deputySyncEnabled}
									onCheckedChange={(checked) => setSettings({ ...settings, deputySyncEnabled: checked })}
								/>
							</div>

              <div>
                <Label htmlFor="api-key">Deputy API Key</Label>
                <Input
                  id="api-key"
                  type="password"
									value={settings.deputyAPIKey || ''}
									onChange={(e) => setSettings({ ...settings, deputyAPIKey: e.target.value })}
                  placeholder="Enter Deputy API key"
                  className="mt-2"
									disabled={!settings.deputySyncEnabled}
                />
								<p className="text-xs text-gray-500 mt-1">API key for Deputy integration</p>
              </div>

              <div>
                <Label htmlFor="sync-interval">Auto Sync Interval (Hours)</Label>
                <Select
									value={settings.deputySyncIntervalHours?.toString() || '2'}
									onValueChange={(value) => setSettings({ ...settings, deputySyncIntervalHours: parseInt(value) })}
									disabled={!settings.deputySyncEnabled}
								>
									<SelectTrigger className="mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">Every hour</SelectItem>
										<SelectItem value="2">Every 2 hours</SelectItem>
										<SelectItem value="4">Every 4 hours</SelectItem>
										<SelectItem value="6">Every 6 hours</SelectItem>
										<SelectItem value="12">Every 12 hours</SelectItem>
										<SelectItem value="24">Every 24 hours</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs text-gray-500 mt-1">How often to sync with Deputy</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
