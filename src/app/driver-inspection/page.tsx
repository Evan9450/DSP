'use client';

import {
	AlertCircle,
	Calendar,
	Camera,
	Clock,
	Gauge,
	LogOut,
	MapPin,
	Truck,
	Upload,
	X,
} from 'lucide-react';
import type {
	InspectionInfo,
	ScheduleInfo,
	TodayInfoResponse,
} from '@/lib/api/driver-client';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { driverApiClient } from '@/lib/api/driver-client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function DriverInspectionPage() {
	const router = useRouter();
	const { toast } = useToast();

	console.log('🟢 DriverInspectionPage component rendering');

	// Authentication State
	const [driverName, setDriverName] = useState('');
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// Today's Data State
	const [todayInfo, setTodayInfo] = useState<TodayInfoResponse | null>(null);
	const [schedule, setSchedule] = useState<ScheduleInfo | null>(null);
	const [existingInspection, setExistingInspection] =
		useState<InspectionInfo | null>(null);
	const [mode, setMode] = useState<'create' | 'edit' | 'loading'>('loading');

	// Form State
	const [mileage, setMileage] = useState('');
	const [notes, setNotes] = useState('');

	// Photo State - New Files
	const [newFiles, setNewFiles] = useState<File[]>([]);
	const [newFilesPreviews, setNewFilesPreviews] = useState<string[]>([]);

	// Photo State - Existing URLs (edit mode only)
	const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);

	// UI State
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');

	// ========================================================================
	// Initialization
	// ========================================================================

	useEffect(() => {
		initializePage();
	}, []);

	// Cleanup previews on unmount
	useEffect(() => {
		return () => {
			newFilesPreviews.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [newFilesPreviews]);

	const initializePage = async () => {
		try {
			// Check authentication
			if (!driverApiClient.isAuthenticated()) {
				router.push('/driver-login');
				return;
			}

			// Get driver info
			const currentDriver = driverApiClient.getCurrentDriver();
			if (!currentDriver) {
				router.push('/driver-login');
				return;
			}

			setDriverName(currentDriver.name);
			setIsAuthenticated(true);

			// Load today's data
			await loadTodayData();
		} catch (error) {
			console.error('❌ Initialization error:', error);
			toast({
				title: 'Error',
				description: 'Failed to load data. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const loadTodayData = async () => {
		try {
			const data = await driverApiClient.getTodayInfo();
			setTodayInfo(data);
			setSchedule(data.schedule);
			setExistingInspection(data.existing_inspection);

			// Determine mode
			if (data.existing_inspection) {
				// Edit mode
				setMode('edit');
				setMileage(
					data.existing_inspection.mileage_at_inspection.toString(),
				);
				setNotes(data.existing_inspection.notes || '');
				setExistingPhotoUrls(
					data.existing_inspection.inspection_urls || [],
				);
			} else {
				// Create mode
				setMode('create');
			}
		} catch (error) {
			console.error('❌ Failed to load today data:', error);
			throw error;
		}
	};

	// ========================================================================
	// Photo Handling
	// ========================================================================

	const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Check file size
		const maxSize = 10 * 1024 * 1024; // 10MB
		const oversizedFiles = files.filter((file) => file.size > maxSize);
		if (oversizedFiles.length > 0) {
			toast({
				title: 'File Too Large',
				description: 'Maximum file size is 10MB per photo',
				variant: 'destructive',
			});
			return;
		}

		// Add new files
		const updatedFiles = [...newFiles, ...files];
		setNewFiles(updatedFiles);

		// Generate previews
		const newPreviews = files.map((file) => URL.createObjectURL(file));
		setNewFilesPreviews([...newFilesPreviews, ...newPreviews]);

		// Clear submit error when user adds photos
		if (submitError) setSubmitError('');
	};

	const handleRemoveNewPhoto = (index: number) => {
		// Revoke object URL
		URL.revokeObjectURL(newFilesPreviews[index]);

		// Remove from arrays
		setNewFiles(newFiles.filter((_, i) => i !== index));
		setNewFilesPreviews(newFilesPreviews.filter((_, i) => i !== index));
	};

	const handleRemoveExistingPhoto = (url: string) => {
		setExistingPhotoUrls(existingPhotoUrls.filter((u) => u !== url));
	};

	// ========================================================================
	// Form Submission
	// ========================================================================

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(''); // Clear previous errors

		console.log('🔵 handleSubmit called');
		console.log('Mode:', mode);
		console.log('Existing photos:', existingPhotoUrls.length);
		console.log('New files:', newFiles.length);
		console.log('Mileage:', mileage);
		console.log('Schedule vehicle_id:', schedule?.vehicle_id);

		// Validation
		const totalPhotos = existingPhotoUrls.length + newFiles.length;
		if (totalPhotos === 0) {
			console.log('❌ Validation failed: No photos');
			const errorMsg = 'Please upload at least one photo of the vehicle';
			setSubmitError(errorMsg);
			toast({
				title: 'Photos Required',
				description: errorMsg,
				variant: 'destructive',
			});
			return;
		}

		if (!mileage || parseInt(mileage) <= 0) {
			console.log('❌ Validation failed: Invalid mileage');
			const errorMsg = 'Please enter a valid odometer reading';
			setSubmitError(errorMsg);
			toast({
				title: 'Mileage Required',
				description: errorMsg,
				variant: 'destructive',
			});
			return;
		}

		// Only validate vehicle_id in create mode (update mode doesn't need it)
		if (
			mode === 'create' &&
			(!schedule?.vehicle_id || schedule.vehicle_id === null)
		) {
			console.log('❌ Validation failed: No vehicle_id');
			const errorMsg =
				'ERROR: No vehicle assigned in your schedule. Please contact your manager to assign a vehicle before submitting inspection.';
			setSubmitError(errorMsg);
			toast({
				title: 'Vehicle Not Assigned',
				description: errorMsg,
				variant: 'destructive',
			});
			return;
		}

		console.log('✅ Validation passed, starting submission...');
		setIsSubmitting(true);

		try {
			let finalPhotoUrls = [...existingPhotoUrls];
			console.log('📤 Starting upload process...');

			// Step 1: Upload new photos if any
			if (newFiles.length > 0) {
				console.log(`📸 Uploading ${newFiles.length} new photos...`);
				const uploadedFiles = await driverApiClient.batchUploadFiles(
					newFiles,
					`inspections/${format(new Date(), 'yyyy-MM-dd')}`,
				);
				console.log('✅ Photos uploaded:', uploadedFiles);

				const newPhotoUrls = uploadedFiles.map((file) => file.file_url);
				finalPhotoUrls = [...finalPhotoUrls, ...newPhotoUrls];
			} else {
				console.log('ℹ️ No new photos to upload');
			}

			console.log('📋 Final photo URLs:', finalPhotoUrls);

			// Step 2: Create or Update inspection
			if (mode === 'create') {
				console.log('🆕 Creating new inspection...');

				// Type safety check (should already be validated above)
				if (!schedule?.vehicle_id || schedule.vehicle_id === null) {
					throw new Error(
						'No vehicle_id available for creating inspection',
					);
				}

				const payload = {
					vehicle_id: schedule.vehicle_id,
					mileage_at_inspection: parseInt(mileage),
					inspection_urls: finalPhotoUrls,
					notes: notes.trim() || undefined,
				};
				console.log('Payload:', payload);

				await driverApiClient.createInspection(payload);
				console.log('✅ Inspection created');

				setSubmitError(''); // Clear any previous errors
				toast({
					title: 'Inspection Submitted',
					description:
						'Your vehicle inspection has been submitted successfully',
				});
			} else {
				console.log('✏️ Updating existing inspection...');
				const payload = {
					mileage_at_inspection: parseInt(mileage),
					inspection_urls: finalPhotoUrls,
					notes: notes.trim() || undefined,
				};
				console.log('Payload:', payload);

				await driverApiClient.updateInspection(payload);
				console.log('✅ Inspection updated');

				setSubmitError(''); // Clear any previous errors
				toast({
					title: 'Inspection Updated',
					description:
						'Your inspection has been updated successfully',
				});
			}

			// Step 3: Reload data
			console.log('🔄 Reloading today data...');
			await loadTodayData();
			console.log('✅ Data reloaded');

			// Clear new files
			console.log('🧹 Cleaning up...');
			newFilesPreviews.forEach((url) => URL.revokeObjectURL(url));
			setNewFiles([]);
			setNewFilesPreviews([]);
			console.log('✅ Cleanup complete');
		} catch (error: any) {
			console.error('❌ Submission error:', error);
			console.error('Error details:', {
				message: error.message,
				response: error.response,
				status: error.response?.status,
				data: error.response?.data,
			});

			const errorMsg =
				error.response?.data?.detail ||
				error.message ||
				'Failed to submit inspection. Please try again.';

			setSubmitError(errorMsg);
			toast({
				title: 'Submission Failed',
				description: errorMsg,
				variant: 'destructive',
			});
		} finally {
			console.log('🏁 Finally block - resetting isSubmitting');
			setIsSubmitting(false);
		}
	};

	const handleLogout = () => {
		driverApiClient.logout();
	};

	// ========================================================================
	// Format Time Helper
	// ========================================================================

	const formatTime = (timeStr: string) => {
		if (!timeStr) return '';
		try {
			const timePart = timeStr.split('T')[1]?.split(/[+-]/)[0];
			if (!timePart) return timeStr;

			const [hoursStr, minutesStr] = timePart.split(':');
			const hours = parseInt(hoursStr);
			const minutes = parseInt(minutesStr);

			const period = hours >= 12 ? 'PM' : 'AM';
			const displayHours =
				hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
			const displayMinutes = minutes.toString().padStart(2, '0');

			return `${displayHours}:${displayMinutes} ${period}`;
		} catch (error) {
			return timeStr;
		}
	};

	// ========================================================================
	// Render
	// ========================================================================

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading...</p>
				</div>
			</div>
		);
	}

	if (!schedule) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4'>
				<Card className='max-w-md p-8 text-center'>
					<AlertCircle className='h-12 w-12 text-red-600 mx-auto mb-4' />
					<h2 className='text-xl font-bold text-gray-900 mb-2'>
						No Schedule Found
					</h2>
					<p className='text-gray-600 mb-6'>
						You don't have a schedule for today. Please contact your
						manager.
					</p>
					<Button onClick={handleLogout} variant='outline'>
						<LogOut className='h-4 w-4 mr-2' />
						Logout
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 py-6 max-w-2xl'>
				{/* Header */}
				<div className='flex items-center justify-between mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>
							Vehicle Inspection
						</h1>
						<p className='text-sm text-gray-600 mt-1'>
							Welcome, {driverName}
						</p>
					</div>
					<Button variant='outline' onClick={handleLogout} size='sm'>
						<LogOut className='h-4 w-4 mr-2' />
						Logout
					</Button>
				</div>

				{/* Mode Indicator */}
				<div className='mb-4'>
					<Badge
						variant={mode === 'create' ? 'secondary' : 'default'}
						className='text-sm'>
						{mode === 'create'
							? 'New Inspection'
							: "Editing Today's Inspection"}
					</Badge>
				</div>

				{/* Schedule Information Card */}
				<Card className='p-6 mb-6 bg-white border-blue-200'>
					<h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
						<Calendar className='h-5 w-5 text-blue-600' />
						Today's Schedule
					</h3>
					<div className='space-y-3'>
						<div className='flex items-center gap-3'>
							<Truck className='h-5 w-5 text-gray-500' />
							<div>
								<p className='text-xs text-gray-500'>Vehicle</p>
								<p className='font-medium text-gray-900'>
									{schedule.vehicle_alias || 'Not assigned'}
								</p>
							</div>
						</div>
						{schedule.route && (
							<div className='flex items-center gap-3'>
								<MapPin className='h-5 w-5 text-gray-500' />
								<div>
									<p className='text-xs text-gray-500'>
										Route
									</p>
									<p className='font-medium text-gray-900'>
										{schedule.route}
									</p>
								</div>
							</div>
						)}
						{schedule.start_time && schedule.end_time && (
							<div className='flex items-center gap-3'>
								<Clock className='h-5 w-5 text-gray-500' />
								<div>
									<p className='text-xs text-gray-500'>
										Shift Time
									</p>
									<p className='font-medium text-gray-900'>
										{formatTime(schedule.start_time)} -{' '}
										{formatTime(schedule.end_time)}
									</p>
								</div>
							</div>
						)}
					</div>
				</Card>

				{/* Inspection Form */}
				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Photo Upload Section */}
					<Card className='p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
							<Camera className='h-5 w-5 text-blue-600' />
							Vehicle Photos (Required)
						</h3>

						<div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4'>
							{/* Existing Photos (Edit Mode) */}
							{existingPhotoUrls.map((url, index) => (
								<div
									key={`existing-${index}`}
									className='relative aspect-square rounded-lg overflow-hidden border-2 border-green-300'>
									<img
										src={url}
										alt={`Saved photo ${index + 1}`}
										className='w-full h-full object-cover'
									/>
									<Badge className='absolute top-2 left-2 bg-green-600 text-white text-xs'>
										Saved
									</Badge>
									<button
										type='button'
										onClick={() =>
											handleRemoveExistingPhoto(url)
										}
										className='absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700'>
										<X className='h-4 w-4' />
									</button>
								</div>
							))}

							{/* New Photos */}
							{newFilesPreviews.map((preview, index) => (
								<div
									key={`new-${index}`}
									className='relative aspect-square rounded-lg overflow-hidden border-2 border-blue-300'>
									<img
										src={preview}
										alt={`New photo ${index + 1}`}
										className='w-full h-full object-cover'
									/>
									<Badge className='absolute top-2 left-2 bg-blue-600 text-white text-xs'>
										New
									</Badge>
									<button
										type='button'
										onClick={() =>
											handleRemoveNewPhoto(index)
										}
										className='absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700'>
										<X className='h-4 w-4' />
									</button>
								</div>
							))}

							{/* Take Photo Button (Mobile Camera) */}
							<label className='aspect-square rounded-lg border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors'>
								<Camera className='h-8 w-8 text-blue-600' />
								<span className='text-xs text-blue-700 font-medium text-center px-2'>
									Take Photo
								</span>
								<input
									type='file'
									accept='image/*'
									capture='environment'
									multiple
									onChange={handleAddPhotos}
									className='hidden'
								/>
							</label>

							{/* Choose from Gallery Button */}
							<label className='aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors'>
								<Upload className='h-8 w-8 text-gray-400' />
								<span className='text-xs text-gray-600 text-center px-2'>
									From Gallery
								</span>
								<input
									type='file'
									accept='image/*'
									multiple
									onChange={handleAddPhotos}
									className='hidden'
								/>
							</label>
						</div>

						<p className='text-xs text-gray-500'>
							Total: {existingPhotoUrls.length + newFiles.length}{' '}
							photos
							{newFiles.length > 0 && ` (${newFiles.length} new)`}
						</p>
					</Card>

					{/* Mileage Section */}
					<Card className='p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
							<Gauge className='h-5 w-5 text-blue-600' />
							Odometer Reading (Required)
						</h3>
						<Input
							type='number'
							placeholder='Enter current odometer reading'
							value={mileage}
							onChange={(e) => {
								setMileage(e.target.value);
								if (submitError) setSubmitError('');
							}}
							className='text-lg'
							min='0'
							required
						/>
						<p className='text-xs text-gray-500 mt-2'>
							Enter the current mileage shown on the vehicle
							odometer
						</p>
					</Card>

					{/* Notes Section */}
					<Card className='p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Additional Notes (Optional)
						</h3>
						<Textarea
							placeholder='Add any issues, observations, or comments about the vehicle...'
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={4}
							className='resize-none'
							maxLength={500}
						/>
						<p className='text-xs text-gray-500 mt-2'>
							{notes.length}/500 characters
						</p>
					</Card>

					{/* Error Display */}
					{submitError && (
						<div className='flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg'>
							<AlertCircle className='h-6 w-6 text-red-600 flex-shrink-0 mt-0.5' />
							<div>
								<p className='font-semibold text-red-900 mb-1'>
									Submission Error
								</p>
								<p className='text-sm text-red-700'>
									{submitError}
								</p>
							</div>
						</div>
					)}

					{/* Submit Button */}
					<Button
						type='submit'
						onClick={(e) => {
							console.log(
								'🟡 Button clicked! Event type:',
								e.type,
							);
							console.log(
								'Current state - isSubmitting:',
								isSubmitting,
							);
							console.log('Current state - mode:', mode);
						}}
						className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg'
						disabled={isSubmitting}>
						{isSubmitting
							? 'Submitting...'
							: mode === 'create'
								? 'Submit Inspection'
								: 'Update Inspection'}
					</Button>
				</form>

				<p className='text-xs text-center text-gray-500 mt-6'>
					You can update today's inspection multiple times before your
					shift ends
				</p>
			</div>
		</div>
	);
}
