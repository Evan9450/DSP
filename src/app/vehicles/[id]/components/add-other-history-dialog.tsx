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
import { apiClient, TokenManager } from '@/lib/api/client';
import { Loader2, X } from 'lucide-react';
import FilePreviewDialog from '@/components/FilePreviewDialog';
import { handleFileAction } from '@/lib/file-utils';
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
	const [documents, setDocuments] = useState<File[]>([]);
	const [reportUrl, setReportUrl] = useState('');
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewError, setPreviewError] = useState(false);

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

	const handlePreview = (url: string) => {
		const filename = url.split('/').pop() || 'document';
		handleFileAction(
			url,
			filename,
			setPreviewUrl,
			setPreviewOpen,
			setPreviewLoading,
			setPreviewError,
		);
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
					'other',
				);
				const newUrls = uploadResult.uploaded_files
					.map((r) => r.file_url)
					.join(',');
				finalReportUrl = finalReportUrl
					? `${finalReportUrl},${newUrls}`
					: newUrls;
			}

			await apiClient.createVehicleOtherHistory(vehicleId, {
				vehicle_id: vehicleId,
				other_date: date,
				description,
				cost: cost ? parseFloat(cost) : null,
				cost_type: costType,
				report_url: finalReportUrl || null,
			});

			toast({
				title: 'Success',
				description: 'Other history record added successfully.',
			});

			// Reset form
			setDescription('');
			setCost('');
			setCostType('Self');
			setDocuments([]);
			setReportUrl('');

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
						<Label htmlFor='other-cost-type'>Paid by *</Label>
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
						<Label htmlFor='other-description'>Description *</Label>
						<Textarea
							id='other-description'
							placeholder='Reason for cost...'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='other-docs'>Documents</Label>
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
												<button
													type='button'
													onClick={() => handlePreview(url)}
													className='text-blue-500 hover:underline inline-block truncate max-w-[150px] text-xs'
													title={decodeURI(url.split('/').pop() || '')}>
													{decodeURI(url.split('/').pop() || '') ||
														`Document ${i + 1}`}
												</button>
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
							id='other-docs'
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
								'Save Record'
							)}
						</Button>
					</DialogFooter>
				</form>
				<FilePreviewDialog
					previewOpen={previewOpen}
					setPreviewOpen={setPreviewOpen}
					previewLoading={previewLoading}
					previewError={previewError}
					previewUrl={previewUrl}
					setPreviewError={setPreviewError}
				/>
			</DialogContent>
		</Dialog>
	);
}
