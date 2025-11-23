'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
	VehicleResponse,
	ScheduleResponse,
	VehicleInspectionResponse,
} from '@/lib/api/client';

type VehicleWithDetails = VehicleResponse & {
	schedule?: ScheduleResponse;
	inspection?: VehicleInspectionResponse;
};

interface VehiclesTableProps {
	title: string;
	vehicles: VehicleWithDetails[];
	showDriverColumn?: boolean;
	emptyMessage: string;
}

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

export function VehiclesTable({
	title,
	vehicles,
	showDriverColumn = false,
	emptyMessage,
}: VehiclesTableProps) {
	const router = useRouter();

	const handleRowClick = (vehicleId: number) => {
		router.push(`/inspections/${vehicleId}`);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{title} ({vehicles.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				{vehicles.length === 0 ? (
					<p className='text-center text-gray-500 py-8'>{emptyMessage}</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Vehicle</TableHead>
								<TableHead>Registration</TableHead>
								<TableHead>Brand/Model</TableHead>
								{showDriverColumn && <TableHead>Driver ID</TableHead>}
								<TableHead>Condition</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Mileage</TableHead>
								<TableHead className='text-center'>Inspection</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{vehicles.map((vehicle) => (
								<TableRow
									key={vehicle.id}
									onClick={() => handleRowClick(vehicle.id)}
									className='cursor-pointer hover:bg-gray-50 transition-colors'>
									<TableCell className='font-medium'>
										{vehicle.alias}
									</TableCell>
									<TableCell className='font-mono text-sm'>
										{vehicle.rego}
									</TableCell>
									<TableCell>
										{vehicle.brand && vehicle.model ? (
											`${vehicle.brand} ${vehicle.model}`
										) : (
											<span className='text-gray-400'>-</span>
										)}
									</TableCell>
									{showDriverColumn && (
										<TableCell>
											{vehicle.schedule?.driver_id ? (
												`Driver #${vehicle.schedule.driver_id}`
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</TableCell>
									)}
									<TableCell>
										<Badge className={cn(getConditionColor(vehicle.condition))}>
											{getConditionText(vehicle.condition)}
										</Badge>
									</TableCell>
									<TableCell>{getStatusText(vehicle.status)}</TableCell>
									<TableCell className='font-mono'>
										{vehicle.mileage ? (
											`${vehicle.mileage.toLocaleString()} km`
										) : (
											<span className='text-gray-400'>-</span>
										)}
									</TableCell>
									<TableCell className='text-center'>
										{vehicle.inspection ? (
											<div className='flex flex-col items-center gap-1'>
												<CheckCircle2 className='h-5 w-5 text-green-600' />
												{vehicle.inspection.mileage_at_inspection && (
													<span className='text-xs text-gray-600'>
														{vehicle.inspection.mileage_at_inspection.toLocaleString()}{' '}
														km
													</span>
												)}
											</div>
										) : (
											<AlertCircle className='h-5 w-5 text-orange-500 mx-auto' />
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
