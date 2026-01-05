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
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ScheduleTable } from './components/ScheduleTable';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { notify } from '@/lib/notifications';
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
			console.log('📥 Fetching schedules for date:', selectedDate);
			const data = await apiClient.getSchedules({
				schedule_date: selectedDate,
				auto_sync: true,
			});
			console.log('📦 Received schedules from API:', data);

			// Sort by deputy_id (ascending) to maintain stable order
			// This ensures rows don't move when driver is changed
			const sortedData = [...data].sort((a, b) => {
				const idA = parseInt(a.deputy_schedule_id) || 0;
				const idB = parseInt(b.deputy_schedule_id) || 0;
				return idA - idB;
			});

			// Enrich data with driver_id by matching with allDrivers
			const enrichedData = sortedData.map((schedule) => {
				const matchedDriver = allDrivers.find(
					(d) =>
						(d.deputy_id && d.deputy_id === schedule.deputy_id) ||
						d.name === schedule.driver_name
				);
				return {
					...schedule,
					// @ts-ignore - Temporary field to track driver_id
					_driver_id: matchedDriver?.id,
				};
			});

			console.log('📊 Sorted and enriched schedules:', enrichedData);

			setScheduleData(enrichedData);
			console.log('✅ Schedule data updated in state');
		} catch (error) {
			console.error('❌ Failed to fetch schedules:', error);
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
		console.log(
			'🔄 Changing driver for schedule',
			scheduleId,
			'to driver',
			newDriverId
		);

		// Find the new driver info
		const newDriver = allDrivers.find((d) => d.id === newDriverId);
		if (!newDriver) {
			console.error('❌ Driver not found:', newDriverId);
			return;
		}

		console.log('✅ Found driver:', newDriver);

		// Save previous state for manual revert
		const previousSchedule = scheduleData.find((s) => s.id === scheduleId);
		if (!previousSchedule) return;

		// Optimistic update: Update local state immediately for instant UI feedback
		setScheduleData((prevData) => {
			const updated = prevData.map((schedule) =>
				schedule.id === scheduleId
					? {
							...schedule,
							deputy_id:
								newDriver.deputy_id || schedule.deputy_id,
							driver_name: newDriver.name,
							amazon_id: newDriver.amazon_id || null,
							confirm_status: 'pending' as const,
							// @ts-ignore - Temporary field to track driver_id
							_driver_id: newDriverId,
						}
					: schedule
			);
			console.log(
				'📝 Optimistic update applied with driver_id:',
				newDriverId
			);
			return updated;
		});

		try {
			console.log('🌐 Calling API to update schedule...');
			const result = await apiClient.updateSchedule(scheduleId, {
				driver_id: newDriverId,
				confirm_status: 'pending', // Reset to pending when driver changes
			});
			console.log('✅ API update successful:', result);

			// Refresh to get backend-updated data
			console.log('🔄 Refreshing schedules from backend...');
			await fetchSchedules();
			console.log('✅ Schedules refreshed');

			toast({
				title: 'Driver Changed',
				description: 'Driver has been reassigned, please confirm again',
			});
		} catch (error: any) {
			console.error('❌ Failed to update driver:', error);

			// Manual revert: restore previous state without reload
			setScheduleData((prevData) =>
				prevData.map((schedule) =>
					schedule.id === scheduleId ? previousSchedule : schedule
				)
			);

			// Show detailed error message from backend
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to change driver';
			toast({
				title: 'Driver Change Failed',
				description: errorMessage,
				variant: 'destructive',
			});
		}
	};

	const handleVehicleAssignment = async (
		scheduleId: number,
		vehicleAlias: string
	) => {
		// Save previous state for manual revert
		const previousSchedule = scheduleData.find((s) => s.id === scheduleId);
		if (!previousSchedule) return;

		// Optimistic update: Update local state immediately for instant UI feedback
		setScheduleData((prevData) =>
			prevData.map((schedule) =>
				schedule.id === scheduleId
					? {
							...schedule,
							vehicle: vehicleAlias,
							confirm_status: 'pending' as const,
						}
					: schedule
			)
		);

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
		} catch (error: any) {
			console.error('❌ Failed to assign vehicle:', error);

			// Manual revert: restore previous state without reload
			setScheduleData((prevData) =>
				prevData.map((schedule) =>
					schedule.id === scheduleId ? previousSchedule : schedule
				)
			);

			// Show detailed error message from backend
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to assign vehicle';
			toast({
				title: 'Vehicle Assignment Failed',
				description: errorMessage,
				variant: 'destructive',
			});
		}
	};

	const handleConfirmSingle = async (scheduleId: number) => {
		try {
			// Wait for API response before updating UI
			const updatedSchedule = await apiClient.confirmSchedule(scheduleId);

			// Update local state with the response from backend
			setScheduleData((prevData) =>
				prevData.map((schedule) =>
					schedule.id === scheduleId
						? {
								...schedule,
								confirm_status: updatedSchedule.confirm_status,
							}
						: schedule
				)
			);

			notify.success('Schedule has been confirmed and SMS sent');
		} catch (error: any) {
			console.error('❌ Failed to confirm schedule:', error);

			// Show detailed error message from backend
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to confirm schedule';
			notify.error(errorMessage);
		}
	};

	const handleConfirm = async () => {
		try {
			// Wait for all confirmations to complete
			const updates = scheduleData.map((schedule) =>
				apiClient.confirmSchedule(schedule.id)
			);
			const updatedSchedules = await Promise.all(updates);

			// Update local state with responses from backend
			setScheduleData((prevData) =>
				prevData.map((schedule) => {
					const updated = updatedSchedules.find(
						(s) => s.id === schedule.id
					);
					return updated
						? {
								...schedule,
								confirm_status: updated.confirm_status,
							}
						: schedule;
				})
			);

			notify.success(
				`${scheduleData.length} schedules have been confirmed and SMS sent`
			);
		} catch (error: any) {
			console.error('❌ Failed to confirm schedules:', error);

			// Show detailed error message from backend
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to confirm schedules';
			notify.error(errorMessage);

			// Refresh data to get the current state from backend
			await fetchSchedules();
		}
	};

	/**
	 * Get available drivers for a specific schedule
	 * Only includes drivers from today's roster who are not already confirmed
	 */
	const getAvailableDriversForSchedule = (currentSchedule: any) => {
		// Get all driver_ids from today's schedules
		// Use _driver_id if available (manually changed), otherwise match by deputy_id
		const todayDriverIds = new Set<number>();
		scheduleData.forEach((s) => {
			const scheduleWithDriverId = s as any;
			if (scheduleWithDriverId._driver_id) {
				todayDriverIds.add(scheduleWithDriverId._driver_id);
			} else if (s.deputy_id) {
				// Find driver by deputy_id
				const driver = allDrivers.find(
					(d) => d.deputy_id === s.deputy_id
				);
				if (driver) {
					todayDriverIds.add(driver.id);
				}
			}
		});

		// Get driver_ids that are already confirmed (and not the current schedule)
		const confirmedDriverIds = new Set<number>();
		scheduleData
			.filter(
				(s) =>
					s.confirm_status === 'confirmed' &&
					s.id !== currentSchedule.id
			)
			.forEach((s) => {
				const scheduleWithDriverId = s as any;
				if (scheduleWithDriverId._driver_id) {
					confirmedDriverIds.add(scheduleWithDriverId._driver_id);
				} else if (s.deputy_id) {
					const driver = allDrivers.find(
						(d) => d.deputy_id === s.deputy_id
					);
					if (driver) {
						confirmedDriverIds.add(driver.id);
					}
				}
			});

		// Filter drivers:
		// 1. Must be in today's roster
		// 2. Must not be confirmed for another schedule
		return allDrivers.filter((driver) => {
			const isInTodayRoster = todayDriverIds.has(driver.id);
			const isAlreadyConfirmed = confirmedDriverIds.has(driver.id);
			return isInTodayRoster && !isAlreadyConfirmed;
		});
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
						{/* <Button
							variant='outline'
							onClick={handleSyncDate}
							disabled={isSyncingDate || isLoadingSchedules}
							className='border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600'>
							{isSyncingDate
								? 'Syncing...'
								: 'Sync Selected Date'}
						</Button> */}
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
					<ScheduleTable
						mode='editable'
						schedules={scheduleData}
						isLoading={isLoadingSchedules}
						allDrivers={allDrivers}
						allVehicles={allVehicles}
						onDriverChange={handleDriverChange}
						onVehicleAssign={handleVehicleAssignment}
						onConfirmSingle={handleConfirmSingle}
						onConfirmAll={handleConfirm}
						getAvailableDriversForSchedule={
							getAvailableDriversForSchedule
						}
						getAvailableVehiclesForSchedule={
							getAvailableVehiclesForSchedule
						}
						emptyMessage='No schedules for this date'
						showConfirmAll={true}
					/>
				</Card>
			</div>
		</div>
	);
}
