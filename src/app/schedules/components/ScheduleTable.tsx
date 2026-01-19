'use client';

import {
	Car as CarIcon,
	Loader2,
	MapPin,
	MessageSquare,
	User,
} from 'lucide-react';
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

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notifications';
import { useState } from 'react';

export interface Driver {
	id: number;
	name: string;
	deputy_id?: string;
	amazon_id?: string;
}

export interface Vehicle {
	id: number;
	alias: string;
}

interface ScheduleTableProps {
	mode: 'editable' | 'readonly';
	schedules: ScheduleResponse[];
	isLoading?: boolean;

	// Editable mode props
	allDrivers?: Driver[];
	allVehicles?: Vehicle[];
	onDriverChange?: (scheduleId: number, driverId: number) => void;
	onVehicleAssign?: (scheduleId: number, vehicleAlias: string) => void;
	onConfirmAll?: () => void;
	getAvailableDriversForSchedule?: (schedule: ScheduleResponse) => Driver[];
	getAvailableVehiclesForSchedule?: (schedule: ScheduleResponse) => Vehicle[];

	// Failed schedule IDs - rows with red border after confirm attempt
	failedScheduleIds?: number[];

	// Optional customization
	emptyMessage?: string;
	loadingMessage?: string;
	showConfirmAll?: boolean;
}

export function ScheduleTable({
	mode,
	schedules,
	isLoading = false,
	onDriverChange,
	onVehicleAssign,
	onConfirmAll,
	getAvailableDriversForSchedule,
	getAvailableVehiclesForSchedule,
	failedScheduleIds = [],
	emptyMessage = 'No schedules found',
	loadingMessage = 'Loading schedules...',
	showConfirmAll = true,
}: ScheduleTableProps) {
	const formatTime = (timeStr: string) => {
		if (!timeStr) return '';

		try {
			const date = new Date(timeStr);
			const hours = date.getHours();
			const minutes = date.getMinutes();
			const period = hours >= 12 ? 'PM' : 'AM';
			const displayHours =
				hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
			const displayMinutes = minutes.toString().padStart(2, '0');
			return `${displayHours}:${displayMinutes} ${period}`;
		} catch {
			return timeStr;
		}
	};

	const isEditable = mode === 'editable';
	const columnCount = 9;

	// Create a Set for O(1) lookup
	const failedIdsSet = new Set(failedScheduleIds);

	// Track which schedules are currently sending SMS
	const [sendingSmsIds, setSendingSmsIds] = useState<Set<number>>(new Set());

	const handleResendSMS = async (scheduleId: number) => {
		setSendingSmsIds((prev) => new Set(prev).add(scheduleId));
		try {
			const result = await apiClient.resendConfirmationSMS(scheduleId);
			if (result.success) {
				notify.success('SMS sent successfully');
			} else {
				notify.error(result.message || 'Failed to send SMS');
			}
		} catch (error: unknown) {
			const err = error as { response?: { data?: { detail?: string } } };
			notify.error(err.response?.data?.detail || 'Failed to send SMS');
		} finally {
			setSendingSmsIds((prev) => {
				const next = new Set(prev);
				next.delete(scheduleId);
				return next;
			});
		}
	};

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Driver Name</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Amazon ID</TableHead>
						<TableHead>Check-in</TableHead>
						<TableHead>Route</TableHead>
						<TableHead>Shift Time</TableHead>
						<TableHead>Vehicle</TableHead>
						<TableHead>Confirm Status</TableHead>
						<TableHead className='text-center'>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell
								colSpan={columnCount}
								className='text-center py-12'>
								<div className='flex flex-col items-center gap-3'>
									<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700'></div>
									<p className='text-gray-600'>
										{loadingMessage}
									</p>
								</div>
							</TableCell>
						</TableRow>
					) : schedules.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={columnCount}
								className='text-center py-12'>
								<p className='text-gray-600'>{emptyMessage}</p>
							</TableCell>
						</TableRow>
					) : (
						schedules.map((schedule) => {
							const isFailed = failedIdsSet.has(schedule.id);

							return (
								<TableRow
									key={schedule.id}
									className={`transition-colors hover:bg-gray-50 ${
										isFailed
											? 'bg-red-50 shadow-[inset_4px_0_0_0_rgb(239,68,68)]'
											: ''
									}`}>
									{/* Driver Name Column */}
									<TableCell>
										{isEditable ? (
											<Select
												value={
													schedule.driver?.id?.toString() ||
													''
												}
												onValueChange={(value) => {
													const driverId =
														parseInt(value);
													if (
														!isNaN(driverId) &&
														onDriverChange
													) {
														onDriverChange(
															schedule.id,
															driverId,
														);
													}
												}}>
												<SelectTrigger className='w-full border-0 shadow-none hover:bg-gray-100'>
													<SelectValue>
														<div className='flex items-center gap-2'>
															<User className='h-4 w-4 text-gray-500' />
															<span className='font-medium text-gray-900'>
																{schedule.driver
																	?.name ||
																	'-'}
															</span>
														</div>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{getAvailableDriversForSchedule &&
														getAvailableDriversForSchedule(
															schedule,
														).map((driver) => (
															<SelectItem
																key={driver.id}
																value={driver.id.toString()}>
																<div className='flex items-center gap-2'>
																	<User className='h-4 w-4 text-gray-500' />
																	{
																		driver.name
																	}
																	{schedule
																		.driver
																		?.id ===
																		driver.id && (
																		<span className='text-xs text-gray-500'>
																			(current)
																		</span>
																	)}
																</div>
															</SelectItem>
														))}
												</SelectContent>
											</Select>
										) : (
											<div className='flex items-center gap-2'>
												<User className='h-4 w-4 text-gray-500' />
												<span className='font-medium text-gray-900'>
													{schedule.driver?.name ||
														'-'}
												</span>
											</div>
										)}
									</TableCell>

									{/* Driver Status Column */}
									<TableCell>
										<Badge
											variant={
												schedule.driver?.is_active
													? 'default'
													: 'secondary'
											}
											className={
												schedule.driver?.is_active
													? 'bg-green-600 text-white'
													: 'bg-gray-300 text-gray-700'
											}>
											{schedule.driver?.is_active
												? 'Active'
												: 'Inactive'}
										</Badge>
									</TableCell>

									{/* Amazon ID Column */}
									<TableCell>
										<span className='font-medium text-gray-900'>
											{schedule.driver?.amazon_id || '-'}
										</span>
									</TableCell>

									{/* Check-in Status Column */}
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

									{/* Route Column */}
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

									{/* Shift Time Column */}
									<TableCell>
										{schedule.start_time &&
										schedule.end_time ? (
											<div className='flex items-center gap-1 text-sm text-gray-700'>
												<span className='font-medium'>
													{formatTime(
														schedule.start_time,
													)}
												</span>
												<span className='text-gray-400'>
													-
												</span>
												<span className='font-medium'>
													{formatTime(
														schedule.end_time,
													)}
												</span>
											</div>
										) : (
											<span className='text-gray-400 text-sm'>
												-
											</span>
										)}
									</TableCell>

									{/* Vehicle Column */}
									<TableCell>
										{isEditable ? (
											<Select
												value={
													schedule.vehicle_alias ||
													'unassigned'
												}
												onValueChange={(value) => {
													if (onVehicleAssign) {
														onVehicleAssign(
															schedule.id,
															value ===
																'unassigned'
																? ''
																: value,
														);
													}
												}}>
												<SelectTrigger className='w-full border-0 shadow-none hover:bg-gray-100'>
													<SelectValue placeholder='Select vehicle'>
														<div className='flex items-center gap-2'>
															<CarIcon className='h-4 w-4 text-gray-500' />
															<span className='font-medium'>
																{schedule.vehicle_alias ||
																	'Assign Vehicle'}
															</span>
														</div>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{schedule.vehicle_alias && (
														<SelectItem value='unassigned'>
															<div className='flex items-center gap-2 text-orange-600'>
																<CarIcon className='h-4 w-4' />
																Unassign Vehicle
															</div>
														</SelectItem>
													)}
													{!schedule.vehicle_alias && (
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
															getAvailableVehiclesForSchedule
																? getAvailableVehiclesForSchedule(
																		schedule,
																	)
																: [];
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
																),
															)
														);
													})()}
												</SelectContent>
											</Select>
										) : schedule.vehicle_alias ? (
											<span className='font-medium text-gray-900'>
												{schedule.vehicle_alias}
											</span>
										) : (
											<span className='text-gray-400 text-sm'>
												Not assigned
											</span>
										)}
									</TableCell>

									{/* Confirm Status Column */}
									<TableCell>
										<Badge
											variant={
												schedule.confirm_status ===
												'confirmed'
													? 'default'
													: schedule.confirm_status ===
														  'cancelled'
														? 'destructive'
														: 'secondary'
											}
											className={
												schedule.confirm_status ===
												'confirmed'
													? 'bg-blue-600 text-white'
													: schedule.confirm_status ===
														  'cancelled'
														? 'bg-rose-500 text-white'
														: 'bg-gray-300 text-gray-700'
											}>
											{schedule.confirm_status ===
											'confirmed'
												? 'Confirmed'
												: schedule.confirm_status ===
													  'cancelled'
													? 'Cancelled'
													: 'Pending'}
										</Badge>
									</TableCell>

									{/* Actions Column - Resend SMS */}
									<TableCell className='text-center'>
										<Button
											variant='outline'
											size='sm'
											onClick={() =>
												handleResendSMS(schedule.id)
											}
											disabled={sendingSmsIds.has(
												schedule.id,
											)}
											className='gap-1.5'>
											{/* {sendingSmsIds.has(schedule.id) ? (
												<Loader2 className='h-4 w-4 animate-spin' />
											) : (
												<MessageSquare className='h-4 w-4' />
											)} */}
											<span className='hidden sm:inline'>
												Resend
											</span>
										</Button>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>

			{/* Footer with Confirm All button (editable mode only) */}
			{isEditable && schedules.length > 0 && showConfirmAll && (
				<div className='p-6 border-t bg-gray-50'>
					<div className='flex justify-between items-center'>
						<p className='text-sm text-gray-600'>
							Total routes: {schedules.length}
						</p>
						<Button
							onClick={onConfirmAll}
							className='bg-blue-700 hover:bg-blue-800'>
							Confirm All Schedules
						</Button>
					</div>
				</div>
			)}

			{/* Footer with count (readonly mode) */}
			{!isEditable && schedules.length > 0 && (
				<div className='p-4 border-t bg-gray-50'>
					<p className='text-sm text-gray-600'>
						Showing {schedules.length}{' '}
						{schedules.length === 1 ? 'schedule' : 'schedules'}
					</p>
				</div>
			)}
		</>
	);
}
