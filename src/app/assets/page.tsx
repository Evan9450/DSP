'use client';

import {
	AlertCircle,
	ArrowUpCircle,
	Package,
	Plus,
	Search,
	ShoppingCart,
	TrendingDown,
} from 'lucide-react';
import type { Asset, AssetBorrowRecord, AssetPurchase } from '@/types/schedule';
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
import {
	mockAssetBorrowRecords,
	mockAssetPurchases,
	mockAssets,
	mockDrivers,
} from '@/lib/mock-data';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isLowStock } from '@/lib/helpers';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function AssetsPage() {
	const { toast } = useToast();
	const [assets, setAssets] = useState<Asset[]>(mockAssets);
	const [borrowRecords, setBorrowRecords] = useState<AssetBorrowRecord[]>(
		mockAssetBorrowRecords
	);
	const [purchaseRecords] = useState<AssetPurchase[]>(mockAssetPurchases);
	const [searchTerm, setSearchTerm] = useState('');
	const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
	const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
	const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

	const filteredAssets = assets.filter(
		(asset) =>
			asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			asset.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getStatusBadge = (asset: Asset) => {
		if (asset.status === 'out-of-stock') {
			return (
				<Badge
					variant='destructive'
					className='flex items-center gap-1'>
					<AlertCircle className='h-3 w-3' />
					Out of Stock
				</Badge>
			);
		}
		if (asset.status === 'low-stock') {
			return (
				<Badge className='bg-orange-500 text-white flex items-center gap-1'>
					<TrendingDown className='h-3 w-3' />
					Low Stock
				</Badge>
			);
		}
		return <Badge className='bg-green-500 text-white'>Available</Badge>;
	};

	const activeBorrows = borrowRecords.filter((record) => !record.returnedAt);
	const borrowHistory = borrowRecords.filter((record) => record.returnedAt);

	const lowStockAssets = assets.filter((a) => a.status === 'low-stock');
	const outOfStockAssets = assets.filter((a) => a.status === 'out-of-stock');

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							Asset & Inventory Management
						</h1>
						<p className='text-gray-500 mt-1'>
							Track inventory, manage borrowing, and monitor stock
							levels
						</p>
					</div>
					<div className='flex gap-2'>
						<Button
							onClick={() => setIsPurchaseDialogOpen(true)}
							variant='outline'
							className='border-blue-600 text-blue-700 hover:bg-blue-50'>
							<ShoppingCart className='h-4 w-4 mr-2' />
							Record Purchase
						</Button>
						<Dialog>
							<DialogTrigger asChild>
								<Button className='bg-blue-700 hover:bg-blue-800'>
									<Plus className='h-4 w-4 mr-2' />
									Add Asset
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add New Asset</DialogTitle>
									<DialogDescription>
										Add a new asset to the inventory
									</DialogDescription>
								</DialogHeader>
								<div className='space-y-4 py-4'>
									<div className='space-y-2'>
										<Label htmlFor='name'>Asset Name</Label>
										<Input
											id='name'
											placeholder='Enter asset name'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='category'>
											Category
										</Label>
										<Select>
											<SelectTrigger>
												<SelectValue placeholder='Select category' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='equipment'>
													Equipment
												</SelectItem>
												<SelectItem value='electronics'>
													Electronics
												</SelectItem>
												<SelectItem value='safety'>
													Safety
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='quantity'>
											Quantity
										</Label>
										<Input
											id='quantity'
											type='number'
											placeholder='0'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='minThreshold'>
											Min Threshold
										</Label>
										<Input
											id='minThreshold'
											type='number'
											placeholder='0'
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										type='submit'
										className='bg-blue-700 hover:bg-blue-800'>
										Add Asset
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
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
				<Card>
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
										<TableHead>Category</TableHead>
										<TableHead className='text-center'>
											Total
										</TableHead>
										<TableHead className='text-center'>
											Available
										</TableHead>
										<TableHead className='text-center'>
											Borrowed
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
												<TableCell>
													<Badge
														variant='outline'
														className='text-xs'>
														{asset.category}
													</Badge>
												</TableCell>
												<TableCell className='text-center font-semibold'>
													{asset.totalQuantity}
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
												<TableCell className='text-center'>
													{asset.borrowedQuantity >
													0 ? (
														<span className='text-blue-600 font-medium'>
															{
																asset.borrowedQuantity
															}
														</span>
													) : (
														<span className='text-gray-400'>
															0
														</span>
													)}
												</TableCell>
												<TableCell className='text-center text-gray-600'>
													{asset.minThreshold}
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

				{/* Active Borrows */}
				<Card>
					<div className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>
							Active Borrows
						</h2>
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Asset</TableHead>
										<TableHead>Borrowed By</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Borrowed Date</TableHead>
										<TableHead>Expected Return</TableHead>
										<TableHead>Notes</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{activeBorrows.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={6}
												className='text-center text-gray-500'>
												No active borrows
											</TableCell>
										</TableRow>
									) : (
										activeBorrows.map((record) => (
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
													{record.borrowedAt.toLocaleDateString()}
												</TableCell>
												<TableCell>
													{assets.find(
														(a) =>
															a.id ===
															record.assetId
													)?.expectedReturnDate
														? assets
																.find(
																	(a) =>
																		a.id ===
																		record.assetId
																)
																?.expectedReturnDate?.toLocaleDateString()
														: '-'}
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
													{record.borrowedAt.toLocaleDateString()}
												</TableCell>
												<TableCell>
													{record.returnedAt?.toLocaleDateString() ||
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
								<Select>
									<SelectTrigger>
										<SelectValue placeholder='Select driver' />
									</SelectTrigger>
									<SelectContent>
										{mockDrivers.map((driver) => (
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
									max={selectedAsset?.quantity || 1}
									defaultValue='1'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='expectedReturn'>
									Expected Return Date
								</Label>
								<Input id='expectedReturn' type='date' />
							</div>
							<div className='space-y-2'>
								<Label htmlFor='notes'>Notes (optional)</Label>
								<Input id='notes' placeholder='Add notes...' />
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
								onClick={() => setIsBorrowDialogOpen(false)}>
								Confirm Borrow
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Return Dialog */}
				<Dialog
					open={isReturnDialogOpen}
					onOpenChange={setIsReturnDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Return Asset</DialogTitle>
							<DialogDescription>
								Record asset return from driver
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
								<Label>Borrowed By</Label>
								<Input
									value={
										mockDrivers.find(
											(d) =>
												d.id ===
												selectedAsset?.borrowedBy
										)?.name || ''
									}
									disabled
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='returnDate'>Return Date</Label>
								<Input
									id='returnDate'
									type='date'
									defaultValue={
										new Date().toISOString().split('T')[0]
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setIsReturnDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								className='bg-blue-700 hover:bg-blue-800'
								onClick={() => setIsReturnDialogOpen(false)}>
								Confirm Return
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
