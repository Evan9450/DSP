'use client';

import {
	AlertCircle,
	Calendar,
	Car,
	ChevronRight,
	MoreVertical,
	Package,
	Plus,
	Search,
	Settings,
	Trash2,
	Wrench,
} from 'lucide-react';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	errorMessages,
	handleApiError,
	notify,
	successMessages,
} from '@/lib/notifications';
import {
	getDaysUntilMaintenance,
	isMaintenanceDueSoon,
	isMaintenanceOverdue,
} from '@/lib/helpers';

import { AddVehicleDialog } from './components/add-vehicle-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { VehicleCondition } from '@/types/schedule';
import { apiClient } from '@/lib/api/client';
// import { apiConditionToString } from '@/lib/helpers';
import { convertVehicle } from '@/lib/api/converters';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useVehicles } from '@/hooks/use-vehicles';

/* =========================
   Domain Types
========================= */

type VehicleCondition =
	| 'available'
	| 'need-repair'
	| 'unavailable'
	| 'supplementary';
type VehicleStatus = 'in-use' | 'not-in-use';

/* =========================
   UI Config
========================= */

const CONDITION_UI: Record<
	VehicleCondition,
	{ label: string; dot: string; text: string }
> = {
	available: {
		label: 'Available',
		dot: 'bg-green-500',
		text: 'text-green-700',
	},
	'need-repair': {
		label: 'Needs Repair',
		dot: 'bg-yellow-500',
		text: 'text-yellow-700',
	},
	unavailable: {
		label: 'Unavailable',
		dot: 'bg-red-500',
		text: 'text-red-700',
	},
	supplementary: {
		label: 'Supplementary',
		dot: 'bg-indigo-500',
		text: 'text-indigo-700',
	},
};

const STATUS_UI: Record<VehicleStatus, { label: string; className: string }> = {
	'in-use': {
		label: 'In Use',
		className: 'bg-blue-600 text-white',
	},
	'not-in-use': {
		label: 'Not In Use',
		className: 'bg-gray-300 text-black',
	},
};

export default function VehiclesPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [showArchived, setShowArchived] = useState(false);
	const { vehicles: apiVehicles, isLoading, refetch } = useVehicles();
	const [searchTerm, setSearchTerm] = useState('');
	const [conditionFilter, setConditionFilter] = useState<
		'available' | 'need-repair' | 'unavailable' | 'supplementary' | 'all'
	>('all');
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(false);
	const [vehicleToDelete, setVehicleToDelete] = useState<{
		id: string;
		rego: string;
	} | null>(null);

	// Debug: Log API response
	if (apiVehicles && apiVehicles.length > 0) {
		console.log('📡 API Vehicle (raw):', apiVehicles[0]);
	}

	const vehicles = apiVehicles?.map(convertVehicle) || [];

	// Debug: Log converted vehicle to check ID
	if (vehicles.length > 0) {
		console.log('🔄 Converted vehicle:', {
			id: vehicles[0].id,
			idType: typeof vehicles[0].id,
			rego: vehicles[0].rego,
			alias: vehicles[0].alias,
		});
	}

	/* =========================
	   Sorting
	========================= */

	// Sort vehicles: vehicles with scheduledMaintenanceDate come first, sorted by date (ASC)
	// then vehicles without scheduledMaintenanceDate
	const filteredVehicles = vehicles
		.filter((v) => {
			// 根据 is_archived 字段过滤归档/正常车辆
			if (showArchived) {
				if (!v.is_archived) return false;
			} else {
				if (v.is_archived) return false;
			}

			const matchesSearch =
				v.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				v.rego.toLowerCase().includes(searchTerm.toLowerCase()) ||
				v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				v.model?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCondition =
				showArchived ||
				conditionFilter === 'all' ||
				(conditionFilter === 'supplementary'
					? v.is_supplementary
					: v.condition === conditionFilter && !v.is_supplementary);

			return matchesSearch && matchesCondition;
		})
		.sort((a, b) => {
			// If both have scheduled date, sort by date (earlier first)
			if (a.scheduledMaintenanceDate && b.scheduledMaintenanceDate) {
				return (
					a.scheduledMaintenanceDate.getTime() -
					b.scheduledMaintenanceDate.getTime()
				);
			}
			// If only a has date, a comes first
			if (a.scheduledMaintenanceDate) return -1;
			// If only b has date, b comes first
			if (b.scheduledMaintenanceDate) return 1;
			// If neither has date, keep original order (or sort by rego/id if needed)
			return 0;
		});

	/* =========================
	   Stats (same source!)
	========================= */

	const conditionStats = {
		available: vehicles.filter(
			(v) => v.condition === 'available' && !v.is_supplementary,
		).length,
		'need-repair': vehicles.filter(
			(v) => v.condition === 'need-repair' && !v.is_supplementary,
		).length,
		unavailable: vehicles.filter(
			(v) => v.condition === 'unavailable' && !v.is_supplementary,
		).length,
		supplementary: vehicles.filter((v) => v.is_supplementary).length,
	};

	const handleRowClick = (vehicleId: string) => {
		console.log(
			'🚗 Clicking vehicle with ID:',
			vehicleId,
			'type:',
			typeof vehicleId,
		);

		if (!vehicleId || vehicleId === 'undefined') {
			console.error('❌ Invalid vehicle ID:', vehicleId);
			return;
		}

		// Ensure vehicleId is a string
		const idStr = String(vehicleId);
		console.log('🔗 Navigating to:', `/vehicles/${idStr}`);
		router.push(`/vehicles/${idStr}`);
	};

	const handleScheduleMaintenance = (
		vehicleId: string,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		// TODO: Implement schedule maintenance functionality
		notify.info('Schedule Maintenance feature coming soon');
	};

	const handleDeleteClick = (
		vehicleId: string,
		rego: string,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		setVehicleToDelete({ id: vehicleId, rego });
		setShowDeleteDialog(true);
	};

	const handleDeleteVehicle = async () => {
		if (!vehicleToDelete) return;

		try {
			await apiClient.deleteVehicle(parseInt(vehicleToDelete.id));
			const vehicleRego = vehicleToDelete.rego;
			setShowDeleteDialog(false);
			setVehicleToDelete(null);
			await refetch();
			notify.success(
				`Vehicle ${vehicleRego} has been archived successfully`,
			);
		} catch (error) {
			console.error('Failed to delete vehicle:', error);
			handleApiError(
				error,
				`Failed to archive vehicle ${vehicleToDelete?.rego}`,
			);
		}
	};

	const handleRestoreClick = async (
		vehicleId: string,
		rego: string,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		try {
			await apiClient.restoreVehicle(parseInt(vehicleId));
			await refetch();
			notify.success(`Vehicle ${rego} has been restored successfully`);
		} catch (error) {
			console.error('Failed to restore vehicle:', error);
			handleApiError(error, `Failed to restore vehicle ${rego}`);
		}
	};

	const handleCheckMaintenance = async () => {
		try {
			setIsCheckingMaintenance(true);
			const result = await apiClient.checkVehicleMaintenance();

			console.log('✅ Check maintenance result:', result);

			toast({
				title: 'Maintenance Check Complete',
				description: `Emails sent: ${result.emails_sent || 0}, SMS sent: ${result.sms_sent || 0}`,
			});
		} catch (error) {
			console.error('Failed to check maintenance:', error);
			toast({
				title: 'Error',
				description: 'Failed to check vehicle maintenance',
				variant: 'destructive',
			});
		} finally {
			setIsCheckingMaintenance(false);
		}
	};

	// Vehicles with maintenance alerts
	const handleFilter = (
		condition:
			| 'available'
			| 'need-repair'
			| 'unavailable'
			| 'supplementary'
			| 'all'
			| 'archived',
	) => {
		if (condition === 'archived') {
			setShowArchived(true);
			setConditionFilter('all');
		} else {
			setShowArchived(false);
			setConditionFilter(condition);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading vehicles...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
				<div className='mb-4 sm:mb-6'>
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						Vehicle Management
					</h1>
				</div>

				{/* Stats Cards */}

				<div className='grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6'>
					<Card 
						className={`p-4 cursor-pointer transition-all border-green-200 ${conditionFilter === 'available' && !showArchived ? 'ring-2 ring-green-500 shadow-md bg-green-100' : 'bg-green-50 hover:bg-green-100'}`}
						onClick={() => handleFilter('available')}
					>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-green-700 font-medium'>
									Available
								</p>
								<p className='text-2xl font-bold text-green-900 mt-1'>
									{conditionStats.available}
								</p>
							</div>
							<div className='w-3 h-3 rounded-full bg-green-500'></div>
						</div>
					</Card>
					<Card 
						className={`p-4 cursor-pointer transition-all border-yellow-200 ${conditionFilter === 'need-repair' && !showArchived ? 'ring-2 ring-yellow-500 shadow-md bg-yellow-100' : 'bg-yellow-50 hover:bg-yellow-100'}`}
						onClick={() => handleFilter('need-repair')}
					>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-yellow-700 font-medium'>
									Needs Repair
								</p>
								<p className='text-2xl font-bold text-yellow-900 mt-1'>
									{conditionStats['need-repair']}
								</p>
							</div>
							<div className='w-3 h-3 rounded-full bg-yellow-500'></div>
						</div>
					</Card>
					<Card 
						className={`p-4 cursor-pointer transition-all border-red-200 ${conditionFilter === 'unavailable' && !showArchived ? 'ring-2 ring-red-500 shadow-md bg-red-100' : 'bg-red-50 hover:bg-red-100'}`}
						onClick={() => handleFilter('unavailable')}
					>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-red-700 font-medium'>
									Unavailable
								</p>
								<p className='text-2xl font-bold text-red-900 mt-1'>
									{conditionStats.unavailable}
								</p>
							</div>
							<div className='w-3 h-3 rounded-full bg-red-500'></div>
						</div>
					</Card>
					<Card 
						className={`p-4 cursor-pointer transition-all border-indigo-200 ${conditionFilter === 'supplementary' && !showArchived ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-100' : 'bg-indigo-50 hover:bg-indigo-100'}`}
						onClick={() => handleFilter('supplementary')}
					>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-indigo-700 font-medium'>
									Supplementary
								</p>
								<p className='text-2xl font-bold text-indigo-900 mt-1'>
									{conditionStats.supplementary}
								</p>
							</div>
							<div className='w-3 h-3 rounded-full bg-indigo-500'></div>
						</div>
					</Card>
				</div>

				{/* Search and Filters */}
				<div className='mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3'>
					<div className='relative flex-1 max-w-full sm:max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search by rego, number, brand, or model...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>

					<div className='flex gap-2'>
						<Button
							variant={
								conditionFilter === 'all' && !showArchived
									? 'default'
									: 'outline'
							}
							onClick={() => handleFilter('all')}
							size='sm'>
							All
						</Button>
						<Button
							variant={showArchived ? 'default' : 'outline'}
							onClick={() => handleFilter('archived')}
							size='sm'
							className={showArchived ? 'bg-gray-600' : ''}>
							Archived
						</Button>
					</div>

					<div className='flex gap-2'>
						<Button
							variant='outline'
							className='border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-600'
							onClick={handleCheckMaintenance}
							disabled={isCheckingMaintenance}>
							<span className='hidden sm:inline'>
								{isCheckingMaintenance
									? 'Checking...'
									: 'Check Maintenance'}
							</span>
							<span className='sm:hidden'>
								{isCheckingMaintenance ? 'Check...' : 'Check'}
							</span>
						</Button>
						<Button
							className='bg-blue-700 hover:bg-blue-800 text-white'
							onClick={() => setShowAddDialog(true)}>
							<Plus className='h-4 w-4 mr-2' />
							<span className='hidden sm:inline'>
								Add Vehicle
							</span>
							<span className='sm:hidden'>Add</span>
						</Button>
					</div>
				</div>

				{/* Vehicles Table */}
				<Card className='bg-white overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[60px]'></TableHead>
								<TableHead>Rego</TableHead>
								{/* <TableHead>VIN Number</TableHead> */}
								<TableHead>Nickname</TableHead>
								<TableHead>Brand</TableHead>
								<TableHead>Condition</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Mileage</TableHead>
								<TableHead>Scheduled Maint.</TableHead>
								{/* <TableHead>Notes</TableHead> */}
								<TableHead className='w-[50px]'></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredVehicles.map((vehicle) => {
								const maintenanceDays =
									vehicle.nextMaintenanceDate
										? getDaysUntilMaintenance(
												vehicle.nextMaintenanceDate,
											)
										: null;
								const isOverdue = vehicle.nextMaintenanceDate
									? isMaintenanceOverdue(
											vehicle.nextMaintenanceDate,
										)
									: false;
								const isDueSoon = vehicle.nextMaintenanceDate
									? isMaintenanceDueSoon(
											vehicle.nextMaintenanceDate,
										)
									: false;

								// const conditionStr = apiConditionToString(
								// 	vehicle.condition,
								// );
								// vehicle.status is already a string: 'in-use' | 'not-in-use'
								const statusStr = vehicle.status;

								return (
									<TableRow
										key={vehicle.id}
										className='cursor-pointer hover:bg-gray-50 transition-colors'
										onClick={() =>
											handleRowClick(vehicle.id)
										}>
										<TableCell>
											<div className='p-2 bg-blue-100 rounded-full inline-block'>
												<Car className='h-5 w-5 text-blue-700' />
											</div>
										</TableCell>
										<TableCell>
											<div className='font-semibold text-gray-900 font-mono'>
												{vehicle.rego}
											</div>
										</TableCell>

										<TableCell>
											{vehicle.alias ||
											(vehicle.is_supplementary &&
												vehicle.active_supp_target_str) ? (
												<div>
													<p className='font-medium text-gray-900 flex items-center gap-1'>
														{vehicle.alias || '-'}
														{vehicle.is_supplementary &&
															vehicle.active_supp_target_str && (
																<span className='text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded-full whitespace-nowrap'>
																	{
																		vehicle.active_supp_target_str
																	}
																</span>
															)}
													</p>
												</div>
											) : (
												<span className='text-gray-400'>
													-
												</span>
											)}
										</TableCell>
										<TableCell>
											{vehicle.brand ? (
												<div>
													<p className='font-medium text-gray-900'>
														{vehicle.brand}
													</p>
												</div>
											) : (
												<span className='text-gray-400'>
													-
												</span>
											)}
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												<span
													className={`w-3 h-3 rounded-full ${CONDITION_UI[vehicle.condition].dot}`}
												/>
												<span
													className={`font-medium ${CONDITION_UI[vehicle.condition].text}`}>
													{
														CONDITION_UI[
															vehicle.condition
														].label
													}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												className={
													STATUS_UI[vehicle.status]
														.className
												}>
												{
													STATUS_UI[vehicle.status]
														.label
												}
											</Badge>
										</TableCell>
										<TableCell>
											{vehicle.mileage ? (
												<span className='font-mono text-sm'>
													{vehicle.mileage?.toLocaleString()}
													km
												</span>
											) : (
												<span className='text-gray-400'>
													-
												</span>
											)}
										</TableCell>
										<TableCell>
											{vehicle.scheduledMaintenanceDate ? (
												<div>
													<p
														className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : isDueSoon ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
														{format(
															vehicle.scheduledMaintenanceDate,
															'MMM dd, yyyy',
														)}
													</p>
													<p
														className={`text-xs ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : 'text-gray-500'}`}>
														{format(
															vehicle.scheduledMaintenanceDate,
															'HH:mm',
														)}
													</p>
												</div>
											) : (
												<span className='text-gray-400'>
													Not scheduled
												</span>
											)}
										</TableCell>

										<TableCell
											onClick={(e) =>
												e.stopPropagation()
											}>
											<div className='flex items-center justify-end gap-2'>
												{showArchived ? (
													<Button
														size='sm'
														variant='outline'
														onClick={(e) =>
															handleRestoreClick(
																vehicle.id,
																vehicle.rego,
																e,
															)
														}>
														Restore
													</Button>
												) : (
													<ChevronRight className='h-5 w-5 text-gray-400' />
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Card>

				{filteredVehicles.length === 0 && (
					<div className='text-center py-12'>
						<Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-600'>No vehicles found</p>
					</div>
				)}

				<AddVehicleDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					onSuccess={refetch}
				/>

				{/* Delete Confirmation Dialog */}
				{/* <Dialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Archive Vehicle</DialogTitle>
							<DialogDescription>
								Are you sure you want to archive vehicle{' '}
								<span className='font-semibold'>
									{vehicleToDelete?.rego}
								</span>
								? This will logically delete the vehicle.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setShowDeleteDialog(false)}>
								Cancel
							</Button>
							<Button
								variant='destructive'
								onClick={handleDeleteVehicle}>
								Archive Vehicle
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog> */}
			</div>
		</div>
	);
}
