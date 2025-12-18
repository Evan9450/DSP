'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
	ArrowLeft,
	Car,
	Calendar,
	Wrench,
	AlertCircle,
	CheckCircle2,
	ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { apiClient, VehicleDetailResponse } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const getConditionColor = (condition: number) => {
	switch (condition) {
		case 0:
			return 'bg-green-100 text-green-800 border-green-300';
		case 1:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 2:
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
};

const getConditionText = (condition: number) => {
	switch (condition) {
		case 0:
			return 'Available';
		case 1:
			return 'Need Repair';
		case 2:
			return 'Unavailable';
		default:
			return 'Unknown';
	}
};

const getStatusText = (status: number) => {
	switch (status) {
		case 0:
			return 'In Use';
		case 1:
			return 'Not In Use';
		default:
			return 'Unknown';
	}
};

export default function VehicleDetailPage() {
	const router = useRouter();
	const params = useParams();
	const vehicleId = parseInt(params.vehicleId as string);

	const [vehicle, setVehicle] = useState<VehicleDetailResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchVehicleDetail = async () => {
			try {
				setIsLoading(true);
				const data = await apiClient.getVehicleDetail(vehicleId);
				setVehicle(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load vehicle details');
			} finally {
				setIsLoading(false);
			}
		};

		if (vehicleId) {
			fetchVehicleDetail();
		}
	}, [vehicleId]);

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto p-6'>
					<div className='flex items-center justify-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
						<p className='ml-4 text-gray-600'>Loading vehicle details...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !vehicle) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto p-6'>
					<div className='text-center py-12'>
						<AlertCircle className='h-12 w-12 text-red-600 mx-auto mb-4' />
						<p className='text-red-600'>Failed to load vehicle details</p>
						<p className='text-sm text-gray-500 mt-2'>{error}</p>
						<Button onClick={() => router.back()} className='mt-4'>
							Go Back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto p-6'>
				{/* Header */}
				<div className='mb-6'>
					<Button
						variant='ghost'
						onClick={() => router.back()}
						className='mb-4 hover:bg-gray-100'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Inspections
					</Button>
					<div className='flex items-start justify-between'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900'>
								{vehicle.alias || vehicle.rego}
							</h1>
							<p className='text-gray-600 mt-2'>
								{vehicle.brand && vehicle.model
									? `${vehicle.brand} ${vehicle.model}`
									: 'Vehicle Details'}
							</p>
						</div>
						<div className='flex gap-2'>
							<Badge className={cn(getConditionColor(vehicle.condition))}>
								{getConditionText(vehicle.condition)}
							</Badge>
							<Badge variant='outline'>{getStatusText(vehicle.status)}</Badge>
						</div>
					</div>
				</div>

				{/* Vehicle Info Cards */}
				<div className='grid gap-6 md:grid-cols-2 mb-6'>
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Car className='h-5 w-5' />
								Basic Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Registration:</span>
								<span className='font-medium font-mono'>{vehicle.rego}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Alias:</span>
								<span className='font-medium'>
									{vehicle.alias || <span className='text-gray-400'>-</span>}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Brand:</span>
								<span className='font-medium'>
									{vehicle.brand || <span className='text-gray-400'>-</span>}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Model:</span>
								<span className='font-medium'>
									{vehicle.model || <span className='text-gray-400'>-</span>}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Mileage:</span>
								<span className='font-medium font-mono'>
									{vehicle.mileage ? (
										`${vehicle.mileage.toLocaleString()} km`
									) : (
										<span className='text-gray-400'>-</span>
									)}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Maintenance Information */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Wrench className='h-5 w-5' />
								Maintenance Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Maintenance Cycle:</span>
								<span className='font-medium'>
									{vehicle.maintenance_cycle_days ? (
										`${vehicle.maintenance_cycle_days} days`
									) : (
										<span className='text-gray-400'>-</span>
									)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Last Maintenance:</span>
								<span className='font-medium'>
									{vehicle.last_maintenance_date ? (
										format(new Date(vehicle.last_maintenance_date), 'MMM dd, yyyy')
									) : (
										<span className='text-gray-400'>-</span>
									)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Next Maintenance:</span>
								<span className='font-medium'>
									{vehicle.next_maintenance_date ? (
										format(new Date(vehicle.next_maintenance_date), 'MMM dd, yyyy')
									) : (
										<span className='text-gray-400'>-</span>
									)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Location:</span>
								<span className='font-medium'>
									{vehicle.maintenance_location || (
										<span className='text-gray-400'>-</span>
									)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Workshop Email:</span>
								<span className='font-medium text-sm'>
									{vehicle.workshop_email || <span className='text-gray-400'>-</span>}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Notes */}
				{vehicle.notes && (
					<Card className='mb-6'>
						<CardHeader>
							<CardTitle>Notes</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-gray-700 whitespace-pre-wrap'>{vehicle.notes}</p>
						</CardContent>
					</Card>
				)}

				{/* Vehicle Photos */}
				{vehicle.photos && vehicle.photos.length > 0 && (
					<Card className='mb-6'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<ImageIcon className='h-5 w-5' />
								Vehicle Photos
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								{vehicle.photos.map((photo, index) => (
									<div
										key={index}
										className='relative aspect-square rounded-lg overflow-hidden border border-gray-200'>
										<img
											src={photo}
											alt={`Vehicle photo ${index + 1}`}
											className='w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer'
											onClick={() => window.open(photo, '_blank')}
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Recent Inspections */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5' />
							Recent Inspections
						</CardTitle>
					</CardHeader>
					<CardContent>
						{vehicle.recent_inspections && vehicle.recent_inspections.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Driver ID</TableHead>
										<TableHead>Mileage</TableHead>
										<TableHead>Reviewed</TableHead>
										<TableHead>Notes</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{vehicle.recent_inspections.map((inspection) => (
										<TableRow key={inspection.id}>
											<TableCell>
												{format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}
											</TableCell>
											<TableCell>
												{inspection.driver_id ? (
													`Driver #${inspection.driver_id}`
												) : (
													<span className='text-gray-400'>-</span>
												)}
											</TableCell>
											<TableCell className='font-mono'>
												{inspection.mileage_at_inspection ? (
													`${inspection.mileage_at_inspection.toLocaleString()} km`
												) : (
													<span className='text-gray-400'>-</span>
												)}
											</TableCell>
											<TableCell>
												{inspection.reviewed_by_admin ? (
													<CheckCircle2 className='h-5 w-5 text-green-600' />
												) : (
													<AlertCircle className='h-5 w-5 text-orange-500' />
												)}
											</TableCell>
											<TableCell className='max-w-xs truncate'>
												{inspection.admin_notes || <span className='text-gray-400'>-</span>}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<p className='text-center text-gray-500 py-8'>No recent inspections</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
