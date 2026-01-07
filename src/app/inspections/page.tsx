'use client';

import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { VehicleInspectionResponse, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DateSelector } from './components/date-selector';
import { InspectionsTable } from './components/inspections-table';
import { VehicleSelector } from './components/vehicle-selector';
import { format } from 'date-fns';

export default function InspectionsPage() {
	// Filter states
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date()
	);
	const [selectedVehicle, setSelectedVehicle] = useState<
		number | undefined
	>();

	// Data states
	const [inspections, setInspections] = useState<VehicleInspectionResponse[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false);

	// Format date for API
	const formattedDate = selectedDate
		? format(selectedDate, 'yyyy-MM-dd')
		: undefined;

	// Fetch inspections based on filters
	useEffect(() => {
		const fetchInspections = async () => {
			// If no filters, clear data
			if (!formattedDate && !selectedVehicle) {
				setInspections([]);
				return;
			}

			setIsLoading(true);
			try {
				let data: VehicleInspectionResponse[];

				// Smart API endpoint selection based on filters
				if (formattedDate && selectedVehicle) {
					// Both filters: use general list endpoint
					data = await apiClient.listInspections({
						inspection_date: formattedDate,
						vehicle_id: selectedVehicle,
					});
				} else if (formattedDate) {
					// Only date: use optimized by-date endpoint
					data = await apiClient.getInspectionsByDate(formattedDate);
				} else if (selectedVehicle) {
					// Only vehicle: use optimized by-vehicle endpoint
					data =
						await apiClient.getInspectionsByVehicle(
							selectedVehicle
						);
				} else {
					data = [];
				}

				setInspections(data);
			} catch (error) {
				console.error('Failed to fetch inspections:', error);
				setInspections([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchInspections();
	}, [formattedDate, selectedVehicle]);

	// Clear all filters
	const handleClearFilters = () => {
		setSelectedDate(undefined);
		setSelectedVehicle(undefined);
	};

	const hasActiveFilters = selectedDate || selectedVehicle;

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto p-6'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold text-gray-900'>
						Vehicle Inspection Records
					</h1>
				</div>

				{/* Filters */}
				<div className='mb-6 flex flex-wrap items-center gap-4'>
					<DateSelector
						selectedDate={selectedDate}
						onDateChange={setSelectedDate}
					/>
					{/* <VehicleSelector
						selectedVehicle={selectedVehicle}
						onVehicleChange={setSelectedVehicle}
					/>
					{hasActiveFilters && (
						<Button
							variant='ghost'
							onClick={handleClearFilters}
							className='text-sm text-gray-600 hover:text-gray-900'>
							<X className='h-4 w-4 mr-1' />
							Clear Filters
						</Button>
					)} */}
				</div>

				{/* Show prompt when no filters are active */}
				{!hasActiveFilters && (
					<Card>
						<CardContent className='py-12'>
							<div className='text-center'>
								<CalendarIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									Please Select Filters
								</h3>
								<p className='text-gray-600'>
									Choose a date or vehicle to view inspection
									records
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Loading State */}
				{hasActiveFilters && isLoading && (
					<Card>
						<CardContent className='py-8'>
							<div className='flex items-center justify-center'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
								<p className='ml-4 text-gray-600'>
									Loading inspections...
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Inspections Table */}
				{hasActiveFilters && !isLoading && (
					<InspectionsTable
						inspections={inspections}
						selectedDate={formattedDate}
					/>
				)}
			</div>
		</div>
	);
}
