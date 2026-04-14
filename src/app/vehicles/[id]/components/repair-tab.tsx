'use client';

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
import { RepairSupplierSelect } from './repair-supplier-select';
import { apiClient } from '@/lib/api/client';
import { FileUp, Loader2 } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface LogRepairDialogProps {
	vehicleId: number;
	defaultSupplierId?: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function LogRepairDialog({
	vehicleId,
	defaultSupplierId,
	open,
	onOpenChange,
	onSuccess,
}: LogRepairDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
	const [supplierId, setSupplierId] = useState<number | undefined>(
		defaultSupplierId,
	);
	const [description, setDescription] = useState('');
	const [cost, setCost] = useState('');
	const [costType, setCostType] = useState('Self');
	const [documents, setDocuments] = useState<File[]>([]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setDocuments(Array.from(e.target.files));
		}
	};

	const resetForm = () => {
		setDate(new Date().toISOString().split('T')[0]);
		setSupplierId(defaultSupplierId);
		setDescription('');
		setCost('');
		setCostType('Self');
		setDocuments([]);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!date || !supplierId || !cost) {
			toast({
				title: 'Validation Error',
				description: 'Date, Supplier, and Cost are required.',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);
		try {
			let reportUrl = '';
			if (documents.length > 0) {
				const uploadResult = await apiClient.batchUploadFiles(
					documents,
					'repairs',
				);
				reportUrl = uploadResult.uploaded_files
					.map((r) => r.file_url)
					.join(',');
			}

			await apiClient.createVehicleRepairHistory(vehicleId, {
				vehicle_id: vehicleId,
				repair_date: date,
				supplier_id: supplierId,
				description: description,
				cost: parseFloat(cost),
				cost_type: costType,
				report_url: reportUrl || undefined,
			});

			toast({
				title: 'Success',
				description: 'Repair record added successfully.',
			});

			resetForm();
			onOpenChange(false);
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Failed to add repair record:', error);
			toast({
				title: 'Error',
				description: 'Failed to add repair record.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) resetForm();
				onOpenChange(isOpen);
			}}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Add New Repair</DialogTitle>
					<DialogDescription>
						Record a repair event including supplier, cost, and
						supporting documents.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid grid-cols-1 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='repair-date'>Date *</Label>
							<Input
								id='repair-date'
								type='date'
								value={date}
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label>Supplier *</Label>
							<RepairSupplierSelect
								value={supplierId}
								onValueChange={setSupplierId}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='repair-cost-type'>Paid by *</Label>
							<Select value={costType} onValueChange={setCostType}>
								<SelectTrigger id='repair-cost-type'>
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
							<Label htmlFor='repair-cost'> Cost *</Label>
							<Input
								id='repair-cost'
								type='number'
								step='0.01'
								placeholder='0.00'
								value={cost}
								onChange={(e) => setCost(e.target.value)}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='repair-docs'>Documents</Label>
							<div className='flex items-center gap-2'>
								<Input
									id='repair-docs'
									type='file'
									multiple
									onChange={handleFileChange}
									className='cursor-pointer'
									accept='.pdf,.png,.jpg,.jpeg,.doc,.docx'
								/>
							</div>
							{documents.length > 0 && (
								<p className='text-xs text-muted-foreground mt-1'>
									{documents.length} file(s) selected
								</p>
							)}
						</div>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='repair-desc'>Description</Label>
						<Textarea
							id='repair-desc'
							placeholder='Details of the repair work done...'
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								resetForm();
								onOpenChange(false);
							}}
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
								'Save Repair Record'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
