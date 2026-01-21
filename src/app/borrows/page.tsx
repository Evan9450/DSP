'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useInventoryChanges } from '@/hooks/use-assets';
import { useState } from 'react';

export default function BorrowsPage() {
	const { changes, isLoading } = useInventoryChanges();
	const [searchTerm, setSearchTerm] = useState('');

	const filteredChanges = (changes || []).filter(
		(record) =>
			record.product_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			record.driver_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			record.operated_by_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()),
	);

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>
						Loading inventory records...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							Inventory Records
						</h1>
						<p className='text-gray-500 mt-1'>
							Track all inventory movements
						</p>
					</div>
				</div>

				{/* Search */}
				<div className='relative mb-6'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
					<Input
						placeholder='Search by product, driver or operator name...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='pl-10'
					/>
				</div>

				{/* Inventory History */}
				<Card>
					<div className='p-6'>
						<h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
							Inventory History
						</h2>
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Type</TableHead>
										<TableHead>Product</TableHead>
										<TableHead>Driver</TableHead>
										<TableHead>Operated By</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredChanges.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={6}
												className='text-center text-gray-500 py-8'>
												{searchTerm
													? 'No records found matching your search'
													: 'No inventory records'}
											</TableCell>
										</TableRow>
									) : (
										filteredChanges.map((record) => (
											<TableRow
												key={`${record.change_type}-${record.id}`}>
												<TableCell>
													<Badge
														variant={
															record.change_type ===
															'IN'
																? 'default'
																: 'secondary'
														}
														className={
															record.change_type ===
															'IN'
																? 'bg-green-100 text-green-800 hover:bg-green-100'
																: 'bg-red-100 text-red-800 hover:bg-red-100'
														}>
														{record.change_type ===
														'IN'
															? 'Stock In'
															: 'Stock Out'}
													</Badge>
												</TableCell>
												<TableCell className='font-medium'>
													{record.product_name}
												</TableCell>
												<TableCell>
													{record.driver_name || '-'}
												</TableCell>
												<TableCell>
													{record.operated_by_name ||
														'-'}
												</TableCell>
												<TableCell>
													{record.change_type === 'IN'
														? record.quantity
														: '-' + record.quantity}
												</TableCell>
												<TableCell>
													{record.change_date}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
