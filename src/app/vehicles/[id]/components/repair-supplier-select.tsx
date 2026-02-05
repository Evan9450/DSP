'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

import { RepairSupplierSimple } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface RepairSupplierSelectProps {
	value?: number;
	onValueChange: (value: number | undefined) => void;
	className?: string;
	disabled?: boolean;
}

export function RepairSupplierSelect({
	value,
	onValueChange,
	className,
	disabled,
}: RepairSupplierSelectProps) {
	const { toast } = useToast();
	const [suppliers, setSuppliers] = useState<RepairSupplierSimple[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchSuppliers = async () => {
			setIsLoading(true);
			try {
				// Fetch all active suppliers
				const response = await apiClient.getRepairSuppliers();
				const activeSuppliers = response.filter((s) => s.is_active);
				setSuppliers(activeSuppliers);
			} catch (error) {
				console.error('Failed to fetch repair suppliers:', error);
				toast({
					title: 'Error',
					description: 'Failed to load repair suppliers.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchSuppliers();
	}, [toast]);

	return (
		<Select
			disabled={disabled || isLoading}
			value={value?.toString()}
			onValueChange={(val) =>
				onValueChange(val ? parseInt(val) : undefined)
			}>
			<SelectTrigger className={cn('w-full', className)}>
				<SelectValue placeholder='Select a repair supplier' />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='0'>None</SelectItem>
				{suppliers.map((supplier) => (
					<SelectItem
						key={supplier.id}
						value={supplier.id.toString()}>
						{supplier.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
