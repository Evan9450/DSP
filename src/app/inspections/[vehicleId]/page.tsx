'use client';

import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	FileText,
	Gauge,
	ImageIcon,
	Minus,
	TrendingDown,
	TrendingUp,
	User,
	XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleInspectionResponse, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { toast } from 'sonner';

const getInspectionStatusBadge = (status: string) => {
	switch (status) {
		case 'need-repair':
			return (
				<Badge
					variant='outline'
					className='border-yellow-300 bg-yellow-50 text-yellow-800'>
					<Clock className='h-3 w-3 mr-1' />
					need repair
				</Badge>
			);
		case 'available':
			return (
				<Badge
					variant='outline'
					className='border-green-300 bg-green-50 text-green-800'>
					<CheckCircle2 className='h-3 w-3 mr-1' />
					available
				</Badge>
			);
		case 'unavailable':
			return (
				<Badge
					variant='outline'
					className='border-red-300 bg-red-50 text-red-800'>
					<XCircle className='h-3 w-3 mr-1' />
					unavailable
				</Badge>
			);
		default:
			return <Badge variant='outline'>Unknown</Badge>;
	}
};

export default function InspectionDetailPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const vehicleId = parseInt(params.vehicleId as string);
	const inspectionId = searchParams.get('inspection_id');

	const [inspection, setInspection] =
		useState<VehicleInspectionResponse | null>(null);

	const [previousInspection, setPreviousInspection] = useState<{
		inspection_date: string;
		mileage_at_inspection: number;
		photos: string[];
		photo_full_urls?: string[];
		driver_name: string;
	} | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isReviewing, setIsReviewing] = useState(false);
	const [adminNotes, setAdminNotes] = useState('');

	useEffect(() => {
		const fetchInspectionDetail = async () => {
			try {
				setIsLoading(true);

				if (inspectionId) {
					// If we have a specific inspection ID, fetch it directly
					// The API returns flattened structure with previous inspection in 'previous' field
					const detailData = await apiClient.getInspection(
						parseInt(inspectionId),
					);
					console.log(
						'🚀 => fetchInspectionDetail => detailData:',
						detailData,
					);

					// Set current inspection (the detail data itself)
					setInspection(detailData);

					// Set previous inspection from the 'previous' field
					setPreviousInspection(detailData.previous);
				} else {
					// If no ID provided, fetch the most recent inspection for this vehicle
					const recentInspections =
						await apiClient.getInspectionsByVehicle(vehicleId, {
							limit: 1,
						});

					if (recentInspections.length === 0) {
						throw new Error(
							'No inspections found for this vehicle',
						);
					}

					// Fetch the detail data for the most recent inspection
					const detailData = await apiClient.getInspection(
						recentInspections[0].id,
					);
					setInspection(detailData);
					setPreviousInspection(detailData.previous);
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load inspection details',
				);
			} finally {
				setIsLoading(false);
			}
		};

		if (vehicleId) {
			fetchInspectionDetail();
		}
	}, [vehicleId, inspectionId]);

	// Handle admin review submission
	const handleReview = async (
		condition: 'available' | 'need-repair' | 'unavailable',
	) => {
		if (!inspection) return;

		try {
			setIsReviewing(true);
			const updatedInspection = await apiClient.reviewInspection(
				inspection.id,
				{
					condition,
					admin_notes: adminNotes || undefined,
				},
			);

			setInspection(updatedInspection);
			setAdminNotes('');

			const statusText =
				condition === 'available'
					? 'Available'
					: condition === 'need-repair'
						? 'Need Repair'
						: 'Unavailable';
			toast.success(`Vehicle marked as ${statusText}`);
		} catch (err) {
			toast.error('Failed to review inspection');
			console.error('Review error:', err);
		} finally {
			setIsReviewing(false);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto p-6'>
					<div className='flex items-center justify-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
						<p className='ml-4 text-gray-600'>
							Loading inspection details...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !inspection) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto p-6'>
					<div className='text-center py-12'>
						<AlertCircle className='h-12 w-12 text-red-600 mx-auto mb-4' />
						<p className='text-red-600'>
							Failed to load inspection details
						</p>
						<p className='text-sm text-gray-500 mt-2'>{error}</p>
						<Button onClick={() => router.back()} className='mt-4'>
							Go Back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Calculate mileage change
	const mileageChange = previousInspection
		? inspection.mileage_at_inspection -
			previousInspection.mileage_at_inspection
		: null;

	// Get photo URLs from the inspection response
	// New API returns 'photos' or 'photo_full_urls', legacy uses 'inspection_urls'
	const getPhotoUrls = (inspection: VehicleInspectionResponse): string[] => {
		// Try new field names first
		if (inspection.photos && inspection.photos.length > 0) {
			return inspection.photos;
		}
		if (
			inspection.photo_full_urls &&
			inspection.photo_full_urls.length > 0
		) {
			return inspection.photo_full_urls;
		}

		// Fallback to legacy field
		const urls = inspection.inspection_urls;
		if (!urls) return [];
		if (Array.isArray(urls)) return urls;
		if (typeof urls === 'string') {
			try {
				const parsed = JSON.parse(urls);
				return Array.isArray(parsed) ? parsed : [];
			} catch (e) {
				console.error('Failed to parse inspection_urls:', e);
				return [];
			}
		}
		return [];
	};

	const photoUrls = getPhotoUrls(inspection);

	// Check if inspection can be reviewed (requires mileage and at least 1 photo)
	const canReview =
		inspection.mileage_at_inspection &&
		inspection.mileage_at_inspection > 0 &&
		photoUrls.length >= 1;

	// Get previous inspection photos
	const getPreviousPhotoUrls = (): string[] => {
		if (!previousInspection) return [];

		// Try photos field first
		if (previousInspection.photos && previousInspection.photos.length > 0) {
			return previousInspection.photos;
		}

		// Try photo_full_urls
		if (
			previousInspection.photo_full_urls &&
			previousInspection.photo_full_urls.length > 0
		) {
			return previousInspection.photo_full_urls;
		}

		return [];
	};

	const previousPhotoUrls = getPreviousPhotoUrls();

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto p-6 max-w-4xl'>
				{/* Header */}
				<div className='mb-6'>
					<Button
						variant='ghost'
						onClick={() => router.back()}
						className='mb-4  '>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>
					<div className='flex items-start justify-between'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900'>
								Inspection Details
							</h1>
							<p className='text-gray-600 mt-2'>
								Vehicle #{vehicleId} •{' '}
								{format(
									new Date(inspection.inspection_date),
									'MMMM dd, yyyy',
								)}
							</p>
						</div>
						{getInspectionStatusBadge(inspection.condition)}
					</div>
				</div>

				{/* Inspection Info Card */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<FileText className='h-5 w-5' />
							Inspection Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<div className='flex items-center gap-2 text-sm text-gray-600 mb-1'>
									<Calendar className='h-4 w-4' />
									Inspection Date
								</div>
								<div className='font-medium'>
									{format(
										new Date(inspection.inspection_date),
										'MMM dd, yyyy',
									)}
								</div>
							</div>
							<div>
								<div className='flex items-center gap-2 text-sm text-gray-600 mb-1'>
									<User className='h-4 w-4' />
									Driver
								</div>
								<div className='font-medium'>
									{inspection.driver_name ||
										(inspection.driver_id
											? `Driver #${inspection.driver_id}`
											: 'N/A')}
								</div>
							</div>
						</div>

						<div className='border-t pt-4'>
							<div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
								<CheckCircle2 className='h-4 w-4' />
								Review Status
							</div>
							<div>
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
							</div>
							{inspection.admin_notes && (
								<div className='mt-3 p-3 bg-gray-50 rounded-lg'>
									<div className='text-sm font-medium text-gray-700 mb-1'>
										Admin Notes:
									</div>
									<div className='text-sm text-gray-600'>
										{inspection.admin_notes}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Admin Review Card - Only show if not reviewed yet */}
				{!inspection.reviewed_by_admin && (
					<Card className='mb-6 border-2 border-blue-200'>
						<CardHeader className='bg-blue-50'>
							<CardTitle className='flex items-center gap-2 text-blue-900'>
								<CheckCircle2 className='h-5 w-5' />
								Admin Review
							</CardTitle>
						</CardHeader>
						<CardContent className='pt-6 space-y-4'>
							{/* Warning if inspection cannot be reviewed */}
							{!canReview && (
								<div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2'>
									<AlertCircle className='h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5' />
									<div className='text-sm text-yellow-800'>
										<div className='font-medium mb-1'>
											Cannot review this inspection
										</div>
										<div className='text-yellow-700'>
											{!inspection.mileage_at_inspection ||
											inspection.mileage_at_inspection ===
												0
												? 'Mileage is required. '
												: ''}
											{photoUrls.length < 1
												? 'At least 1 photo is required.'
												: ''}
										</div>
									</div>
								</div>
							)}

							<div>
								<label className='text-sm font-medium text-gray-700 mb-2 block'>
									Review Notes (Optional)
								</label>
								<Textarea
									value={adminNotes}
									onChange={(e) =>
										setAdminNotes(e.target.value)
									}
									placeholder='Add any notes about this inspection...'
									rows={3}
									className='w-full'
									disabled={isReviewing || !canReview}
								/>
							</div>
							<div className='flex gap-3'>
								<Button
									onClick={() => handleReview('available')}
									disabled={isReviewing || !canReview}
									className='flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'>
									<CheckCircle2 className='h-4 w-4 mr-2' />
									Mark as Available
								</Button>

								<Button
									onClick={() => handleReview('need-repair')}
									disabled={isReviewing || !canReview}
									variant='outline'
									className='flex-1 border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed'>
									<Clock className='h-4 w-4 mr-2' />
									Mark as Need Repair
								</Button>
								<Button
									onClick={() => handleReview('unavailable')}
									disabled={isReviewing || !canReview}
									variant='destructive'
									className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'>
									<XCircle className='h-4 w-4 mr-2' />
									Mark as Unavailable
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Mileage Card */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Gauge className='h-5 w-5' />
							Mileage Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{/* Current Mileage */}
							<div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
								<div className='text-sm text-gray-600 mb-2'>
									Current Mileage
								</div>
								<div className='text-2xl font-bold text-blue-700 font-mono'>
									{inspection.mileage_at_inspection
										? inspection.mileage_at_inspection.toLocaleString()
										: '-'}{' '}
									km
								</div>
							</div>

							{/* Previous Mileage */}
							{previousInspection && (
								<div className='text-center p-4 bg-gray-50 rounded-lg border border-gray-200'>
									<div className='text-sm text-gray-600 mb-2'>
										Previous Mileage
									</div>
									<div className='text-2xl font-bold text-gray-700 font-mono'>
										{previousInspection.mileage_at_inspection?.toLocaleString()}{' '}
										km
									</div>
									<div className='text-xs text-gray-500 mt-1'>
										{format(
											new Date(
												previousInspection.inspection_date,
											),
											'MMM dd, yyyy',
										)}
									</div>
								</div>
							)}

							{/* Mileage Change */}
							{mileageChange !== null && (
								<div className='text-center p-4 bg-green-50 rounded-lg border border-green-200'>
									<div className='text-sm text-gray-600 mb-2'>
										Mileage Change
									</div>
									<div className='flex items-center justify-center gap-2'>
										{mileageChange > 0 ? (
											<>
												<TrendingUp className='h-5 w-5 text-green-600' />
												<span className='text-2xl font-bold text-green-700 font-mono'>
													+
													{mileageChange.toLocaleString()}{' '}
													km
												</span>
											</>
										) : mileageChange < 0 ? (
											<>
												<TrendingDown className='h-5 w-5 text-red-600' />
												<span className='text-2xl font-bold text-red-700 font-mono'>
													{mileageChange.toLocaleString()}{' '}
													km
												</span>
											</>
										) : (
											<>
												<Minus className='h-5 w-5 text-gray-600' />
												<span className='text-2xl font-bold text-gray-700 font-mono'>
													0 km
												</span>
											</>
										)}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Driver Notes */}
				{inspection.notes && (
					<Card className='mb-6'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FileText className='h-5 w-5' />
								Driver Notes
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-gray-700 whitespace-pre-wrap'>
								{inspection.notes}
							</p>
						</CardContent>
					</Card>
				)}

				{/* Current Inspection Photos */}
				<Card className='mb-6'>
					<CardHeader className='bg-blue-50'>
						<CardTitle className='flex items-center gap-2'>
							<ImageIcon className='h-5 w-5 text-blue-700' />
							<span className='text-blue-900'>
								Current Inspection Photos
							</span>
							{photoUrls && photoUrls.length > 0 && (
								<span className='text-sm font-normal text-blue-600'>
									({photoUrls.length})
								</span>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className='pt-6'>
						{photoUrls && photoUrls.length > 0 ? (
							<>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{photoUrls.map((photoUrl, index) => (
										<div
											key={index}
											className='relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer group'>
											<img
												src={photoUrl}
												alt={`Current inspection photo ${index + 1}`}
												className='w-full h-full object-cover group-hover:scale-105 transition-transform'
												onClick={() =>
													window.open(
														photoUrl,
														'_blank',
													)
												}
											/>
											<div className='absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded'>
												{index + 1} / {photoUrls.length}
											</div>
										</div>
									))}
								</div>
								<p className='text-sm text-gray-500 mt-4 text-center'>
									Click on any photo to view full size
								</p>
							</>
						) : (
							<div className='text-center py-8'>
								<ImageIcon className='h-12 w-12 text-gray-400 mx-auto mb-3' />
								<p className='text-gray-600'>
									No photos uploaded for this inspection
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Previous Inspection Photos */}
				{previousInspection && (
					<Card>
						<CardHeader className='bg-gray-50'>
							<CardTitle className='flex items-center gap-2'>
								<ImageIcon className='h-5 w-5 text-gray-600' />
								<span className='text-gray-900'>
									Previous Inspection Photos
								</span>
								{previousPhotoUrls &&
									previousPhotoUrls.length > 0 && (
										<span className='text-sm font-normal text-gray-600'>
											({previousPhotoUrls.length})
										</span>
									)}
								<span className='text-sm font-normal text-gray-500 ml-auto'>
									{format(
										new Date(
											previousInspection.inspection_date,
										),
										'MMM dd, yyyy',
									)}{' '}
									• {previousInspection.driver_name}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className='pt-6'>
							{previousPhotoUrls &&
							previousPhotoUrls.length > 0 ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
										{previousPhotoUrls.map(
											(photoUrl, index) => (
												<div
													key={index}
													className='relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer group'>
													<img
														src={photoUrl}
														alt={`Previous inspection photo ${index + 1}`}
														className='w-full h-full object-cover group-hover:scale-105 transition-transform'
														onClick={() =>
															window.open(
																photoUrl,
																'_blank',
															)
														}
													/>
													<div className='absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded'>
														{index + 1} /{' '}
														{
															previousPhotoUrls.length
														}
													</div>
												</div>
											),
										)}
									</div>
									<p className='text-sm text-gray-500 mt-4 text-center'>
										Click on any photo to view full size
									</p>
								</>
							) : (
								<div className='text-center py-8'>
									<ImageIcon className='h-12 w-12 text-gray-400 mx-auto mb-3' />
									<p className='text-gray-600'>
										No photos available for previous
										inspection
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
