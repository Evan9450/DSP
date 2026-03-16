import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api/client';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface AddOtherHistoryDialogProps {
	vehicleId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function AddOtherHistoryDialog({
	vehicleId,
	open,
	onOpenChange,
	onSuccess,
}: AddOtherHistoryDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
	const [description, setDescription] = useState('');
	const [cost, setCost] = useState('');
	const [costType, setCostType] = useState('Self'); // Expected: 'Self', 'Amazon', 'Insurance'

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!date) {
			toast({
				title: 'Validation Error',
				description: 'Date is required.',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await apiClient.createVehicleOtherHistory(vehicleId, {
				vehicle_id: vehicleId,
				other_date: date,
				description,
				cost: cost ? parseFloat(cost) : null,
				cost_type: costType,
			});

			toast({
				title: 'Success',
				description: 'Other history record added successfully.',
			});

			// Reset form
			setDescription('');
			setCost('');
			setCostType('Self');

			onOpenChange(false);
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Failed to add other history record:', error);
			toast({
				title: 'Error',
				description: 'Failed to add other history record.',
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
					<DialogTitle>Add Other Cost</DialogTitle>
					<DialogDescription>
						Record miscellaneous costs like registration, fines, or
						insurance claims.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='other-date'>Date *</Label>
						<Input
							id='other-date'
							type='date'
							value={date}
							onChange={(e) => setDate(e.target.value)}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='other-cost-type'>
							Cost Attributed To *
						</Label>
						<Select value={costType} onValueChange={setCostType}>
							<SelectTrigger id='other-cost-type'>
								<SelectValue placeholder='Select cost type' />
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

					<div className='space-y-2'>
						<Label htmlFor='other-cost'>Cost</Label>
						<Input
							id='other-cost'
							type='number'
							step='0.01'
							placeholder='0.00'
							value={cost}
							onChange={(e) => setCost(e.target.value)}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='other-description'>Description</Label>
						<Textarea
							id='other-description'
							placeholder='Reason for cost...'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
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
							{isSubmitting ? 'Saving...' : 'Save Record'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
