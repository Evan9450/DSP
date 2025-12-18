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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import type { Asset } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Driver {
	id: string;
	name: string;
	amazonId?: string;
}

interface BorrowDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	assets: Asset[];
	drivers: Driver[];
	onSuccess: () => void;
}

export function BorrowDialog({
	open,
	onOpenChange,
	assets,
	drivers,
	onSuccess,
}: BorrowDialogProps) {
	const { toast } = useToast();

	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [borrowDriverId, setBorrowDriverId] = useState('');
	const [borrowQuantity, setBorrowQuantity] = useState('1');
	const [borrowNotes, setBorrowNotes] = useState('');
	const [borrowDate, setBorrowDate] = useState<Date>(new Date());

	const availableAssets = assets.filter(
		(asset) => asset.availableQuantity > 0
	);

	const resetState = () => {
		setSelectedAsset(null);
		setBorrowDriverId('');
		setBorrowQuantity('1');
		setBorrowNotes('');
		setBorrowDate(new Date());
	};

	const handleBorrow = async () => {
		if (!selectedAsset || !borrowDriverId) {
			toast({
				title: 'Error',
				description: 'Please select a driver',
				variant: 'destructive',
			});
			return;
		}

		try {
			const payload: any = {
				product_id: parseInt(selectedAsset.id),
				driver_id: parseInt(borrowDriverId),
				quantity: parseInt(borrowQuantity),
				borrow_date: format(borrowDate, 'yyyy-MM-dd'),
			};

			if (borrowNotes.trim()) {
				payload.notes = borrowNotes;
			}

			await apiClient.createBorrowRecord(payload);

			toast({
				title: 'Success',
				description: 'Asset borrowed successfully',
			});

			onOpenChange(false);
			resetState();
			onSuccess();
		} catch (error: any) {
			toast({
				title: 'Error',
				description:
					error.response?.data?.detail || 'Failed to record borrow',
				variant: 'destructive',
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Lend Asset</DialogTitle>
					<DialogDescription>
						Record asset lending to a driver
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label>Select Asset</Label>
						<Select
							value={selectedAsset?.id || ''}
							onValueChange={(value) => {
								const asset = availableAssets.find(
									(a) => a.id === value
								);
								setSelectedAsset(asset || null);
								setBorrowQuantity('1');
							}}>
							<SelectTrigger>
								<SelectValue placeholder='Select asset' />
							</SelectTrigger>
							<SelectContent>
								{availableAssets.map((asset) => (
									<SelectItem key={asset.id} value={asset.id}>
										{asset.name} (Available:{' '}
										{asset.availableQuantity})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label>Driver</Label>
						<Select
							value={borrowDriverId}
							onValueChange={setBorrowDriverId}>
							<SelectTrigger>
								<SelectValue placeholder='Select driver' />
							</SelectTrigger>
							<SelectContent>
								{drivers.map((driver) => (
									<SelectItem
										key={driver.id}
										value={driver.id}>
										{driver.name}{' '}
										{driver.amazonId &&
											`(${driver.amazonId})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label>Quantity</Label>
						<Input
							type='number'
							min={1}
							max={selectedAsset?.availableQuantity || 1}
							value={borrowQuantity}
							onChange={(e) => setBorrowQuantity(e.target.value)}
						/>
					</div>

					<div className='space-y-2'>
						<Label>Borrow Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className={cn(
										'w-full justify-start text-left font-normal',
										!borrowDate && 'text-muted-foreground'
									)}>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{format(borrowDate, 'PPP')}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={borrowDate}
									onSelect={(date) =>
										setBorrowDate(date || new Date())
									}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className='space-y-2'>
						<Label>Notes (optional)</Label>
						<Input
							placeholder='Add notes...'
							value={borrowNotes}
							onChange={(e) => setBorrowNotes(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						className='bg-blue-700 hover:bg-blue-800'
						onClick={handleBorrow}
						disabled={!selectedAsset || !borrowDriverId}>
						Confirm Lend
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
