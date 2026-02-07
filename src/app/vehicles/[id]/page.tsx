'use client';

import {
	ArrowLeft,
	Calendar as CalendarIcon,
	Car,
	Check,
	Edit,
	Mail,
	Trash2,
	Wrench,
	X,
} from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { DeleteVehicleDialog } from './components/delete-vehicle-dialog';
import { Input } from '@/components/ui/input';
import { InspectionHistory } from './components/inspection-history';
import { Label } from '@/components/ui/label';
import { MaintenanceCard } from './components/maintenance-card';
import { PhotoLightboxDialog } from '../components/photo-lightbox-dialog';
import { Textarea } from '@/components/ui/textarea';
import { VehicleDetailResponse } from '@/lib/api/client';
import { VehicleInfoCard } from './components/vehicle-info-card';
import { apiClient } from '@/lib/api/client';
import { format } from 'date-fns';
import {
	apiConditionToString,
	getDaysUntilMaintenance,
	isMaintenanceDueSoon,
	isMaintenanceOverdue,
} from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { use } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

export default function VehicleDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	// Resolve async params using React's use() hook (Next.js 15+)
	const resolvedParams = use(params);

	const router = useRouter();
	const { toast } = useToast();
	const [vehicle, setVehicle] = useState<VehicleDetailResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [editForm, setEditForm] = useState<Partial<VehicleDetailResponse>>(
		{},
	);
	const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
		null,
	);
	const [isSendingEmail, setIsSendingEmail] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	useEffect(() => {
		console.log('🔍 Vehicle Detail - Resolved params:', resolvedParams);
		console.log(
			'🔍 Vehicle Detail - params.id:',
			resolvedParams.id,
			'type:',
			typeof resolvedParams.id,
		);
		if (resolvedParams.id) {
			fetchVehicleDetail();
		}
	}, [resolvedParams.id]);

	// Keyboard navigation for photo viewer
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (selectedPhotoIndex === null) return;

			if (e.key === 'ArrowLeft') {
				handlePreviousPhoto();
			} else if (e.key === 'ArrowRight') {
				handleNextPhoto();
			} else if (e.key === 'Escape') {
				setSelectedPhotoIndex(null);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [selectedPhotoIndex]);

	const fetchVehicleDetail = async () => {
		try {
			setIsLoading(true);

			if (!resolvedParams.id) {
				throw new Error('No vehicle ID provided');
			}

			// Parse ID safely
			const vehicleId = parseInt(resolvedParams.id);
			console.log('📊 Parsing vehicle ID:', {
				raw: resolvedParams.id,
				rawType: typeof resolvedParams.id,
				parsed: vehicleId,
				isNaN: isNaN(vehicleId),
			});

			if (isNaN(vehicleId)) {
				throw new Error(`Invalid vehicle ID: ${resolvedParams.id}`);
			}

			const data = await apiClient.getVehicleDetail(vehicleId);
			setVehicle(data);
			setEditForm(data);
		} catch (error) {
			console.error('Unavailable to fetch vehicle detail:', error);
			toast({
				title: 'Error',
				description: 'Unavailable to load vehicle details.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleStartEdit = () => {
		setEditForm(vehicle || {});
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setEditForm(vehicle || {});
		setIsEditing(false);
	};

	const handleSaveEdit = async () => {
		if (!vehicle) return;

		setIsSaving(true);
		try {
			const updateData = {
				rego: editForm.rego,
				alias: editForm.alias,
				nickname: editForm.nickname,
				repair_supplier_id: editForm.repair_supplier_id,
				brand: editForm.brand,
				model: editForm.model,
				condition: editForm.condition,
				status: editForm.status,
				maintenance_cycle_days: editForm.maintenance_cycle_days,
				maintenance_cycle_mileage: editForm.maintenance_cycle_mileage,

				mileage: editForm.mileage,
				notes: editForm.notes,
				last_maintenance_date: editForm.last_maintenance_date,
				next_maintenance_date: editForm.next_maintenance_date,
				scheduled_maintenance_date: editForm.scheduled_maintenance_date,
				procession_date: editForm.procession_date,
			};
			console.log('💾 Full update payload:', updateData);
			const response = await apiClient.updateVehicle(
				vehicle.id,
				updateData,
			);
			console.log('✅ Backend response:', response);
			toast({
				title: 'Success',
				description: 'Vehicle updated successfully.',
			});
			setIsEditing(false);
			fetchVehicleDetail();
		} catch (error) {
			console.error('Unavailable to update vehicle:', error);
			toast({
				title: 'Error',
				description: 'Unavailable to update vehicle.',
				variant: 'destructive',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handlePhotoUpload = async (files: FileList | null) => {
		if (!files || files.length === 0 || !vehicle) return;

		setIsUploading(true);
		try {
			await apiClient.uploadVehiclePhotos(vehicle.id, Array.from(files));
			toast({
				title: 'Success',
				description: 'Photos uploaded successfully.',
			});
			fetchVehicleDetail();
		} catch (error) {
			console.error('Unavailable to upload photos:', error);
			toast({
				title: 'Error',
				description: 'Unavailable to upload photos.',
				variant: 'destructive',
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeletePhoto = async (photoIndex: number) => {
		if (!vehicle) return;

		try {
			await apiClient.deleteVehiclePhoto(vehicle.id, photoIndex);
			toast({
				title: 'Success',
				description: 'Photo deleted successfully.',
			});
			fetchVehicleDetail();
			setSelectedPhotoIndex(null);
		} catch (error) {
			console.error('Unavailable to delete photo:', error);
			toast({
				title: 'Error',
				description: 'Unavailable to delete photo.',
				variant: 'destructive',
			});
		}
	};

	const handlePreviousPhoto = () => {
		if (selectedPhotoIndex === null || !vehicle?.photo_urls) return;

		// Parse photo URLs to get count
		let photoCount = 0;
		try {
			const cleanedString = vehicle.photo_urls
				.replace(/\\n/g, '')
				.replace(/\n/g, '')
				.trim();
			const parsed = JSON.parse(cleanedString);
			photoCount = Array.isArray(parsed) ? parsed.length : 0;
		} catch {
			photoCount = 0;
		}

		setSelectedPhotoIndex((prev) =>
			prev === 0 ? photoCount - 1 : (prev || 0) - 1,
		);
	};

	const handleNextPhoto = () => {
		if (selectedPhotoIndex === null || !vehicle?.photo_urls) return;

		// Parse photo URLs to get count
		let photoCount = 0;
		try {
			const cleanedString = vehicle.photo_urls
				.replace(/\\n/g, '')
				.replace(/\n/g, '')
				.trim();
			const parsed = JSON.parse(cleanedString);
			photoCount = Array.isArray(parsed) ? parsed.length : 0;
		} catch {
			photoCount = 0;
		}

		setSelectedPhotoIndex((prev) =>
			prev === photoCount - 1 ? 0 : (prev || 0) + 1,
		);
	};

	const handleSendMaintenanceEmail = async () => {
		if (!vehicle) return;

		setIsSendingEmail(true);
		try {
			const result = await apiClient.sendMaintenanceEmail(vehicle.id);
			toast({
				title: 'Success',
				description:
					result.message || 'Maintenance email sent successfully.',
			});
		} catch (error: any) {
			console.error('Unavailable to send maintenance email:', error);
			const errorMessage =
				error.response?.data?.detail ||
				'Unavailable to send maintenance email.';
			toast({
				title: 'Error',
				description: errorMessage,
				variant: 'destructive',
			});
		} finally {
			setIsSendingEmail(false);
		}
	};

	const handleDeleteVehicle = async () => {
		if (!vehicle) return;

		try {
			await apiClient.deleteVehicle(vehicle.id);
			const vehicleRego = vehicle.rego;
			setShowDeleteDialog(false);
			toast({
				title: 'Success',
				description: `Vehicle ${vehicleRego} deleted successfully.`,
			});
			// Navigate back to vehicles list
			router.push('/vehicles');
		} catch (error) {
			console.error('Unavailable to delete vehicle:', error);
			toast({
				title: 'Error',
				description: `Unavailable to delete vehicle ${vehicle.rego}.`,
				variant: 'destructive',
			});
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>
						Loading vehicle details...
					</p>
				</div>
			</div>
		);
	}

	if (!vehicle) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<Car className='h-16 w-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 mb-2'>
						Vehicle Not Found
					</h2>
					<Button onClick={() => router.push('/vehicles')}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>
				</div>
			</div>
		);
	}

	const conditionStr = apiConditionToString(vehicle.condition);
	// vehicle.status is already a string: 'in-use' | 'not-in-use'
	const statusStr = vehicle.status;

	// Parse photo_urls from JSON string to array
	const photoUrls: string[] = vehicle.photo_urls
		? (() => {
				try {
					// First, clean up the JSON string structure
					let cleanedString = vehicle.photo_urls
						.replace(/\\n/g, '')
						.replace(/\n/g, '')
						.trim();

					// Parse the JSON
					const parsed = JSON.parse(cleanedString);

					// Clean up each URL by removing any remaining whitespace
					const cleanedUrls = Array.isArray(parsed)
						? parsed.map((url: string) => url.replace(/\s+/g, ''))
						: [];

					return cleanedUrls;
				} catch (error) {
					console.error('Unavailable to parse photo_urls:', error);
					console.log('Original photo_urls:', vehicle.photo_urls);
					return [];
				}
			})()
		: [];

	const statusConfig: Record<
		'in-use' | 'not-in-use',
		{ label: string; className: string }
	> = {
		'in-use': { label: 'In Use', className: 'bg-blue-600 text-white' },
		'not-in-use': {
			label: 'Not In Use',
			className: 'bg-gray-600 text-white',
		},
	};

	const conditionConfig = {
		green: {
			label: 'Available',
			className: 'bg-green-500',
			textClass: 'text-green-700',
		},
		yellow: {
			label: 'Needs Repair',
			className: 'bg-yellow-500',
			textClass: 'text-yellow-700',
		},
		red: {
			label: 'Unavailable',
			className: 'bg-red-500',
			textClass: 'text-red-700',
		},
	};

	// const maintenanceDays = vehicle.next_maintenance_date
	// 	? getDaysUntilMaintenance(new Date(vehicle.next_maintenance_date))
	// 	: null;
	// const isOverdue = vehicle.next_maintenance_date
	// 	? isMaintenanceOverdue(new Date(vehicle.next_maintenance_date))
	// 	: false;
	// const isDueSoon = vehicle.next_maintenance_date
	// 	? isMaintenanceDueSoon(new Date(vehicle.next_maintenance_date))
	// 	: false;

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='mb-6'>
					<Button
						variant='ghost'
						className='mb-4'
						onClick={() => router.push('/vehicles')}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>

					<div className='flex items-start justify-between'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900'>
								{vehicle.brand && vehicle.model
									? `${vehicle.brand} ${vehicle.model}`
									: vehicle.rego}
							</h1>
							<p className='text-gray-600 mt-1'>
								{vehicle.rego} • {vehicle.alias}
							</p>
						</div>
						<div className='flex gap-2'>
							{isEditing ? (
								<>
									<Button
										variant='outline'
										onClick={handleCancelEdit}
										disabled={isSaving}>
										<X className='h-4 w-4 mr-2' />
										Cancel
									</Button>
									<Button
										onClick={handleSaveEdit}
										disabled={isSaving}>
										<Check className='h-4 w-4 mr-2' />
										{isSaving
											? 'Saving...'
											: 'Save Changes'}
									</Button>
								</>
							) : (
								<>
									<Button onClick={handleStartEdit}>
										<Edit className='h-4 w-4 mr-2' />
										Edit
									</Button>
									<Button
										variant='outline'
										className='text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-300'
										onClick={() =>
											setShowDeleteDialog(true)
										}>
										<Trash2 className='h-4 w-4 mr-2' />
										Delete
									</Button>
								</>
							)}
						</div>
					</div>
				</div>


				<div className='grid grid-cols-1 gap-6'>
					{/* Main Info */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Basic Information */}
						<VehicleInfoCard
							vehicle={vehicle}
							isEditing={isEditing}
							editForm={editForm}
							setEditForm={setEditForm}
						/>

						{/* Maintenance Information */}
						<MaintenanceCard
							vehicle={vehicle}
							isEditing={isEditing}
							editForm={editForm}
							setEditForm={setEditForm}
						/>
						{/* Inspection History */}
						<InspectionHistory vehicle={vehicle} />
					</div>
				</div>

				{/* Photo Lightbox Dialog */}
				<PhotoLightboxDialog
					photoUrls={photoUrls}
					selectedPhotoIndex={selectedPhotoIndex}
					isEditing={isEditing}
					onClose={() => setSelectedPhotoIndex(null)}
					onPrevious={handlePreviousPhoto}
					onNext={handleNextPhoto}
					onDelete={handleDeletePhoto}
				/>
				<DeleteVehicleDialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}
					onConfirm={handleDeleteVehicle}
					vehicleRego={vehicle?.rego}
				/>
			</div>
		</div>
	);
}
