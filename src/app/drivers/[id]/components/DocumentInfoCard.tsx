'use client';

import { CalendarIcon, FileText, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { handleApiError, notify } from '@/lib/notifications';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import FilePreviewDialog from './FilePreviewDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface DocumentInfoCardProps {
	type: 'license' | 'visa';
	title: string;
	driver: any;
	editedDriver: any;
	isLoading: boolean;
	isEditing: boolean;
	getStatusBadge: (expiryDate: string) => JSX.Element;
	onEdit: (field: string, value: string) => void;
	onDeleteFile?: (type: 'license' | 'visa', fileUrl: string) => Promise<void>;
	onUpload?: (
		type: 'license' | 'visa',
		file: File | null,
		expiryDate: string,
		documentNumber?: string,
	) => Promise<void>;
}

export function DocumentInfoCard({
	type,
	title,
	driver,
	editedDriver,
	isLoading,
	isEditing,
	getStatusBadge,
	onEdit,
	onDeleteFile,
	onUpload,
}: DocumentInfoCardProps) {
	const documentNumber =
		type === 'license' ? driver?.license_number : driver?.visa_number;
	const expiryDate =
		type === 'license'
			? driver?.license_expiry_date
			: driver?.visa_expiry_date;
	const fileUrls =
		type === 'license' ? driver?.license_file_url : driver?.visa_file_url;

	const editedDocNumber =
		type === 'license'
			? editedDriver?.license_number
			: editedDriver?.visa_number;
	const editedExpiryDate =
		type === 'license'
			? editedDriver?.license_expiry_date
			: editedDriver?.visa_expiry_date;

	const docNumberField =
		type === 'license' ? 'license_number' : 'visa_number';
	const expiryDateField =
		type === 'license' ? 'license_expiry_date' : 'visa_expiry_date';

	// Local state for calendar date
	const [calendarDate, setCalendarDate] = useState<Date | undefined>(
		editedExpiryDate ? new Date(editedExpiryDate) : undefined,
	);

	// Preview dialog state
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewError, setPreviewError] = useState(false);

	// Delete state
	const [deletingFileUrl, setDeletingFileUrl] = useState<string | null>(null);

	// Upload state
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync calendar date when editedDriver changes
	useEffect(() => {
		if (editedExpiryDate) {
			setCalendarDate(new Date(editedExpiryDate));
		} else {
			setCalendarDate(undefined);
		}
	}, [editedExpiryDate]);

	// Handle file preview
	const handlePreview = async (fileUrl: string) => {
		setPreviewOpen(true);
		setPreviewLoading(true);
		setPreviewError(false);

		try {
			// Extract file ID from URL (e.g., http://localhost:8000/api/v1/files/download/20 -> 20)
			const fileIdMatch = fileUrl.match(/\/files\/download\/(\d+)/);
			if (!fileIdMatch) {
				setPreviewError(true);
				setPreviewLoading(false);
				return;
			}

			const fileId = parseInt(fileIdMatch[1]);

			// Fetch file as blob with authentication
			const blob = await apiClient.viewFile(fileId);

			// Create object URL for preview
			const objectUrl = URL.createObjectURL(blob);
			setPreviewUrl(objectUrl);
			setPreviewLoading(false);
		} catch (error) {
			console.error('Failed to load preview:', error);
			setPreviewError(true);
			setPreviewLoading(false);
		}
	};

	// Clean up object URL when dialog closes
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	// Handle file delete
	const handleDelete = async (fileUrl: string) => {
		console.log('🗑️ Delete button clicked!', {
			type,
			fileUrl,
			hasHandler: !!onDeleteFile,
		});

		if (!onDeleteFile) {
			console.warn('⚠️ No onDeleteFile handler provided!');
			return;
		}

		try {
			console.log('⏳ Starting delete process...');
			setDeletingFileUrl(fileUrl);
			await onDeleteFile(type, fileUrl);
			console.log('✅ Delete completed successfully!');
		} catch (error) {
			console.error('❌ Failed to delete file:', error);
		} finally {
			setDeletingFileUrl(null);
		}
	};

	// Handle file upload
	const handleUpload = async () => {
		console.log('🔘 Upload button clicked for:', title, {
			type,
			expiryDate,
			documentNumber,
			hasFile: !!selectedFile,
		});

		if (!selectedFile) {
			console.warn('⚠️ No file selected');
			notify.error('Please select a file to upload');
			return;
		}

		if (!onUpload) {
			console.warn('⚠️ No onUpload handler provided!');
			return;
		}

		setIsUploading(true);
		console.log('⏳ Starting upload process...');
		try {
			// Convert Date to YYYY-MM-DD format for API (if provided)
			const existingExpiryDate =
				type === 'license'
					? driver?.license_expiry_date
					: driver?.visa_expiry_date;
			const expiryDateString = existingExpiryDate || '';
			console.log('📅 Expiry date:', expiryDateString);
			console.log('📤 Calling onUpload function...');
			await onUpload(
				type,
				selectedFile,
				expiryDateString,
				documentNumber,
			);
			console.log('✅ onUpload completed successfully');
			// Clear file input after successful upload
			setSelectedFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			notify.success(`${title} uploaded successfully!`);
		} catch (error: any) {
			console.error('❌ Upload failed:', error);
			handleApiError(error, `Failed to upload ${title}`);
		} finally {
			setIsUploading(false);
			console.log('🏁 Upload process finished');
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<FileText className='h-5 w-5' />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className='text-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto'></div>
						<p className='mt-2 text-sm text-gray-600'>Loading...</p>
					</div>
				) : (
					<div className='space-y-4'>
						{expiryDate && !isEditing && (
							<div className='flex items-center justify-between'>
								<Label>Status</Label>
								{getStatusBadge(expiryDate)}
							</div>
						)}
						{/* Document Number and Expiry Date in one row */}
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label>Document Number</Label>
								{isEditing ? (
									<Input
										value={editedDocNumber || ''}
										onChange={(e) => {
											console.log(
												`📝 ${type} document number changed:`,
												e.target.value,
											);
											onEdit(
												docNumberField,
												e.target.value,
											);
										}}
										placeholder={`Enter ${title.toLowerCase()} number`}
										className='mt-1'
									/>
								) : (
									<p className='text-gray-900 font-mono mt-1'>
										{documentNumber || '-'}
									</p>
								)}
							</div>
							<div>
								<Label>Expiry Date</Label>
								{isEditing ? (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'w-full justify-start text-left font-normal mt-1',
													!calendarDate &&
														'text-muted-foreground',
												)}>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{calendarDate ? (
													format(calendarDate, 'PPP')
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<Calendar
												mode='single'
												captionLayout='dropdown'
												fromYear={1900}
												toYear={2999}
												classNames={{
													caption:
														'flex items-center justify-center gap-2 pt-1',
													caption_label: 'hidden', // ❗只对 dropdown 隐藏 label
													vhidden: 'hidden', // ❗把 rdp-vhidden 隐藏掉
												}}
												selected={calendarDate}
												onSelect={(date) => {
													setCalendarDate(date);
													if (date) {
														const formattedDate =
															format(
																date,
																'yyyy-MM-dd',
															);
														console.log(
															`📅 ${type} expiry date changed:`,
															formattedDate,
														);
														onEdit(
															expiryDateField,
															formattedDate,
														);
													}
												}}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								) : (
									<p className='text-gray-900 mt-1'>
										{expiryDate
											? new Date(
													expiryDate,
												).toLocaleDateString()
											: '-'}
									</p>
								)}
							</div>
						</div>
						<div>
							<Label>
								Uploaded Files ({fileUrls?.length || 0})
							</Label>
							{fileUrls && fileUrls.length > 0 ? (
								<div className='space-y-2 mt-2'>
									{fileUrls.map(
										(url: string, index: number) => (
											<div
												key={index}
												className='flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200 hover:border-indigo-300 transition-colors'>
												<div className='flex items-center gap-2 flex-1 min-w-0'>
													<FileText className='h-4 w-4 text-gray-500 shrink-0' />
													<button
														onClick={() =>
															handlePreview(url)
														}
														className='text-indigo-600 hover:text-indigo-700 text-sm truncate flex-1 text-left'>
														File {index + 1}
													</button>
												</div>
												<div className='flex items-center gap-1 shrink-0 ml-2'>
													{onDeleteFile && (
														<Button
															variant='ghost'
															size='sm'
															onClick={() =>
																handleDelete(
																	url,
																)
															}
															className='text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0'
															disabled={
																deletingFileUrl ===
																url
															}>
															{deletingFileUrl ===
															url ? (
																<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500'></div>
															) : (
																<Trash2 className='h-4 w-4' />
															)}
														</Button>
													)}
												</div>
											</div>
										),
									)}
								</div>
							) : (
								<p className='text-sm text-gray-500 mt-1'>
									No files uploaded
								</p>
							)}
						</div>

						{/* Upload Section */}
						{onUpload && (
							<div className='pt-4 border-t border-gray-200'>
								<Label className='text-sm'>
									Upload New File
								</Label>
								<Input
									ref={fileInputRef}
									type='file'
									onChange={(e) =>
										setSelectedFile(
											e.target.files?.[0] || null,
										)
									}
									accept='image/*,.pdf'
									className='mt-1'
								/>
								{selectedFile && (
									<p className='text-xs text-green-600 mt-1 flex items-center gap-1'>
										<FileText className='h-3 w-3' />
										{selectedFile.name}
									</p>
								)}
								<Button
									onClick={() => {
										console.log(
											`🖱️ Button clicked - ${type}:`,
											{
												selectedFile,
												isDisabled:
													!selectedFile ||
													isUploading,
												isUploading,
												hasFile: !!selectedFile,
											},
										);
										handleUpload();
									}}
									disabled={!selectedFile || isUploading}
									className='w-full mt-2 bg-blue-700 hover:bg-blue-800'>
									{isUploading ? (
										<>
											<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
											Uploading...
										</>
									) : (
										<>
											<Upload className='h-4 w-4 mr-2' />
											{fileUrls && fileUrls.length > 0
												? 'Add File'
												: 'Upload File'}
										</>
									)}
								</Button>
							</div>
						)}
					</div>
				)}
			</CardContent>

			{/* Preview Dialog */}
			<FilePreviewDialog
				previewOpen={previewOpen}
				setPreviewOpen={setPreviewOpen}
				previewLoading={previewLoading}
				previewError={previewError}
				previewUrl={previewUrl}
				setPreviewError={setPreviewError}
			/>
		</Card>
	);
}
