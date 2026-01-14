'use client';

import { FileCheck, Plus, RefreshCw, Search, User } from 'lucide-react';
import {
	errorMessages,
	handleApiError,
	notify,
	successMessages,
} from '@/lib/notifications';
import { useEffect, useState } from 'react';

import { AddDriverDialog } from './components/AddDriverDialog';
import { Button } from '@/components/ui/button';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import DriverTable from './components/DriverTable';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { calculateDocumentStatus } from '@/lib/helpers';
import { convertDriver } from '@/lib/api/converters';
import { useDrivers } from '@/hooks/use-drivers';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function DriversPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { drivers: apiDrivers, isLoading, refetch } = useDrivers();
	const [searchTerm, setSearchTerm] = useState('');
	const [driverDocuments, setDriverDocuments] = useState<
		Record<string, any[]>
	>({});
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isSyncingDeputy, setIsSyncingDeputy] = useState(false);
	const [isCheckingDocuments, setIsCheckingDocuments] = useState(false);
	const [driverToDelete, setDriverToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const drivers = apiDrivers?.map(convertDriver) || [];

	// Extract documents from driver data (no longer need separate API call)
	useEffect(() => {
		if (!apiDrivers) return;

		const docsMap: Record<string, any[]> = {};

		for (const driver of apiDrivers) {
			const docs: any[] = [];

			// Add license if exists
			if (driver.license_expiry_date) {
				docs.push({
					type: 'license',
					expiry_date: driver.license_expiry_date,
					document_number: driver.license_number,
				});
			}

			// Add visa if exists
			if (driver.visa_expiry_date) {
				docs.push({
					type: 'visa',
					expiry_date: driver.visa_expiry_date,
					document_number: driver.visa_number,
				});
			}
			if (driver) {
				docs.push({
					type: 'total',
					total:
						(driver?.license_file_url?.length ?? 0) +
						(driver?.visa_file_url?.length ?? 0),
				});
			}
			docsMap[driver.id.toString()] = docs;
		}

		setDriverDocuments(docsMap);
	}, [apiDrivers]);

	const filteredDrivers = drivers.filter(
		(d) =>
			d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			d.amazonId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			d.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleRowClick = (driverId: string) => {
		router.push(`/drivers/${driverId}`);
	};

	const handleSyncDeputy = async () => {
		setIsSyncingDeputy(true);
		try {
			const result = await apiClient.syncDeputyDrivers();
			console.log('Deputy sync result:', result);
			await refetch();

			// Handle different response formats
			if (result.message) {
				// New API format with message
				notify.success(result.message, 'Deputy Sync Completed!');
			} else if (result.synced_count !== undefined) {
				// Old API format with counts
				notify.success(
					successMessages.sync.deputy({
						synced: result.synced_count || 0,
						newDrivers: result.new_drivers || 0,
						updated: result.updated_drivers || 0,
					}),
					'Deputy Sync Completed!'
				);
			} else {
				// Generic success
				notify.success(
					'Deputy drivers synced successfully',
					'Deputy Sync Completed!'
				);
			}
		} catch (error: any) {
			console.error('Failed to sync Deputy drivers:', error);
			console.error('Error response:', error.response?.data);
			handleApiError(error, errorMessages.sync.deputyFailed());
		} finally {
			setIsSyncingDeputy(false);
		}
	};

	const handleDeleteClick = (driverId: string, driverName: string) => {
		setDriverToDelete({ id: driverId, name: driverName });
		setShowDeleteDialog(true);
	};

	const handleDeleteDriver = async () => {
		if (!driverToDelete) return;

		try {
			await apiClient.deleteDriver(parseInt(driverToDelete.id));
			const driverName = driverToDelete.name;
			setShowDeleteDialog(false);
			setDriverToDelete(null);
			await refetch();
			notify.success(successMessages.driver.deleted(driverName));
		} catch (error) {
			console.error('Failed to delete driver:', error);
			handleApiError(
				error,
				errorMessages.driver.deleteFailed(driverToDelete?.name)
			);
		}
	};

	const handleCheckDocuments = async () => {
		try {
			setIsCheckingDocuments(true);
			const result = await apiClient.checkDocumentExpiry();

			console.log('✅ Check documents result:', result);

			toast({
				title: 'Document Check Complete',
				description: `License alerts: ${result.license_alerts || 0}, Visa alerts: ${result.visa_alerts || 0}`,
			});
		} catch (error) {
			console.error('Failed to check documents:', error);
			toast({
				title: 'Error',
				description: 'Failed to check document expiry',
				variant: 'destructive',
			});
		} finally {
			setIsCheckingDocuments(false);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-zinc-100 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto'></div>
					<p className='mt-4 text-sm text-gray-500'>
						Loading drivers...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-zinc-100'>
			<div className='container mx-auto py-12 px-4 max-w-7xl'>
				<div className='mb-8'>
					<div className='flex justify-between items-start'>
						<div>
							<h1 className='text-4xl font-bold tracking-tight text-zinc-900'>
								Driver Management
							</h1>
						</div>

						<div>
							<Button
								variant='outline'
								className='border-emerald-500 text-emerald-500 hover:bg-emerald-50 rounded-md hover:text-emerald-500'
								onClick={handleSyncDeputy}
								disabled={isSyncingDeputy}>
								{isSyncingDeputy ? (
									<>
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mr-2'></div>
										<span className='hidden sm:inline'>
											Syncing...
										</span>
										<span className='sm:hidden'>
											Sync...
										</span>
									</>
								) : (
									<>
										<RefreshCw className='h-4 w-4 mr-2' />
										<span className='hidden sm:inline'>
											Sync Deputy
										</span>
										<span className='sm:hidden'>Sync</span>
									</>
								)}
							</Button>
							<Button
								variant='outline'
								className='border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md hover:text-blue-600'
								onClick={handleCheckDocuments}
								disabled={isCheckingDocuments}>
								{isCheckingDocuments ? (
									<>
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
										<span className='hidden sm:inline'>
											Checking...
										</span>
										<span className='sm:hidden'>
											Check...
										</span>
									</>
								) : (
									<>
										<FileCheck className='h-4 w-4 mr-2' />
										<span className='hidden sm:inline'>
											Check Documents
										</span>
										<span className='sm:hidden'>Check</span>
									</>
								)}
							</Button>
						</div>
					</div>
				</div>

				<div className='mb-6 flex flex-col sm:flex-row gap-3 justify-between'>
					<div className='relative flex-1 max-w-full sm:max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
						<Input
							placeholder='Search by name, Amazon ID, or email...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10 rounded-md '
						/>
					</div>
					<div className='flex gap-2'>
						<Button
							className=' text-white rounded-md'
							onClick={() => setShowAddDialog(true)}>
							<Plus className='h-4 w-4 mr-2' />
							<span className='hidden sm:inline'>Add Driver</span>
							<span className='sm:hidden'>Add</span>
						</Button>
					</div>
				</div>
				<DriverTable
					filteredDrivers={filteredDrivers}
					driverDocuments={driverDocuments}
					handleRowClick={handleRowClick}
					handleDeleteClick={handleDeleteClick}
				/>

				{filteredDrivers.length === 0 && (
					<div className='text-center py-12'>
						<User className='h-12 w-12 text-gray-500 mx-auto mb-4' />
						<p className='text-base leading-7 text-gray-700'>
							No drivers found
						</p>
					</div>
				)}
			</div>

			{/* Add Driver Dialog */}
			<AddDriverDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				onSuccess={refetch}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				showDeleteDialog={showDeleteDialog}
				setShowDeleteDialog={setShowDeleteDialog}
				driverToDelete={driverToDelete}
				setDriverToDelete={setDriverToDelete}
				handleDeleteDriver={handleDeleteDriver}
			/>
		</div>
	);
}
