'use client';

import {
	Bell,
	Clock,
	Loader2,
	Save,
	Settings as SettingsIcon,
	Wrench,
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SystemConfigUpdate, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import { ContactSelector } from './components/contact-selector';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { MessageTemplateList } from './components/message-template-list';

export default function SettingsPage() {
	const { toast } = useToast();
	const { settings, isLoading, error, refetch } = useSettings();
	const [isSaving, setIsSaving] = useState(false);

	// Form state
	const [formData, setFormData] = useState<SystemConfigUpdate>({
		admin_phone: '',
		contact_ids: [],
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
				contact_ids: settings.contacts?.map((c) => c.id) || [],
				driver_file_reminder_days:
					settings.driver_file_reminder_days || 15,
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
					description:
						'System configuration has been updated successfully',
				});
			} else {
				// Create new settings
				await apiClient.createSystemConfig(formData);
				toast({
					title: 'Settings Created',
					description:
						'System configuration has been created successfully',
				});
			}

			refetch();
		} catch (err: any) {
			toast({
				title: 'Error',
				description:
					err.response?.data?.detail ||
					'Failed to save settings. Please try again.',
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
						<p className='ml-4 text-gray-600'>
							Loading settings...
						</p>
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
						<p className='text-sm text-gray-500 mt-2'>
							{error.message}
						</p>
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
						<h1 className='text-3xl font-bold text-gray-900'>
							System Settings
						</h1>

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

							</div>
						</div>

						<div className='space-y-4'>
							<div>
								<Label htmlFor='contacts'>
									System Contacts
								</Label>
								<div className='mt-2'>
									<ContactSelector
										value={formData.contact_ids || []}
										onChange={(ids) =>
											setFormData({
												...formData,
												contact_ids: ids,
											})
										}
									/>
								</div>

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

							</div>
						</div>

						<div className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{/* Driver File Reminder */}
								<div>
									<Label htmlFor='driverFileReminderDays'>
										Driver File Reminder{' '}
									</Label>
									<Input
										value={formData.driver_file_reminder_days?.toString()}
										type='number'
										onChange={(e) =>
											setFormData({
												...formData,
												driver_file_reminder_days:
													parseInt(e.target.value),
											})
										} />
										{/* <SelectTrigger className='mt-2'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='10'>
												10 days before expiry
											</SelectItem>
											<SelectItem value='15'>
												15 days before expiry
											</SelectItem>
											<SelectItem value='30'>
												30 days before expiry
											</SelectItem>
										</SelectContent> */}
									{/* </Select> */}
									{/* <p className='text-xs text-gray-500 mt-1'>
										Remind drivers before license/document
										expiry
									</p> */}
								</div>

								{/* Daily SMS Time */}
								<div>
									<Label htmlFor='dailySmsTime'>
										Check-in SMS Time{' '}
									</Label>
									<Input
										id='dailySmsTime'
										type='time'
										value={formData.daily_sms_time}
										onChange={(e) =>
											setFormData({
												...formData,
												daily_sms_time: e.target.value,
											})
										}
										className='mt-2'
									/>
									{/* <p className='text-xs text-gray-500 mt-1'>
										Time to send daily schedule confirmation
										SMS (24-hour format)
									</p> */}
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

							</div>
						</div>

						<div className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{/* Maintenance Booking Reminder */}
								<div>
									<Label htmlFor='maintenanceBookingReminderDays'>
										Maintenance Booking Reminder{' '}
									</Label>
									<Input
										value={formData.maintenance_booking_reminder_days?.toString()}
										onChange={(e) =>
											setFormData({
												...formData,
												maintenance_booking_reminder_days:
													parseInt(e.target.value),
											})
										} />



								</div>

								{/* Next Maintenance Reminder */}
								<div>
									<Label htmlFor='nextMaintenanceReminderDays'>
										Next Maintenance Reminder{' '}
									</Label>
									<Input
										value={formData.next_maintenance_reminder_days?.toString()}
										onChange={(e) =>
											setFormData({
												...formData,
												next_maintenance_reminder_days:
													parseInt(e.target.value),
											})
										} />


								</div>
							</div>
						</div>
					</Card>

					{/* Message Templates */}
					<MessageTemplateList />
				</div>
			</div>
		</div>
	);
}
