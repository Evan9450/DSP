'use client';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api/client';
import type { VehicleResponse } from '@/lib/api/client';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface AssignSupplementaryDialogProps {
	vehicleId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function AssignSupplementaryDialog({
	vehicleId,
	open,
	onOpenChange,
	onSuccess,
}: AssignSupplementaryDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
	const [unavailableVehicles, setUnavailableVehicles] = useState<
		VehicleResponse[]
	>([]);

	const [targetVehicleId, setTargetVehicleId] = useState<string>('');
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [cost, setCost] = useState<string>('');
	const [costType, setCostType] = useState<string>('Self');

	// Fetch vehicles that need replacement
	useEffect(() => {
		if (open) {
			fetchUnavailableVehicles();
		} else {
			// Reset form
			setTargetVehicleId('');
			setStartDate(new Date());
			setCost('');
			setCostType('Self');
		}
	}, [open]);

	const fetchUnavailableVehicles = async () => {
		setIsLoadingVehicles(true);
		try {
			// Get all vehicles
			const data = await apiClient.getVehicles();
			// Filter for vehicles that are unavailable or need repair, AND exclude the current vehicle
			const filtered = data.filter(
				(v) =>
					v.id !== vehicleId && // Cannot assign to itself
					(v.condition === 'unavailable' ||
						v.condition === 'need-repair' ||
						v.status === 'not-in-use'),
			);
			setUnavailableVehicles(filtered);
		} catch (error) {
			console.error('Failed to fetch vehicles for assignment:', error);
			toast({
				title: 'Error',
				description: 'Failed to load list of target vehicles.',
				variant: 'destructive',
			});
		} finally {
			setIsLoadingVehicles(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!targetVehicleId) {
			toast({
				title: 'Validation Error',
				description: 'Please select a target vehicle to replace.',
				variant: 'destructive',
			});
			return;
		}

		if (!startDate) {
			toast({
				title: 'Validation Error',
				description: 'Please select a start date.',
				variant: 'destructive',
			});
			return;
		}

		try {
			setIsSubmitting(true);

			const parsedTargetId = parseInt(targetVehicleId);
			const parsedCost = cost ? parseFloat(cost) : undefined;

			await apiClient.createVehicleSupplementary(parsedTargetId, {
				target_vehicle_id: parsedTargetId,
				supplementary_vehicle_id: vehicleId,
				start_date: format(startDate, 'yyyy-MM-dd'),
				cost: parsedCost,
				cost_type: costType,
			});

			toast({
				title: 'Success',
				description: 'Supplementary vehicle assigned successfully.',
			});

			onOpenChange(false);
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Failed to assign supplementary vehicle:', error);
			toast({
				title: 'Error',
				description: 'Failed to assign supplementary vehicle.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Assign as Supplementary Vehicle</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4 pt-4'>
					<div className='space-y-2'>
						<Label>
							Target Vehicle{' '}
							<span className='text-red-500'>*</span>
						</Label>
						<Select
							value={targetVehicleId}
							onValueChange={setTargetVehicleId}
							disabled={isLoadingVehicles}>
							<SelectTrigger>
								<SelectValue
									placeholder={
										isLoadingVehicles
											? 'Loading...'
											: 'Select vehicle'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{unavailableVehicles.map(
									(v) =>
										v.alias &&
										!v.is_supplementary &&
										!v.is_archived &&
										!v.has_active_supplementary && (
											<SelectItem
												key={v.id}
												value={v.id.toString()}>
												{v.alias}
												{/* -{' '}
										{v.condition === 'unavailable'
											? 'Unavailable'
											: 'Needs Repair'} */}
											</SelectItem>
										),
								)}
								{unavailableVehicles.length === 0 &&
									!isLoadingVehicles && (
										<SelectItem value='none' disabled>
											No unavailable vehicles found
										</SelectItem>
									)}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label>
							Assignment Start Date{' '}
							<span className='text-red-500'>*</span>
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={'outline'}
									className={cn(
										'w-full justify-start text-left font-normal',
										!startDate && 'text-muted-foreground',
									)}>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{startDate ? (
										format(startDate, 'PPP')
									) : (
										<span>Pick a date</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={startDate}
									onSelect={(date) =>
										date && setStartDate(date)
									}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='daily-cost'>Cost (Optional)</Label>
						<div className='relative'>
							<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
								$
							</span>
							<Input
								id='daily-cost'
								type='number'
								step='0.01'
								min='0'
								placeholder='0.00'
								className='pl-7'
								value={cost}
								onChange={(e) => setCost(e.target.value)}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label>
							Paid By <span className='text-red-500'>*</span>
						</Label>
						<Select value={costType} onValueChange={setCostType}>
							<SelectTrigger>
								<SelectValue placeholder='Select cost bearer' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='Self'>Self</SelectItem>
								<SelectItem value='Amazon'>Amazon</SelectItem>
								<SelectItem value='Insurance'>
									Insurance
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<DialogFooter className='pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isSubmitting || !targetVehicleId}>
							{isSubmitting && (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							)}
							Confirm Assignment
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
