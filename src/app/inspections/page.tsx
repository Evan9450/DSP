'use client';

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
	ScheduleResponse,
	VehicleInspectionResponse,
	VehicleResponse,
} from '@/lib/api/client';
import { format } from 'date-fns';
import { useInspections } from '@/hooks/use-inspections';
import { useSchedules } from '@/hooks/use-schedules';
import { useVehicles } from '@/hooks/use-vehicles';
import { DateSelector } from './components/date-selector';
import { VehiclesTable } from './components/vehicles-table';

type VehicleWithDetails = VehicleResponse & {
	schedule?: ScheduleResponse;
	inspection?: VehicleInspectionResponse;
};

export default function InspectionsPage() {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [usedVehicles, setUsedVehicles] = useState<VehicleWithDetails[]>([]);
	const [unusedVehicles, setUnusedVehicles] = useState<VehicleWithDetails[]>([]);

	// Format date for API
	const formattedDate = selectedDate
		? format(selectedDate, 'yyyy-MM-dd')
		: undefined;

	// Only fetch data when a date is selected
	const { vehicles, isLoading: vehiclesLoading } = useVehicles();
	const { schedules, isLoading: schedulesLoading } = useSchedules(
		formattedDate,
		formattedDate
	);
	const { inspections, isLoading: inspectionsLoading } = useInspections({
		inspectionDate: formattedDate,
	});

	useEffect(() => {
		if (
			!selectedDate ||
			vehiclesLoading ||
			schedulesLoading ||
			inspectionsLoading
		) {
			return;
		}

		// Separate vehicles based on status: 0 = in-use, 1 = not-in-use
		const used = vehicles
			.filter((vehicle) => vehicle.status === 0)
			.map((vehicle) => {
				// Find schedule for this vehicle on the selected date
				const schedule = schedules.find((s) => s.vehicle_id === vehicle.id);
				const inspection = inspections.find(
					(i) => i.vehicle_id === vehicle.id
				);
				return { ...vehicle, schedule, inspection };
			});

		const unused = vehicles
			.filter((vehicle) => vehicle.status === 1)
			.map((vehicle) => {
				const inspection = inspections.find(
					(i) => i.vehicle_id === vehicle.id
				);
				return { ...vehicle, inspection };
			});

		setUsedVehicles(used);
		setUnusedVehicles(unused);
	}, [
		selectedDate,
		vehicles,
		schedules,
		inspections,
		vehiclesLoading,
		schedulesLoading,
		inspectionsLoading,
	]);

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto p-6'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold text-gray-900'>
						Vehicle Inspection Records
					</h1>
					{/* <p className='text-gray-600 mt-2'>
						Vehicle Inspection Records
					</p> */}
				</div>

				{/* Date Selector */}
				<DateSelector
					selectedDate={selectedDate}
					onDateChange={setSelectedDate}
				/>

				{/* Show prompt when no date is selected */}
				{!selectedDate && (
					<Card>
						<CardContent className='py-12'>
							<div className='text-center'>
								<CalendarIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									Please Select a Date
								</h3>
								<p className='text-gray-600'>
									Choose a date above to view vehicle
									inspections
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Loading State */}
				{selectedDate &&
					(vehiclesLoading ||
						schedulesLoading ||
						inspectionsLoading) && (
						<Card>
							<CardContent className='py-8'>
								<div className='flex items-center justify-center'>
									<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
									<p className='ml-4 text-gray-600'>
										Loading...
									</p>
								</div>
							</CardContent>
						</Card>
					)}

				{selectedDate &&
					!vehiclesLoading &&
					!schedulesLoading &&
					!inspectionsLoading && (
						<>
							{/* Used Vehicles Section */}
							<div className='mb-6'>
								<VehiclesTable
									title='Vehicles in Use'
									vehicles={usedVehicles}
									showDriverColumn={true}
									emptyMessage='No vehicles in use on this date'
								/>
							</div>

							{/* Unused Vehicles Section */}
							<div>
								<VehiclesTable
									title='Vehicles Not in Use'
									vehicles={unusedVehicles}
									showDriverColumn={false}
									emptyMessage='All vehicles are in use on this date'
								/>
							</div>
						</>
					)}
			</div>
		</div>
	);
}
