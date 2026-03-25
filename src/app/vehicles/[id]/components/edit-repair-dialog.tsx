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
import { RepairSupplierSelect } from './repair-supplier-select';
import { apiClient, type UnifiedHistoryItem } from '@/lib/api/client';
import { Loader2, X } from 'lucide-react';

interface EditRepairDialogProps {
	vehicleId: number;
	record: UnifiedHistoryItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function EditRepairDialog({
	vehicleId,
	record,
	open,
	onOpenChange,
	onSuccess,
}: EditRepairDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [date, setDate] = useState(record.date);
	const [description, setDescription] = useState(record.description ?? '');
	const [cost, setCost] = useState(record.cost ? String(record.cost) : '');
	const [supplierId, setSupplierId] = useState<number | undefined>(
		record.metadata?.supplier_id ?? undefined,
	);
	const [documents, setDocuments] = useState<File[]>([]);
	const [reportUrl, setReportUrl] = useState(record.action || '');

	// 当 record 变化时（打开新记录），重置表单
	useEffect(() => {
		setDate(record.date);
		setDescription(record.description ?? '');
		setCost(record.cost ? String(record.cost) : '');
		setSupplierId(record.metadata?.supplier_id ?? undefined);
		setReportUrl(record.report_url || record.action || '');
		setDocuments([]);
	}, [record]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setDocuments(Array.from(e.target.files));
		}
	};

	const handleRemoveUrl = (urlToRemove: string) => {
		const newUrls = reportUrl
			.split(',')
			.filter((url) => url !== urlToRemove)
			.join(',');
		setReportUrl(newUrls);
	};

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
			let finalReportUrl = reportUrl;
			if (documents.length > 0) {
				const uploadResult = await apiClient.batchUploadFiles(
					documents,
					'repairs',
				);
				const newUrls = uploadResult.uploaded_files
					.map((r) => r.file_url)
					.join(',');
				finalReportUrl = finalReportUrl
					? `${finalReportUrl},${newUrls}`
					: newUrls;
			}

			await apiClient.updateVehicleRepairHistory(vehicleId, record.id, {
				repair_date: date,
				supplier_id: supplierId ?? null,
				description: description || null,
				cost: cost ? parseFloat(cost) : null,
				report_url: finalReportUrl || null,
			});

			toast({
				title: 'Success',
				description: 'Repair record updated successfully.',
			});

			onOpenChange(false);
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Failed to update repair record:', error);
			toast({
				title: 'Error',
				description: 'Failed to update repair record.',
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
					<DialogTitle>Edit Repair Record</DialogTitle>
					<DialogDescription>
						Modify the existing repair record details.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid grid-cols-1 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='edit-repair-date'>Date *</Label>
							<Input
								id='edit-repair-date'
								type='date'
								value={date}
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label>Supplier</Label>
							<RepairSupplierSelect
								value={supplierId}
								onValueChange={setSupplierId}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-repair-cost'>Cost</Label>
							<Input
								id='edit-repair-cost'
								type='number'
								step='0.01'
								placeholder='0.00'
								value={cost}
								onChange={(e) => setCost(e.target.value)}
							/>
						</div>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='edit-repair-desc'>Description</Label>
						<Textarea
							id='edit-repair-desc'
							placeholder='Details of the repair work done...'
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='edit-repair-docs'>Documents</Label>
						{reportUrl && (
							<div className='mb-2 text-sm'>
								<div className='flex flex-wrap gap-2'>
									{reportUrl
										.split(',')
										.filter(Boolean)
										.map((url, i) => (
											<div
												key={i}
												className='flex items-center gap-1 bg-muted px-2 py-1 rounded-md'>
												<a
													href={url}
													target='_blank'
													rel='noopener noreferrer'
													className='text-blue-500 hover:underline inline-block truncate max-w-[150px] text-xs'
													title={url
														.split('/')
														.pop()}>
													{url.split('/').pop() ||
														`Document ${i + 1}`}
												</a>
												<button
													type='button'
													className='text-red-500 hover:text-red-700 p-0.5 rounded focus:outline-none'
													onClick={() =>
														handleRemoveUrl(url)
													}
													title='Remove Document'>
													<X className='h-3 w-3' />
												</button>
											</div>
										))}
								</div>
							</div>
						)}
						<Input
							id='edit-repair-docs'
							type='file'
							multiple
							onChange={handleFileChange}
							accept='.pdf,.png,.jpg,.jpeg,.doc,.docx'
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
