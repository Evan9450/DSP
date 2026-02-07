'use client';

import { AlertCircle, PackageCheck, Search, TrendingDown } from 'lucide-react';

import AddAssetDialog from './components/AddAssetDialog';
import { AddInventoryDialog } from './components/AddInventoryDialog';
import type { Asset } from '@/types/schedule';
import { BorrowDialog } from './components/BorrowDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InventoryTable from './components/InventoryTable';
import { apiClient } from '@/lib/api/client';
import { convertAsset } from '@/lib/api/converters';
import { useAssets } from '@/hooks/use-assets';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function AssetsPage() {
	const { toast } = useToast();
	const {
		assets: apiAssets,
		isLoading: assetsLoading,
		refetch: refetchAssets,
	} = useAssets();

	const [searchTerm, setSearchTerm] = useState('');
	const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
	const [selectedAsset, setSelectedAsset] = useState<Asset>();
	const [isAddInventoryDialogOpen, setIsAddInventoryDialogOpen] =
		useState(false);
	const [selectedInventoryAsset, setSelectedInventoryAsset] =
		useState<Asset | null>(null);
	const [isCheckingStock, setIsCheckingStock] = useState(false);
	const [transactionType, setTransactionType] = useState<'lend' | 'deduct'>(
		'lend'
	);
	const [showArchived, setShowArchived] = useState(false);

	// Convert API data to frontend types
	const assets = apiAssets?.map(convertAsset) || [];

	const isLoading = assetsLoading;

	const filteredAssets = assets.filter((asset) => {
		const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesArchiveFilter = showArchived ? true : !asset.archive;
		return matchesSearch && matchesArchiveFilter;
	});

	const handleArchive = async (asset: Asset) => {
		try {
			await apiClient.archiveProduct(parseInt(asset.id));
			toast({
				title: 'Success',
				description: `${asset.name} has been archived`,
			});
			refetchAssets();
		} catch (error) {
			console.error('Failed to archive asset:', error);
			toast({
				title: 'Error',
				description: 'Failed to archive asset',
				variant: 'destructive',
			});
		}
	};

	const handleUnarchive = async (asset: Asset) => {
		try {
			await apiClient.unarchiveProduct(parseInt(asset.id));
			toast({
				title: 'Success',
				description: `${asset.name} has been unarchived`,
			});
			refetchAssets();
		} catch (error) {
			console.error('Failed to unarchive asset:', error);
			toast({
				title: 'Error',
				description: 'Failed to unarchive asset',
				variant: 'destructive',
			});
		}
	};

	const lowStockAssets = assets.filter((a) => {
		const threshold = a.lowStockThreshold || a.minThreshold || 5;
		return a.availableQuantity > 0 && a.availableQuantity <= threshold;
	});
	const outOfStockAssets = assets.filter((a) => a.availableQuantity === 0);

	const handleCheckLowStock = async () => {
		try {
			setIsCheckingStock(true);
			const result = await apiClient.checkLowStock();

			console.log('✅ Check low stock result:', result);

			toast({
				title: 'Stock Check Complete',
				description: `Alerts sent: ${result.stats.alerts_sent || 0}`,
			});
		} catch (error) {
			console.error('Failed to check low stock:', error);
			toast({
				title: 'Error',
				description: 'Failed to check low stock',
				variant: 'destructive',
			});
		} finally {
			setIsCheckingStock(false);
		}
	};

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
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							Asset Management
						</h1>
					</div>
					<div className='flex gap-2'>
						<AddAssetDialog onSuccess={refetchAssets} />
					</div>
				</div>

				{/* Search and Actions */}
				<div className='mb-6 flex flex-col sm:flex-row gap-3 justify-between'>
					<div className='relative flex-1 max-w-full sm:max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search assets by name or category...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
					<Button
						variant='outline'
						className='border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600'
						onClick={handleCheckLowStock}
						disabled={isCheckingStock}>
						<PackageCheck className='h-4 w-4 mr-2' />
						{isCheckingStock ? 'Checking...' : 'Check Low Stock'}
					</Button>
					<Button
						variant='outline'
						onClick={() => setShowArchived(!showArchived)}>
						{showArchived ? 'Hide Archived' : 'Show Archived'}
					</Button>
				</div>

				{/* Assets Inventory */}
				<InventoryTable
					filteredAssets={filteredAssets}
					setIsBorrowDialogOpen={setIsBorrowDialogOpen}
					setSelectedAsset={setSelectedAsset}
					setIsAddInventoryDialogOpen={setIsAddInventoryDialogOpen}
					setSelectedInventoryAsset={setSelectedInventoryAsset}
					setTransactionType={setTransactionType}
					onArchive={handleArchive}
					onUnarchive={handleUnarchive}
				/>

				<BorrowDialog
					open={isBorrowDialogOpen}
					onOpenChange={setIsBorrowDialogOpen}
					assets={assets}
					clickedAsset={selectedAsset}
					transactionType={transactionType}
					onSuccess={() => {
						refetchAssets();
					}}
				/>

				<AddInventoryDialog
					open={isAddInventoryDialogOpen}
					onOpenChange={setIsAddInventoryDialogOpen}
					asset={selectedInventoryAsset}
					onSuccess={() => {
						refetchAssets();
					}}
				/>
			</div>
		</div>
	);
}
