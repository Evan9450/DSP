'use client';

import { Calendar as CalendarClock, CalendarIcon } from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { ScheduleResponse, apiClient } from '@/lib/api/client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ScheduleTable } from '../components/ScheduleTable';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ScheduleHistoryPage() {
	const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();

	const fetchSchedulesForDate = async (dateStr: string) => {
		try {
			setIsLoading(true);
			const data = await apiClient.getSchedules({
				schedule_date: dateStr,
			});
			setSchedules(data);
		} catch (error) {
			console.error('Failed to fetch schedules:', error);
			setSchedules([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDateSelect = (date: Date | undefined) => {
		setSelectedDate(date);
		if (date) {
			const dateStr = format(date, 'yyyy-MM-dd');
			fetchSchedulesForDate(dateStr);
		} else {
			// Clear schedules when no date is selected
			setSchedules([]);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='mb-4 sm:mb-6'>
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						Schedule History
					</h1>
				</div>

				<div className='mb-6 flex items-center gap-4'>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								className={cn(
									'w-full justify-start text-left font-normal',
									!selectedDate && 'text-muted-foreground',
								)}>
								<CalendarIcon className='mr-2 h-4 w-4' />
								{selectedDate ? (
									format(selectedDate, 'PPP')
								) : (
									<span>Select Date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-auto p-0'>
							<Calendar
								mode='single'
								captionLayout='dropdown'
								fromYear={1900}
								toYear={2999}
								classNames={{
									caption:
										'flex items-center justify-center gap-2 pt-1',
									caption_label: 'hidden', // ❗只对 dropdown 隐藏 label
									vhidden: 'hidden', // ❗把 rdp-vhidden 隐藏掉
								}}
								selected={selectedDate}
								onSelect={handleDateSelect}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
					{selectedDate && (
						<Button
							variant='ghost'
							onClick={() => handleDateSelect(undefined)}
							className='text-sm'>
							Clear Filter
						</Button>
					)}
				</div>

				<Card className='bg-white overflow-hidden'>
					{!selectedDate ? (
						<div className='text-center py-12'>
							<CalendarClock className='h-12 w-12 text-gray-400 mx-auto mb-4' />
							<p className='text-gray-600 font-medium'>
								Please select a date to view schedule history
							</p>
							<p className='text-gray-500 text-sm mt-2'>
								Use the calendar above to choose a date
							</p>
						</div>
					) : (
						<ScheduleTable
							mode='readonly'
							schedules={schedules}
							isLoading={isLoading}
							emptyMessage='No schedules found for selected date'
							loadingMessage='Loading schedules...'
						/>
					)}
				</Card>
			</div>
		</div>
	);
}
