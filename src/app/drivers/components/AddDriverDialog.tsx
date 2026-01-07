'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, DriverCreate } from '@/lib/api/client';
import {
	notify,
	successMessages,
	errorMessages,
	handleApiError,
} from '@/lib/notifications';
import {
	validateDriverFields,
	hasValidationErrors,
	type DriverValidationErrors,
} from '@/lib/validation';

interface AddDriverDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function AddDriverDialog({
	open,
	onOpenChange,
	onSuccess,
}: AddDriverDialogProps) {
	const [newDriver, setNewDriver] = useState<DriverCreate>({
		name: '',
		amazon_id: '',
		password: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationErrors, setValidationErrors] =
		useState<DriverValidationErrors>({});

	// Validate fields whenever newDriver changes
	useEffect(() => {
		const errors = validateDriverFields({
			email: newDriver.email,
			phone: newDriver.phone,
		});
		setValidationErrors(errors);
	}, [newDriver.email, newDriver.phone]);

	const handleAddDriver = async () => {
		// Check for validation errors
		if (hasValidationErrors(validationErrors)) {
			notify.error('Please fix validation errors before saving');
			return;
		}

		try {
			setIsSubmitting(true);
			await apiClient.createDriver(newDriver);
			const driverName = newDriver.name;
			// Reset form
			setNewDriver({ name: '', amazon_id: '', password: '' });
			setValidationErrors({});
			onOpenChange(false);
			await onSuccess();
			notify.success(successMessages.driver.created(driverName));
		} catch (error) {
			console.error('Failed to create driver:', error);
			handleApiError(
				error,
				errorMessages.driver.createFailed(newDriver.name)
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setNewDriver({ name: '', amazon_id: '', password: '' });
		setValidationErrors({});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-white'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold text-zinc-900'>
						Add New Driver
					</DialogTitle>
					<DialogDescription className='text-sm text-gray-500'>
						Create a new driver profile. You can add more details
						later.
					</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div>
						<Label>Name *</Label>
						<Input
							value={newDriver.name}
							onChange={(e) =>
								setNewDriver({
									...newDriver,
									name: e.target.value,
								})
							}
							placeholder='Enter driver name'
						/>
					</div>
					<div>
						<Label>Amazon ID *</Label>
						<Input
							value={newDriver.amazon_id}
							onChange={(e) =>
								setNewDriver({
									...newDriver,
									amazon_id: e.target.value,
								})
							}
							placeholder='e.g., DA123456'
						/>
					</div>
					<div>
						<Label>Password *</Label>
						<Input
							type='password'
							value={newDriver.password}
							onChange={(e) =>
								setNewDriver({
									...newDriver,
									password: e.target.value,
								})
							}
							placeholder='Enter login password'
						/>
					</div>
					<div>
						<Label>Phone</Label>
						<Input
							value={newDriver.phone || ''}
							onChange={(e) =>
								setNewDriver({
									...newDriver,
									phone: e.target.value,
								})
							}
							placeholder='04XX XXX XXX or +61 4XX XXX XXX'
							className={
								validationErrors.phone ? 'border-rose-500' : ''
							}
						/>
						{validationErrors.phone && (
							<p className='text-rose-500 text-xs mt-1'>
								{validationErrors.phone}
							</p>
						)}
					</div>
					<div>
						<Label>Email</Label>
						<Input
							type='email'
							value={newDriver.email || ''}
							onChange={(e) =>
								setNewDriver({
									...newDriver,
									email: e.target.value,
								})
							}
							placeholder='email@example.com'
							className={
								validationErrors.email ? 'border-rose-500' : ''
							}
						/>
						{validationErrors.email && (
							<p className='text-rose-500 text-xs mt-1'>
								{validationErrors.email}
							</p>
						)}
					</div>
					<div>
						<Label>Address</Label>
						<Input
							value={newDriver.address || ''}
							onChange={(e) =>
								setNewDriver({
									...newDriver,
									address: e.target.value,
								})
							}
							placeholder='Full address'
						/>
					</div>
				</div>
				{/* <div className='px-6 pb-2'>
					<p className='text-sm text-gray-500 italic'>
						* Deputy ID will be automatically assigned when syncing
						with Deputy
					</p>
				</div> */}
				<DialogFooter>
					<Button
						variant='outline'
						onClick={handleCancel}
						className='rounded-md'>
						Cancel
					</Button>
					<Button
						onClick={handleAddDriver}
						disabled={
							!newDriver.name ||
							!newDriver.amazon_id ||
							!newDriver.password ||
							hasValidationErrors(validationErrors) ||
							isSubmitting
						}
						className='bg-zinc-900 hover:bg-zinc-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed'>
						{isSubmitting ? 'Adding...' : 'Add Driver'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
