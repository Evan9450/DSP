'use client';

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiClient, VehicleCreate } from '@/lib/api/client';
import { RepairSupplierSelect } from './repair-supplier-select';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AddVehicleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function AddVehicleDialog({
	open,
	onOpenChange,
	onSuccess,
}: AddVehicleDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<Partial<VehicleCreate>>({
		condition: 'available', // Default to available
		status: 'not-in-use', // Default to not-in-use
		maintenance_cycle_days: 90, // Default 90 days
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.rego || !formData.alias) {
			toast({
				title: 'Missing Information',
				description: 'Please fill in all required fields.',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			await apiClient.createVehicle(formData as VehicleCreate);
			toast({
				title: 'Vehicle Added',
				description: 'The vehicle has been successfully added.',
			});
			onSuccess();
			onOpenChange(false);
			// Reset form
			setFormData({
				condition: 'available',
				status: 'not-in-use',
				maintenance_cycle_days: 90,
			});
		} catch (error) {
			console.error('Failed to create vehicle:', error);
			toast({
				title: 'Error',
				description: 'Failed to add vehicle. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Add New Vehicle</DialogTitle>
					<DialogDescription>
						Add a new vehicle to your fleet. Fill in the details below.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='rego'>
								Registration Number <span className='text-red-600'>*</span>
							</Label>
							<Input
								id='rego'
								value={formData.rego || ''}
								onChange={(e) =>
									setFormData({ ...formData, rego: e.target.value })
								}
								placeholder='ABC123'
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='alias'>
								Vehicle Alias/Number <span className='text-red-600'>*</span>
							</Label>
							<Input
								id='alias'
								value={formData.alias || ''}
								onChange={(e) =>
									setFormData({ ...formData, alias: e.target.value })
								}
								placeholder='V001'
								required
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='brand'>Brand</Label>
							<Input
								id='brand'
								value={formData.brand || ''}
								onChange={(e) =>
									setFormData({ ...formData, brand: e.target.value })
								}
								placeholder='Toyota'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='model'>Model</Label>
							<Input
								id='model'
								value={formData.model || ''}
								onChange={(e) =>
									setFormData({ ...formData, model: e.target.value })
								}
								placeholder='Hiace'
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='condition'>Condition</Label>
							<Select
								value={formData.condition || 'available'}
								onValueChange={(value: 'available' | 'need-repair' | 'unavailable') =>
									setFormData({ ...formData, condition: value })
								}>
								<SelectTrigger>
									<SelectValue placeholder='Select condition' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='available'>
										<div className='flex items-center gap-2'>
											<div className='w-3 h-3 rounded-full bg-green-500'></div>
											<span>Available</span>
										</div>
									</SelectItem>
									<SelectItem value='need-repair'>
										<div className='flex items-center gap-2'>
											<div className='w-3 h-3 rounded-full bg-yellow-500'></div>
											<span>Needs Repair</span>
										</div>
									</SelectItem>
									<SelectItem value='unavailable'>
										<div className='flex items-center gap-2'>
											<div className='w-3 h-3 rounded-full bg-red-500'></div>
											<span>Unavailable</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='status'>Status</Label>
							<Select
								value={formData.status || 'not-in-use'}
								onValueChange={(value: 'in-use' | 'not-in-use') =>
									setFormData({ ...formData, status: value })
								}>
								<SelectTrigger>
									<SelectValue placeholder='Select status' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='not-in-use'>Not In Use</SelectItem>
									<SelectItem value='in-use'>In Use</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='mileage'>Mileage (km)</Label>
							<Input
								id='mileage'
								type='number'
								value={formData.mileage || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										mileage: e.target.value ? parseInt(e.target.value) : undefined,
									})
								}
								placeholder='50000'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='maintenance_cycle_days'>Maintenance Cycle (days)</Label>
							<Input
								id='maintenance_cycle_days'
								type='number'
								value={formData.maintenance_cycle_days || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										maintenance_cycle_days: e.target.value
											? parseInt(e.target.value)
											: undefined,
									})
								}
								placeholder='90'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='maintenance_cycle_mileage'>
								Maintenance Cycle (km)
							</Label>
							<Input
								id='maintenance_cycle_mileage'
								type='number'
								value={formData.maintenance_cycle_mileage || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										maintenance_cycle_mileage: e.target.value
											? parseInt(e.target.value)
											: undefined,
									})
								}
								placeholder='10000'
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='nickname'>Nickname</Label>
							<Input
								id='nickname'
								value={formData.nickname || ''}
								onChange={(e) =>
									setFormData({ ...formData, nickname: e.target.value })
								}
								placeholder='Van 1'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='repair_supplier'>Repair Supplier</Label>
							<RepairSupplierSelect
								value={formData.repair_supplier_id}
								onValueChange={(value) =>
									setFormData({ ...formData, repair_supplier_id: value })
								}
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='last_maintenance_date'>Last Maintenance Date</Label>
							<Input
								id='last_maintenance_date'
								type='date'
								value={formData.last_maintenance_date || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										last_maintenance_date: e.target.value,
									})
								}
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='next_maintenance_date'>Next Maintenance Date</Label>
							<Input
								id='next_maintenance_date'
								type='date'
								value={formData.next_maintenance_date || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										next_maintenance_date: e.target.value,
									})
								}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='notes'>Notes</Label>
						<Textarea
							id='notes'
							value={formData.notes || ''}
							onChange={(e) =>
								setFormData({ ...formData, notes: e.target.value })
							}
							placeholder='Additional notes about the vehicle...'
							rows={3}
						/>
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting ? 'Adding...' : 'Add Vehicle'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
