'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { usePagination } from '@/hooks/use-pagination';
import { TablePagination } from '@/components/TablePagination';

interface AssetHistoryItem {
	product_name: string;
	quantity: number;
	borrow_date: string;
}

interface AssetHistoryCardProps {
	assetHistory: AssetHistoryItem[];
}

export function AssetHistoryCard({ assetHistory }: AssetHistoryCardProps) {
	const {
		currentItems: currentHistory,
		currentPage,
		totalPages,
		goToPage,
	} = usePagination({
		data: assetHistory || [],
		itemsPerPage: 10,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Package className='h-5 w-5' />
					Asset History
				</CardTitle>
			</CardHeader>
			<CardContent>
				{!assetHistory || assetHistory.length === 0 ? (
					<div className='text-center py-6 text-gray-500'>
						No asset history found.
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product Name</TableHead>
								<TableHead className='text-right'>Quantity</TableHead>
								<TableHead className='text-right'>Borrow Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{currentHistory.map((item, index) => (
								<TableRow key={index}>
									<TableCell className='font-medium'>
										{item.product_name}
									</TableCell>
									<TableCell className='text-right'>
										{item.quantity}
									</TableCell>
									<TableCell className='text-right'>
										{item.borrow_date}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				{assetHistory && assetHistory.length > 0 && (
					<TablePagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={goToPage}
					/>
				)}
			</CardContent>
		</Card>
	);
}
