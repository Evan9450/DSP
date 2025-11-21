'use client';

import {
	AlertCircle,
	Package,
	Plus,
	Search,
	ShoppingCart,
	TrendingDown,
} from 'lucide-react';
import type { Asset, BorrowRecord } from '@/types/schedule';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { convertAsset, convertBorrowRecord } from '@/lib/api/converters';
import { useAssets, useBorrowRecords } from '@/hooks/use-assets';

import AddAssetDialog from './components/AddAssetDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { useDrivers } from '@/hooks/use-drivers';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function AssetsPage() {
	const { toast } = useToast();
	const {
		assets: apiAssets,
		isLoading: assetsLoading,
		refetch: refetchAssets,
	} = useAssets();
	const {
		records: apiRecords,
		isLoading: recordsLoading,
		refetch: refetchRecords,
	} = useBorrowRecords();
	const { drivers: apiDrivers, isLoading: driversLoading } = useDrivers();

	const [searchTerm, setSearchTerm] = useState('');
	const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
	const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [borrowDriverId, setBorrowDriverId] = useState('');
	const [borrowQuantity, setBorrowQuantity] = useState('1');
	const [borrowNotes, setBorrowNotes] = useState('');
	const [expectedReturnDate, setExpectedReturnDate] = useState('');

	// Convert API data to frontend types
	const assets = apiAssets?.map(convertAsset) || [];
	const borrowRecords = apiRecords?.map(convertBorrowRecord) || [];
	const drivers =
		apiDrivers?.map((d) => ({
			id: d.id.toString(),
			name: d.name,
			amazonId: d.amazon_id,
		})) || [];

	const isLoading = assetsLoading || recordsLoading || driversLoading;

	const filteredAssets = assets.filter(
		(asset) =>
			asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			asset.category.toLowerCase().includes(searchTerm.toLowerCase())
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

	const activeBorrows = borrowRecords.filter(
		(record) => record.status === 'borrowed'
	);
	const borrowHistory = borrowRecords.filter(
		(record) => record.status === 'returned'
	);

	const lowStockAssets = assets.filter((a) => {
		const threshold = a.lowStockThreshold || a.minThreshold || 5;
		return a.availableQuantity > 0 && a.availableQuantity <= threshold;
	});
	const outOfStockAssets = assets.filter((a) => a.availableQuantity === 0);

	const handleBorrow = async () => {
		if (!selectedAsset || !borrowDriverId) {
			toast({
				title: 'Error',
				description: 'Please select a driver',
				variant: 'destructive',
			});
			return;
		}

		try {
			await apiClient.createBorrowRecord({
				asset_id: parseInt(selectedAsset.id),
				driver_id: parseInt(borrowDriverId),
				quantity: parseInt(borrowQuantity),
				expected_return_date: expectedReturnDate || undefined,
				notes: borrowNotes || undefined,
			});

			toast({
				title: 'Success',
				description: 'Asset borrowed successfully',
			});

			setIsBorrowDialogOpen(false);
			setBorrowDriverId('');
			setBorrowQuantity('1');
			setBorrowNotes('');
			setExpectedReturnDate('');
			refetchAssets();
			refetchRecords();
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to record borrow',
				variant: 'destructive',
			});
		}
	};

	const handleReturn = async (recordId: string) => {
		try {
			await apiClient.returnBorrowRecord(parseInt(recordId));

			toast({
				title: 'Success',
				description: 'Asset returned successfully',
			});

			refetchAssets();
			refetchRecords();
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to record return',
				variant: 'destructive',
			});
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
						<AddAssetDialog />
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
							<Package className='h-5 w-5 text-blue-700' />
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
										<TableHead className='text-right'>
											Actions
										</TableHead>
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
												<TableCell className='text-right'>
													<Button
														variant='outline'
														size='sm'
														disabled={
															asset.availableQuantity ===
															0
														}
														onClick={() => {
															setSelectedAsset(
																asset
															);
															setIsBorrowDialogOpen(
																true
															);
														}}>
														Lend Out
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</div>
				</Card>

				{/* Borrow History */}
				<Card>
					<div className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>
							Borrow History
						</h2>
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Asset</TableHead>
										<TableHead>Borrowed By</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Borrowed Date</TableHead>
										<TableHead>Returned Date</TableHead>
										<TableHead>Notes</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{borrowHistory.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={6}
												className='text-center text-gray-500'>
												No borrow history
											</TableCell>
										</TableRow>
									) : (
										borrowHistory.map((record) => (
											<TableRow key={record.id}>
												<TableCell className='font-medium'>
													{record.assetName}
												</TableCell>
												<TableCell>
													{record.driverName}
												</TableCell>
												<TableCell>
													{record.quantity}
												</TableCell>
												<TableCell>
													{record.borrowDate.toLocaleDateString()}
												</TableCell>
												<TableCell>
													{record.actualReturnDate?.toLocaleDateString() ||
														'-'}
												</TableCell>
												<TableCell>
													{record.notes || '-'}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</Card>

				{/* Borrow Dialog */}
				<Dialog
					open={isBorrowDialogOpen}
					onOpenChange={setIsBorrowDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Borrow Asset</DialogTitle>
							<DialogDescription>
								Record asset borrowing for a driver
							</DialogDescription>
						</DialogHeader>
						<div className='space-y-4 py-4'>
							<div className='space-y-2'>
								<Label>Asset</Label>
								<Input
									value={selectedAsset?.name || ''}
									disabled
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='driver'>Driver</Label>
								<Select
									value={borrowDriverId}
									onValueChange={setBorrowDriverId}>
									<SelectTrigger>
										<SelectValue placeholder='Select driver' />
									</SelectTrigger>
									<SelectContent>
										{drivers.map((driver) => (
											<SelectItem
												key={driver.id}
												value={driver.id}>
												{driver.name} ({driver.amazonId}
												)
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='borrowQuantity'>Quantity</Label>
								<Input
									id='borrowQuantity'
									type='number'
									min='1'
									max={selectedAsset?.availableQuantity || 1}
									value={borrowQuantity}
									onChange={(e) =>
										setBorrowQuantity(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='expectedReturn'>
									Expected Return Date (Optional)
								</Label>
								<Input
									id='expectedReturn'
									type='date'
									value={expectedReturnDate}
									onChange={(e) =>
										setExpectedReturnDate(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='notes'>Notes (optional)</Label>
								<Input
									id='notes'
									placeholder='Add notes...'
									value={borrowNotes}
									onChange={(e) =>
										setBorrowNotes(e.target.value)
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setIsBorrowDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								className='bg-blue-700 hover:bg-blue-800'
								onClick={handleBorrow}>
								Confirm Borrow
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
