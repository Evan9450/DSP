'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
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
import { CalendarIcon, Calendar as CalendarClock, Eye } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ScheduleHistory {
	date: string;
	totalRoutes: number;
}

export default function ScheduleHistoryPage() {
	const router = useRouter();
	const [allHistory, setAllHistory] = useState<ScheduleHistory[]>([]);
	const [filteredHistory, setFilteredHistory] = useState<ScheduleHistory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();

	useEffect(() => {
		fetchHistory();
	}, []);

	const fetchHistory = async () => {
		try {
			setIsLoading(true);
			// Fetch schedules for the last 14 days
			const endDate = format(new Date(), 'yyyy-MM-dd');
			const startDate = format(subDays(new Date(), 13), 'yyyy-MM-dd');

			const schedules = await apiClient.getSchedules(startDate, endDate);

			// Group schedules by date
			const dateGroups = schedules.reduce(
				(acc: Record<string, number>, schedule) => {
					const date = schedule.date;
					if (!acc[date]) {
						acc[date] = 0;
					}
					acc[date]++;
					return acc;
				},
				{}
			);

			// Convert to array and sort by date (newest first)
			const historyData = Object.entries(dateGroups)
				.map(([date, totalRoutes]) => ({
					date,
					totalRoutes,
				}))
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

			setAllHistory(historyData);
			setFilteredHistory(historyData);
		} catch (error) {
			console.error('Failed to fetch schedule history:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDateSelect = (date: Date | undefined) => {
		setSelectedDate(date);
		if (date) {
			// Filter history to show only the selected date
			const dateStr = format(date, 'yyyy-MM-dd');
			const filtered = allHistory.filter((item) => item.date === dateStr);
			setFilteredHistory(filtered);
		} else {
			// Show all history if no date is selected
			setFilteredHistory(allHistory);
		}
	};

	const handleViewSchedule = (date: string) => {
		router.push(`/schedules?date=${date}`);
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
								<TableHead className='text-center'>
									Total Routes
								</TableHead>
								<TableHead className='text-center w-[120px]'>
									Action
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className='text-center py-12'>
										<div className='flex flex-col items-center gap-3'>
											<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700'></div>
											<p className='text-gray-600'>
												Loading history...
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : filteredHistory.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className='text-center py-12'>
										<CalendarClock className='h-12 w-12 text-gray-400 mx-auto mb-4' />
										<p className='text-gray-600'>
											{selectedDate
												? 'No schedules found for selected date'
												: 'No schedule history available'}
										</p>
									</TableCell>
								</TableRow>
							) : (
								filteredHistory.map((item) => (
									<TableRow
										key={item.date}
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
														new Date(item.date),
														'EEEE, MMMM dd, yyyy'
													)}
												</p>
												<p className='text-xs text-gray-500'>
													{format(
														new Date(item.date),
														'dd/MM/yyyy'
													)}
												</p>
											</div>
										</TableCell>
										<TableCell className='text-center'>
											<div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full'>
												<span className='text-xl font-bold text-blue-700'>
													{item.totalRoutes}
												</span>
												<span className='text-xs text-blue-600'>
													{item.totalRoutes === 1
														? 'route'
														: 'routes'}
												</span>
											</div>
										</TableCell>
										<TableCell className='text-center'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() =>
													handleViewSchedule(item.date)
												}
												className='hover:bg-blue-50 hover:text-blue-700'>
												<Eye className='h-4 w-4 mr-2' />
												View
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					{filteredHistory.length > 0 && (
						<div className='p-4 border-t bg-gray-50'>
							<p className='text-sm text-gray-600'>
								Showing {filteredHistory.length}{' '}
								{filteredHistory.length === 1 ? 'record' : 'records'}
								{selectedDate && ' for selected date'}
							</p>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
