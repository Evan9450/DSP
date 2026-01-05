'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Eye, Image, XCircle } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VehicleInspectionResponse } from '@/lib/api/client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface InspectionsTableProps {
	inspections: VehicleInspectionResponse[];
	selectedDate?: string;
}

// Helper function to parse inspection_urls (handles both array and JSON string)
const getPhotoUrls = (urls: any): string[] => {
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

const getInspectionStatusBadge = (status: 'pending' | 'passed' | 'failed') => {
	switch (status) {
		case 'pending':
			return (
				<Badge
					variant='outline'
					className='border-yellow-300 bg-yellow-50 text-yellow-800'>
					<Clock className='h-3 w-3 mr-1' />
					Pending
				</Badge>
			);
		case 'passed':
			return (
				<Badge
					variant='outline'
					className='border-green-300 bg-green-50 text-green-800'>
					<CheckCircle2 className='h-3 w-3 mr-1' />
					Passed
				</Badge>
			);
		case 'failed':
			return (
				<Badge
					variant='outline'
					className='border-red-300 bg-red-50 text-red-800'>
					<XCircle className='h-3 w-3 mr-1' />
					Failed
				</Badge>
			);
		default:
			return <Badge variant='outline'>Unknown</Badge>;
	}
};

const getReviewStatusBadge = (reviewed: boolean) => {
	if (reviewed) {
		return (
			<Badge
				variant='outline'
				className='border-blue-300 bg-blue-50 text-blue-800'>
				Reviewed
			</Badge>
		);
	}
	return (
		<Badge
			variant='outline'
			className='border-gray-300 bg-gray-50 text-gray-800'>
			Not Reviewed
		</Badge>
	);
};

export function InspectionsTable({
	inspections,
	selectedDate,
}: InspectionsTableProps) {
	console.log('🚀 => InspectionsTable => inspections:', inspections);
	const router = useRouter();

	const handleViewDetails = (inspectionId: number, vehicleId: number) => {
		router.push(`/inspections/${vehicleId}?inspection_id=${inspectionId}`);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center justify-between'>
					<span>
						Inspection Records
						{selectedDate && (
							<span className='text-sm font-normal text-gray-600 ml-2'>
								(
								{format(new Date(selectedDate), 'MMM dd, yyyy')}
								)
							</span>
						)}
					</span>
					<Badge variant='secondary' className='text-lg'>
						{inspections.length} Total
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{inspections.length === 0 ? (
					<div className='text-center py-12'>
						<Clock className='h-16 w-16 text-gray-400 mx-auto mb-4' />
						<h3 className='text-lg font-semibold text-gray-900 mb-2'>
							No Inspections Found
						</h3>
						<p className='text-gray-600'>
							No inspection records found for the selected date.
						</p>
					</div>
				) : (
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Vehicle ID</TableHead>
									<TableHead>Driver ID</TableHead>
									<TableHead>Inspection Date</TableHead>
									<TableHead>Mileage</TableHead>
									<TableHead>Photos</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Review Status</TableHead>
									<TableHead>Notes</TableHead>
									<TableHead className='text-center'>
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{inspections.map((inspection) => {
									const photoUrls = getPhotoUrls(inspection.inspection_urls);
									return (
									<TableRow
										key={inspection.id}
										className='hover:bg-gray-50 transition-colors'>
										<TableCell className='font-medium'>
											Vehicle #{inspection.vehicle_id}
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
										<TableCell>
											{format(
												new Date(
													inspection.inspection_date
												),
												'MMM dd, yyyy'
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
											{photoUrls && photoUrls.length > 0 ? (
												<div className='flex items-center gap-1'>
													<Image className='h-4 w-4 text-blue-600' />
													<span className='text-sm'>
														{photoUrls.length}
													</span>
												</div>
											) : (
												<span className='text-gray-400'>
													No photos
												</span>
											)}
										</TableCell>
										<TableCell>
											{getInspectionStatusBadge(
												inspection.inspection_status
											)}
										</TableCell>
										<TableCell>
											{getReviewStatusBadge(
												inspection.reviewed_by_admin
											)}
										</TableCell>
										<TableCell className='max-w-xs'>
											{inspection.notes ? (
												<div className='truncate text-sm text-gray-700'>
													{inspection.notes}
												</div>
											) : (
												<span className='text-gray-400'>
													-
												</span>
											)}
										</TableCell>
										<TableCell className='text-center'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() =>
													handleViewDetails(
														inspection.id,
														inspection.vehicle_id
													)
												}>
												<Eye className='h-4 w-4 mr-1' />
												View
											</Button>
										</TableCell>
									</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
