'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useInspections } from '@/hooks/use-inspections';
import { DateSelector } from './components/date-selector';
import { InspectionsTable } from './components/inspections-table';

export default function InspectionsPage() {
	// Default to today's date
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

	// Format date for API
	const formattedDate = selectedDate
		? format(selectedDate, 'yyyy-MM-dd')
		: undefined;

	// Fetch inspections for selected date
	const { inspections, isLoading } = useInspections({
		inspection_date: formattedDate,
	});

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto p-6'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold text-gray-900'>
						Vehicle Inspection Records
					</h1>
					<p className='text-gray-600 mt-2'>
						View and manage daily vehicle inspections
					</p>
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
									Choose a date above to view inspection records
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Loading State */}
				{selectedDate && isLoading && (
					<Card>
						<CardContent className='py-8'>
							<div className='flex items-center justify-center'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
								<p className='ml-4 text-gray-600'>Loading inspections...</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Inspections Table */}
				{selectedDate && !isLoading && (
					<InspectionsTable
						inspections={inspections}
						selectedDate={formattedDate}
					/>
				)}
			</div>
		</div>
	);
}
