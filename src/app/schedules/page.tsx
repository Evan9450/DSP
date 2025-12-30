'use client';

import {
	CalendarIcon,
	Car as CarIcon,
	MapPin,
	Upload,
	User,
} from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { ScheduleResponse, apiClient } from '@/lib/api/client';
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
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function ScheduleTablePage() {
	const { toast } = useToast();
	const [selectedDate, setSelectedDate] = useState<string>(
		format(new Date(), 'yyyy-MM-dd')
	);
	const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
	const [isSyncingToday, setIsSyncingToday] = useState(false);
	const [isSyncingDate, setIsSyncingDate] = useState(false);

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

	const [scheduleData, setScheduleData] = useState<ScheduleResponse[]>([]);
	const [allVehicles, setAllVehicles] = useState<any[]>([]);
	const [allDrivers, setAllDrivers] = useState<any[]>([]);
	const [isImporting, setIsImporting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Get available vehicles for a specific schedule
	const getAvailableVehiclesForSchedule = (
		currentSchedule: ScheduleResponse
	) => {
		// Get all vehicle aliases that are already assigned to OTHER schedules
		const assignedVehicles = scheduleData
			.filter((s) => s.id !== currentSchedule.id && s.vehicle) // Exclude current schedule
			.map((s) => s.vehicle);

		// Filter out vehicles that are already assigned
		return allVehicles.filter((v) => !assignedVehicles.includes(v.alias));
	};

	// Fetch all vehicles (including assigned ones)
	const fetchVehicles = async () => {
		try {
			const data = await apiClient.getVehicles();
			console.log(
				'✅ All vehicles loaded (count: ' + data.length + '):',
				data
			);
			setAllVehicles(data);
		} catch (error) {
			console.error('❌ Failed to fetch vehicles:', error);
			setAllVehicles([]);
		}
	};

	// Fetch all drivers from database
	const fetchDrivers = async () => {
		try {
			const data = await apiClient.getDrivers();
			console.log(
				'✅ All drivers loaded (count: ' + data.length + '):',
				data
			);
			setAllDrivers(data);
		} catch (error) {
			console.error('❌ Failed to fetch drivers:', error);
			setAllDrivers([]);
		}
	};

	// Fetch vehicles and drivers on mount
	useEffect(() => {
		fetchVehicles();
		fetchDrivers();
	}, []);

	// Fetch schedules for selected date
	const fetchSchedules = async () => {
		try {
			setIsLoadingSchedules(true);
			const data = await apiClient.getSchedules({
				schedule_date: selectedDate,
				auto_sync: true,
			});

			// Sort by deputy_id (ascending) to maintain stable order
			// This ensures rows don't move when driver is changed
			const sortedData = [...data].sort((a, b) => {
				const idA = parseInt(a.deputy_id) || 0;
				const idB = parseInt(b.deputy_id) || 0;
				return idA - idB;
			});
			console.log('🚀 => fetchSchedules => sortedData:', sortedData);

			setScheduleData(sortedData);
			console.log('🚀 => fetchSchedules => data:', sortedData);
		} catch (error) {
			console.error('Failed to fetch schedules:', error);
			toast({
				title: 'Error',
				description: 'Failed to load schedules',
				variant: 'destructive',
			});
		} finally {
			setIsLoadingSchedules(false);
		}
	};

	// Fetch schedules when date changes
	useEffect(() => {
		fetchSchedules();
	}, [selectedDate]);

	const handleDriverChange = async (
		scheduleId: number,
		newDriverId: number
	) => {
		try {
			await apiClient.updateSchedule(scheduleId, {
				driver_id: newDriverId,
				confirm_status: 'pending', // Reset to pending when driver changes
			});
			await fetchSchedules();
			toast({
				title: 'Driver Changed',
				description: 'Driver has been reassigned, please confirm again',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to change driver',
				variant: 'destructive',
			});
		}
	};

	const handleVehicleAssignment = async (
		scheduleId: number,
		vehicleAlias: string
	) => {
		try {
			await apiClient.updateSchedule(scheduleId, {
				vehicle: vehicleAlias,
				confirm_status: 'pending', // Reset to pending when vehicle changes
			});
			await fetchSchedules(); // Refresh schedules
			toast({
				title: 'Vehicle Assigned',
				description: 'Vehicle has been assigned, please confirm again',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to assign vehicle',
				variant: 'destructive',
			});
		}
	};

	const handleConfirmSingle = async (scheduleId: number) => {
		try {
			await apiClient.updateSchedule(scheduleId, {
				confirm_status: 'confirmed',
			});
			await fetchSchedules();
			toast({
				title: 'Confirmed',
				description: 'Schedule has been confirmed',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to confirm schedule',
				variant: 'destructive',
			});
		}
	};

	const handleConfirm = async () => {
		try {
			// Update all schedules to confirmed status
			const updates = scheduleData.map((schedule) =>
				apiClient.updateSchedule(schedule.id, {
					confirm_status: 'confirmed',
				})
			);
			await Promise.all(updates);
			await fetchSchedules();
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

	const formatTime = (timeStr: string) => {
		if (!timeStr) return '';

		try {
			// Extract time part from ISO 8601 timestamp
			// e.g., "2025-12-24T07:45:00+11:00" -> "07:45:00"
			const timePart = timeStr.split('T')[1]?.split(/[+-]/)[0];
			if (!timePart) {
				console.log('⚠️ Invalid time format:', timeStr);
				return timeStr;
			}

			const [hoursStr, minutesStr] = timePart.split(':');
			const hours = parseInt(hoursStr);
			const minutes = parseInt(minutesStr);

			// Convert to 12-hour format
			const period = hours >= 12 ? 'PM' : 'AM';
			const displayHours =
				hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
			const displayMinutes = minutes.toString().padStart(2, '0');

			const result = `${displayHours}:${displayMinutes} ${period}`;

			return result;
		} catch (error) {
			console.error('Failed to format time:', timeStr, error);
			return timeStr;
		}
	};

	const handleSyncToday = async () => {
		try {
			setIsSyncingToday(true);
			await apiClient.syncToday();
			const today = format(new Date(), 'yyyy-MM-dd');
			setSelectedDate(today);
			toast({
				title: 'Success',
				description:
					"Today's schedules synced from Deputy successfully",
			});
		} catch (error) {
			console.error('Failed to sync today:', error);
			toast({
				title: 'Error',
				description: "Failed to sync today's schedules",
				variant: 'destructive',
			});
		} finally {
			setIsSyncingToday(false);
		}
	};

	const handleSyncDate = async () => {
		try {
			setIsSyncingDate(true);
			await apiClient.syncSpecificDate(selectedDate);
			await fetchSchedules();
			toast({
				title: 'Success',
				description: `Schedules for ${format(new Date(selectedDate), 'PPP')} synced successfully`,
			});
		} catch (error) {
			console.error('Failed to sync date:', error);
			toast({
				title: 'Error',
				description: 'Failed to sync schedules',
				variant: 'destructive',
			});
		} finally {
			setIsSyncingDate(false);
		}
	};

	const handleImportRoutes = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			setIsImporting(true);
			const result = await apiClient.importRoutes(file, selectedDate);

			console.log('✅ Import routes result:', result);

			await fetchSchedules(); // Refresh schedules

			toast({
				title: 'Routes Imported',
				description: `Successfully imported routes. Matched: ${result.matched_count}, Updated: ${result.updated_count}`,
			});

			// Clear file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		} catch (error) {
			console.error('Failed to import routes:', error);
			toast({
				title: 'Error',
				description: 'Failed to import routes from file',
				variant: 'destructive',
			});
		} finally {
			setIsImporting(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='mb-4 sm:mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						{/* <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
							{format(new Date(selectedDate), 'dd/MM/yyyy')}
						</h1> */}
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
							<PopoverContent
								className='w-auto p-0'
								align='start'>
								<Calendar
									mode='single'
									selected={new Date(selectedDate)}
									onSelect={(date) => {
										if (date) {
											setSelectedDate(
												format(date, 'yyyy-MM-dd')
											);
										}
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							onClick={handleSyncToday}
							disabled={isSyncingToday || isLoadingSchedules}
							className='border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600'>
							{isSyncingToday ? 'Syncing...' : 'Sync Today'}
						</Button>
						<Button
							variant='outline'
							onClick={handleSyncDate}
							disabled={isSyncingDate || isLoadingSchedules}
							className='border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600'>
							{isSyncingDate ? 'Syncing...' : 'Sync Selected Date'}
						</Button>
						<input
							ref={fileInputRef}
							type='file'
							accept='.xlsx,.xls'
							onChange={handleImportRoutes}
							className='hidden'
						/>
						<Button
							variant='outline'
							onClick={() => fileInputRef.current?.click()}
							disabled={isImporting || isLoadingSchedules}
							className='border-green-600 text-green-600 hover:bg-green-50 hover:text-green-600'>
							<Upload className='h-4 w-4 mr-2' />
							{isImporting ? 'Importing...' : 'Import Routes'}
						</Button>
					</div>
				</div>

				<Card className='bg-white overflow-hidden'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[60px]'></TableHead>
								<TableHead>Driver Name</TableHead>
								<TableHead>Amazon ID</TableHead>
								<TableHead>Check-in Status</TableHead>
								<TableHead>Route</TableHead>
								<TableHead>Shift Time</TableHead>
								<TableHead>Vehicle</TableHead>
								<TableHead>Confirm</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoadingSchedules ? (
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
							) : scheduleData.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
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
											<div className='p-2 rounded-full inline-block bg-blue-100'>
												<User className='h-5 w-5 text-blue-700' />
											</div>
										</TableCell>
										<TableCell>
											<Select
												value={
													allDrivers
														.find(
															(d) =>
																d.deputy_id ===
																schedule.deputy_id
														)
														?.id?.toString() || ''
												}
												onValueChange={(value) => {
													const driverId =
														parseInt(value);
													if (!isNaN(driverId)) {
														handleDriverChange(
															schedule.id,
															driverId
														);
													}
												}}>
												<SelectTrigger className='w-full border-0 shadow-none hover:bg-gray-100'>
													<SelectValue>
														<div className='flex items-center gap-2'>
															<User className='h-4 w-4 text-gray-500' />
															<span className='font-medium text-gray-900'>
																{schedule.deputy_id +
																	'. ' +
																	schedule.driver_name}
															</span>
														</div>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{allDrivers.map(
														(driver) => (
															<SelectItem
																key={driver.id}
																value={driver.id.toString()}>
																<div className='flex items-center gap-2'>
																	<User className='h-4 w-4 text-gray-500' />
																	{
																		driver.name
																	}
																</div>
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell>
											<span className='font-medium text-gray-900'>
												{schedule.amazon_id || '-'}
											</span>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													schedule.checkin_status ===
														'checked_in' ||
													schedule.checkin_status ===
														'completed'
														? 'default'
														: 'secondary'
												}
												className={
													schedule.checkin_status ===
														'checked_in' ||
													schedule.checkin_status ===
														'completed'
														? 'bg-green-600 text-white'
														: 'bg-gray-300 text-gray-700'
												}>
												{schedule.checkin_status ===
													'checked_in' ||
												schedule.checkin_status ===
													'completed'
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
											{schedule.start_time &&
											schedule.end_time ? (
												<div className='flex items-center gap-1 text-gray-700'>
													<span className='font-medium'>
														{formatTime(
															schedule.start_time
														)}
													</span>
													<span className='text-gray-400'>
														-
													</span>
													<span className='font-medium'>
														{formatTime(
															schedule.end_time
														)}
													</span>
												</div>
											) : (
												<span className='text-gray-400 text-sm'>
													-
												</span>
											)}
										</TableCell>
										<TableCell>
											<Select
												value={
													schedule.vehicle ||
													'unassigned'
												}
												onValueChange={(value) => {
													if (
														value !== 'unassigned'
													) {
														handleVehicleAssignment(
															schedule.id,
															value
														);
													}
												}}>
												<SelectTrigger className='w-full border-0 shadow-none hover:bg-gray-100'>
													<SelectValue placeholder='Select vehicle'>
														<div className='flex items-center gap-2'>
															<CarIcon className='h-4 w-4 text-gray-500' />
															<span className='font-medium'>
																{schedule.vehicle ||
																	'Assign Vehicle'}
															</span>
														</div>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{!schedule.vehicle && (
														<SelectItem
															value='unassigned'
															disabled>
															<div className='flex items-center gap-2 text-gray-400'>
																<CarIcon className='h-4 w-4' />
																No vehicle
																assigned
															</div>
														</SelectItem>
													)}
													{(() => {
														const availableVehicles =
															getAvailableVehiclesForSchedule(
																schedule
															);
														return availableVehicles.length ===
															0 ? (
															<SelectItem
																value='no-vehicles'
																disabled>
																<div className='flex items-center gap-2 text-gray-400'>
																	No available
																	vehicles
																</div>
															</SelectItem>
														) : (
															availableVehicles.map(
																(vehicle) => (
																	<SelectItem
																		key={
																			vehicle.id
																		}
																		value={
																			vehicle.alias
																		}>
																		<div className='flex items-center gap-2'>
																			<CarIcon className='h-4 w-4 text-gray-500' />
																			{
																				vehicle.alias
																			}
																		</div>
																	</SelectItem>
																)
															)
														);
													})()}
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell>
											<Button
												size='sm'
												onClick={() =>
													handleConfirmSingle(
														schedule.id
													)
												}
												disabled={
													schedule.confirm_status ===
													'confirmed'
												}
												className='bg-blue-700 hover:bg-blue-800 disabled:opacity-50'>
												{schedule.confirm_status ===
												'confirmed'
													? 'Confirmed'
													: 'Confirm'}
											</Button>
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
