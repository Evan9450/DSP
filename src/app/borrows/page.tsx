'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useAssets, useBorrowRecords } from '@/hooks/use-assets';

import type { BorrowRecord } from '@/types/schedule';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { convertBorrowRecord } from '@/lib/api/converters';
import { useDrivers } from '@/hooks/use-drivers';
import { useState } from 'react';

export default function BorrowsPage() {
	const { assets: apiAssets, isLoading: assetsLoading } = useAssets();
	const { records: apiRecords, isLoading: recordsLoading } =
		useBorrowRecords();
	const { drivers: apiDrivers, isLoading: driversLoading } = useDrivers();

	const [searchTerm, setSearchTerm] = useState('');

	// Convert and enrich borrow records with product and driver names
	const borrowRecords: BorrowRecord[] = (apiRecords || []).map((record) => {
		const converted = convertBorrowRecord(record);
		// Enrich with product name
		const product = apiAssets?.find((a) => a.id === record.product_id);
		if (product) {
			converted.assetName = product.name;
		}
		// Enrich with driver name
		const driver = apiDrivers?.find((d) => d.id === record.driver_id);
		if (driver) {
			converted.driverName = driver.name;
		}
		return converted;
	});

	const isLoading = assetsLoading || recordsLoading || driversLoading;

	const filteredBorrows = borrowRecords.filter(
		(record: BorrowRecord) =>
			record.assetName
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			record.driverName
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			record.operatedBy?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>
						Loading borrow records...
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
							Borrow Records
						</h1>
						<p className='text-gray-500 mt-1'>
							Track all asset borrowing records
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

				{/* Borrows History*/}
				<Card>
					<div className='p-6'>
						<h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
							Borrows History
						</h2>
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Product</TableHead>
										<TableHead>Borrowed By</TableHead>
										<TableHead>Operated By</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Borrowed Date</TableHead>
										{/* <TableHead>Notes</TableHead> */}
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredBorrows.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={6}
												className='text-center text-gray-500 py-8'>
												{searchTerm
													? 'No borrows found matching your search'
													: 'No borrow records'}
											</TableCell>
										</TableRow>
									) : (
										filteredBorrows.map(
											(record: BorrowRecord) => (
												<TableRow key={record.id}>
													<TableCell className='font-medium'>
														{record.assetName ||
															'Unknown Product'}
													</TableCell>
													<TableCell>
														{record.driverName ||
															record.operatedBy ||
															'N/A'}
													</TableCell>
													<TableCell>
														{record.operatedBy ||
															'-'}
													</TableCell>
													<TableCell>
														{record.quantity}
													</TableCell>
													<TableCell>
														{record.borrowDate
															? record.borrowDate.toLocaleDateString()
															: '-'}
													</TableCell>
													{/* <TableCell>
													{record.notes || '-'}
												</TableCell> */}
												</TableRow>
											)
										)
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
