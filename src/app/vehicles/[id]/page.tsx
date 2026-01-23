'use client';

import {
	ArrowLeft,
	Calendar as CalendarIcon,
	Car,
	Check,
	CheckCircle2,
	Clock,
	Edit,
	Eye,
	FileText,
	Image as ImageIcon,
	Mail,
	MapPin,
	Package,
	Trash2,
	Upload,
	Wrench,
	X,
	XCircle,
} from 'lucide-react';
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { VehicleDetailResponse, apiClient } from '@/lib/api/client';
import {
	apiConditionToString,
	getDaysUntilMaintenance,
	isMaintenanceDueSoon,
	isMaintenanceOverdue,
} from '@/lib/helpers';
import { use, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhotoLightboxDialog } from '../components/photo-lightbox-dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

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
			console.error('Failed to fetch vehicle detail:', error);
			toast({
				title: 'Error',
				description: 'Failed to load vehicle details.',
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
				brand: editForm.brand,
				model: editForm.model,
				condition: editForm.condition,
				status: editForm.status,
				maintenance_cycle_days: editForm.maintenance_cycle_days,
				maintenance_location: editForm.maintenance_location,
				workshop_email: editForm.workshop_email,
				mileage: editForm.mileage,
				notes: editForm.notes,
				last_maintenance_date: editForm.last_maintenance_date,
				next_maintenance_date: editForm.next_maintenance_date,
				scheduled_maintenance_date: editForm.scheduled_maintenance_date,
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
			console.error('Failed to update vehicle:', error);
			toast({
				title: 'Error',
				description: 'Failed to update vehicle.',
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
			console.error('Failed to upload photos:', error);
			toast({
				title: 'Error',
				description: 'Failed to upload photos.',
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
			console.error('Failed to delete photo:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete photo.',
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
			console.error('Failed to send maintenance email:', error);
			const errorMessage =
				error.response?.data?.detail ||
				'Failed to send maintenance email.';
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
			console.error('Failed to delete vehicle:', error);
			toast({
				title: 'Error',
				description: `Failed to delete vehicle ${vehicle.rego}.`,
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
					console.error('Failed to parse photo_urls:', error);
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

	const maintenanceDays = vehicle.next_maintenance_date
		? getDaysUntilMaintenance(new Date(vehicle.next_maintenance_date))
		: null;
	const isOverdue = vehicle.next_maintenance_date
		? isMaintenanceOverdue(new Date(vehicle.next_maintenance_date))
		: false;
	const isDueSoon = vehicle.next_maintenance_date
		? isMaintenanceDueSoon(new Date(vehicle.next_maintenance_date))
		: false;

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

				{/* Maintenance Alert */}
				{/* {(isOverdue || isDueSoon) && (
					<Card className='mb-6 p-4 border-orange-200 bg-orange-50'>
						<div className='flex items-start gap-3'>
							<Wrench className='h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0' />
							<div className='flex-1'>
								<h3 className='font-semibold text-orange-900'>
									{isOverdue
										? 'Maintenance Overdue'
										: 'Maintenance Due Soon'}
								</h3>
								<p className='text-sm text-orange-700 mt-1'>
									{isOverdue
										? `Maintenance was due ${Math.abs(maintenanceDays || 0)} days ago`
										: `Maintenance due in ${maintenanceDays} days`}
								</p>
							</div>
						</div>
					</Card>
				)} */}

				<div className='grid grid-cols-1 gap-6'>
					{/* Main Info */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Basic Information */}
						<Card className='p-6'>
							<h2 className='text-xl font-semibold text-gray-900 mb-4'>
								Vehicle Information
							</h2>
							{isEditing ? (
								<div className='space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='edit-rego'>
												Registration
											</Label>
											<Input
												id='edit-rego'
												value={editForm.rego || ''}
												onChange={(e) =>
													setEditForm({
														...editForm,
														rego: e.target.value,
													})
												}
												placeholder='ABC123'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='edit-alias'>
												Alias
											</Label>
											<Input
												id='edit-alias'
												value={editForm.alias || ''}
												onChange={(e) =>
													setEditForm({
														...editForm,
														alias: e.target.value,
													})
												}
												placeholder='V001'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='edit-brand'>
												Brand
											</Label>
											<Input
												id='edit-brand'
												value={editForm.brand || ''}
												onChange={(e) =>
													setEditForm({
														...editForm,
														brand: e.target.value,
													})
												}
												placeholder='Toyota'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='edit-model'>
												Model
											</Label>
											<Input
												id='edit-model'
												value={editForm.model || ''}
												onChange={(e) =>
													setEditForm({
														...editForm,
														model: e.target.value,
													})
												}
												placeholder='Hiace'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='edit-condition'>
												Condition
											</Label>
											<Select
												value={
													editForm.condition ||
													'available'
												}
												onValueChange={(value) =>
													setEditForm({
														...editForm,
														condition: value as
															| 'available'
															| 'need-repair'
															| 'unavailable',
													})
												}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='available'>
														<div className='flex items-center gap-2'>
															<div className='w-3 h-3 rounded-full bg-green-500'></div>
															<span>
																Available
															</span>
														</div>
													</SelectItem>
													<SelectItem value='need-repair'>
														<div className='flex items-center gap-2'>
															<div className='w-3 h-3 rounded-full bg-yellow-500'></div>
															<span>
																Needs Repair
															</span>
														</div>
													</SelectItem>
													<SelectItem value='unavailable'>
														<div className='flex items-center gap-2'>
															<div className='w-3 h-3 rounded-full bg-red-500'></div>
															<span>
																Unavailable
															</span>
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='edit-status'>
												Status
											</Label>
											<Select
												value={
													editForm.status ||
													'not-in-use'
												}
												onValueChange={(value) =>
													setEditForm({
														...editForm,
														status: value as
															| 'in-use'
															| 'not-in-use',
													})
												}
												disabled>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='in-use'>
														In Use
													</SelectItem>
													<SelectItem value='not-in-use'>
														Not In Use
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='edit-mileage'>
												Mileage (km)
											</Label>
											<Input
												id='edit-mileage'
												type='number'
												value={editForm.mileage || ''}
												onChange={(e) =>
													setEditForm({
														...editForm,
														mileage: e.target.value
															? parseInt(
																	e.target
																		.value,
																)
															: undefined,
													})
												}
												placeholder='50000'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='edit-cycle'>
												Maintenance Cycle (days)
											</Label>
											<Input
												id='edit-cycle'
												type='number'
												value={
													editForm.maintenance_cycle_days ||
													''
												}
												onChange={(e) =>
													setEditForm({
														...editForm,
														maintenance_cycle_days:
															e.target.value
																? parseInt(
																		e.target
																			.value,
																	)
																: undefined,
													})
												}
												placeholder='90'
											/>
										</div>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='edit-notes'>
											Notes
										</Label>
										<Textarea
											id='edit-notes'
											value={editForm.notes || ''}
											onChange={(e) =>
												setEditForm({
													...editForm,
													notes: e.target.value,
												})
											}
											placeholder='Additional notes...'
											rows={3}
										/>
									</div>
								</div>
							) : (
								<>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<p className='text-sm text-gray-600'>
												Registration
											</p>
											<p className='font-semibold font-mono text-lg'>
												{vehicle.rego}
											</p>
										</div>
										<div>
											<p className='text-sm text-gray-600'>
												Alias
											</p>
											<p className='font-semibold text-lg'>
												{vehicle.alias}
											</p>
										</div>
										<div>
											<p className='text-sm text-gray-600'>
												Brand
											</p>
											<p className='font-semibold'>
												{vehicle.brand || (
													<span className='text-gray-400'>
														-
													</span>
												)}
											</p>
										</div>
										<div>
											<p className='text-sm text-gray-600'>
												Model
											</p>
											<p className='font-semibold'>
												{vehicle.model || (
													<span className='text-gray-400'>
														-
													</span>
												)}
											</p>
										</div>
										<div>
											<p className='text-sm text-gray-600'>
												Condition
											</p>
											<div className='flex items-center gap-2 mt-1'>
												<div
													className={`w-3 h-3 rounded-full ${conditionConfig[conditionStr]?.className}`}></div>
												<span
													className={`font-medium ${conditionConfig[conditionStr]?.textClass}`}>
													{
														conditionConfig[
															conditionStr
														]?.label
													}
												</span>
											</div>
										</div>
										<div>
											<p className='text-sm text-gray-600'>
												Status
											</p>
											<Badge
												className={`mt-1 ${statusConfig[statusStr]?.className}`}>
												{statusConfig[statusStr]?.label}
											</Badge>
										</div>
										<div>
											<p className='text-sm text-gray-600'>
												Mileage
											</p>
											<p className='font-semibold font-mono'>
												{vehicle.mileage ? (
													<>
														{vehicle.mileage.toLocaleString()}{' '}
														km
													</>
												) : (
													<span className='text-gray-400'>
														-
													</span>
												)}
											</p>
										</div>
										<div>
											<p className='text-sm text-gray-600'>
												Maintenance Cycle
											</p>
											<p className='font-semibold'>
												{vehicle.maintenance_cycle_days ? (
													<>
														{
															vehicle.maintenance_cycle_days
														}{' '}
														days
													</>
												) : (
													<span className='text-gray-400'>
														-
													</span>
												)}
											</p>
										</div>
									</div>

									{vehicle.notes && (
										<div className='mt-4 pt-4 border-t'>
											<p className='text-sm text-gray-600 mb-1'>
												Notes
											</p>
											<p className='text-gray-900'>
												{vehicle.notes}
											</p>
										</div>
									)}
								</>
							)}
						</Card>

						{/* Maintenance Information */}
						<Card className='p-6'>
							<div className='flex items-center justify-between mb-4'>
								<h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
									<Wrench className='h-5 w-5' />
									Maintenance Schedule
								</h2>
								{!isEditing && (
									<Button
										variant='outline'
										size='sm'
										onClick={handleSendMaintenanceEmail}
										disabled={
											isSendingEmail ||
											!vehicle.workshop_email ||
											!vehicle.next_maintenance_date
										}
										title={
											!vehicle.workshop_email
												? 'Workshop email not configured'
												: !vehicle.next_maintenance_date
													? 'Next maintenance date not set'
													: 'Send maintenance booking email to workshop'
										}>
										<Mail className='h-4 w-4 mr-2' />
										{isSendingEmail
											? 'Sending...'
											: 'Send Booking Email'}
									</Button>
								)}
							</div>
							{isEditing ? (
								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label>Last Maintenance Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='outline'
													className='w-full justify-start text-left font-normal'>
													<CalendarIcon className='mr-2 h-4 w-4' />
													{editForm.last_maintenance_date ? (
														format(
															new Date(
																editForm.last_maintenance_date,
															),
															'PPP',
														)
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0'>
												<Calendar
													mode='single'
													selected={
														editForm.last_maintenance_date
															? new Date(
																	editForm.last_maintenance_date,
																)
															: undefined
													}
													onSelect={(date) =>
														setEditForm({
															...editForm,
															last_maintenance_date:
																date
																	? format(
																			date,
																			'yyyy-MM-dd',
																		)
																	: undefined,
														})
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
									<div className='space-y-2'>
										<Label>Next Maintenance Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='outline'
													className='w-full justify-start text-left font-normal'>
													<CalendarIcon className='mr-2 h-4 w-4' />
													{editForm.next_maintenance_date ? (
														format(
															new Date(
																editForm.next_maintenance_date,
															),
															'PPP',
														)
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0'>
												<Calendar
													mode='single'
													selected={
														editForm.next_maintenance_date
															? new Date(
																	editForm.next_maintenance_date,
																)
															: undefined
													}
													onSelect={(date) =>
														setEditForm({
															...editForm,
															next_maintenance_date:
																date
																	? format(
																			date,
																			'yyyy-MM-dd',
																		)
																	: undefined,
														})
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
									<div className='space-y-2'>
										<Label>
											Scheduled Maintenance Date
										</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='outline'
													className='w-full justify-start text-left font-normal'>
													<CalendarIcon className='mr-2 h-4 w-4' />
													{editForm.scheduled_maintenance_date ? (
														format(
															new Date(
																editForm.scheduled_maintenance_date,
															),
															'PPP',
														)
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0'>
												<Calendar
													mode='single'
													selected={
														editForm.scheduled_maintenance_date
															? new Date(
																	editForm.scheduled_maintenance_date,
																)
															: undefined
													}
													onSelect={(date) =>
														setEditForm({
															...editForm,
															scheduled_maintenance_date:
																date
																	? format(
																			date,
																			'yyyy-MM-dd',
																		)
																	: undefined,
														})
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
									{/* TODO: Scheduled Mileage */}
									<div className='space-y-2'>
										<Label htmlFor='edit-location'>
											Scheduled Mileage
										</Label>
										<Input
											id='edit-location'
											value={''}
											onChange={(e) => console.log(e)}
											placeholder='Scheduled Mileage'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='edit-location'>
											Maintenance Location
										</Label>
										<Input
											id='edit-location'
											value={
												editForm.maintenance_location ||
												''
											}
											onChange={(e) =>
												setEditForm({
													...editForm,
													maintenance_location:
														e.target.value,
												})
											}
											placeholder='Main Workshop'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='edit-email'>
											Workshop Email
										</Label>
										<Input
											id='edit-email'
											type='email'
											value={
												editForm.workshop_email || ''
											}
											onChange={(e) =>
												setEditForm({
													...editForm,
													workshop_email:
														e.target.value,
												})
											}
											placeholder='workshop@example.com'
										/>
									</div>
								</div>
							) : (
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-gray-600'>
											Last Maintenance
										</p>
										<p className='font-semibold'>
											{vehicle.last_maintenance_date ? (
												format(
													new Date(
														vehicle.last_maintenance_date,
													),
													'MMM dd, yyyy',
												)
											) : (
												<span className='text-gray-400'>
													Not recorded
												</span>
											)}
										</p>
									</div>
									<div>
										<p className='text-sm text-gray-600'>
											Next Maintenance
										</p>
										<p
											className={`font-semibold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : ''}`}>
											{vehicle.next_maintenance_date ? (
												format(
													new Date(
														vehicle.next_maintenance_date,
													),
													'MMM dd, yyyy',
												)
											) : (
												<span className='text-gray-400'>
													Not scheduled
												</span>
											)}
										</p>
									</div>
									<div>
										<p className='text-sm text-gray-600'>
											Scheduled Maintenance
										</p>
										<p className='font-semibold'>
											{vehicle.scheduled_maintenance_date ? (
												format(
													new Date(
														vehicle.scheduled_maintenance_date,
													),
													'MMM dd, yyyy',
												)
											) : (
												<span className='text-gray-400'>
													Not scheduled
												</span>
											)}
										</p>
									</div>
									<div>
										<p className='text-sm text-gray-600'>
											Scheduled Mileage
										</p>
										<p className='font-semibold'>
											{vehicle.scheduled_maintenance_date ? (
												format(
													new Date(
														vehicle.scheduled_maintenance_date,
													),
													'MMM dd, yyyy',
												)
											) : (
												<span className='text-gray-400'>
													Not scheduled
												</span>
											)}
										</p>
									</div>
									<div>
										<p className='text-sm text-gray-600'>
											Maintenance Location
										</p>
										<p className='font-semibold flex items-center gap-2'>
											{vehicle.maintenance_location ? (
												<>
													<MapPin className='h-4 w-4 text-gray-400' />
													{
														vehicle.maintenance_location
													}
												</>
											) : (
												<span className='text-gray-400'>
													-
												</span>
											)}
										</p>
									</div>
									<div>
										<p className='text-sm text-gray-600'>
											Workshop Email
										</p>
										<p className='font-semibold'>
											{vehicle.workshop_email || (
												<span className='text-gray-400'>
													-
												</span>
											)}
										</p>
									</div>
								</div>
							)}
						</Card>

						{/* Inspection History - Removed Vehicle Photos section */}
						{/* <Card className='p-6'>
							<div className='flex items-center justify-between mb-4'>
								<h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
									<ImageIcon className='h-5 w-5' />
									Vehicle Photos
								</h2>
								<div className='relative'>
									<input
										type='file'
										id='photo-upload'
										multiple
										accept='image/*'
										className='hidden'
										onChange={(e) =>
											handlePhotoUpload(e.target.files)
										}
										disabled={isUploading}
									/>
									<Button
										size='sm'
										onClick={() =>
											document
												.getElementById('photo-upload')
												?.click()
										}
										disabled={isUploading}>
										<Upload className='h-4 w-4 mr-2' />
										{isUploading
											? 'Uploading...'
											: 'Upload Photos'}
									</Button>
								</div>
							</div>

							{photoUrls && photoUrls.length > 0 ? (
								<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
									{photoUrls.map((url, index) => {
										console.log(
											`Photo ${index + 1} URL:`,
											url
										);
										return (
											<div
												key={index}
												className='relative group bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all'
												onClick={() =>
													setSelectedPhotoIndex(index)
												}>
												<div className='relative w-full h-40'>
													<img
														src={url}
														alt={`Vehicle photo ${index + 1}`}
														className='w-full h-full object-cover'
														crossOrigin='anonymous'
														onLoad={() => {
															console.log(
																`Photo ${index + 1} loaded successfully`
															);
														}}
														onError={(e) => {
															// Handle image load error
															console.error(
																`Failed to load photo ${index + 1}:`,
																url
															);
															const target =
																e.target as HTMLImageElement;
															target.src =
																'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
														}}
													/>
													<div className='absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity' />
												</div>

												<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2'>
													<p
														className='text-xs text-white truncate'
														title={url}>
														Photo {index + 1}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className='text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
									<ImageIcon className='h-12 w-12 text-gray-400 mx-auto mb-3' />
									<p className='text-gray-600 text-sm mb-1'>
										No photos uploaded yet
									</p>
									<p className='text-gray-500 text-xs'>
										Click "Upload Photos" to add vehicle
										images
									</p>
								</div>
							)} */}
						{/* </Card> */}

						{/* Inspection History */}
						<Card className='p-6'>
							<h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
								<FileText className='h-5 w-5' />
								Inspection History
							</h2>

							{vehicle.recent_inspections &&
							vehicle.recent_inspections.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Driver</TableHead>
											<TableHead>Mileage</TableHead>
											<TableHead>Photos</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Review</TableHead>
											<TableHead className='text-center'>
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{vehicle.recent_inspections.map(
											(inspection: any) => {
												// Parse photo URLs
												const getPhotoCount = (
													urls: any,
												): number => {
													if (!urls) return 0;
													if (Array.isArray(urls))
														return urls.length;
													if (
														typeof urls === 'string'
													) {
														try {
															const parsed =
																JSON.parse(
																	urls,
																);
															return Array.isArray(
																parsed,
															)
																? parsed.length
																: 0;
														} catch (e) {
															return 0;
														}
													}
													return 0;
												};

												const photoCount =
													getPhotoCount(
														inspection.inspection_urls,
													);

												return (
													<TableRow
														key={inspection.id}
														className='hover:bg-gray-50'>
														<TableCell>
															{inspection.inspection_date
																? format(
																		new Date(
																			inspection.inspection_date,
																		),
																		'MMM dd, yyyy',
																	)
																: '-'}
														</TableCell>
														<TableCell>
															{inspection.driver_id ? (
																`Driver #${inspection.driver_id}`
															) : (
																<span className='text-gray-400'>
																	-
																</span>
															)}
														</TableCell>
														<TableCell className='font-mono'>
															{inspection.mileage_at_inspection ? (
																`${inspection.mileage_at_inspection.toLocaleString()} km`
															) : (
																<span className='text-gray-400'>
																	-
																</span>
															)}
														</TableCell>
														<TableCell>
															{photoCount > 0 ? (
																<div className='flex items-center gap-1'>
																	<ImageIcon className='h-4 w-4 text-blue-600' />
																	<span className='text-sm'>
																		{
																			photoCount
																		}
																	</span>
																</div>
															) : (
																<span className='text-gray-400'>
																	No photos
																</span>
															)}
														</TableCell>
														<TableCell>
															{inspection.inspection_status ===
																'pending' && (
																<Badge
																	variant='outline'
																	className='border-yellow-300 bg-yellow-50 text-yellow-800'>
																	<Clock className='h-3 w-3 mr-1' />
																	Pending
																</Badge>
															)}
															{inspection.inspection_status ===
																'passed' && (
																<Badge
																	variant='outline'
																	className='border-green-300 bg-green-50 text-green-800'>
																	<CheckCircle2 className='h-3 w-3 mr-1' />
																	Passed
																</Badge>
															)}
															{inspection.inspection_status ===
																'failed' && (
																<Badge
																	variant='outline'
																	className='border-red-300 bg-red-50 text-red-800'>
																	<XCircle className='h-3 w-3 mr-1' />
																	Failed
																</Badge>
															)}
														</TableCell>
														<TableCell>
															{inspection.reviewed_by_admin ? (
																<Badge className='bg-blue-100 text-blue-800 border-blue-300'>
																	Reviewed
																</Badge>
															) : (
																<Badge
																	variant='outline'
																	className='border-gray-300 bg-gray-50 text-gray-800'>
																	Not Reviewed
																</Badge>
															)}
														</TableCell>
														<TableCell className='text-center'>
															<Button
																variant='ghost'
																size='sm'
																onClick={() =>
																	router.push(
																		`/inspections/${vehicle.id}?inspection_id=${inspection.id}`,
																	)
																}>
																<Eye className='h-4 w-4 mr-1' />
																View
															</Button>
														</TableCell>
													</TableRow>
												);
											},
										)}
									</TableBody>
								</Table>
							) : (
								<div className='text-center py-8'>
									<FileText className='h-12 w-12 text-gray-400 mx-auto mb-2' />
									<p className='text-gray-600 text-sm'>
										No inspections recorded yet
									</p>
								</div>
							)}
						</Card>
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
				<Dialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Vehicle</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete vehicle{' '}
								<span className='font-semibold'>
									{vehicle?.rego}
								</span>
								? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setShowDeleteDialog(false)}>
								Cancel
							</Button>
							<Button
								variant='destructive'
								onClick={handleDeleteVehicle}>
								Delete Vehicle
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
