'use client';

import {
	CheckCircle2,
	Clock,
	Eye,
	FileText,
	Image as ImageIcon,
	XCircle,
} from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import { VehicleDetailResponse } from '@/lib/api/client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface InspectionHistoryProps {
	vehicle: VehicleDetailResponse;
}

export function InspectionHistory({ vehicle }: InspectionHistoryProps) {
	const router = useRouter();

	return (
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
						{vehicle.recent_inspections.map((inspection: any) => {
							// Parse photo URLs
							const getPhotoCount = (urls: any): number => {
								if (!urls) return 0;
								if (Array.isArray(urls)) return urls.length;
								if (typeof urls === 'string') {
									try {
										const parsed = JSON.parse(urls);
										return Array.isArray(parsed)
											? parsed.length
											: 0;
									} catch (e) {
										return 0;
									}
								}
								return 0;
							};

							const photoCount = getPhotoCount(
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
											inspection.driver_name
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
													{photoCount}
												</span>
											</div>
										) : (
											<span className='text-gray-400'>
												No photos
											</span>
										)}
									</TableCell>
									<TableCell>
										{inspection.condition ===
											'need-repair' && (
											<Badge
												variant='outline'
												className='border-yellow-300 bg-yellow-50 text-yellow-800'>
												<Clock className='h-3 w-3 mr-1' />
												Need Repair
											</Badge>
										)}
										{inspection.condition ===
											'available' && (
											<Badge
												variant='outline'
												className='border-green-300 bg-green-50 text-green-800'>
												<CheckCircle2 className='h-3 w-3 mr-1' />
												Available
											</Badge>
										)}
										{inspection.condition ===
											'unavailable' && (
											<Badge
												variant='outline'
												className='border-red-300 bg-red-50 text-red-800'>
												<XCircle className='h-3 w-3 mr-1' />
												Unavailable
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
						})}
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
	);
}
