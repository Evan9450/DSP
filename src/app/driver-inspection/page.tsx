'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, Check, LogOut, AlertCircle, Gauge } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { VehicleInspectionStatus } from '@/types/schedule';

export default function DriverInspectionPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [driverName, setDriverName] = useState('');
	const [photos, setPhotos] = useState<File[]>([]);
	const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
	const [odometer, setOdometer] = useState('');
	const [status, setStatus] = useState<VehicleInspectionStatus>('normal');
	const [notes, setNotes] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Check if driver is logged in
		const name = sessionStorage.getItem('driverName');
		if (!name) {
			router.push('/driver-login');
			return;
		}
		setDriverName(name);
	}, [router]);

	const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Limit to 6 photos
		const newPhotos = [...photos, ...files].slice(0, 6);
		setPhotos(newPhotos);

		// Create previews
		const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
		setPhotoPreviews(newPreviews);
	};

	const handleRemovePhoto = (index: number) => {
		const newPhotos = photos.filter((_, i) => i !== index);
		const newPreviews = photoPreviews.filter((_, i) => i !== index);
		setPhotos(newPhotos);
		setPhotoPreviews(newPreviews);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (photos.length === 0) {
			toast({
				title: 'Photos Required',
				description: 'Please upload at least one photo of the vehicle',
				variant: 'destructive'
			});
			return;
		}

		if (!odometer) {
			toast({
				title: 'Odometer Required',
				description: 'Please enter the current odometer reading',
				variant: 'destructive'
			});
			return;
		}

		setIsSubmitting(true);

		// Simulate upload
		await new Promise(resolve => setTimeout(resolve, 2000));

		toast({
			title: 'Inspection Submitted',
			description: 'Your vehicle inspection has been submitted successfully',
		});

		// Reset form
		setPhotos([]);
		setPhotoPreviews([]);
		setOdometer('');
		setStatus('normal');
		setNotes('');

		setIsSubmitting(false);
	};

	const handleLogout = () => {
		sessionStorage.clear();
		router.push('/driver-login');
	};

	const statusOptions = [
		{ value: 'normal' as VehicleInspectionStatus, label: 'Normal - Ready to Go', color: 'bg-green-500' },
		{ value: 'has-issues' as VehicleInspectionStatus, label: 'Has Issues - Minor Problems', color: 'bg-yellow-500' },
		{ value: 'needs-repair' as VehicleInspectionStatus, label: 'Needs Repair - Cannot Drive', color: 'bg-red-500' },
	];

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 py-6 max-w-2xl'>
				{/* Header */}
				<div className='flex items-center justify-between mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>Vehicle Inspection</h1>
						<p className='text-sm text-gray-600 mt-1'>Welcome, {driverName}</p>
					</div>
					<Button variant='outline' onClick={handleLogout} size='sm'>
						<LogOut className='h-4 w-4 mr-2' />
						Logout
					</Button>
				</div>

				{/* Info Card */}
				<Card className='p-4 mb-6 bg-blue-50 border-blue-200'>
					<div className='flex items-start gap-3'>
						<AlertCircle className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
						<div>
							<p className='text-sm font-medium text-blue-900'>Daily Vehicle Inspection</p>
							<p className='text-xs text-blue-700 mt-1'>
								Complete this inspection before starting your shift. Take photos of all sides of the vehicle and record the odometer reading.
							</p>
						</div>
					</div>
				</Card>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Photo Upload Section */}
					<Card className='p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
							<Camera className='h-5 w-5 text-blue-600' />
							Vehicle Photos (Required)
						</h3>

						<div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4'>
							{photoPreviews.map((preview, index) => (
								<div key={index} className='relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200'>
									<img
										src={preview}
										alt={`Vehicle photo ${index + 1}`}
										className='w-full h-full object-cover'
									/>
									<button
										type='button'
										onClick={() => handleRemovePhoto(index)}
										className='absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700'
									>
										<X className='h-4 w-4' />
									</button>
								</div>
							))}

							{photos.length < 6 && (
								<label className='aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors'>
									<Upload className='h-8 w-8 text-gray-400' />
									<span className='text-xs text-gray-600 text-center px-2'>
										{photos.length === 0 ? 'Add Photos' : 'Add More'}
									</span>
									<input
										type='file'
										accept='image/*'
										capture='environment'
										multiple
										onChange={handlePhotoSelect}
										className='hidden'
									/>
								</label>
							)}
						</div>

						<p className='text-xs text-gray-500'>
							{photos.length} of 6 photos uploaded
						</p>
					</Card>

					{/* Odometer Section */}
					<Card className='p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
							<Gauge className='h-5 w-5 text-blue-600' />
							Odometer Reading (Required)
						</h3>
						<Input
							type='number'
							placeholder='Enter current odometer reading'
							value={odometer}
							onChange={(e) => setOdometer(e.target.value)}
							className='text-lg'
							min='0'
							required
						/>
						<p className='text-xs text-gray-500 mt-2'>Enter the current mileage shown on the vehicle odometer</p>
					</Card>

					{/* Vehicle Status Section */}
					<Card className='p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Vehicle Condition (Required)
						</h3>
						<div className='space-y-3'>
							{statusOptions.map((option) => (
								<label
									key={option.value}
									className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
										status === option.value
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:border-gray-300'
									}`}
								>
									<input
										type='radio'
										name='status'
										value={option.value}
										checked={status === option.value}
										onChange={(e) => setStatus(e.target.value as VehicleInspectionStatus)}
										className='hidden'
									/>
									<div className={`w-4 h-4 rounded-full ${option.color}`}></div>
									<span className='flex-1 font-medium text-gray-900'>{option.label}</span>
									{status === option.value && (
										<Check className='h-5 w-5 text-blue-600' />
									)}
								</label>
							))}
						</div>
					</Card>

					{/* Notes Section */}
					<Card className='p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Additional Notes (Optional)
						</h3>
						<Textarea
							placeholder='Add any additional comments about the vehicle condition...'
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={4}
							className='resize-none'
						/>
					</Card>

					{/* Submit Button */}
					<Button
						type='submit'
						className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg'
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting Inspection...' : 'Submit Inspection'}
					</Button>
				</form>

				<p className='text-xs text-center text-gray-500 mt-6'>
					You can update today's inspection multiple times before your shift ends
				</p>
			</div>
		</div>
	);
}
