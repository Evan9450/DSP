'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { Car } from 'lucide-react';
import { useVehicles } from '@/hooks/use-vehicles';

interface VehicleSelectorProps {
	selectedVehicle?: number;
	onVehicleChange: (vehicleId: number | undefined) => void;
}

export function VehicleSelector({
	selectedVehicle,
	onVehicleChange,
}: VehicleSelectorProps) {
	const { vehicles, isLoading } = useVehicles();
	console.log('🚀 => VehicleSelector => vehicles:', vehicles);

	return (
		<div className='flex items-center gap-2'>
			<Car className='h-5 w-5 text-gray-600' />
			<Select
				value={selectedVehicle?.toString() || 'all'}
				onValueChange={(value) => {
					onVehicleChange(
						value === 'all' ? undefined : parseInt(value)
					);
				}}
				disabled={isLoading}>
				<SelectTrigger className='w-[280px]'>
					<SelectValue
						placeholder={
							isLoading ? 'Loading vehicles...' : 'All Vehicles'
						}
					/>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='all'>All Vehicles</SelectItem>
					{vehicles.map((vehicle) => (
						<SelectItem
							key={vehicle.id}
							value={vehicle.id.toString()}>
							<div className='flex items-center gap-2'>
								<span className='font-medium'>
									{vehicle.alias || `Vehicle #${vehicle.id}`}
								</span>
								{vehicle.brand && vehicle.model && (
									<span className='text-sm text-gray-500'>
										({vehicle.brand} {vehicle.model})
									</span>
								)}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
