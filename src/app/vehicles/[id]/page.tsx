'use client';

import React from 'react';
import {
	AlertCircle,
	AlertTriangle,
	ArrowLeft,
	Calendar,
	Camera,
	Car,
	CheckCircle,
	Edit,
	Wrench,
} from 'lucide-react';
import { Schedule, Vehicle } from '@/types/schedule';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { mockSchedules, mockVehicles } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function VehicleDetailsPage() {
	const router = useRouter();
	const params = useParams();
	const vehicleId = params.id as string;

	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [schedules, setSchedules] = useState<Schedule[]>([]);

	useEffect(() => {
		const foundVehicle = mockVehicles.find((v) => v.id === vehicleId);
		setVehicle(foundVehicle || null);

		const vehicleSchedules = mockSchedules.filter(
			(s) => s.vehicleId === vehicleId
		);
		setSchedules(vehicleSchedules);
	}, [vehicleId]);

	if (!vehicle) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
				<div className='container mx-auto px-6 py-8 max-w-7xl'>
					<div className='text-center py-12'>
						<Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-600'>Vehicle not found</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => router.push('/vehicles')}>
							Back to Vehicles
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const statusConfig = {
		available: {
			label: 'Available',
			className: 'bg-green-600',
			icon: CheckCircle,
		},
		'in-use': { label: 'In Use', className: 'bg-blue-600', icon: Calendar },
		maintenance: {
			label: 'Maintenance',
			className: 'bg-blue-600',
			icon: AlertTriangle,
		},
	};

	const statusInfo = statusConfig[vehicle.status];
	const StatusIcon = statusInfo.icon;

	const conditionConfig = {
		green: {
			label: 'Good Condition',
			className: 'bg-green-500 text-white',
			icon: CheckCircle,
		},
		yellow: {
			label: 'Fair Condition',
			className: 'bg-yellow-500 text-white',
			icon: AlertTriangle,
		},
		red: {
			label: 'Needs Attention',
			className: 'bg-red-500 text-white',
			icon: AlertCircle,
		},
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<Button
					variant='ghost'
					className='mb-4 sm:mb-6'
					onClick={() => router.push('/vehicles')}>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Vehicles
				</Button>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
					<div className='lg:col-span-1'>
						<Card className='p-6 bg-white '>
							<div className='flex flex-col items-center mb-6'>
								<div className='p-6 bg-blue-100 rounded-full mb-4'>
									<Car className='h-16 w-16 text-blue-700' />
								</div>
								<h1 className='text-2xl font-bold text-gray-900 mb-2'>
									{vehicle.vehicleNumber}
								</h1>
								<div className='flex gap-2 flex-wrap justify-center'>
									<Badge
										className={`${statusInfo.className} text-white flex items-center gap-1`}>
										<StatusIcon className='h-3 w-3' />
										{statusInfo.label}
									</Badge>
									{vehicle.condition && (
										<Badge
											className={`${conditionConfig[vehicle.condition].className} flex items-center gap-1`}>
											{React.createElement(
												conditionConfig[vehicle.condition].icon,
												{ className: 'h-3 w-3' }
											)}
											{conditionConfig[vehicle.condition].label}
										</Badge>
									)}
								</div>
							</div>

							<div className='space-y-4 mb-6'>
								<div className='border-t border-gray-200 pt-4'>
									<h3 className='text-sm font-semibold text-gray-900 mb-3'>
										Vehicle Information
									</h3>
									<div className='space-y-3'>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-600'>
												ID:
											</span>
											<span className='font-medium text-gray-900'>
												{vehicle.id}
											</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-600'>
												Type:
											</span>
											<span className='font-medium text-gray-900'>
												Delivery Van
											</span>
										</div>
										{vehicle.mileage && (
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													Mileage:
												</span>
												<span className='font-medium text-gray-900'>
													{vehicle.mileage.toLocaleString()} miles
												</span>
											</div>
										)}
										{vehicle.lastMaintenanceDate && (
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													Last Service:
												</span>
												<span className='font-medium text-gray-900'>
													{format(
														vehicle.lastMaintenanceDate,
														'MMM dd, yyyy'
													)}
												</span>
											</div>
										)}
										{vehicle.nextMaintenanceDate && (
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													Next Service:
												</span>
												<span
													className={`font-medium ${
														vehicle.nextMaintenanceDate <
														new Date()
															? 'text-red-600'
															: 'text-gray-900'
													}`}>
													{format(
														vehicle.nextMaintenanceDate,
														'MMM dd, yyyy'
													)}
												</span>
											</div>
										)}
									</div>
								</div>

								<div className='border-t border-gray-200 pt-4'>
									<h3 className='text-sm font-semibold text-gray-900 mb-3'>
										Statistics
									</h3>
									<div className='space-y-3'>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-600'>
												Total Deliveries:
											</span>
											<span className='font-medium text-gray-900'>
												1,243
											</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-600'>
												Total Shifts:
											</span>
											<span className='font-medium text-gray-900'>
												156
											</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-600'>
												Avg. Efficiency:
											</span>
											<span className='font-medium text-green-600'>
												94.2%
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className='space-y-2'>
								<div className='flex gap-2'>
									<Button variant='outline' className='flex-1'>
										<Edit className='h-4 w-4 mr-2' />
										Edit
									</Button>
									<Button variant='outline' className='flex-1'>
										<Wrench className='h-4 w-4 mr-2' />
										Service
									</Button>
								</div>
								<Button variant='outline' className='w-full'>
									<Camera className='h-4 w-4 mr-2' />
									Upload Photo
								</Button>
							</div>
						</Card>
					</div>

					<div className='lg:col-span-2 space-y-4 sm:space-y-6'>
						<Card className='p-4 sm:p-6 bg-white '>
							<h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
								<Camera className='h-5 w-5 text-blue-700' />
								Vehicle Photos
							</h2>
							{vehicle.photos && vehicle.photos.length > 0 ? (
								<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
									{vehicle.photos.map((photo) => (
										<div
											key={photo.id}
											className='relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer'>
											<div className='absolute inset-0 bg-gray-200 flex items-center justify-center'>
												<Camera className='h-8 w-8 text-gray-400' />
											</div>
											<div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity'>
												<p className='text-xs text-white'>
													{format(photo.uploadedAt, 'MMM dd, yyyy')}
												</p>
												{photo.notes && (
													<p className='text-xs text-white/80 truncate'>
														{photo.notes}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='text-center py-12 bg-gray-50 rounded-lg'>
									<Camera className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-600 mb-2'>No photos uploaded</p>
									<p className='text-sm text-gray-500'>
										Upload photos to track vehicle condition
									</p>
								</div>
							)}
						</Card>

						<Card className='p-4 sm:p-6 bg-white  overflow-x-auto'>
							<h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
								<Calendar className='h-5 w-5' />
								Schedule History
							</h2>

							{schedules.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Driver</TableHead>
											<TableHead>Amazon ID</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{schedules.map((schedule) => (
											<TableRow key={schedule.id}>
												<TableCell className='font-semibold text-gray-900'>
													{schedule.driverName}
												</TableCell>
												<TableCell>
													<Badge className='bg-blue-600 text-white'>
														{schedule.amazonId}
													</Badge>
												</TableCell>
												<TableCell className='text-gray-600'>
													{format(
														schedule.startTime,
														'MMM dd, yyyy'
													)}
												</TableCell>
												<TableCell className='text-gray-600'>
													{format(
														schedule.startTime,
														'h:mm a'
													)}{' '}
													-{' '}
													{format(
														schedule.endTime,
														'h:mm a'
													)}
												</TableCell>
												<TableCell>
													<Badge
														className={
															schedule.status ===
															'completed'
																? 'bg-green-600 text-white'
																: schedule.status ===
																	  'confirmed'
																	? 'bg-blue-600 text-white'
																	: 'bg-gray-500 text-white'
														}>
														{schedule.status}
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className='text-center py-12'>
									<Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-600'>
										No schedule history for this vehicle
									</p>
								</div>
							)}
						</Card>

						<Card className='p-4 sm:p-6 bg-white  overflow-x-auto'>
							<h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
								<Wrench className='h-5 w-5' />
								Maintenance History
							</h2>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Cost</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell className='text-gray-600'>
											Jan 10, 2024
										</TableCell>
										<TableCell className='font-medium text-gray-900'>
											Oil Change
										</TableCell>
										<TableCell className='text-gray-600'>
											Regular maintenance service
										</TableCell>
										<TableCell className='text-gray-900'>
											$85.00
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className='text-gray-600'>
											Dec 15, 2023
										</TableCell>
										<TableCell className='font-medium text-gray-900'>
											Tire Rotation
										</TableCell>
										<TableCell className='text-gray-600'>
											Rotated all four tires
										</TableCell>
										<TableCell className='text-gray-900'>
											$60.00
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className='text-gray-600'>
											Nov 22, 2023
										</TableCell>
										<TableCell className='font-medium text-gray-900'>
											Brake Inspection
										</TableCell>
										<TableCell className='text-gray-600'>
											Inspected brake pads and rotors
										</TableCell>
										<TableCell className='text-gray-900'>
											$120.00
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
