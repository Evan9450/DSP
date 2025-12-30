'use client';

import { Calendar as CalendarClock, CalendarIcon, MapPin, User } from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ScheduleResponse, apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

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

	const formatTime = (timeStr: string) => {
		if (!timeStr) return '';

		try {
			const date = new Date(timeStr);
			const hours = date.getHours();
			const minutes = date.getMinutes();
			const period = hours >= 12 ? 'PM' : 'AM';
			const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
			const displayMinutes = minutes.toString().padStart(2, '0');
			return `${displayHours}:${displayMinutes} ${period}`;
		} catch (error) {
			return timeStr;
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='mb-4 sm:mb-6'>
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						Schedule History
					</h1>
					<p className='text-sm sm:text-base text-gray-600 mt-1'>
						View past schedule records
					</p>
				</div>

				<div className='mb-6 flex items-center gap-4'>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								className={cn(
									'w-[280px] justify-start text-left font-normal',
									!selectedDate && 'text-muted-foreground'
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
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[60px]'></TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Driver</TableHead>
								<TableHead>Route</TableHead>
								<TableHead>Shift Time</TableHead>
								<TableHead>Vehicle</TableHead>
								<TableHead>Check-in</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className='text-center py-12'>
										<div className='flex flex-col items-center gap-3'>
											<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700'></div>
											<p className='text-gray-600'>
												Loading schedules...
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : !selectedDate ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className='text-center py-12'>
										<CalendarClock className='h-12 w-12 text-gray-400 mx-auto mb-4' />
										<p className='text-gray-600 font-medium'>
											Please select a date to view schedule history
										</p>
										<p className='text-gray-500 text-sm mt-2'>
											Use the calendar above to choose a date
										</p>
									</TableCell>
								</TableRow>
							) : schedules.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className='text-center py-12'>
										<CalendarClock className='h-12 w-12 text-gray-400 mx-auto mb-4' />
										<p className='text-gray-600'>
											No schedules found for selected date
										</p>
									</TableCell>
								</TableRow>
							) : (
								schedules.map((schedule) => (
									<TableRow
										key={schedule.id}
										className='hover:bg-gray-50 transition-colors'>
										<TableCell>
											<div className='p-2 bg-blue-100 rounded-full inline-block'>
												<CalendarIcon className='h-5 w-5 text-blue-700' />
											</div>
										</TableCell>
										<TableCell>
											<div>
												<p className='font-semibold text-gray-900'>
													{format(
														new Date(schedule.schedule_date),
														'MMM dd, yyyy'
													)}
												</p>
												<p className='text-xs text-gray-500'>
													{format(
														new Date(schedule.schedule_date),
														'EEEE'
													)}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												<User className='h-4 w-4 text-gray-500' />
												<span className='font-medium text-gray-900'>
													{schedule.driver_name}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{schedule.route ? (
												<div className='flex items-center gap-2'>
													<MapPin className='h-4 w-4 text-blue-600' />
													<span className='font-mono font-semibold text-gray-900'>
														{schedule.route}
													</span>
												</div>
											) : (
												<span className='text-gray-400 text-sm'>
													Not assigned
												</span>
											)}
										</TableCell>
										<TableCell>
											{schedule.start_time && schedule.end_time ? (
												<div className='flex items-center gap-1 text-sm text-gray-700'>
													<span className='font-medium'>
														{formatTime(schedule.start_time)}
													</span>
													<span className='text-gray-400'>-</span>
													<span className='font-medium'>
														{formatTime(schedule.end_time)}
													</span>
												</div>
											) : (
												<span className='text-gray-400 text-sm'>-</span>
											)}
										</TableCell>
										<TableCell>
											{schedule.vehicle ? (
												<span className='font-medium text-gray-900'>
													{schedule.vehicle}
												</span>
											) : (
												<span className='text-gray-400 text-sm'>
													Not assigned
												</span>
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													schedule.checkin_status === 'checked_in' ||
													schedule.checkin_status === 'completed'
														? 'default'
														: 'secondary'
												}
												className={
													schedule.checkin_status === 'checked_in' ||
													schedule.checkin_status === 'completed'
														? 'bg-green-600 text-white'
														: 'bg-gray-300 text-gray-700'
												}>
												{schedule.checkin_status === 'checked_in' ||
												schedule.checkin_status === 'completed'
													? 'Yes'
													: 'No'}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													schedule.confirm_status === 'confirmed'
														? 'default'
														: schedule.confirm_status === 'cancelled'
														? 'destructive'
														: 'secondary'
												}
												className={
													schedule.confirm_status === 'confirmed'
														? 'bg-blue-600 text-white'
														: schedule.confirm_status === 'cancelled'
														? 'bg-rose-500 text-white'
														: 'bg-gray-300 text-gray-700'
												}>
												{schedule.confirm_status === 'confirmed'
													? 'Confirmed'
													: schedule.confirm_status === 'cancelled'
													? 'Cancelled'
													: 'Pending'}
											</Badge>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					{selectedDate && schedules.length > 0 && (
						<div className='p-4 border-t bg-gray-50'>
							<p className='text-sm text-gray-600'>
								Showing {schedules.length}{' '}
								{schedules.length === 1 ? 'schedule' : 'schedules'} for{' '}
								{format(selectedDate, 'PPP')}
							</p>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
