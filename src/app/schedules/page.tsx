'use client';

import { useState, useEffect } from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { useDrivers } from '@/hooks/use-drivers';
import { useVehicles } from '@/hooks/use-vehicles';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, User, MapPin, Car as CarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient, ScheduleResponse } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function ScheduleTablePage() {
	const { toast } = useToast();
	const [selectedDate, setSelectedDate] = useState<string>(
		format(new Date(), 'yyyy-MM-dd')
	);

	// Handle URL date parameter on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const dateParam = params.get('date');
			if (dateParam) {
				setSelectedDate(dateParam);
			}
		}
	}, []);

	const { schedules, isLoading, refetch } = useSchedules(
		selectedDate,
		selectedDate
	);
	const { drivers } = useDrivers();
	const { vehicles } = useVehicles();

	const [scheduleData, setScheduleData] = useState<ScheduleResponse[]>([]);

	useEffect(() => {
		setScheduleData(schedules);
	}, [schedules]);

	const handleVehicleAssignment = async (
		scheduleId: number,
		vehicleId: string
	) => {
		try {
			await apiClient.updateSchedule(scheduleId, {
				vehicle_id: parseInt(vehicleId),
			});
			refetch();
			toast({
				title: 'Vehicle Assigned',
				description: 'Vehicle has been assigned successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to assign vehicle',
				variant: 'destructive',
			});
		}
	};

	const handleConfirm = async () => {
		try {
			// Update all schedules to confirmed status
			const updates = scheduleData.map((schedule) =>
				apiClient.updateSchedule(schedule.id, { status: 'confirmed' })
			);
			await Promise.all(updates);
			refetch();
			toast({
				title: 'Confirmed',
				description: 'All schedules have been confirmed',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to confirm schedules',
				variant: 'destructive',
			});
		}
	};

	const getDriverName = (driverId: number) => {
		const driver = drivers.find((d) => d.id === driverId);
		return driver?.name || '';
	};

	const getVehicleAlias = (vehicleId: number | undefined) => {
		if (!vehicleId) return '';
		const vehicle = vehicles.find((v) => v.id === vehicleId);
		return vehicle?.alias || '';
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='mb-4 sm:mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
							{format(new Date(selectedDate), 'dd/MM/yyyy')}
						</h1>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className={cn(
										'w-[240px] justify-start text-left font-normal',
										!selectedDate && 'text-muted-foreground'
									)}>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{selectedDate ? (
										format(new Date(selectedDate), 'PPP')
									) : (
										<span>Pick a date</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0' align='start'>
								<Calendar
									mode='single'
									selected={new Date(selectedDate)}
									onSelect={(date) => {
										if (date) {
											setSelectedDate(format(date, 'yyyy-MM-dd'));
										}
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<Button variant='outline'>Import Routes</Button>
				</div>

				<Card className='bg-white overflow-hidden'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[60px]'></TableHead>
								<TableHead>Driver Name</TableHead>
								<TableHead>Check-in Status</TableHead>
								<TableHead>Route</TableHead>
								<TableHead>Vehicle</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className='text-center py-12'>
										<div className='flex flex-col items-center gap-3'>
											<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700'></div>
											<p className='text-gray-600'>
												Loading schedules...
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : scheduleData.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className='text-center py-12'>
										<CalendarIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
										<p className='text-gray-600'>
											No schedules for this date
										</p>
									</TableCell>
								</TableRow>
							) : (
								scheduleData.map((schedule) => (
									<TableRow
										key={schedule.id}
										className='hover:bg-gray-50 transition-colors'>
										<TableCell>
											<div className='p-2 bg-blue-100 rounded-full inline-block'>
												<User className='h-5 w-5 text-blue-700' />
											</div>
										</TableCell>
										<TableCell>
											<Select
												defaultValue={schedule.driver_id.toString()}>
												<SelectTrigger className='w-full border-0 shadow-none hover:bg-gray-100'>
													<SelectValue>
														<div className='flex items-center gap-2'>
															<span className='font-medium text-gray-900'>
																{getDriverName(
																	schedule.driver_id
																)}
															</span>
														</div>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{drivers.map((driver) => (
														<SelectItem
															key={driver.id}
															value={driver.id.toString()}>
															{driver.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													schedule.driver_confirmed
														? 'default'
														: 'secondary'
												}
												className={
													schedule.driver_confirmed
														? 'bg-green-600 text-white'
														: 'bg-gray-300 text-gray-700'
												}>
												{schedule.driver_confirmed
													? 'Yes'
													: 'No'}
											</Badge>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												{schedule.route ? (
													<>
														<MapPin className='h-4 w-4 text-blue-600' />
														<span className='font-mono font-semibold text-gray-900'>
															{schedule.route}
														</span>
													</>
												) : (
													<span className='text-gray-400'>
														Not assigned
													</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Select
												value={schedule.vehicle_id?.toString()}
												onValueChange={(value) =>
													handleVehicleAssignment(
														schedule.id,
														value
													)
												}>
												<SelectTrigger className='w-full border-0 shadow-none hover:bg-gray-100'>
													<SelectValue placeholder='Select vehicle'>
														<div className='flex items-center gap-2'>
															<CarIcon className='h-4 w-4 text-gray-500' />
															<span className='font-medium'>
																{getVehicleAlias(
																	schedule.vehicle_id
																) || 'Select vehicle'}
															</span>
														</div>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{vehicles
														.filter((v) => v.status === 0)
														.map((vehicle) => (
															<SelectItem
																key={vehicle.id}
																value={vehicle.id.toString()}>
																<div className='flex items-center gap-2'>
																	<CarIcon className='h-4 w-4 text-gray-500' />
																	{vehicle.alias}
																</div>
															</SelectItem>
														))}
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					{scheduleData.length > 0 && (
						<div className='p-6 border-t bg-gray-50'>
							<div className='flex justify-between items-center'>
								<p className='text-sm text-gray-600'>
									Total routes: {scheduleData.length}
								</p>
								<Button
									onClick={handleConfirm}
									className='bg-blue-700 hover:bg-blue-800'>
									Confirm All Schedules
								</Button>
							</div>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
