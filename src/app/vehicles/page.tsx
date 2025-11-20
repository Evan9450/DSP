'use client';

import { Car, ChevronRight, Plus, Search, AlertCircle, Wrench } from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Vehicle, VehicleCondition } from '@/types/schedule';
import { mockVehicles } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { getVehicleConditionBadge, getDaysUntilMaintenance, isMaintenanceOverdue, isMaintenanceDueSoon } from '@/lib/helpers';

export default function VehiclesPage() {
	const router = useRouter();
	const [vehicles] = useState<Vehicle[]>(mockVehicles);
	const [searchTerm, setSearchTerm] = useState('');
	const [conditionFilter, setConditionFilter] = useState<VehicleCondition | 'all'>('all');

	const filteredVehicles = vehicles.filter((v) => {
		const matchesSearch =
			v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.rego.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.model?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCondition = conditionFilter === 'all' || v.condition === conditionFilter;

		return matchesSearch && matchesCondition;
	});

	const conditionStats = {
		green: vehicles.filter(v => v.condition === 'green').length,
		yellow: vehicles.filter(v => v.condition === 'yellow').length,
		red: vehicles.filter(v => v.condition === 'red').length,
	};

	const statusConfig = {
		available: { label: 'Available', className: 'bg-green-600 text-white' },
		'in-use': { label: 'In Use', className: 'bg-blue-600 text-white' },
		maintenance: { label: 'Maintenance', className: 'bg-orange-600 text-white' },
	};

	const conditionConfig = {
		green: { label: 'Ready', className: 'bg-green-500', textClass: 'text-green-700' },
		yellow: { label: 'Needs Repair', className: 'bg-yellow-500', textClass: 'text-yellow-700' },
		red: { label: 'Unavailable', className: 'bg-red-500', textClass: 'text-red-700' },
	};

	const handleRowClick = (vehicleId: string) => {
		router.push(`/vehicles/${vehicleId}`);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='mb-4 sm:mb-6'>
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						Vehicle Fleet Management
					</h1>
					<p className='text-sm sm:text-base text-gray-600 mt-1'>
						Manage fleet vehicles, conditions, and maintenance schedules
					</p>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
					<Card className='p-4 cursor-pointer hover:shadow-lg transition-shadow' onClick={() => setConditionFilter('green')}>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Ready to Use</p>
								<p className='text-2xl font-bold text-green-600'>{conditionStats.green}</p>
							</div>
							<div className='w-12 h-12 rounded-full bg-green-500'></div>
						</div>
					</Card>
					<Card className='p-4 cursor-pointer hover:shadow-lg transition-shadow' onClick={() => setConditionFilter('yellow')}>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Needs Repair</p>
								<p className='text-2xl font-bold text-yellow-600'>{conditionStats.yellow}</p>
							</div>
							<div className='w-12 h-12 rounded-full bg-yellow-500'></div>
						</div>
					</Card>
					<Card className='p-4 cursor-pointer hover:shadow-lg transition-shadow' onClick={() => setConditionFilter('red')}>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Unavailable</p>
								<p className='text-2xl font-bold text-red-600'>{conditionStats.red}</p>
							</div>
							<div className='w-12 h-12 rounded-full bg-red-500'></div>
						</div>
					</Card>
				</div>

				{/* Filters and Actions */}
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
							variant={conditionFilter === 'all' ? 'default' : 'outline'}
							onClick={() => setConditionFilter('all')}
							className={conditionFilter === 'all' ? 'bg-blue-700' : ''}
						>
							All
						</Button>
						<Button
							variant={conditionFilter === 'green' ? 'default' : 'outline'}
							onClick={() => setConditionFilter('green')}
							className={conditionFilter === 'green' ? 'bg-green-600' : ''}
						>
							Green
						</Button>
						<Button
							variant={conditionFilter === 'yellow' ? 'default' : 'outline'}
							onClick={() => setConditionFilter('yellow')}
							className={conditionFilter === 'yellow' ? 'bg-yellow-600' : ''}
						>
							Yellow
						</Button>
						<Button
							variant={conditionFilter === 'red' ? 'default' : 'outline'}
							onClick={() => setConditionFilter('red')}
							className={conditionFilter === 'red' ? 'bg-red-600' : ''}
						>
							Red
						</Button>
					</div>
					<Button className='bg-blue-700 hover:bg-blue-800 text-white'>
						<Plus className='h-4 w-4 mr-2' />
						<span className='hidden sm:inline'>Add Vehicle</span>
						<span className='sm:hidden'>Add</span>
					</Button>
				</div>

				<Card className='bg-white overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[40px]'></TableHead>
								<TableHead>Rego</TableHead>
								<TableHead>Vehicle Number</TableHead>
								<TableHead>Brand / Model</TableHead>
								<TableHead>Condition</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Mileage</TableHead>
								<TableHead>Next Maintenance</TableHead>
								<TableHead className='w-[50px]'></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredVehicles.map((vehicle) => {
								const statusInfo = statusConfig[vehicle.status];
								const conditionInfo = conditionConfig[vehicle.condition];
								const daysUntilMaintenance = getDaysUntilMaintenance(vehicle.nextMaintenanceDate);
								const maintenanceOverdue = isMaintenanceOverdue(vehicle.nextMaintenanceDate);
								const maintenanceDueSoon = isMaintenanceDueSoon(vehicle.nextMaintenanceDate);

								return (
									<TableRow
										key={vehicle.id}
										className='cursor-pointer hover:bg-gray-50 transition-colors'
										onClick={() => handleRowClick(vehicle.id)}
									>
										<TableCell>
											<div className={`w-3 h-3 rounded-full ${conditionInfo.className}`}></div>
										</TableCell>
										<TableCell className='font-semibold text-gray-900'>
											{vehicle.rego}
										</TableCell>
										<TableCell className='font-medium text-gray-800'>
											{vehicle.vehicleNumber}
										</TableCell>
										<TableCell className='text-gray-600'>
											{vehicle.brand && vehicle.model ? (
												<div>
													<span className='font-medium'>{vehicle.brand}</span> {vehicle.model}
												</div>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												<div className={`w-2 h-2 rounded-full ${conditionInfo.className}`}></div>
												<span className={`text-sm font-medium ${conditionInfo.textClass}`}>
													{conditionInfo.label}
												</span>
											</div>
											{vehicle.notes && vehicle.condition !== 'green' && (
												<div className='flex items-center gap-1 mt-1'>
													<AlertCircle className='h-3 w-3 text-gray-500' />
													<span className='text-xs text-gray-600'>{vehicle.notes}</span>
												</div>
											)}
										</TableCell>
										<TableCell>
											<Badge className={statusInfo.className}>
												{statusInfo.label}
											</Badge>
										</TableCell>
										<TableCell className='text-gray-600'>
											{vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : '-'}
										</TableCell>
										<TableCell>
											{vehicle.nextMaintenanceDate ? (
												<div className='flex items-center gap-2'>
													{maintenanceOverdue ? (
														<div className='flex items-center gap-1 text-red-600'>
															<AlertCircle className='h-4 w-4' />
															<span className='text-sm font-medium'>Overdue</span>
														</div>
													) : maintenanceDueSoon ? (
														<div className='flex items-center gap-1 text-orange-600'>
															<Wrench className='h-4 w-4' />
															<span className='text-sm font-medium'>In {daysUntilMaintenance} days</span>
														</div>
													) : (
														<span className='text-sm text-gray-600'>
															{format(vehicle.nextMaintenanceDate, 'MMM d, yyyy')}
														</span>
													)}
												</div>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</TableCell>
										<TableCell>
											<ChevronRight className='h-5 w-5 text-gray-400' />
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
			</div>
		</div>
	);
}
