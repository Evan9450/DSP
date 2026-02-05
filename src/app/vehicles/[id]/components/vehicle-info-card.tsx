'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RepairSupplierSelect } from './repair-supplier-select';
import { VehicleDetailResponse } from '@/lib/api/client';
import { apiConditionToString } from '@/lib/helpers';

interface VehicleInfoCardProps {
	vehicle: VehicleDetailResponse;
	isEditing: boolean;
	editForm: Partial<VehicleDetailResponse>;
	setEditForm: (form: Partial<VehicleDetailResponse>) => void;
}

export function VehicleInfoCard({
	vehicle,
	isEditing,
	editForm,
	setEditForm,
}: VehicleInfoCardProps) {
	const conditionStr = apiConditionToString(vehicle.condition);
	const statusStr = vehicle.status;

	const statusConfig: Record<
		'in-use' | 'not-in-use',
		{ label: string; className: string }
	> = {
		'in-use': { label: 'In Use', className: 'bg-blue-600 text-white' },
		'not-in-use': {
			label: 'Not In Use',
			className: 'bg-gray-600 text-white',
		},
	};

	const conditionConfig = {
		green: {
			label: 'Available',
			className: 'bg-green-500',
			textClass: 'text-green-700',
		},
		yellow: {
			label: 'Needs Repair',
			className: 'bg-yellow-500',
			textClass: 'text-yellow-700',
		},
		red: {
			label: 'Unavailable',
			className: 'bg-red-500',
			textClass: 'text-red-700',
		},
	};

	return (
		<Card className='p-6'>
			<h2 className='text-xl font-semibold text-gray-900 mb-4'>
				Vehicle Information
			</h2>
			{isEditing ? (
				<div className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='edit-rego'>Registration</Label>
							<Input
								id='edit-rego'
								value={editForm.rego || ''}
								onChange={(e) =>
									setEditForm({
										...editForm,
										rego: e.target.value,
									})
								}
								placeholder='ABC123'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-alias'>VIN Number</Label>
							<Input
								id='edit-alias'
								value={editForm.alias || ''}
								onChange={(e) =>
									setEditForm({
										...editForm,
										alias: e.target.value,
									})
								}
								placeholder='V001'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-nickname'>Nickname</Label>
							<Input
								id='edit-nickname'
								value={editForm.nickname || ''}
								onChange={(e) =>
									setEditForm({
										...editForm,
										nickname: e.target.value,
									})
								}
								placeholder='Red Van'
							/>
						</div>
						<div className='space-y-2'>
							<Label>Repair Supplier</Label>
							<RepairSupplierSelect
								value={editForm.repair_supplier_id}
								onValueChange={(value) =>
									setEditForm({
										...editForm,
										repair_supplier_id: value,
									})
								}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-brand'>Brand</Label>
							<Input
								id='edit-brand'
								value={editForm.brand || ''}
								onChange={(e) =>
									setEditForm({
										...editForm,
										brand: e.target.value,
									})
								}
								placeholder='Toyota'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-model'>Model</Label>
							<Input
								id='edit-model'
								value={editForm.model || ''}
								onChange={(e) =>
									setEditForm({
										...editForm,
										model: e.target.value,
									})
								}
								placeholder='Hiace'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-condition'>Condition</Label>
							<Select
								value={editForm.condition || 'available'}
								onValueChange={(value) =>
									setEditForm({
										...editForm,
										condition: value as
											| 'available'
											| 'need-repair'
											| 'unavailable',
									})
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='available'>
										<div className='flex items-center gap-2'>
											<div className='w-3 h-3 rounded-full bg-green-500'></div>
											<span>Available</span>
										</div>
									</SelectItem>
									<SelectItem value='need-repair'>
										<div className='flex items-center gap-2'>
											<div className='w-3 h-3 rounded-full bg-yellow-500'></div>
											<span>Needs Repair</span>
										</div>
									</SelectItem>
									<SelectItem value='unavailable'>
										<div className='flex items-center gap-2'>
											<div className='w-3 h-3 rounded-full bg-red-500'></div>
											<span>Unavailable</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-status'>Status</Label>
							<Select
								value={editForm.status || 'not-in-use'}
								onValueChange={(value) =>
									setEditForm({
										...editForm,
										status: value as
											| 'in-use'
											| 'not-in-use',
									})
								}
								disabled>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='in-use'>
										In Use
									</SelectItem>
									<SelectItem value='not-in-use'>
										Not In Use
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-mileage'>Mileage (km)</Label>
							<Input
								id='edit-mileage'
								type='number'
								value={editForm.mileage || ''}
								onChange={(e) =>
									setEditForm({
										...editForm,
										mileage: e.target.value
											? parseInt(e.target.value)
											: undefined,
									})
								}
								placeholder='50000'
							/>
						</div>
					</div>
				</div>
			) : (
				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-sm text-gray-600'>Registration</p>
						<p className='font-semibold font-mono text-lg'>
							{vehicle.rego}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>VIN Number</p>
						<p className='font-semibold text-lg'>
							{vehicle.alias}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Nickname</p>
						<p className='font-semibold text-lg'>
							{vehicle.nickname || (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Repair Supplier</p>
						<p className='font-semibold'>
							{vehicle.repair_supplier?.name || (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Brand</p>
						<p className='font-semibold'>
							{vehicle.brand || (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Model</p>
						<p className='font-semibold'>
							{vehicle.model || (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Condition</p>
						<div className='flex items-center gap-2 mt-1'>
							<div
								className={`w-3 h-3 rounded-full ${conditionConfig[conditionStr]?.className}`}></div>
							<span
								className={`font-medium ${conditionConfig[conditionStr]?.textClass}`}>
								{conditionConfig[conditionStr]?.label}
							</span>
						</div>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Status</p>
						<Badge
							className={`mt-1 ${statusConfig[statusStr]?.className}`}>
							{statusConfig[statusStr]?.label}
						</Badge>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Mileage</p>
						<p className='font-semibold font-mono'>
							{vehicle.mileage ? (
								<>
									{vehicle.mileage.toLocaleString()} km
								</>
							) : (
								<span className='text-gray-400'>-</span>
							)}
						</p>
					</div>
				</div>
			)}
		</Card>
	);
}
