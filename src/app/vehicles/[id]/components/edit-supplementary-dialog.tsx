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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { apiClient, type UnifiedHistoryItem } from '@/lib/api/client';
import { Loader2 } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface EditSupplementaryDialogProps {
	record: UnifiedHistoryItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function EditSupplementaryDialog({
	record,
	open,
	onOpenChange,
	onSuccess,
}: EditSupplementaryDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [startDate, setStartDate] = useState('');
	const [cost, setCost] = useState('');
	const [costType, setCostType] = useState('Self');
	const [description, setDescription] = useState('');

	useEffect(() => {
		if (record) {
			setStartDate(record.date || '');
			setCost(record.cost ? String(record.cost) : '');
			setCostType(record.cost_type || 'Self');
			setDescription(
				record.description?.includes('Target:') ? '' : record.description || ''
			); // If it's the auto-generated description, default to empty to allow blank
		} else {
			setStartDate('');
			setCost('');
			setCostType('Self');
			setDescription('');
		}
	}, [record]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!record) return;

		setIsSubmitting(true);
		try {
			await apiClient.updateVehicleSupplementary(record.id, {
				start_date: startDate || undefined,
				cost: cost ? parseFloat(cost) : null,
				cost_type: costType,
				description: description || null,
			});

			toast({
				title: 'Success',
				description: 'Supplementary assignment updated successfully.',
			});

			onOpenChange(false);
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Failed to update supplementary assignment:', error);
			toast({
				title: 'Error',
				description: 'Failed to update supplementary assignment.',
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
					<DialogTitle>Edit Supplementary Assignment</DialogTitle>
					<DialogDescription>
						Update the details of the active supplementary vehicle assignment.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4 pt-4'>
					<div className='space-y-2'>
						<Label>
							Start Date <span className='text-red-500'>*</span>
						</Label>
						<Input
							type='date'
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='supp-cost'>Cost</Label>
						<div className='relative'>
							<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
								$
							</span>
							<Input
								id='supp-cost'
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
						<Label>Paid By</Label>
						<Select value={costType} onValueChange={setCostType}>
							<SelectTrigger>
								<SelectValue placeholder='Select cost bearer' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='Self'>Self</SelectItem>
								<SelectItem value='Amazon'>Amazon</SelectItem>
								<SelectItem value='Insurance'>Insurance</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='supp-desc'>Notes</Label>
						<Textarea
							id='supp-desc'
							placeholder='Add any specific notes...'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<DialogFooter className='pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type='submit' disabled={isSubmitting || !startDate}>
							{isSubmitting && (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							)}
							Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
