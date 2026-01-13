'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';

import type { Asset } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface AddInventoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset: Asset | null;
	onSuccess: () => void;
}

export function AddInventoryDialog({
	open,
	onOpenChange,
	asset,
	onSuccess,
}: AddInventoryDialogProps) {
	const { toast } = useToast();

	const [quantity, setQuantity] = useState('');
	const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
	const [unitPrice, setUnitPrice] = useState('');
	const [supplier, setSupplier] = useState('');
	const [notes, setNotes] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetState = () => {
		setQuantity('');
		setPurchaseDate(new Date());
		setUnitPrice('');
		setSupplier('');
		setNotes('');
	};

	useEffect(() => {
		if (open) {
			resetState();
		}
	}, [open]);

	const handleSubmit = async () => {
		if (!asset) {
			toast({
				title: 'Error',
				description: 'Please select an asset',
				variant: 'destructive',
			});
			return;
		}

		const qty = parseInt(quantity);
		if (!quantity || qty <= 0) {
			toast({
				title: 'Error',
				description: 'Please enter a valid quantity (greater than 0)',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await apiClient.addInventory({
				product_id: parseInt(asset.id),
				quantity: qty,
				purchase_date: format(purchaseDate, 'yyyy-MM-dd'),
				unit_price: unitPrice ? parseFloat(unitPrice) : undefined,
				supplier: supplier.trim() || undefined,
				notes: notes.trim() || undefined,
			});

			toast({
				title: 'Success',
				description: `Added ${qty} units to ${asset.name}`,
			});

			resetState();
			onOpenChange(false);
			onSuccess();
		} catch (error: any) {
			console.error('Failed to add inventory:', error);
			toast({
				title: 'Error',
				description:
					error.response?.data?.detail ||
					'Failed to add inventory. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Add Inventory</DialogTitle>
					<DialogDescription>
						Add stock for {asset?.name || 'selected asset'}
					</DialogDescription>
				</DialogHeader>

				<div className='grid gap-4 py-4'>
					{/* Asset Name (Read-only) */}
					<div className='grid gap-2'>
						<Label>Asset</Label>
						<Input
							value={asset?.name || ''}
							disabled
							className='bg-gray-50'
						/>
					</div>

					{/* Quantity */}
					<div className='grid gap-2'>
						<Label htmlFor='quantity'>
							Quantity <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='quantity'
							type='number'
							min='1'
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							placeholder='Enter quantity'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
						className='bg-blue-700 hover:bg-blue-800'>
						{isSubmitting ? 'Adding...' : 'Add Inventory'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
