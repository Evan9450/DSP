'use client';

import { Plus, Wrench, Trash2, Pencil } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type {
	VehicleHistoryTotalResponse,
	UnifiedHistoryItem,
} from '@/lib/api/client';
import { AddOtherHistoryDialog } from './add-other-history-dialog';
import { LogRepairDialog } from './repair-tab';
import { EditRepairDialog } from './edit-repair-dialog';
import { EditOtherHistoryDialog } from './edit-other-history-dialog';
import { EditMaintenanceDialog } from './edit-maintenance-dialog';

interface VehicleHistoryCardProps {
	vehicleId: number;
	isArchived?: boolean;
}

export function VehicleHistoryCard({
	vehicleId,
	isArchived = false,
}: VehicleHistoryCardProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [historyData, setHistoryData] =
		useState<VehicleHistoryTotalResponse | null>(null);
	const [records, setRecords] = useState<UnifiedHistoryItem[]>([]);

	const [showAddOtherDialog, setShowAddOtherDialog] = useState(false);
	const [showRepairDialog, setShowRepairDialog] = useState(false);

	// 编辑状态
	const [editingRecord, setEditingRecord] =
		useState<UnifiedHistoryItem | null>(null);

	const fetchAllHistory = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getVehicleHistoryTotal(vehicleId);
			setHistoryData(data);
			setRecords(data.history || []);
		} catch (error) {
			console.error('Failed to fetch vehicle history logs:', error);
			toast({
				title: 'Error',
				description: 'Failed to load vehicle history logs.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAllHistory();
	}, [vehicleId]);

	const totalDspCost = historyData?.total_cost
		? parseFloat(historyData.total_cost)
		: 0;

	const { currentItems, currentPage, totalPages, goToPage } = usePagination({
		data: records,
		itemsPerPage: 10,
	});

	const getCostTypeBadge = (costType: string) => {
		if (costType === 'Amazon')
			return (
				<Badge
					variant='secondary'
					className='bg-amber-100 text-amber-800'>
					Amazon
				</Badge>
			);
		if (costType === 'Insurance')
			return (
				<Badge
					variant='secondary'
					className='bg-blue-100 text-blue-800'>
					Insurance
				</Badge>
			);
		return (
			<Badge
				variant='secondary'
				className='bg-indigo-100 text-indigo-800'>
				Self
			</Badge>
		);
	};

	const getTypeBadge = (type: string) => {
		if (type === 'Maintenance')
			return (
				<Badge className='bg-green-100 text-green-800 border-[1px] border-green-200'>
					Maintenance
				</Badge>
			);
		if (type === 'Repair')
			return (
				<Badge className='bg-orange-100 text-orange-800 border-[1px] border-orange-200'>
					Repair
				</Badge>
			);
		if (type === 'Supplementary')
			return (
				<Badge className='bg-purple-100 text-purple-800 border-[1px] border-purple-200'>
					Supplementary
				</Badge>
			);
		return (
			<Badge className='bg-gray-100 text-gray-800 border-[1px] border-gray-200'>
				Other
			</Badge>
		);
	};

	const isEditable = (type: string) =>
		type === 'Repair' || type === 'Other' || type === 'Maintenance';

	const closeEditDialog = (open: boolean) => {
		if (!open) setEditingRecord(null);
	};

	return (
		<div className='space-y-6'>
			<Card className='p-6'>
				<div className='flex items-center justify-between mb-2'>
					<h3 className='text-xl font-semibold text-zinc-900 pb-2 flex-grow'>
						Vehicle History
					</h3>
					<div className='flex gap-2'>
						{!isArchived && (
							<>
								<Button
									size='sm'
									variant='outline'
									onClick={() => setShowRepairDialog(true)}>
									<Plus className='h-4 w-4 mr-2' />
									Add Repair
								</Button>
								<Button
									size='sm'
									variant='outline'
									onClick={() => setShowAddOtherDialog(true)}>
									<Plus className='h-4 w-4 mr-2' />
									Add Other Cost
								</Button>
							</>
						)}
						<p className='text-2xl font-bold text-indigo-900 mt-1'>
							Total: $
							{totalDspCost.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
					</div>
				</div>

				<div className='overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Supplier</TableHead>
								<TableHead>Cost Type</TableHead>
								<TableHead className='text-right'>
									Cost
								</TableHead>
								<TableHead className='w-[100px] text-right'>
									Action
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className='text-center py-8 text-gray-500'>
										<div className='flex items-center justify-center gap-2'>
											<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600'></div>
											Loading...
										</div>
									</TableCell>
								</TableRow>
							) : currentItems.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className='text-center py-8 text-gray-500'>
										No history records found.
									</TableCell>
								</TableRow>
							) : (
								currentItems.map((record) => (
									<TableRow
										key={`${record.history_type}-${record.id}`}>
										<TableCell className='font-medium'>
											{record.date
												? format(
														new Date(record.date),
														'dd/MM/yyyy',
													)
												: '-'}
										</TableCell>
										<TableCell>
											{getTypeBadge(record.history_type)}
										</TableCell>
										<TableCell
											className='max-w-[200px] whitespace-normal break-words'
											title={
												record.description || undefined
											}>
											{record.description}
										</TableCell>
										<TableCell>
											{!record.supplier ? (
												<span className='text-gray-400'>
													-
												</span>
											) : (
												<div className='font-medium'>
													{record.supplier}
												</div>
											)}
										</TableCell>
										<TableCell>
											{getCostTypeBadge(record.cost_type)}
										</TableCell>
										<TableCell
											className={`text-right font-medium ${
												record.cost_type === 'Amazon'
													? 'text-gray-500'
													: 'text-zinc-900'
											}`}>
											$
											{record.cost
												? parseFloat(
														record.cost,
													).toLocaleString(
														undefined,
														{
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														},
													)
												: '0.00'}
										</TableCell>
										<TableCell className='text-right'>
											{!isArchived && (
												<div className='flex items-center justify-end gap-1'>
													{isEditable(
														record.history_type,
													) ? (
														<Button
															variant='ghost'
															size='icon'
															className='text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0'
															onClick={() =>
																setEditingRecord(
																	record,
																)
															}
															title='Edit Record'>
															<Pencil className='h-4 w-4' />
														</Button>
													) : (
														<div className='h-8 w-8' />
													)}
													<Button
														variant='ghost'
														size='icon'
														className='text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0'
														onClick={() => {
															toast({
																title: 'Not Implemented',
																description:
																	'Deletion of history arriving soon.',
															});
														}}
														title='Delete Record'>
														<Trash2 className='h-4 w-4' />
													</Button>
												</div>
											)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* <TablePagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={goToPage}
			/> */}
			</Card>

			<LogRepairDialog
				vehicleId={vehicleId}
				open={showRepairDialog}
				onOpenChange={setShowRepairDialog}
				onSuccess={fetchAllHistory}
			/>
			<AddOtherHistoryDialog
				vehicleId={vehicleId}
				open={showAddOtherDialog}
				onOpenChange={setShowAddOtherDialog}
				onSuccess={fetchAllHistory}
			/>

			{/* 编辑 Dialogs —— 根据 history_type 渲染对应组件 */}
			{editingRecord?.history_type === 'Repair' && (
				<EditRepairDialog
					vehicleId={vehicleId}
					record={editingRecord}
					open={true}
					onOpenChange={closeEditDialog}
					onSuccess={fetchAllHistory}
				/>
			)}
			{editingRecord?.history_type === 'Other' && (
				<EditOtherHistoryDialog
					vehicleId={vehicleId}
					record={editingRecord}
					open={true}
					onOpenChange={closeEditDialog}
					onSuccess={fetchAllHistory}
				/>
			)}
			{editingRecord?.history_type === 'Maintenance' && (
				<EditMaintenanceDialog
					vehicleId={vehicleId}
					record={editingRecord}
					open={true}
					onOpenChange={closeEditDialog}
					onSuccess={fetchAllHistory}
				/>
			)}
		</div>
	);
}
