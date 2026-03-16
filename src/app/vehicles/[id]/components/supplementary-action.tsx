'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Lock, Edit, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient, type UnifiedHistoryItem } from '@/lib/api/client';
import type { VehicleDetailResponse } from '@/lib/api/client';
import { AssignSupplementaryDialog } from './assign-supplementary-dialog';
import { ReleaseSupplementaryDialog } from './ReleaseSupplementaryDialog';
import { EditSupplementaryDialog } from './edit-supplementary-dialog';
import { format } from 'date-fns';

interface SupplementaryActionProps {
	vehicle: VehicleDetailResponse;
	onUpdate: () => void;
	isArchived?: boolean;
}

export function SupplementaryAction({
	vehicle,
	onUpdate,
	isArchived = false,
}: SupplementaryActionProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingRecord, setIsFetchingRecord] = useState(false);

	const [showAssignDialog, setShowAssignDialog] = useState(false);
	const [showReleaseDialog, setShowReleaseDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	const [endDate, setEndDate] = useState(
		() => new Date().toISOString().split('T')[0],
	);
	const [cost, setCost] = useState('');
	const [activeRecord, setActiveRecord] = useState<UnifiedHistoryItem | null>(
		null,
	);

	const hasActiveAssignment = !!vehicle.active_supp_history_id;
	// Assuming status "in-use" means locked
	const isLocked = hasActiveAssignment && vehicle.status === 'in-use';

	useEffect(() => {
		if (hasActiveAssignment && vehicle.id) {
			fetchActiveRecord();
		} else {
			setActiveRecord(null);
		}
	}, [hasActiveAssignment, vehicle.id, vehicle.active_supp_history_id]);

	const fetchActiveRecord = async () => {
		setIsFetchingRecord(true);
		try {
			const data = await apiClient.getVehicleHistoryTotal(vehicle.id);
			const record = data.history.find(
				(item) =>
					item.history_type === 'Supplementary' &&
					item.id === vehicle.active_supp_history_id,
			);
			if (record) {
				setActiveRecord(record);
			}
		} catch (error) {
			console.error(
				'Failed to fetch active supplementary record:',
				error,
			);
		} finally {
			setIsFetchingRecord(false);
		}
	};

	const handleAction = () => {
		if (!hasActiveAssignment) {
			setShowAssignDialog(true);
			return;
		}
		// Open release dialog to collect end_date
		setEndDate(new Date().toISOString().split('T')[0]);
		setCost('');
		setShowReleaseDialog(true);
	};

	const handleRelease = async () => {
		if (!endDate) {
			toast({
				title: '请填写结束日期',
				description: '结束日期为必填项。',
				variant: 'destructive',
			});
			return;
		}

		if (!vehicle.active_supp_history_id) return;

		setIsLoading(true);
		try {
			const releaseData: { end_date: string; cost?: number } = {
				end_date: endDate,
			};
			if (cost !== '') {
				const parsedCost = parseFloat(cost);
				if (!isNaN(parsedCost)) {
					releaseData.cost = parsedCost;
				}
			}
			await apiClient.releaseVehicleSupplementary(
				vehicle.active_supp_history_id,
				releaseData,
			);

			toast({
				title: 'Success',
				description: `Vehicle ${vehicle.rego} has been released to standard pool.`,
			});

			setShowReleaseDialog(false);
			onUpdate();
		} catch (error) {
			console.error('Failed to release supplementary vehicle:', error);
			toast({
				title: 'Error',
				description: 'Failed to release supplementary vehicle.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className='shadow-sm border-gray-200'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
						Supplementary Assignment
					</h2>
					{hasActiveAssignment && (
						<span className='inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20'>
							Active
						</span>
					)}
				</div>
			</CardHeader>
			<CardContent className='pt-4'>
				{hasActiveAssignment ? (
					<div className='space-y-4'>
						{isFetchingRecord ? (
							<div className='text-sm text-gray-500 animate-pulse'>
								Loading assignment details...
							</div>
						) : activeRecord ? (
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
								<div className='flex flex-col space-y-1'>
									<span className='text-gray-500 font-medium'>
										Assignment Period
									</span>
									<span className='text-gray-900 font-semibold'>
										{activeRecord.date
											? format(
													new Date(activeRecord.date),
													'MMM d, yyyy',
												)
											: 'Unknown'}{' '}
										- Present
									</span>
								</div>
								<div className='flex flex-col space-y-1'>
									<span className='text-gray-500 font-medium'>
										Estimated Cost
									</span>
									<span className='text-gray-900 font-semibold'>
										{activeRecord.cost
											? `$${Number(activeRecord.cost).toFixed(2)}`
											: 'N/A'}
										<span className='text-xs text-gray-500 font-normal ml-1'>
											({activeRecord.cost_type || 'Self'})
										</span>
									</span>
								</div>
								<div className='flex flex-col space-y-1 sm:col-span-2'>
									<span className='text-gray-500 font-medium'>
										Target / Description
									</span>
									<span className='text-gray-900 bg-gray-50 rounded px-2 py-1 border border-gray-100 mt-1 break-words'>
										{activeRecord.description ||
											'No description provided.'}
									</span>
								</div>
							</div>
						) : (
							<div className='text-sm text-gray-500'>
								Record overview not available.
							</div>
						)}

						{!isArchived && (
							<div className='flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100'>
								<Button
									variant='outline'
									className='flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50'
									onClick={() => setShowEditDialog(true)}
									disabled={isLoading || isFetchingRecord}>
									<Edit className='w-4 h-4 mr-2' />
									Edit Assignment
								</Button>
								<Button
									className='flex-1'
									onClick={handleAction}
									disabled={
										isLoading ||
										isLocked ||
										isFetchingRecord
									}>
									<CheckCircle className='w-4 h-4 mr-2' />
									{isLoading
										? 'Processing...'
										: 'Release Supplementary'}
								</Button>
							</div>
						)}
						{isLocked && (
							<p className='text-xs text-amber-600 mt-2 flex items-center justify-center gap-1 bg-amber-50 p-1.5 rounded-md border border-amber-100'>
								<Lock className='h-3 w-3' />
								Vehicle is currently locked in an active
								Schedule
							</p>
						)}
					</div>
				) : (
					<div className='flex flex-col items-center justify-center py-4 space-y-3 text-center'>
						<div className='space-y-1'>
							<p className='text-sm font-medium text-gray-900'>
								No Active Assignment
							</p>
							<p className='text-xs text-gray-500 max-w-[250px] mx-auto'>
								This vehicle is currently available in the
								standard pool.
							</p>
						</div>
						{!isArchived && (
							<Button
								onClick={handleAction}
								disabled={isLoading}
								size='sm'
								className='mt-2'>
								Assign as Supplementary
							</Button>
						)}
					</div>
				)}
			</CardContent>

			{/* Assign Dialog */}
			<AssignSupplementaryDialog
				vehicleId={vehicle.id}
				open={showAssignDialog}
				onOpenChange={setShowAssignDialog}
				onSuccess={onUpdate}
			/>

			{/* Release Dialog */}
			<ReleaseSupplementaryDialog
				vehicleId={vehicle.id}
				showReleaseDialog={showReleaseDialog}
				setShowReleaseDialog={setShowReleaseDialog}
				setEndDate={setEndDate}
				setCost={setCost}
				endDate={endDate}
				cost={cost}
				isLoading={isLoading}
				handleRelease={handleRelease}
				onSuccess={onUpdate}
			/>

			{/* Edit Dialog */}
			<EditSupplementaryDialog
				record={activeRecord}
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				onSuccess={() => {
					fetchActiveRecord();
					onUpdate();
				}}
			/>
		</Card>
	);
}
