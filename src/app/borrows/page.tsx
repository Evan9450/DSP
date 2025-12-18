'use client';

import { CalendarIcon, Search, ShoppingCart } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
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

import type { Asset } from '@/types/schedule';
import { BorrowDialog } from '../assets/components/BorrowDialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useDrivers } from '@/hooks/use-drivers';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function BorrowsPage() {
	// const { toast } = useToast();
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
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [borrowDriverId, setBorrowDriverId] = useState('');
	const [borrowQuantity, setBorrowQuantity] = useState('1');
	const [borrowNotes, setBorrowNotes] = useState('');
	const [borrowDate, setBorrowDate] = useState<Date>(new Date());

	// Convert API data to frontend types
	const assets = apiAssets?.map(convertAsset) || [];
	const drivers =
		apiDrivers?.map((d) => ({
			id: d.id.toString(),
			name: d.name,
			amazonId: d.amazon_id,
		})) || [];

	// Convert and enrich borrow records with product and driver names
	const borrowRecords = (apiRecords || []).map((record) => {
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

	const activeBorrows = borrowRecords.filter(
		(record) => record.status === 'borrowed'
	);

	const filteredBorrows = activeBorrows.filter(
		(record) =>
			record.assetName
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			record.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Filter available assets for borrowing
	const availableAssets = assets.filter(
		(asset) => asset.availableQuantity > 0
	);

	// const handleBorrow = async () => {
	// 	if (!selectedAsset || !borrowDriverId) {
	// 		toast({
	// 			title: 'Error',
	// 			description: 'Please select a driver',
	// 			variant: 'destructive',
	// 		});
	// 		return;
	// 	}

	// 	try {
	// 		const borrowData: any = {
	// 			product_id: parseInt(selectedAsset.id),
	// 			driver_id: parseInt(borrowDriverId),
	// 			quantity: parseInt(borrowQuantity),
	// 			borrow_date: format(borrowDate, 'yyyy-MM-dd'),
	// 		};

	// 		if (borrowNotes && borrowNotes.trim() !== '') {
	// 			borrowData.notes = borrowNotes;
	// 		}

	// 		console.log('Sending borrow data:', borrowData);
	// 		await apiClient.createBorrowRecord(borrowData);

	// 		toast({
	// 			title: 'Success',
	// 			description: 'Asset borrowed successfully',
	// 		});

	// 		setIsBorrowDialogOpen(false);
	// 		setBorrowDriverId('');
	// 		setBorrowQuantity('1');
	// 		setBorrowNotes('');
	// 		setBorrowDate(new Date());
	// 		refetchAssets();
	// 		refetchRecords();
	// 	} catch (error: any) {
	// 		console.error('Borrow error:', error.response?.data);
	// 		toast({
	// 			title: 'Error',
	// 			description:
	// 				error.response?.data?.detail || 'Failed to record borrow',
	// 			variant: 'destructive',
	// 		});
	// 	}
	// };

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
							Manage asset borrowing and track active borrows
						</p>
					</div>
					{/* <div className='flex gap-2'>
						<Button
							onClick={() => setIsBorrowDialogOpen(true)}
							className='bg-blue-700 hover:bg-blue-800 w-40'>
							<ShoppingCart className='h-4 w-4 mr-2' />
							Lend Asset
						</Button>
					</div> */}
				</div>

				{/* Search */}
				<div className='relative mb-6'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
					<Input
						placeholder='Search by product or driver name...'
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
										<TableHead>Quantity</TableHead>
										<TableHead>Borrowed Date</TableHead>
										<TableHead>Notes</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredBorrows.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={5}
												className='text-center text-gray-500 py-8'>
												{searchTerm
													? 'No borrows found matching your search'
													: 'No active borrows'}
											</TableCell>
										</TableRow>
									) : (
										filteredBorrows.map((record) => (
											<TableRow key={record.id}>
												<TableCell className='font-medium'>
													{record.assetName ||
														'Unknown Product'}
												</TableCell>
												<TableCell>
													{record.driverName ||
														'Unknown Driver'}
												</TableCell>
												<TableCell>
													{record.quantity}
												</TableCell>
												<TableCell>
													{record.borrowDate.toLocaleDateString()}
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
				{/* <BorrowDialog
					open={isBorrowDialogOpen}
					onOpenChange={setIsBorrowDialogOpen}
					assets={assets}
					drivers={drivers}
					onSuccess={() => {
						refetchAssets();
						refetchRecords();
					}}
				/> */}
			</div>
		</div>
	);
}
