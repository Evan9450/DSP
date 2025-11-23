'use client';

import { ChevronRight, Phone, Plus, Search, User, AlertTriangle, FileText, MapPin, Mail, Upload, Key } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { calculateDocumentStatus } from '@/lib/helpers';
import { useDrivers } from '@/hooks/use-drivers';
import { apiClient, DriverCreate } from '@/lib/api/client';
import { convertDriver, convertDriverDocument } from '@/lib/api/converters';

export default function DriversPage() {
	const router = useRouter();
	const { drivers: apiDrivers, isLoading, refetch } = useDrivers();
	const [searchTerm, setSearchTerm] = useState('');
	const [driverDocuments, setDriverDocuments] = useState<Record<string, any[]>>({});
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [newDriver, setNewDriver] = useState<DriverCreate>({
		name: '',
		amazon_id: '',
	});
	const [importFile, setImportFile] = useState<File | null>(null);

	const drivers = apiDrivers?.map(convertDriver) || [];

	// Fetch documents for all drivers
	useEffect(() => {
		if (!apiDrivers) return;

		const fetchAllDocuments = async () => {
			const docsMap: Record<string, any[]> = {};

			for (const driver of apiDrivers) {
				try {
					const files = await apiClient.getDriverFiles(driver.id);
					docsMap[driver.id.toString()] = files;
				} catch (error) {
					console.error(`Failed to fetch files for driver ${driver.id}:`, error);
					docsMap[driver.id.toString()] = [];
				}
			}

			setDriverDocuments(docsMap);
		};

		fetchAllDocuments();
	}, [apiDrivers]);

	const filteredDrivers = drivers.filter(
		(d) =>
			d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			d.amazonId.toLowerCase().includes(searchTerm.toLowerCase()) ||
			d.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Get document stats for alerts
	const getDriverDocumentStatus = (driverId: string) => {
		const docs = driverDocuments[driverId] || [];
		const expiring = docs.filter(d => {
			const status = calculateDocumentStatus(new Date(d.expiry_date));
			return status === 'expiring';
		});
		const expired = docs.filter(d => {
			const status = calculateDocumentStatus(new Date(d.expiry_date));
			return status === 'expired';
		});
		return { total: docs.length, expiring: expiring.length, expired: expired.length };
	};

	const driversWithExpiringDocs = drivers.filter(d => {
		const status = getDriverDocumentStatus(d.id);
		return status.expiring > 0 || status.expired > 0;
	});

	const handleRowClick = (driverId: string) => {
		router.push(`/drivers/${driverId}`);
	};

	const handleAddDriver = async () => {
		try {
			await apiClient.createDriver(newDriver);
			setShowAddDialog(false);
			setNewDriver({ name: '', amazon_id: '' });
			await refetch();
		} catch (error) {
			console.error('Failed to create driver:', error);
			alert('Failed to create driver');
		}
	};

	const handleImportAmazonIds = async () => {
		if (!importFile) return;

		try {
			await apiClient.importAmazonIds(importFile);
			setShowImportDialog(false);
			setImportFile(null);
			await refetch();
			alert('Amazon IDs imported successfully');
		} catch (error) {
			console.error('Failed to import Amazon IDs:', error);
			alert('Failed to import Amazon IDs');
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
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						Driver Management
					</h1>
					<p className='text-sm sm:text-base text-gray-600 mt-1'>
						Manage drivers, Amazon credentials, and document expiry tracking
					</p>
				</div>

				{/* Document Expiry Alert */}
				{driversWithExpiringDocs.length > 0 && (
					<Card className='mb-6 p-4 border-orange-200 bg-orange-50'>
						<div className='flex items-start gap-3'>
							<AlertTriangle className='h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0' />
							<div className='flex-1'>
								<h3 className='font-semibold text-orange-900'>Document Expiry Alerts</h3>
								<p className='text-sm text-orange-700 mt-1'>
									{driversWithExpiringDocs.length} {driversWithExpiringDocs.length === 1 ? 'driver has' : 'drivers have'} documents expiring or expired
								</p>
							</div>
						</div>
					</Card>
				)}

				<div className='mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3'>
					<div className='relative flex-1 max-w-full sm:max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search by name, Amazon ID, or email...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							className='border-blue-600 text-blue-700 hover:bg-blue-50'
							onClick={() => setShowImportDialog(true)}
						>
							<Upload className='h-4 w-4 mr-2' />
							<span className='hidden sm:inline'>Import Amazon IDs</span>
							<span className='sm:hidden'>Import</span>
						</Button>
						<Button
							className='bg-blue-700 hover:bg-blue-800 text-white'
							onClick={() => setShowAddDialog(true)}
						>
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
								<TableHead className='w-[60px]'></TableHead>
								<TableHead>Driver Name</TableHead>
								<TableHead>Amazon ID</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Address</TableHead>
								<TableHead>Documents</TableHead>
								<TableHead>Deputy</TableHead>
								<TableHead className='w-[50px]'></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredDrivers.map((driver) => {
								const docStatus = getDriverDocumentStatus(driver.id);
								return (
									<TableRow
										key={driver.id}
										className='cursor-pointer hover:bg-gray-50 transition-colors'
										onClick={() => handleRowClick(driver.id)}
									>
										<TableCell>
											<div className='p-2 bg-blue-100 rounded-full inline-block'>
												<User className='h-5 w-5 text-blue-700' />
											</div>
										</TableCell>
										<TableCell>
											<div>
												<p className='font-semibold text-gray-900'>{driver.name}</p>
												<div className='flex items-center gap-1 mt-1'>
													<Key className='h-3 w-3 text-gray-400' />
													<span className='text-xs font-mono text-gray-500'>{driver.amazonId}</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant='outline' className='font-mono text-xs'>
												{driver.amazonId}
											</Badge>
											{driver.amazonPassword && (
												<div className='flex items-center gap-1 mt-1'>
													<div className='w-2 h-2 rounded-full bg-green-500'></div>
													<span className='text-xs text-gray-500'>Has Password</span>
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
													<span className='text-xs'>{driver.email}</span>
												</div>
											)}
										</TableCell>
										<TableCell className='text-gray-600 text-sm'>
											{driver.address ? (
												<div className='flex items-start gap-1 max-w-xs'>
													<MapPin className='h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0' />
													<span className='text-xs'>{driver.address}</span>
												</div>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</TableCell>
										<TableCell>
											{docStatus.total > 0 ? (
												<div className='space-y-1'>
													<div className='flex items-center gap-1'>
														<FileText className='h-3 w-3 text-gray-500' />
														<span className='text-xs text-gray-600'>{docStatus.total} documents</span>
													</div>
													{docStatus.expired > 0 && (
														<Badge variant='destructive' className='text-xs'>
															{docStatus.expired} Expired
														</Badge>
													)}
													{docStatus.expiring > 0 && (
														<Badge className='bg-orange-500 text-white text-xs'>
															{docStatus.expiring} Expiring
														</Badge>
													)}
												</div>
											) : (
												<span className='text-xs text-gray-400'>No documents</span>
											)}
										</TableCell>
										<TableCell>
											{driver.deputyId ? (
												<div className='flex items-center gap-1'>
													<div className='w-2 h-2 rounded-full bg-green-500'></div>
													<span className='text-xs text-gray-600'>{driver.deputyId}</span>
												</div>
											) : (
												<span className='text-xs text-gray-400'>Not synced</span>
											)}
										</TableCell>
										<TableCell>
											<ChevronRight className='h-5 w-5 text-gray-400' />
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
			<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Driver</DialogTitle>
						<DialogDescription>
							Create a new driver profile. You can add more details later.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div>
							<Label>Name *</Label>
							<Input
								value={newDriver.name}
								onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
								placeholder='Enter driver name'
							/>
						</div>
						<div>
							<Label>Amazon ID *</Label>
							<Input
								value={newDriver.amazon_id}
								onChange={(e) => setNewDriver({ ...newDriver, amazon_id: e.target.value })}
								placeholder='e.g., DA123456'
							/>
						</div>
						<div>
							<Label>Phone</Label>
							<Input
								value={newDriver.phone || ''}
								onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
								placeholder='Phone number'
							/>
						</div>
						<div>
							<Label>Email</Label>
							<Input
								type='email'
								value={newDriver.email || ''}
								onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
								placeholder='email@example.com'
							/>
						</div>
						<div>
							<Label>Address</Label>
							<Input
								value={newDriver.address || ''}
								onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
								placeholder='Full address'
							/>
						</div>
						<div>
							<Label>Deputy ID</Label>
							<Input
								value={newDriver.deputy_id || ''}
								onChange={(e) => setNewDriver({ ...newDriver, deputy_id: e.target.value })}
								placeholder='Deputy ID (if synced)'
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setShowAddDialog(false);
								setNewDriver({ name: '', amazon_id: '' });
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddDriver}
							disabled={!newDriver.name || !newDriver.amazon_id}
						>
							Add Driver
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Import Amazon IDs Dialog */}
			<Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Import Amazon IDs</DialogTitle>
						<DialogDescription>
							Upload an Excel or CSV file containing Amazon IDs to import driver data.
						</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<Label>Select File</Label>
						<Input
							type='file'
							onChange={(e) => setImportFile(e.target.files?.[0] || null)}
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
								<li>Supported formats: Excel (.xlsx, .xls) or CSV (.csv)</li>
								<li>File should contain Amazon ID column</li>
								<li>Optionally include name, phone, email columns</li>
							</ul>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setShowImportDialog(false);
								setImportFile(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleImportAmazonIds}
							disabled={!importFile}
						>
							Import
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
