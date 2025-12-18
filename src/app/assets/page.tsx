'use client';

import {
	AlertCircle,
	Search,
	TrendingDown,
} from 'lucide-react';
import type { Asset } from '@/types/schedule';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { convertAsset } from '@/lib/api/converters';
import { useAssets } from '@/hooks/use-assets';

import AddAssetDialog from './components/AddAssetDialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AssetsPage() {
	const {
		assets: apiAssets,
		isLoading: assetsLoading,
		refetch: refetchAssets,
	} = useAssets();

	const [searchTerm, setSearchTerm] = useState('');

	// Convert API data to frontend types
	const assets = apiAssets?.map(convertAsset) || [];

	const isLoading = assetsLoading;

	const filteredAssets = assets.filter(
		(asset) => asset.name.toLowerCase().includes(searchTerm.toLowerCase())
		// asset.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getStatusBadge = (asset: Asset) => {
		const available = asset.availableQuantity;
		const threshold = asset.lowStockThreshold || asset.minThreshold || 5;

		if (available === 0) {
			return (
				<Badge
					variant='destructive'
					className='flex items-center gap-1'>
					<AlertCircle className='h-3 w-3' />
					Out of Stock
				</Badge>
			);
		}
		if (available <= threshold) {
			return (
				<Badge className='bg-orange-500 text-white flex items-center gap-1'>
					<TrendingDown className='h-3 w-3' />
					Low Stock
				</Badge>
			);
		}
		return <Badge className='bg-green-500 text-white'>Available</Badge>;
	};

	const lowStockAssets = assets.filter((a) => {
		const threshold = a.lowStockThreshold || a.minThreshold || 5;
		return a.availableQuantity > 0 && a.availableQuantity <= threshold;
	});
	const outOfStockAssets = assets.filter((a) => a.availableQuantity === 0);

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading assets...</p>
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
							Asset Management
						</h1>
						<p className='text-gray-500 mt-1'>
							Track inventory, manage borrowing, and monitor stock
							levels
						</p>
					</div>
					<div className='flex gap-2'>
						<AddAssetDialog onSuccess={refetchAssets} />
					</div>
				</div>

				{/* Alert Cards */}
				{(lowStockAssets.length > 0 || outOfStockAssets.length > 0) && (
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
						{lowStockAssets.length > 0 && (
							<Card className='p-4 border-orange-200 bg-orange-50'>
								<div className='flex items-start gap-3'>
									<TrendingDown className='h-5 w-5 text-orange-600 mt-0.5' />
									<div className='flex-1'>
										<h3 className='font-semibold text-orange-900'>
											Low Stock Alert
										</h3>
										<p className='text-sm text-orange-700 mt-1'>
											{lowStockAssets.length}{' '}
											{lowStockAssets.length === 1
												? 'item'
												: 'items'}{' '}
											below minimum threshold
										</p>
									</div>
								</div>
							</Card>
						)}
						{outOfStockAssets.length > 0 && (
							<Card className='p-4 border-red-200 bg-red-50'>
								<div className='flex items-start gap-3'>
									<AlertCircle className='h-5 w-5 text-red-600 mt-0.5' />
									<div className='flex-1'>
										<h3 className='font-semibold text-red-900'>
											Out of Stock
										</h3>
										<p className='text-sm text-red-700 mt-1'>
											{outOfStockAssets.length}{' '}
											{outOfStockAssets.length === 1
												? 'item is'
												: 'items are'}{' '}
											out of stock
										</p>
									</div>
								</div>
							</Card>
						)}
					</div>
				)}

				{/* Search */}
				<div className='relative mb-6'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
					<Input
						placeholder='Search assets by name or category...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='pl-10'
					/>
				</div>

				{/* Assets Inventory */}
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
														{
															asset.availableQuantity
														}
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
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
