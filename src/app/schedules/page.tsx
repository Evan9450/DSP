'use client';

import {
	Bell,
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
		format(new Date(), 'yyyy-MM-dd'),
	);
	const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
	const [isSyncingToday, setIsSyncingToday] = useState(false);
	const [isSyncingDate, setIsSyncingDate] = useState(false);
	const [isSendingReminders, setIsSendingReminders] = useState(false);

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
	const [syncedDriverIds, setSyncedDriverIds] = useState<Set<number>>(
		new Set(),
	);
	console.log('syncedDriverIds', syncedDriverIds);
	const [isImporting, setIsImporting] = useState(false);
	// Track failed schedule IDs after batch confirm - rows will show red border
	const [failedScheduleIds, setFailedScheduleIds] = useState<number[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Get available vehicles for a specific schedule
	const getAvailableVehiclesForSchedule = (
		currentSchedule: ScheduleResponse,
	) => {
		// Get all vehicle aliases that are already assigned to OTHER schedules
		const assignedVehicleAliases = scheduleData
			.filter(
				(s) =>
					s.id !== currentSchedule.id &&
					(s.vehicle_rego || s.vehicle_alias),
			) // Exclude current schedule
			.map((s) => s.vehicle_alias);

		// Filter out vehicles that are already assigned or unavailable
		return allVehicles.filter(
			(v) =>
				!assignedVehicleAliases.includes(v.alias) &&
				v.condition !== 'unavailable',
		);
	};

	// Fetch all vehicles (including assigned ones)
	const fetchVehicles = async () => {
		try {
			const data = await apiClient.getVehicles();
			console.log(
				'✅ All vehicles loaded (count: ' + data.length + '):',
				data,
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
				data,
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
						(d.deputy_id &&
							d.deputy_id === schedule.driver.deputy_id) ||
						d.name === schedule.driver.name,
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

			// Fetch synced drivers for the roster
			try {
				const syncedDrivers = await apiClient.getSyncedDeputyDrivers();
				console.log(
					'🚀 => fetchSchedules => syncedDrivers:',
					syncedDrivers,
				);
				const ids = new Set(syncedDrivers.map((d) => d.driver_id));
				console.log('🚀 => fetchSchedules => ids:', ids);
				setSyncedDriverIds(ids);
				console.log('✅ Synced drivers loaded:', ids.size);
			} catch (error) {
				console.error('❌ Failed to fetch synced drivers:', error);
			}
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
		newDriverId: number,
	) => {
		// Check if schedule is confirmed
		const targetSchedule = scheduleData.find((s) => s.id === scheduleId);
		if (targetSchedule?.confirm_status === 'confirmed') {
			notify.warning('Cannot change driver for a confirmed schedule');
			return;
		}

		console.log(
			'🔄 Changing driver for schedule',
			scheduleId,
			'to driver',
			newDriverId,
		);

		// 1. Handle Unassign Case
		if (newDriverId === 0) {
			const previousSchedule = scheduleData.find(
				(s) => s.id === scheduleId,
			);
			if (!previousSchedule) return;

			// Optimistic update
			setScheduleData((prevData) =>
				prevData.map((schedule) =>
					schedule.id === scheduleId
						? {
								...schedule,
								driver: {
									...schedule.driver,
									id: 0,
									name: '',
									amazon_id: null,
									phone: null,
									is_active: false,
									has_password: false,
								},
								confirm_status: 'pending' as const,
								// @ts-ignore
								_driver_id: 0,
							}
						: schedule,
				),
			);

			try {
				const updatedSchedule = await apiClient.updateSchedule(
					scheduleId,
					{
						driver_id: null as any,
						confirm_status: 'pending',
					},
				);

				setScheduleData((prevData) =>
					prevData.map((schedule) =>
						schedule.id === scheduleId
							? {
									...updatedSchedule,
									// @ts-ignore
									_driver_id: 0,
								}
							: schedule,
					),
				);

				toast({
					title: 'Driver Unassigned',
					description: 'Driver has been removed from this schedule',
				});
			} catch (error: any) {
				console.error('❌ Failed to unassign driver:', error);
				// Revert
				setScheduleData((prevData) =>
					prevData.map((schedule) =>
						schedule.id === scheduleId
							? previousSchedule
							: schedule,
					),
				);
				toast({
					title: 'Error',
					description: 'Failed to unassign driver',
					variant: 'destructive',
				});
			}
			return;
		}

		// 2. Handle Reassign Case (with potential stealing)
		const newDriver = allDrivers.find((d) => d.id === newDriverId);
		if (!newDriver) {
			console.error('❌ Driver not found:', newDriverId);
			return;
		}

		// Check if driver is already assigned to another schedule
		const oldScheduleWithDriver = scheduleData.find(
			(s) =>
				s.id !== scheduleId &&
				((s as any)._driver_id === newDriverId ||
					s.driver.id === newDriverId),
		);

		// Save previous state for manual revert
		const previousTargetSchedule = scheduleData.find(
			(s) => s.id === scheduleId,
		);
		const previousSourceSchedule = oldScheduleWithDriver
			? scheduleData.find((s) => s.id === oldScheduleWithDriver.id)
			: null;

		if (!previousTargetSchedule) return;

		// Optimistic update: Update both rows if stealing
		setScheduleData((prevData) => {
			return prevData.map((schedule) => {
				// Update target schedule
				if (schedule.id === scheduleId) {
					return {
						...schedule,
						driver: {
							...schedule.driver,
							id: newDriver.id,
							name: newDriver.name,
							amazon_id: newDriver.amazon_id || null,
							deputy_id: newDriver.deputy_id || '',
						},
						confirm_status: 'pending' as const,
						// @ts-ignore
						_driver_id: newDriverId,
					};
				}
				// Update source schedule (unassign)
				if (
					oldScheduleWithDriver &&
					schedule.id === oldScheduleWithDriver.id
				) {
					return {
						...schedule,
						driver: {
							...schedule.driver,
							id: 0,
							name: '',
							amazon_id: null,
							phone: null,
							is_active: false,
							has_password: false,
						},
						confirm_status: 'pending' as const,
						// @ts-ignore
						_driver_id: 0,
					};
				}
				return schedule;
			});
		});

		try {
			// If stealing, unassign from old schedule first (or parallel)
			if (oldScheduleWithDriver) {
				console.log(
					`Unassigning driver ${newDriverId} from old schedule ${oldScheduleWithDriver.id}`,
				);
				await apiClient.updateSchedule(oldScheduleWithDriver.id, {
					driver_id: null as any,
					confirm_status: 'pending',
				});
			}

			console.log('🌐 Calling API to update schedule...');
			const updatedSchedule = await apiClient.updateSchedule(scheduleId, {
				driver_id: newDriverId,
				confirm_status: 'pending',
			});
			console.log('✅ API update successful:', updatedSchedule);

			// Single-row replacement: use API response to update the specific row
			setScheduleData((prevData) =>
				prevData.map((schedule) => {
					if (schedule.id === scheduleId) {
						return {
							...updatedSchedule,
							// Preserve local computed field
							// @ts-ignore
							_driver_id: newDriverId,
						};
					}
					// For the source schedule, we keep the optimistic update state
					// since we didn't fetch the fresh record, but unassigning is safe.
					return schedule;
				}),
			);

			toast({
				title: 'Driver Changed',
				description: oldScheduleWithDriver
					? `Driver moved from another schedule to this one.`
					: 'Driver has been reassigned, please confirm again',
			});
		} catch (error: any) {
			console.error('❌ Failed to update driver:', error);

			// Manual revert
			setScheduleData((prevData) =>
				prevData.map((schedule) => {
					if (schedule.id === scheduleId)
						return previousTargetSchedule;
					if (
						oldScheduleWithDriver &&
						schedule.id === oldScheduleWithDriver.id &&
						previousSourceSchedule
					)
						return previousSourceSchedule;
					return schedule;
				}),
			);

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
		vehicleAlias: string,
	) => {
		// Check if schedule is confirmed
		const targetSchedule = scheduleData.find((s) => s.id === scheduleId);
		if (targetSchedule?.confirm_status === 'confirmed') {
			notify.warning('Cannot change vehicle for a confirmed schedule');
			return;
		}

		// Handle unassign case
		if (!vehicleAlias) {
			const previousSchedule = scheduleData.find(
				(s) => s.id === scheduleId,
			);
			if (!previousSchedule) return;

			// Optimistic update
			setScheduleData((prevData) =>
				prevData.map((schedule) =>
					schedule.id === scheduleId
						? {
								...schedule,
								vehicle_rego: null,
								vehicle_alias: null,
							}
						: schedule,
				),
			);

			try {
				const updatedSchedule = await apiClient.updateSchedule(
					scheduleId,
					{
						vehicle_rego: null as any,
						vehicle_alias: null as any,
					},
				);
				// Single-row replacement
				setScheduleData((prevData) =>
					prevData.map((schedule) =>
						schedule.id === scheduleId
							? {
									...updatedSchedule,
									// @ts-ignore - Preserve local computed field
									_driver_id: (schedule as any)._driver_id,
								}
							: schedule,
					),
				);
				toast({
					title: 'Vehicle Unassigned',
					description: 'Vehicle has been removed from this schedule',
				});
			} catch (error: any) {
				console.error('❌ Failed to unassign vehicle:', error);
				setScheduleData((prevData) =>
					prevData.map((schedule) =>
						schedule.id === scheduleId
							? previousSchedule
							: schedule,
					),
				);
				toast({
					title: 'Error',
					description: 'Failed to unassign vehicle',
					variant: 'destructive',
				});
			}
			return;
		}

		// Find the vehicle object to get both rego and alias
		const vehicle = allVehicles.find((v) => v.alias === vehicleAlias);
		if (!vehicle) {
			console.error('❌ Vehicle not found:', vehicleAlias);
			return;
		}

		// Save previous state for manual revert
		const previousSchedule = scheduleData.find((s) => s.id === scheduleId);
		if (!previousSchedule) return;

		// Optimistic update: Update local state immediately for instant UI feedback
		setScheduleData((prevData) =>
			prevData.map((schedule) =>
				schedule.id === scheduleId
					? {
							...schedule,
							vehicle_rego: vehicle.rego,
							vehicle_alias: vehicle.alias,
							confirm_status: 'pending' as const,
						}
					: schedule,
			),
		);

		try {
			const updatedSchedule = await apiClient.updateSchedule(scheduleId, {
				vehicle_rego: vehicle.rego,
				vehicle_alias: vehicle.alias,
				confirm_status: 'pending', // Reset to pending when vehicle changes
			});
			// Single-row replacement
			setScheduleData((prevData) =>
				prevData.map((schedule) =>
					schedule.id === scheduleId
						? {
								...updatedSchedule,
								// @ts-ignore - Preserve local computed field
								_driver_id: (schedule as any)._driver_id,
							}
						: schedule,
				),
			);
			toast({
				title: 'Vehicle Assigned',
				description: 'Vehicle has been assigned, please confirm again',
			});
		} catch (error: any) {
			console.error('❌ Failed to assign vehicle:', error);

			// Manual revert: restore previous state without reload
			setScheduleData((prevData) =>
				prevData.map((schedule) =>
					schedule.id === scheduleId ? previousSchedule : schedule,
				),
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

	const handleConfirm = async () => {
		try {
			// 清除之前的失败标记
			setFailedScheduleIds([]);

			// 仅处理未确认的 schedules
			const pendingSchedules = scheduleData.filter(
				(s) => s.confirm_status !== 'confirmed',
			);

			if (pendingSchedules.length === 0) {
				notify.info('All schedules are already confirmed');
				return;
			}

			/**
			 * ⏭️ 1. 没有 route 的 schedules：直接跳过，不参与 confirm
			 */
			const skippedSchedules = pendingSchedules.filter((s) => !s.route);

			/**
			 * ✅ 2. 有 route 的 schedules：才有资格进入 confirm 校验
			 */
			const routeSchedules = pendingSchedules.filter((s) => s.route);

			const checkUnassignedDriver = pendingSchedules.filter(
				(s) => s.driver,
			);

			/**
			 * 3. 前端必填校验（⚠️ 不再检查 route）
			 * Required: amazon_id, vehicle, has_password
			 */
			const canConfirm = (s: ScheduleResponse) => {
				const hasDriver = !!s.driver?.id;
				const hasAmazonId = !!s.driver?.amazon_id;
				const hasVehicle = !!s.vehicle_alias || !!s.vehicle_rego;
				const hasPassword = !!s.driver?.has_password;
				return hasDriver && hasAmazonId && hasVehicle && hasPassword;
			};

			const validSchedules = routeSchedules.filter(canConfirm);
			const invalidSchedules = routeSchedules.filter(
				(s) => !canConfirm(s),
			);

			/**
			 * ❌ 4. 如果存在“本应可确认但字段缺失”的 schedules，阻断流程
			 */
			if (invalidSchedules.length > 0) {
				setFailedScheduleIds(invalidSchedules.map((s) => s.id));

				notify.warning(
					`${invalidSchedules.length} schedules are missing required fields and cannot be confirmed. Please fix the highlighted rows.`,
				);

				return;
			}

			/**
			 * 🚫 没有任何可确认的 schedule
			 */
			if (validSchedules.length === 0) {
				notify.info('No schedules eligible for confirmation');
				return;
			}

			/**
			 * ⏭️（可选但推荐）提示被跳过的数量
			 */
			if (skippedSchedules.length > 0) {
				notify.info(
					`${skippedSchedules.length} schedules without route were skipped`,
				);
			}

			/**
			 * 🚀 5. 批量确认
			 */
			const scheduleIds = validSchedules.map((s) => s.id);
			const result = await apiClient.batchConfirmSchedules(scheduleIds);

			/**
			 * 6. 更新成功确认的 schedules
			 */
			if (result.success && result.success.length > 0) {
				const successIds = new Set(result.success.map((s) => s.id));

				setScheduleData((prevData) =>
					prevData.map((schedule) =>
						successIds.has(schedule.id)
							? {
									...schedule,
									confirm_status: 'confirmed' as const,
								}
							: schedule,
					),
				);
			}

			/**
			 * 7. 标记后端返回的失败 schedules
			 */
			if (result.failed && result.failed.length > 0) {
				setFailedScheduleIds(result.failed.map((item) => item.id));
			}

			/**
			 * 8. 结果提示
			 */
			if (result.total_failed === 0) {
				notify.success(
					`${result.total_success} schedules confirmed and SMS sent`,
				);
			} else if (result.total_success > 0) {
				notify.warning(
					`${result.total_success} confirmed, ${result.total_failed} failed. Failed rows are highlighted.`,
				);

				result.failed?.forEach((item) => {
					console.warn(`Schedule ${item.id} failed: ${item.error}`);
				});
			} else {
				notify.error(
					'All confirmations failed. Please check the highlighted rows.',
				);

				result.failed?.forEach((item) => {
					console.error(`Schedule ${item.id}: ${item.error}`);
				});
			}
		} catch (error: any) {
			console.error('❌ Failed to confirm schedules:', error);

			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to confirm schedules';

			notify.error(errorMessage);

			// 拉取后端真实状态
			await fetchSchedules();
		}
	};

	/**
	 * Get available drivers for a specific schedule
	 * Only includes drivers from today's roster who are not already confirmed
	 */
	const getAvailableDriversForSchedule = (currentSchedule: any) => {
		// Get driver_ids that are already confirmed (and not the current schedule)
		const confirmedDriverIds = new Set<number>();
		scheduleData
			.filter(
				(s) =>
					s.confirm_status === 'confirmed' &&
					s.id !== currentSchedule.id,
			)
			.forEach((s) => {
				const scheduleWithDriverId = s as any;
				if (scheduleWithDriverId._driver_id) {
					confirmedDriverIds.add(scheduleWithDriverId._driver_id);
				} else if (s.driver.deputy_id) {
					const driver = allDrivers.find(
						(d) => d.deputy_id === s.driver.deputy_id,
					);
					if (driver) {
						confirmedDriverIds.add(driver.id);
					}
				}
			});

		// Filter drivers:
		// 1. Must be in today's synced roster (fetched from /synced-drivers)
		// 2. Must not be confirmed for another schedule
		return allDrivers.filter((driver) => {
			const isInTodayRoster = syncedDriverIds.has(driver.id);
			const isAlreadyConfirmed = confirmedDriverIds.has(driver.id);
			return isInTodayRoster && !isAlreadyConfirmed;
		});
	};

	const handleSyncToday = async () => {
		try {
			setIsSyncingToday(true);
			const result = await apiClient.syncToday();

			const today = format(new Date(), 'yyyy-MM-dd');
			setSelectedDate(today);

			// Build detailed success message from API response
			const syncedCount = result?.synced_count ?? result?.count ?? 0;
			const createdCount = result?.created_count ?? 0;
			const updatedCount = result?.updated_count ?? 0;

			let description =
				"Today's schedules synced from Deputy successfully";
			if (syncedCount > 0 || createdCount > 0 || updatedCount > 0) {
				const details: string[] = [];
				if (syncedCount > 0) details.push(`Synced: ${syncedCount}`);
				if (createdCount > 0) details.push(`Created: ${createdCount}`);
				if (updatedCount > 0) details.push(`Updated: ${updatedCount}`);
				description = details.join(', ');
			}

			notify.success(description);

			// 添加这段代码：如果当前已经是今天，则手动刷新；如果不是今天，useEffect 会自动刷新
			if (selectedDate === today) {
				await fetchSchedules();
			}
		} catch (error: any) {
			// Show detailed error message from backend
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				"Failed to sync today's schedules";

			notify.error(errorMessage);
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
		event: React.ChangeEvent<HTMLInputElement>,
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

	const handleSendReminders = async () => {
		try {
			setIsSendingReminders(true);
			const result = await apiClient.sendScheduleReminders(selectedDate);

			console.log('✅ Send reminders result:', result);

			toast({
				title: 'Reminders Sent',
				description: `Successfully sent reminders. Sent: ${result.sent || 0}, Failed: ${result.failed || 0}, Skipped: ${result.skipped || 0}`,
			});
		} catch (error) {
			console.error('Failed to send reminders:', error);
			toast({
				title: 'Error',
				description: 'Failed to send schedule reminders',
				variant: 'destructive',
			});
		} finally {
			setIsSendingReminders(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
				<div className='mb-6'>
				<h1 className='text-3xl font-bold text-gray-900'>
					Schedules
					</h1>
				</div>
				<div className='mb-4 sm:mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									disabled
									className={cn(
										'w-[240px] justify-start text-left font-normal',
										!selectedDate &&
											'text-muted-foreground',
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
									// disabled
									selected={new Date(selectedDate)}
									onSelect={(date) => {
										if (date) {
											setSelectedDate(
												format(date, 'yyyy-MM-dd'),
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
							onClick={handleSendReminders}
							disabled={isSendingReminders || isLoadingSchedules}
							className='border-orange-600 text-orange-600 hover:bg-orange-50 hover:text-orange-600'>
							<Bell className='h-4 w-4 mr-2' />
							{isSendingReminders
								? 'Sending...'
								: 'Send Reminders'}
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
						onDriverChange={handleDriverChange}
						onVehicleAssign={handleVehicleAssignment}
						onConfirmAll={handleConfirm}
						getAvailableDriversForSchedule={
							getAvailableDriversForSchedule
						}
						getAvailableVehiclesForSchedule={
							getAvailableVehiclesForSchedule
						}
						failedScheduleIds={failedScheduleIds}
						emptyMessage='No schedules for this date'
						showConfirmAll={true}
					/>
				</Card>
			</div>
		</div>
	);
}
