'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { notify, handleApiError } from '@/lib/notifications';

export interface DocumentUploadCardProps {
	type: 'license' | 'visa';
	title: string;
	driver: any;
	onUpload: (
		type: 'license' | 'visa',
		file: File | null,
		expiryDate: string,
		documentNumber?: string
	) => Promise<void>;
}

export function DocumentUploadCard({
	type,
	title,
	driver,
	onUpload,
}: DocumentUploadCardProps) {
	const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
	const [documentNumber, setDocumentNumber] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (driver) {
			const existingExpiryDate =
				type === 'license'
					? driver.license_expiry_date
					: driver.visa_expiry_date;
			const existingDocNumber =
				type === 'license' ? driver.license_number : driver.visa_number;

			console.log(
				`📋 DocumentUploadCard (${type}) - Loading existing data:`,
				{
					existingExpiryDate,
					existingDocNumber,
					driver_id: driver.id,
				}
			);

			// Always update state, even if values are empty/undefined
			setExpiryDate(
				existingExpiryDate ? new Date(existingExpiryDate) : undefined
			);
			setDocumentNumber(existingDocNumber || '');
		}
	}, [driver, type]);

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

		setIsUploading(true);
		console.log('⏳ Starting upload process...');
		try {
			// Convert Date to YYYY-MM-DD format for API (if provided)
			const expiryDateString = expiryDate ? format(expiryDate, 'yyyy-MM-dd') : '';
			console.log('📅 Expiry date formatted:', expiryDateString);
			console.log('📤 Calling onUpload function...');
			await onUpload(
				type,
				selectedFile,
				expiryDateString,
				documentNumber
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
					<Upload className='h-5 w-5' />
					{driver &&
					(type === 'license'
						? driver.license_expiry_date
						: driver.visa_expiry_date)
						? 'Update'
						: 'Upload'}{' '}
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					<div>
						<Label className='text-sm'>
							Upload File (Optional)
						</Label>
						<Input
							ref={fileInputRef}
							type='file'
							onChange={(e) =>
								setSelectedFile(e.target.files?.[0] || null)
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
					</div>
					<Button
						onClick={() => {
							console.log(`🖱️ Button clicked - ${type}:`, {
								selectedFile,
								isDisabled: !selectedFile || isUploading,
								isUploading,
								hasFile: !!selectedFile,
							});
							handleUpload();
						}}
						disabled={!selectedFile || isUploading}
						className='w-full bg-blue-700 hover:bg-blue-800'>
						{isUploading ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
								Uploading...
							</>
						) : (
							<>
								<Upload className='h-4 w-4 mr-2' />
								{driver &&
								(type === 'license'
									? driver.license_expiry_date
									: driver.visa_expiry_date)
									? 'Update'
									: 'Upload'}{' '}
								{title}
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
