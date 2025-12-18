'use client';

import {
	AlertTriangle,
	ChevronRight,
	FileText,
	Mail,
	MapPin,
	Phone,
	Plus,
	RefreshCw,
	Search,
	Trash2,
	Upload,
	User,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	errorMessages,
	handleApiError,
	notify,
	successMessages,
} from '@/lib/notifications';
import { useEffect, useState } from 'react';

import { AddDriverDialog } from './components/AddDriverDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { calculateDocumentStatus } from '@/lib/helpers';
import { convertDriver } from '@/lib/api/converters';
import { useDrivers } from '@/hooks/use-drivers';
import { useRouter } from 'next/navigation';

export default function DriversPage() {
	const router = useRouter();
	const { drivers: apiDrivers, isLoading, refetch } = useDrivers();
	const [searchTerm, setSearchTerm] = useState('');
	const [driverDocuments, setDriverDocuments] = useState<
		Record<string, any[]>
	>({});
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isSyncingDeputy, setIsSyncingDeputy] = useState(false);
	const [driverToDelete, setDriverToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [importFile, setImportFile] = useState<File | null>(null);

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

	// Get document stats for alerts
	const getDriverDocumentStatus = (driverId: string) => {
		const docs = driverDocuments[driverId] || [];
		const expiring = docs.filter((d) => {
			const status = calculateDocumentStatus(new Date(d.expiry_date));
			return status === 'expiring';
		});
		const expired = docs.filter((d) => {
			const status = calculateDocumentStatus(new Date(d.expiry_date));
			return status === 'expired';
		});
		return {
			total: docs.length,
			expiring: expiring.length,
			expired: expired.length,
		};
	};

	const driversWithExpiringDocs = drivers.filter((d) => {
		const status = getDriverDocumentStatus(d.id);
		return status.expiring > 0 || status.expired > 0;
	});

	const handleRowClick = (driverId: string) => {
		router.push(`/drivers/${driverId}`);
	};

	const handleImportAmazonIds = async () => {
		if (!importFile) return;

		try {
			await apiClient.importAmazonIds(importFile);
			setShowImportDialog(false);
			setImportFile(null);
			await refetch();
			notify.success(successMessages.sync.amazonIds());
		} catch (error) {
			console.error('Failed to import Amazon IDs:', error);
			handleApiError(error, errorMessages.sync.amazonIdsFailed());
		}
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
				notify.success('Deputy drivers synced successfully', 'Deputy Sync Completed!');
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

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading drivers...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<div className='mb-4 sm:mb-6'>
					<div className='flex justify-between'>
						<div>
							<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
								Driver Management
							</h1>
							<p className='text-sm sm:text-base text-gray-600 mt-1'>
								Manage drivers, Amazon credentials, and document
								expiry tracking
							</p>
						</div>

						<div>
							<Button
								variant='outline'
								className='border-green-600 text-green-700 hover:bg-green-200 hover:!text-green-700'
								onClick={handleSyncDeputy}
								disabled={isSyncingDeputy}>
								{isSyncingDeputy ? (
									<>
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2'></div>
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
						</div>
					</div>
				</div>

				{/* Document Expiry Alert */}
				{/* {driversWithExpiringDocs.length > 0 && (
					<Card className='mb-6 p-4 border-orange-200 bg-orange-50'>
						<div className='flex items-start gap-3'>
							<AlertTriangle className='h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0' />
							<div className='flex-1'>
								<h3 className='font-semibold text-orange-900'>
									Document Expiry Alerts
								</h3>
								<p className='text-sm text-orange-700 mt-1'>
									{driversWithExpiringDocs.length}{' '}
									{driversWithExpiringDocs.length === 1
										? 'driver has'
										: 'drivers have'}{' '}
									documents expiring or expired
								</p>
							</div>
						</div>
					</Card>
				)} */}

				<div className='mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 justify-between'>
					<div className='relative flex-1 max-w-full sm:max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search by name, Amazon ID, or email...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
					<div className='flex gap-2 '>
						<Button
							className='bg-blue-700 hover:bg-blue-800 text-white'
							onClick={() => setShowAddDialog(true)}>
							<Plus className='h-4 w-4 mr-2' />
							<span className='hidden sm:inline'>Add Driver</span>
							<span className='sm:hidden'>Add</span>
						</Button>
					</div>
				</div>

				<Card className='bg-white overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								{/* <TableHead className='w-[60px]'></TableHead> */}
								<TableHead>Driver Name</TableHead>
								<TableHead>Amazon ID</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Address</TableHead>
								<TableHead>Documents</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className='w-[80px]'></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredDrivers.map((driver) => {
								const docStatus = getDriverDocumentStatus(
									driver.id
								);
								return (
									<TableRow
										key={driver.id}
										className='cursor-pointer hover:bg-gray-50 transition-colors'
										onClick={() =>
											handleRowClick(driver.id)
										}>
										{/* <TableCell></TableCell> */}
										<TableCell className='flex flex-row'>
											<div className='p-2 bg-blue-100 rounded-full inline-block'>
												<User className='h-5 w-5 text-blue-700' />
											</div>
											<div className='ml-2'>
												<p className='font-semibold text-gray-900'>
													{driver.name}
												</p>
												<div className='flex items-center gap-1 mt-1'>
													{/* <Key className='h-3 w-3 text-gray-400' /> */}
													<div className='flex items-center gap-1'>
														<div className='w-2 h-2 rounded-full bg-green-500'></div>
														<span className='text-xs text-gray-600'>
															{driver.deputyId}
														</span>
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant='outline'
												className='font-mono text-xs'>
												{driver.amazonId}
											</Badge>
											{driver.amazonPassword && (
												<div className='flex items-center gap-1 mt-1'>
													<div className='w-2 h-2 rounded-full bg-green-500'></div>
													<span className='text-xs text-gray-500'>
														Has Password
													</span>
												</div>
											)}
										</TableCell>
										<TableCell className='text-gray-600 text-sm'>
											{driver.phone && (
												<div className='flex items-center gap-1 mb-1'>
													<Phone className='h-3 w-3 text-gray-500' />
													<span>{driver.phone}</span>
												</div>
											)}
											{driver.email && (
												<div className='flex items-center gap-1'>
													<Mail className='h-3 w-3 text-gray-500' />
													<span className='text-xs'>
														{driver.email}
													</span>
												</div>
											)}
										</TableCell>
										<TableCell className='text-gray-600 text-sm'>
											{driver.address ? (
												<div className='flex items-start gap-1 max-w-xs'>
													<MapPin className='h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0' />
													<span className='text-xs'>
														{driver.address}
													</span>
												</div>
											) : (
												<span className='text-gray-400'>
													-
												</span>
											)}
										</TableCell>
										<TableCell>
											{docStatus.total > 0 ? (
												<div className='space-y-1'>
													<div className='flex items-center gap-1'>
														<FileText className='h-3 w-3 text-gray-500' />
														<span className='text-xs text-gray-600'>
															{docStatus.total}{' '}
															documents
														</span>
													</div>
													{docStatus.expired > 0 && (
														<Badge
															variant='destructive'
															className='text-xs'>
															{docStatus.expired}{' '}
															Expired
														</Badge>
													)}
													{/* {docStatus.expiring > 0 && (
														<Badge className='bg-orange-500 text-white text-xs'>
															{docStatus.expiring}{' '}
															Expiring
														</Badge>
													)} */}
												</div>
											) : (
												<span className='text-xs text-gray-400'>
													No documents
												</span>
											)}
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1'>
												<div className={`w-2 h-2 rounded-full ${driver.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
												<span className='text-xs text-gray-600'>
													{driver.isActive ? 'Active' : 'Inactive'}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center justify-end gap-2'>
												<Button
													variant='ghost'
													size='sm'
													className='text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0'
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteClick(
															driver.id,
															driver.name
														);
													}}>
													<Trash2 className='h-4 w-4' />
												</Button>
												<ChevronRight className='h-5 w-5 text-gray-400' />
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Card>

				{filteredDrivers.length === 0 && (
					<div className='text-center py-12'>
						<User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-600'>No drivers found</p>
					</div>
				)}
			</div>

			{/* Add Driver Dialog */}
			<AddDriverDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				onSuccess={refetch}
			/>

			{/* Import Amazon IDs Dialog */}
			<Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Import Amazon IDs</DialogTitle>
						<DialogDescription>
							Upload an Excel or CSV file containing Amazon IDs to
							import driver data.
						</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<Label>Select File</Label>
						<Input
							type='file'
							onChange={(e) =>
								setImportFile(e.target.files?.[0] || null)
							}
							accept='.xlsx,.xls,.csv'
						/>
						{importFile && (
							<p className='text-sm text-gray-600 mt-2'>
								Selected: {importFile.name}
							</p>
						)}
						<div className='mt-4 p-4 bg-blue-50 rounded-lg'>
							<p className='text-sm text-gray-700 mb-2'>
								<strong>File Requirements:</strong>
							</p>
							<ul className='text-sm text-gray-600 list-disc list-inside space-y-1'>
								<li>
									Supported formats: Excel (.xlsx, .xls) or
									CSV (.csv)
								</li>
								<li>File should contain Amazon ID column</li>
								<li>
									Optionally include name, phone, email
									columns
								</li>
							</ul>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setShowImportDialog(false);
								setImportFile(null);
							}}>
							Cancel
						</Button>
						<Button
							onClick={handleImportAmazonIds}
							disabled={!importFile}>
							Import
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Driver</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this driver? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
							<div className='flex items-center gap-3'>
								<div className='p-2 bg-red-100 rounded-full'>
									<Trash2 className='h-5 w-5 text-red-600' />
								</div>
								<div>
									<p className='font-semibold text-gray-900'>
										{driverToDelete?.name}
									</p>
									<p className='text-sm text-gray-600'>
										This driver and all associated data will
										be permanently deleted.
									</p>
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setShowDeleteDialog(false);
								setDriverToDelete(null);
							}}>
							Cancel
						</Button>
						<Button
							variant='destructive'
							onClick={handleDeleteDriver}>
							<Trash2 className='h-4 w-4 mr-2' />
							Delete Driver
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
