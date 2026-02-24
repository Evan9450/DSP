'use client';

import {
	Calendar,
	CheckCircle,
	MapPin,
	MoreVertical,
	Plus,
	Wrench,
	Trash2,
} from 'lucide-react';
import { AddMaintenanceDialog } from './AddMaintenanceDialog';
import { CompleteMaintenanceDialog } from './CompleteMaintenanceDialog';
import DeleteMaintenanceDialog from './DeleteMaintenanceDialog';
import { TablePagination } from '@/components/TablePagination';
import { usePagination } from '@/hooks/use-pagination';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface MaintenanceHistoryProps {
	vehicleId: number;
	defaultSupplier?: {
		id: number;
		name: string;
	};
	onUpdate?: () => void;
}

interface MaintenanceRecord {
	id: number;
	maintenance_date: string;
	location?: string;
	description?: string;
	cost?: number | string; // Handle API response which might be string
	supplier_id?: number;
	supplier?: {
		id: number;
		name: string;
	};
}

export function MaintenanceHistory({ vehicleId, defaultSupplier, onUpdate }: MaintenanceHistoryProps) {
	const { toast } = useToast();
	const [records, setRecords] = useState<MaintenanceRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showCompleteDialog, setShowCompleteDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);

	const {
		currentItems,
		currentPage,
		totalPages,
		goToPage,
	} = usePagination({
		data: records,
		itemsPerPage: 10,
	});

	useEffect(() => {
		fetchHistory();
	}, [vehicleId]);



	const fetchHistory = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getVehicleMaintenanceHistory(vehicleId);
			setRecords(data);
		} catch (error) {
			console.error('Failed to fetch maintenance history:', error);
			// toast({
			// 	title: 'Error',
			// 	description: 'Failed to load maintenance history.',
			// 	variant: 'destructive',
			// });
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteRecord = async () => {
		if (!recordToDelete) return;
		try {
			await apiClient.deleteVehicleMaintenanceRecord(vehicleId, recordToDelete.id);
			toast({
				title: 'Success',
				description: 'Maintenance record deleted successfully.',
			});
			fetchHistory();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error('Failed to delete maintenance record:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete maintenance record.',
				variant: 'destructive',
			});
		} finally {
			setShowDeleteDialog(false);
			setRecordToDelete(null);
		}
	};

	return (
		<Card className='p-6 mt-6'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
					<Wrench className='h-5 w-5' />
					Maintenance History
				</h2>
				{/* <Button size='sm' onClick={() => setShowAddDialog(true)}>
					<Plus className='h-4 w-4 mr-2' />
					Add Repair Record
				</Button> */}
				<Button
					size='sm'
					variant="outline"
					className="ml-2"
					onClick={() => setShowCompleteDialog(true)}
					disabled={!defaultSupplier}
					title={!defaultSupplier ? 'Please set Maintenance Supplier first' : 'Complete maintenance'}
				>
					<CheckCircle className='h-4 w-4 mr-2' />
					Complete Maint.
				</Button>
			</div>

			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Supplier</TableHead>
							<TableHead className='w-[80px] text-right'>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={4} className='text-center py-4'>
									Loading...
								</TableCell>
							</TableRow>
						) : records.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className='text-center py-4 text-gray-500'>
									No maintenance records found.
								</TableCell>
							</TableRow>
						) : (
							currentItems.map((record) => (
								<TableRow key={record.id}>
									<TableCell>
										{format(new Date(record.maintenance_date), 'dd/MM/yyyy')}
									</TableCell>
									<TableCell>
										{record.description || (
											<span className='text-gray-400'>-</span>
										)}
									</TableCell>
									<TableCell>
										{record.supplier ? (
											<div className='font-medium'>{record.supplier.name}</div>
										) : record.location ? (
											<div className='flex items-center gap-1 text-gray-600'>
												<MapPin className='h-3 w-3' />
												{record.location}
											</div>
										) : (
											<span className='text-gray-400'>-</span>
										)}
									</TableCell>
									<TableCell className='text-right'>
										<Button
											variant='ghost'
											size='icon'
											className='text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0'
											onClick={() => {
												setRecordToDelete(record);
												setShowDeleteDialog(true);
											}}
											title='Delete Record'
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<TablePagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={goToPage}
			/>

			<AddMaintenanceDialog
				vehicleId={vehicleId}
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				onSuccess={() => {
					fetchHistory();
					if (onUpdate) onUpdate();
				}}
			/>
			<CompleteMaintenanceDialog
				vehicleId={vehicleId}
				open={showCompleteDialog}
				onOpenChange={setShowCompleteDialog}
				onSuccess={() => {
					fetchHistory();
					if (onUpdate) onUpdate();
				}}
				defaultSupplier={defaultSupplier}
			/>
			<DeleteMaintenanceDialog
				showDeleteDialog={showDeleteDialog}
				setShowDeleteDialog={setShowDeleteDialog}
				recordToDelete={recordToDelete}
				setRecordToDelete={setRecordToDelete}
				handleDeleteRecord={handleDeleteRecord}
			/>
		</Card>
	);
}
