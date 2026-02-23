'use client';

import {
	Mail,
	Wrench,
} from 'lucide-react';
import {
	SendMaintenanceEmailResponse,
	VehicleDetailResponse,
	apiClient,
} from '@/lib/api/client';
import {
	apiConditionToString,
	isMaintenanceDueSoon,
	isMaintenanceOverdue,
} from '@/lib/helpers';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MaintenanceHistory } from './maintenance-history';
import { RepairSupplierSelect } from './repair-supplier-select';
import { useToast } from '@/components/ui/use-toast';

interface MaintenanceCardProps {
	vehicle: VehicleDetailResponse;
	isEditing: boolean;
	editForm?: Partial<VehicleDetailResponse>;
	setEditForm?: (form: Partial<VehicleDetailResponse>) => void;
	onEmailSent?: () => void;
	onUpdate?: () => void;
}

export function MaintenanceCard({
	vehicle,
	isEditing,
	editForm,
	setEditForm,
	onEmailSent,
	onUpdate,
}: MaintenanceCardProps) {
	const { toast } = useToast();
	const [isSendingEmail, setIsSendingEmail] = useState(false);

	const isOverdue = vehicle.next_maintenance_date
		? isMaintenanceOverdue(new Date(vehicle.next_maintenance_date))
		: false;
	const isDueSoon = vehicle.next_maintenance_date
		? isMaintenanceDueSoon(new Date(vehicle.next_maintenance_date))
		: false;

	const handleSendMaintenanceEmail = async () => {
		if (!vehicle.repair_supplier?.email) {
			toast({
				title: 'Configuration Error',
				description: 'No repair supplier email configured for this vehicle.',
				variant: 'destructive',
			});
			return;
		}

		try {
			setIsSendingEmail(true);
			const response = await apiClient.sendMaintenanceEmail(vehicle.id);

			if (response.success) {
				toast({
					title: 'Email Sent',
					description: `Maintenance booking email sent to ${vehicle.repair_supplier.name}`,
				});
				if (onEmailSent) onEmailSent();
				window.location.reload();
			} else {
				toast({
					title: 'Error',
					description: response.message || 'Failed to send email',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Failed to send maintenance email:', error);
			toast({
				title: 'Error',
				description: 'Failed to send maintenance booking email',
				variant: 'destructive',
			});
		} finally {
			setIsSendingEmail(false);
		}
	};

	if (isEditing && editForm && setEditForm) {
		return (
			<Card className='p-6'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
						<Wrench className='h-5 w-5' />
						Maintenance Schedule
					</h2>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label>Last Maintenance Date</Label>
						<Input
							type='date'
							disabled
							value={editForm.last_maintenance_date || ''}
							onChange={(e) =>
								setEditForm({
									...editForm,
									last_maintenance_date: e.target.value || undefined,
								})
							}
						/>
					</div>
					{/* <div className='space-y-2'>
						<Label>Next Maintenance Date</Label>
						<Input
							type='date'
							value={editForm.next_maintenance_date || ''}
							onChange={(e) =>
								setEditForm({
									...editForm,
									next_maintenance_date: e.target.value || undefined,
								})
							}
						/>
					</div> */}
					<div className='space-y-2'>
						<Label>Confirmed Maintenance</Label>
						<Input
							type='datetime-local'
							value={
								editForm.scheduled_maintenance_date
									? editForm.scheduled_maintenance_date.includes('T')
										? editForm.scheduled_maintenance_date.slice(0, 16)
										: `${editForm.scheduled_maintenance_date}T00:00`
									: ''
							}
							onChange={(e) => {
								const value = e.target.value;
								setEditForm({
									...editForm,
									scheduled_maintenance_date: value
										? `${value}:00`
										: undefined,
								});
							}}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='edit-location'>Scheduled Mileage</Label>
						<Input
							id='edit-location'
							type='number'
							value={editForm.scheduled_mileage ?? ''}
							onChange={(e) => {
								const value = e.target.value.trim();
								const parsedValue = value ? parseInt(value, 10) : undefined;
								setEditForm({
									...editForm,
									scheduled_mileage: parsedValue !== undefined && !isNaN(parsedValue)
										? parsedValue
										: undefined,
								});
							}}
						/>
					</div>
					<div className='space-y-2'>
						<Label>Maintenance Supplier</Label>
						<RepairSupplierSelect
							value={editForm.repair_supplier_id}
							onValueChange={(value) =>
								setEditForm({
									...editForm,
									repair_supplier_id: value,
								})
							}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='edit-cycle'>
							Maintenance Cycle (days)
						</Label>
						<Input
							id='edit-cycle'
							type='number'
							value={editForm.maintenance_cycle_days || ''}
							onChange={(e) =>
								setEditForm({
									...editForm,
									maintenance_cycle_days: e.target.value
										? parseInt(e.target.value)
										: undefined,
								})
							}
							placeholder='90'
						/>
					</div>
					<div className='col-span-2 space-y-2'>
						<Label htmlFor='edit-notes'>Notes</Label>
						<Textarea
							id='edit-notes'
							value={editForm.notes || ''}
							onChange={(e) =>
								setEditForm({
									...editForm,
									notes: e.target.value,
								})
							}
							placeholder='Additional notes...'
							rows={3}
						/>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<Card className='p-6'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
						<Wrench className='h-5 w-5' />
						Maintenance Schedule
					</h2>
					{!isEditing && (
						<Button
							variant='outline'
							size='sm'
							onClick={handleSendMaintenanceEmail}
							disabled={
								isSendingEmail ||
								!vehicle.repair_supplier?.email ||
								!vehicle.next_maintenance_date
							}
							title={
								!vehicle.repair_supplier?.email
									? 'Supplier email not configured'
									: !vehicle.next_maintenance_date
										? 'Next maintenance date not set'
										: 'Send maintenance booking email to workshop'
							}>
							<Mail className='h-4 w-4 mr-2' />
							{isSendingEmail ? 'Sending...' : 'Send Booking Email'}
						</Button>
					)}
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-sm text-gray-600'>Last Maintenance</p>
						<p className='font-semibold'>
							{vehicle.last_maintenance_date ? (
								format(new Date(vehicle.last_maintenance_date), 'MMM dd, yyyy')
							) : (
								<span className='text-gray-400'>Not recorded</span>
							)}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Next Maintenance</p>
						<p
							className={`font-semibold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : ''}`}>
							{vehicle.next_maintenance_date ? (
								format(new Date(vehicle.next_maintenance_date), 'MMM dd, yyyy')
							) : (
								<span className='text-gray-400'>Not scheduled</span>
							)}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Confirmed Maintenance</p>
						<p className='font-semibold'>
							{vehicle.scheduled_maintenance_date ? (
								format(
									new Date(vehicle.scheduled_maintenance_date),
									'MMM dd, yyyy HH:mm',
								)
							) : (
								<span className='text-gray-400'>Not scheduled</span>
							)}
						</p>
					</div>

					<div>
						<p className='text-sm text-gray-600'>Scheduled Mileage</p>
						<p className='font-semibold'>
							{vehicle.scheduled_mileage ? (
								`${vehicle.scheduled_mileage.toLocaleString()} km`
							) : (
								<span className='text-gray-400'>Not scheduled</span>
							)}
						</p>
					</div>
					{/* <div>
						<p className='text-sm text-gray-600'>Cycle Mileage</p>
						<p className='font-semibold'>
							{vehicle.maintenance_cycle_mileage ? (
								`${vehicle.maintenance_cycle_mileage.toLocaleString()} km`
							) : (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div> */}
					<div>
						<p className='text-sm text-gray-600'>Maintenance Supplier</p>
						<p className='font-semibold'>
							{vehicle.repair_supplier?.name || (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Cycle Days</p>
						<p className='font-semibold'>
							{vehicle.maintenance_cycle_days ? (
								`${vehicle.maintenance_cycle_days} days`
							) : (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div>
				</div>

				{vehicle.notes && (
					<div className='mt-4 pt-4 border-t'>
						<p className='text-sm text-gray-600 mb-1'>Notes</p>
						<p className='text-gray-900'>{vehicle.notes}</p>
					</div>
				)}

				{/* Email Status Info */}
				{vehicle.email_sent && (
					<div className='mt-4 pt-4 border-t'>
						<p className='text-sm text-blue-600 flex items-center gap-2'>
							<Mail className='h-3 w-3' />
							Booking email sent{' '}
							{vehicle.email_sent_at
								? `on ${format(new Date(vehicle.email_sent_at), 'MMM dd, yyyy')}`
								: ''}
						</p>
					</div>
				)}
			</Card>

			<MaintenanceHistory
				vehicleId={vehicle.id}
				defaultSupplier={vehicle.repair_supplier ? {
					id: vehicle.repair_supplier.id,
					name: vehicle.repair_supplier.name
				} : undefined}
				onUpdate={onUpdate}
			/>
		</div>
	);
}
