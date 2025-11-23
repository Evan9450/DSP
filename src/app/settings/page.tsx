'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Settings as SettingsIcon,
	Bell,
	Clock,
	Wrench,
	Save,
	Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { apiClient, SystemConfigUpdate } from '@/lib/api/client';

export default function SettingsPage() {
	const { toast } = useToast();
	const { settings, isLoading, error, refetch } = useSettings();
	const [isSaving, setIsSaving] = useState(false);

	// Form state
	const [formData, setFormData] = useState<SystemConfigUpdate>({
		admin_phone: '',
		driver_file_reminder_days: 15,
		daily_sms_time: '08:00',
		maintenance_booking_reminder_days: 15,
		next_maintenance_reminder_days: 15,
	});

	// Update form data when settings load
	useEffect(() => {
		if (settings) {
			setFormData({
				admin_phone: settings.admin_phone || '',
				driver_file_reminder_days: settings.driver_file_reminder_days || 15,
				daily_sms_time: settings.daily_sms_time || '08:00',
				maintenance_booking_reminder_days:
					settings.maintenance_booking_reminder_days || 15,
				next_maintenance_reminder_days:
					settings.next_maintenance_reminder_days || 15,
			});
		}
	}, [settings]);

	const handleSave = async () => {
		try {
			setIsSaving(true);

			// Check if settings exist (has any field set)
			const settingsExist =
				settings &&
				(settings.admin_phone ||
					settings.driver_file_reminder_days ||
					settings.daily_sms_time ||
					settings.maintenance_booking_reminder_days ||
					settings.next_maintenance_reminder_days);

			if (settingsExist) {
				// Update existing settings
				await apiClient.updateSystemConfig(formData);
				toast({
					title: 'Settings Updated',
					description: 'System configuration has been updated successfully',
				});
			} else {
				// Create new settings
				await apiClient.createSystemConfig(formData);
				toast({
					title: 'Settings Created',
					description: 'System configuration has been created successfully',
				});
			}

			refetch();
		} catch (err: any) {
			toast({
				title: 'Error',
				description:
					err.response?.data?.detail || 'Failed to save settings. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
					<div className='flex items-center justify-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
						<p className='ml-4 text-gray-600'>Loading settings...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
					<div className='text-center py-12'>
						<p className='text-red-600'>Failed to load settings</p>
						<p className='text-sm text-gray-500 mt-2'>{error.message}</p>
						<Button onClick={() => refetch()} className='mt-4'>
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>System Settings</h1>
						<p className='text-gray-600 mt-1'>
							Configure global system parameters and preferences
						</p>
					</div>
					<Button
						onClick={handleSave}
						disabled={isSaving}
						className='bg-blue-600 hover:bg-blue-700'>
						{isSaving ? (
							<>
								<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								Saving...
							</>
						) : (
							<>
								<Save className='h-4 w-4 mr-2' />
								Save All Changes
							</>
						)}
					</Button>
				</div>

				<div className='space-y-6'>
					{/* Admin Contact Information */}
					<Card className='p-6 bg-white'>
						<div className='flex items-center gap-3 mb-6'>
							<div className='p-2 bg-blue-100 rounded-lg'>
								<Bell className='h-5 w-5 text-blue-700' />
							</div>
							<div>
								<h2 className='text-xl font-bold text-gray-900'>
									Admin Contact
								</h2>
								<p className='text-sm text-gray-500'>
									管理员联系信息和提醒设置
								</p>
							</div>
						</div>

						<div className='space-y-4'>
							<div>
								<Label htmlFor='adminPhone'>
									Admin Notification Phone{' '}
									<span className='text-gray-500 font-normal'>
										(管理员提醒电话)
									</span>
								</Label>
								<Input
									id='adminPhone'
									type='tel'
									value={formData.admin_phone}
									onChange={(e) =>
										setFormData({ ...formData, admin_phone: e.target.value })
									}
									placeholder='+61400000000'
									className='mt-2'
								/>
								<p className='text-xs text-gray-500 mt-1'>
									Phone number to receive system notifications and alerts
								</p>
							</div>
						</div>
					</Card>

					{/* Driver & Document Reminders */}
					<Card className='p-6 bg-white'>
						<div className='flex items-center gap-3 mb-6'>
							<div className='p-2 bg-orange-100 rounded-lg'>
								<Clock className='h-5 w-5 text-orange-700' />
							</div>
							<div>
								<h2 className='text-xl font-bold text-gray-900'>
									Driver & Document Reminders
								</h2>
								<p className='text-sm text-gray-500'>
									司机文件和每日确认提醒设置
								</p>
							</div>
						</div>

						<div className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{/* Driver File Reminder */}
								<div>
									<Label htmlFor='driverFileReminderDays'>
										Driver File Reminder{' '}
										<span className='text-gray-500 font-normal'>
											(司机文件临期提醒)
										</span>
									</Label>
									<Select
										value={formData.driver_file_reminder_days?.toString()}
										onValueChange={(value) =>
											setFormData({
												...formData,
												driver_file_reminder_days: parseInt(value),
											})
										}>
										<SelectTrigger className='mt-2'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='10'>10 days before expiry</SelectItem>
											<SelectItem value='15'>15 days before expiry</SelectItem>
											<SelectItem value='30'>30 days before expiry</SelectItem>
										</SelectContent>
									</Select>
									<p className='text-xs text-gray-500 mt-1'>
										Remind drivers before license/document expiry
									</p>
								</div>

								{/* Daily SMS Time */}
								<div>
									<Label htmlFor='dailySmsTime'>
										Daily SMS Time{' '}
										<span className='text-gray-500 font-normal'>
											(每日确认短信时间)
										</span>
									</Label>
									<Input
										id='dailySmsTime'
										type='time'
										value={formData.daily_sms_time}
										onChange={(e) =>
											setFormData({ ...formData, daily_sms_time: e.target.value })
										}
										className='mt-2'
									/>
									<p className='text-xs text-gray-500 mt-1'>
										Time to send daily schedule confirmation SMS (24-hour format)
									</p>
								</div>
							</div>
						</div>
					</Card>

					{/* Vehicle Maintenance Reminders */}
					<Card className='p-6 bg-white'>
						<div className='flex items-center gap-3 mb-6'>
							<div className='p-2 bg-green-100 rounded-lg'>
								<Wrench className='h-5 w-5 text-green-700' />
							</div>
							<div>
								<h2 className='text-xl font-bold text-gray-900'>
									Vehicle Maintenance Reminders
								</h2>
								<p className='text-sm text-gray-500'>车辆保养提醒设置</p>
							</div>
						</div>

						<div className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{/* Maintenance Booking Reminder */}
								<div>
									<Label htmlFor='maintenanceBookingReminderDays'>
										Maintenance Booking Reminder{' '}
										<span className='text-gray-500 font-normal'>
											(保养预约提醒)
										</span>
									</Label>
									<Select
										value={formData.maintenance_booking_reminder_days?.toString()}
										onValueChange={(value) =>
											setFormData({
												...formData,
												maintenance_booking_reminder_days: parseInt(value),
											})
										}>
										<SelectTrigger className='mt-2'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='10'>10 days before</SelectItem>
											<SelectItem value='15'>15 days before</SelectItem>
											<SelectItem value='30'>30 days before</SelectItem>
										</SelectContent>
									</Select>
									<p className='text-xs text-gray-500 mt-1'>
										Remind to book maintenance appointment
									</p>
								</div>

								{/* Next Maintenance Reminder */}
								<div>
									<Label htmlFor='nextMaintenanceReminderDays'>
										Next Maintenance Reminder{' '}
										<span className='text-gray-500 font-normal'>
											(下次保养临近提醒)
										</span>
									</Label>
									<Select
										value={formData.next_maintenance_reminder_days?.toString()}
										onValueChange={(value) =>
											setFormData({
												...formData,
												next_maintenance_reminder_days: parseInt(value),
											})
										}>
										<SelectTrigger className='mt-2'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='10'>10 days before</SelectItem>
											<SelectItem value='15'>15 days before</SelectItem>
											<SelectItem value='30'>30 days before</SelectItem>
										</SelectContent>
									</Select>
									<p className='text-xs text-gray-500 mt-1'>
										Remind when next maintenance is approaching
									</p>
								</div>
							</div>
						</div>
					</Card>

					{/* Configuration Summary */}
					<Card className='p-6 bg-blue-50 border-blue-200'>
						<div className='flex items-start gap-3'>
							<SettingsIcon className='h-5 w-5 text-blue-700 mt-0.5' />
							<div className='flex-1'>
								<h3 className='font-semibold text-blue-900 mb-2'>
									Configuration Notes
								</h3>
								<ul className='text-sm text-blue-800 space-y-1'>
									<li>
										• All reminder days settings accept values: 10, 15, or 30 days
									</li>
									<li>
										• Daily SMS time is in 24-hour format (e.g., 08:00 for 8 AM)
									</li>
									<li>
										• Admin phone should include country code (e.g., +61 for
										Australia)
									</li>
									<li>
										• Changes take effect immediately after saving
									</li>
								</ul>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
