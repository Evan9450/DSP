'use client';

import { Car as CarIcon, MapPin, User } from 'lucide-react';
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
import { ScheduleResponse } from '@/lib/api/client';
import { format } from 'date-fns';

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
	onConfirmSingle?: (scheduleId: number) => void;
	onConfirmAll?: () => void;
	getAvailableDriversForSchedule?: (schedule: any) => Driver[];
	getAvailableVehiclesForSchedule?: (schedule: any) => Vehicle[];

	// Optional customization
	emptyMessage?: string;
	loadingMessage?: string;
	showConfirmAll?: boolean;
}

export function ScheduleTable({
	mode,
	schedules,
	isLoading = false,
	allDrivers = [],
	allVehicles = [],
	onDriverChange,
	onVehicleAssign,
	onConfirmSingle,
	onConfirmAll,
	getAvailableDriversForSchedule,
	getAvailableVehiclesForSchedule,
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
		} catch (error) {
			return timeStr;
		}
	};

	const isEditable = mode === 'editable';
	const columnCount = isEditable ? 7 : 8; // editable has 7 columns, readonly has 8 (includes Date)

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Driver Name</TableHead>
						<TableHead>Amazon ID</TableHead>
						<TableHead>Check-in Status</TableHead>
						<TableHead>Route</TableHead>
						<TableHead>Shift Time</TableHead>
						<TableHead>Vehicle</TableHead>
						{isEditable && <TableHead>Confirm</TableHead>}
						{!isEditable && <TableHead>Status</TableHead>}
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
						schedules.map((schedule) => (
							<TableRow
								key={schedule.id}
								className='hover:bg-gray-50 transition-colors'>
								{/* Driver Name Column */}
								<TableCell>
									{isEditable ? (
										<Select
											value={
												// @ts-ignore - _driver_id is a temporary field
												schedule._driver_id?.toString() ||
												allDrivers
													.find(
														(d) =>
															d.deputy_id ===
															schedule.deputy_id
													)
													?.id?.toString() ||
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
														driverId
													);
												}
											}}>
											<SelectTrigger className='w-full border-0 shadow-none hover:bg-gray-100'>
												<SelectValue>
													<div className='flex items-center gap-2'>
														<User className='h-4 w-4 text-gray-500' />
														<span className='font-medium text-gray-900'>
															{
																schedule.driver_name
															}
														</span>
													</div>
												</SelectValue>
											</SelectTrigger>
											<SelectContent>
												{getAvailableDriversForSchedule &&
													getAvailableDriversForSchedule(
														schedule
													).map((driver) => (
														<SelectItem
															key={driver.id}
															value={driver.id.toString()}>
															<div className='flex items-center gap-2'>
																<User className='h-4 w-4 text-gray-500' />
																{driver.name}
																{(
																	schedule as any
																)._driver_id ===
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
												{schedule.driver_name}
											</span>
										</div>
									)}
								</TableCell>

								{/* Amazon ID Column */}
								<TableCell>
									<span className='font-medium text-gray-900'>
										{schedule.amazon_id || '-'}
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
										schedule.checkin_status === 'completed'
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
													schedule.start_time
												)}
											</span>
											<span className='text-gray-400'>
												-
											</span>
											<span className='font-medium'>
												{formatTime(schedule.end_time)}
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
												schedule.vehicle || 'unassigned'
											}
											onValueChange={(value) => {
												if (
													value !== 'unassigned' &&
													onVehicleAssign
												) {
													onVehicleAssign(
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
															No vehicle assigned
														</div>
													</SelectItem>
												)}
												{(() => {
													const availableVehicles =
														getAvailableVehiclesForSchedule
															? getAvailableVehiclesForSchedule(
																	schedule
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
															)
														)
													);
												})()}
											</SelectContent>
										</Select>
									) : schedule.vehicle ? (
										<span className='font-medium text-gray-900'>
											{schedule.vehicle}
										</span>
									) : (
										<span className='text-gray-400 text-sm'>
											Not assigned
										</span>
									)}
								</TableCell>

								{/* Confirm Column (editable only) / Status Column (readonly only) */}
								{isEditable ? (
									<TableCell>
										<Button
											size='sm'
											onClick={() =>
												onConfirmSingle &&
												onConfirmSingle(schedule.id)
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
								) : (
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
								)}
							</TableRow>
						))
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
