'use client';

import { AlertCircle, Package, TrendingDown } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import type { Asset } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InventoryTableProps {
	filteredAssets: Asset[];
	setIsBorrowDialogOpen: (open: boolean) => void;
	setSelectedAsset: (asset: Asset) => void;
	setIsAddInventoryDialogOpen: (open: boolean) => void;
	setSelectedInventoryAsset: (asset: Asset) => void;
}
const InventoryTable = ({
	filteredAssets,
	setIsBorrowDialogOpen,
	setSelectedAsset,
	setIsAddInventoryDialogOpen,
	setSelectedInventoryAsset,
}: InventoryTableProps) => {
	const getStatusBadge = (asset: Asset) => {
		const available = asset.availableQuantity;
		const threshold = asset.lowStockThreshold || asset.minThreshold || 5;

		if (available === 0) {
			return (
				<Badge
					variant='destructive'
					className='flex items-center gap-1'>
					Out of Stock
				</Badge>
			);
		}
		if (available <= threshold) {
			return (
				<Badge className='bg-orange-500 text-white flex items-center gap-1'>
					Low Stock
				</Badge>
			);
		}
		return <Badge className='bg-green-500 text-white'>Available</Badge>;
	};
	return (
		<Card className='mb-6'>
			<div className='p-6'>
				<h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
					{/* <Package className='h-5 w-5 text-blue-700' /> */}
					Inventory
				</h2>
				<div className='overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Asset Name</TableHead>

								<TableHead className='text-center'>
									Available
								</TableHead>

								<TableHead className='text-center'>
									Min Threshold
								</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredAssets.map((asset) => {
								return (
									<TableRow key={asset.id}>
										<TableCell className='font-medium'>
											{asset.name}
										</TableCell>

										<TableCell className='text-center'>
											<span
												className={
													asset.availableQuantity ===
													0
														? 'text-red-600 font-semibold'
														: 'text-gray-900'
												}>
												{asset.availableQuantity}
											</span>
										</TableCell>

										<TableCell className='text-center text-gray-600'>
											{asset.lowStockThreshold ||
												asset.minThreshold ||
												5}
										</TableCell>
										<TableCell>
											{getStatusBadge(asset)}
										</TableCell>
										<TableCell>
											<div className='flex gap-2'>
												<Button
													onClick={() => {
														setIsAddInventoryDialogOpen(
															true
														);
														setSelectedInventoryAsset(
															asset
														);
													}}
													variant='outline'
													className='border-green-600 text-green-700 hover:bg-green-50 hover:text-green-700 w-28 h-8'>
													<Package className='h-3 w-3 mr-1' />
													Add Stock
												</Button>
												<Button
													onClick={() => {
														setIsBorrowDialogOpen(
															true
														);
														setSelectedAsset(asset);
													}}
													className='bg-blue-700 hover:bg-blue-800 w-28 h-8'>
													Lend Asset
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</div>
		</Card>
	);
};

export default InventoryTable;
