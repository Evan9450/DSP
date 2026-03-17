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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { apiClient, type UnifiedHistoryItem } from '@/lib/api/client';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface EditOtherHistoryDialogProps {
	vehicleId: number;
	record: UnifiedHistoryItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function EditOtherHistoryDialog({
	vehicleId,
	record,
	open,
	onOpenChange,
	onSuccess,
}: EditOtherHistoryDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [date, setDate] = useState(record.date);
	const [description, setDescription] = useState(record.description ?? '');
	const [cost, setCost] = useState(record.cost ? String(record.cost) : '');
	const [costType, setCostType] = useState(record.cost_type ?? 'Self');

	// 当 record 变化时（打开新记录），重置表单
	useEffect(() => {
		setDate(record.date);
		setDescription(record.description ?? '');
		setCost(record.cost ? String(record.cost) : '');
		setCostType(record.cost_type ?? 'Self');
	}, [record]);

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
			await apiClient.updateVehicleOtherHistory(vehicleId, record.id, {
				other_date: date,
				description: description || null,
				cost: cost ? parseFloat(cost) : null,
				cost_type: costType,
			});

			toast({
				title: 'Success',
				description: 'Other history record updated successfully.',
			});

			onOpenChange(false);
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Failed to update other history record:', error);
			toast({
				title: 'Error',
				description: 'Failed to update other history record.',
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
					<DialogTitle>Edit Other Cost Record</DialogTitle>
					<DialogDescription>
						Modify the existing miscellaneous cost record.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='edit-other-date'>Date *</Label>
						<Input
							id='edit-other-date'
							type='date'
							value={date}
							onChange={(e) => setDate(e.target.value)}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='edit-other-cost-type'>Paid by *</Label>
						<Select value={costType} onValueChange={setCostType}>
							<SelectTrigger id='edit-other-cost-type'>
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
						<Label htmlFor='edit-other-cost'>Cost </Label>
						<Input
							id='edit-other-cost'
							type='number'
							step='0.01'
							placeholder='0.00'
							value={cost}
							onChange={(e) => setCost(e.target.value)}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='edit-other-description'>
							Description
						</Label>
						<Textarea
							id='edit-other-description'
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
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Saving...
								</>
							) : (
								'Save Changes'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
