'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

import { RepairSupplierResponse, apiClient } from '@/lib/api/client';

interface RepairSupplierSelectProps {
	value?: number;
	onValueChange: (value: number | undefined) => void;
	placeholder?: string;
}

export function RepairSupplierSelect({
	value,
	onValueChange,
	placeholder = 'Select supplier...',
}: RepairSupplierSelectProps) {
	const [suppliers, setSuppliers] = useState<RepairSupplierResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchSuppliers();
	}, []);

	const fetchSuppliers = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getRepairSuppliers({ is_active: true });
			setSuppliers(data);
		} catch (error) {
			console.error('Failed to fetch repair suppliers:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Select
			value={value?.toString()}
			onValueChange={(val) => onValueChange(val ? parseInt(val) : undefined)}>
			<SelectTrigger>
				<SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='none'>None</SelectItem>
				{suppliers.map((supplier) => (
					<SelectItem key={supplier.id} value={supplier.id.toString()}>
						{supplier.name}
						{supplier.location && (
							<span className='text-gray-500 text-xs ml-2'>
								({supplier.location})
							</span>
						)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
