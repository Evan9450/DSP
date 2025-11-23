'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDriver, useDriverFiles } from '@/hooks/use-drivers';
import { apiClient, DriverFileCreate } from '@/lib/api/client';
import { calculateDocumentStatus } from '@/lib/helpers';
import {
	ArrowLeft,
	Phone,
	Mail,
	MapPin,
	User,
	Key,
	FileText,
	Plus,
	Upload,
	Trash2,
	Edit,
	Calendar,
	Shield,
	AlertTriangle,
	Save,
	X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function DriverDetailPage() {
	const params = useParams();
	const router = useRouter();
	const driverId = params.id ? parseInt(params.id as string) : null;

	const { driver, isLoading: driverLoading, refetch: refetchDriver } = useDriver(driverId);
	const { files, isLoading: filesLoading, refetch: refetchFiles } = useDriverFiles(driverId);

	const [isEditing, setIsEditing] = useState(false);
	const [editedDriver, setEditedDriver] = useState<any>(null);
	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [newPassword, setNewPassword] = useState('');
	const [showFileDialog, setShowFileDialog] = useState(false);
	const [editingFile, setEditingFile] = useState<any>(null);
	const [newFile, setNewFile] = useState<DriverFileCreate>({
		type: 'license',
		expiry_date: '',
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	useEffect(() => {
		if (driver) {
			setEditedDriver(driver);
		}
	}, [driver]);

	const handleSaveDriver = async () => {
		if (!driverId || !editedDriver) return;

		try {
			await apiClient.updateDriver(driverId, {
				name: editedDriver.name,
				phone: editedDriver.phone,
				email: editedDriver.email,
				address: editedDriver.address,
				amazon_id: editedDriver.amazon_id,
				deputy_id: editedDriver.deputy_id,
			});
			await refetchDriver();
			setIsEditing(false);
		} catch (error) {
			console.error('Failed to update driver:', error);
			alert('Failed to update driver information');
		}
	};

	const handleSetPassword = async () => {
		if (!driverId || !newPassword) return;

		try {
			await apiClient.setDriverPassword(driverId, newPassword);
			setShowPasswordDialog(false);
			setNewPassword('');
			await refetchDriver();
			alert('Password set successfully');
		} catch (error) {
			console.error('Failed to set password:', error);
			alert('Failed to set password');
		}
	};

	const handleAddFile = async () => {
		if (!driverId) return;

		try {
			const createdFile = await apiClient.createDriverFile(driverId, newFile);

			// If a file was selected, upload it
			if (selectedFile) {
				await apiClient.uploadDriverFile(driverId, createdFile.id, selectedFile);
			}

			await refetchFiles();
			setShowFileDialog(false);
			setNewFile({
				type: 'license',
				expiry_date: '',
			});
			setSelectedFile(null);
		} catch (error) {
			console.error('Failed to add file:', error);
			alert('Failed to add file');
		}
	};

	const handleUpdateFile = async () => {
		if (!driverId || !editingFile) return;

		try {
			await apiClient.updateDriverFile(driverId, editingFile.id, {
				type: editingFile.type,
				document_number: editingFile.document_number,
				issue_date: editingFile.issue_date,
				expiry_date: editingFile.expiry_date,
				notes: editingFile.notes,
			});

			// If a new file was selected, upload it
			if (selectedFile) {
				await apiClient.uploadDriverFile(driverId, editingFile.id, selectedFile);
			}

			await refetchFiles();
			setEditingFile(null);
			setSelectedFile(null);
		} catch (error) {
			console.error('Failed to update file:', error);
			alert('Failed to update file');
		}
	};

	const handleDeleteFile = async (fileId: number) => {
		if (!driverId || !confirm('Are you sure you want to delete this file?')) return;

		try {
			await apiClient.deleteDriverFile(driverId, fileId);
			await refetchFiles();
		} catch (error) {
			console.error('Failed to delete file:', error);
			alert('Failed to delete file');
		}
	};

	const getStatusBadge = (expiryDate: string) => {
		const status = calculateDocumentStatus(new Date(expiryDate));
		if (status === 'expired') {
			return <Badge variant='destructive'>Expired</Badge>;
		} else if (status === 'expiring') {
			return <Badge className='bg-orange-500'>Expiring Soon</Badge>;
		} else {
			return <Badge className='bg-green-500'>Valid</Badge>;
		}
	};

	if (driverLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading driver details...</p>
				</div>
			</div>
		);
	}

	if (!driver) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-gray-600'>Driver not found</p>
					<Button onClick={() => router.push('/drivers')} className='mt-4'>
						Back to Drivers
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				{/* Header */}
				<div className='mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Button
							variant='outline'
							onClick={() => router.push('/drivers')}
							className='border-blue-600 text-blue-700 hover:bg-blue-50'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back
						</Button>
						<div>
							<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
								{driver.name}
							</h1>
							<p className='text-sm text-gray-600 mt-1'>Driver Details</p>
						</div>
					</div>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							onClick={() => setShowPasswordDialog(true)}
							className='border-blue-600 text-blue-700 hover:bg-blue-50'
						>
							<Shield className='h-4 w-4 mr-2' />
							Set Password
						</Button>
						{isEditing ? (
							<>
								<Button
									variant='outline'
									onClick={() => {
										setIsEditing(false);
										setEditedDriver(driver);
									}}
								>
									<X className='h-4 w-4 mr-2' />
									Cancel
								</Button>
								<Button onClick={handleSaveDriver} className='bg-blue-700 hover:bg-blue-800'>
									<Save className='h-4 w-4 mr-2' />
									Save
								</Button>
							</>
						) : (
							<Button
								onClick={() => setIsEditing(true)}
								className='bg-blue-700 hover:bg-blue-800'
							>
								<Edit className='h-4 w-4 mr-2' />
								Edit
							</Button>
						)}
					</div>
				</div>

				{/* Driver Information Card */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Driver Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div>
								<Label>Name</Label>
								{isEditing ? (
									<Input
										value={editedDriver?.name || ''}
										onChange={(e) =>
											setEditedDriver({ ...editedDriver, name: e.target.value })
										}
									/>
								) : (
									<p className='text-gray-900 font-medium'>{driver.name}</p>
								)}
							</div>
							<div>
								<Label className='flex items-center gap-2'>
									<Key className='h-4 w-4' />
									Amazon ID
								</Label>
								{isEditing ? (
									<Input
										value={editedDriver?.amazon_id || ''}
										onChange={(e) =>
											setEditedDriver({ ...editedDriver, amazon_id: e.target.value })
										}
									/>
								) : (
									<p className='text-gray-900 font-mono'>{driver.amazon_id}</p>
								)}
							</div>
							<div>
								<Label className='flex items-center gap-2'>
									<Phone className='h-4 w-4' />
									Phone
								</Label>
								{isEditing ? (
									<Input
										value={editedDriver?.phone || ''}
										onChange={(e) =>
											setEditedDriver({ ...editedDriver, phone: e.target.value })
										}
									/>
								) : (
									<p className='text-gray-900'>{driver.phone || '-'}</p>
								)}
							</div>
							<div>
								<Label className='flex items-center gap-2'>
									<Mail className='h-4 w-4' />
									Email
								</Label>
								{isEditing ? (
									<Input
										type='email'
										value={editedDriver?.email || ''}
										onChange={(e) =>
											setEditedDriver({ ...editedDriver, email: e.target.value })
										}
									/>
								) : (
									<p className='text-gray-900'>{driver.email || '-'}</p>
								)}
							</div>
							<div>
								<Label>Deputy ID</Label>
								{isEditing ? (
									<Input
										value={editedDriver?.deputy_id || ''}
										onChange={(e) =>
											setEditedDriver({ ...editedDriver, deputy_id: e.target.value })
										}
									/>
								) : (
									<p className='text-gray-900'>{driver.deputy_id || '-'}</p>
								)}
							</div>
							<div>
								<Label>Status</Label>
								<p>
									{driver.is_active ? (
										<Badge className='bg-green-500'>Active</Badge>
									) : (
										<Badge variant='destructive'>Inactive</Badge>
									)}
								</p>
							</div>
							<div className='md:col-span-2'>
								<Label className='flex items-center gap-2'>
									<MapPin className='h-4 w-4' />
									Address
								</Label>
								{isEditing ? (
									<Input
										value={editedDriver?.address || ''}
										onChange={(e) =>
											setEditedDriver({ ...editedDriver, address: e.target.value })
										}
									/>
								) : (
									<p className='text-gray-900'>{driver.address || '-'}</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Files/Documents Card */}
				<Card>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<CardTitle className='flex items-center gap-2'>
								<FileText className='h-5 w-5' />
								Documents & Files
							</CardTitle>
							<Button
								onClick={() => setShowFileDialog(true)}
								className='bg-blue-700 hover:bg-blue-800'
							>
								<Plus className='h-4 w-4 mr-2' />
								Add Document
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{filesLoading ? (
							<div className='text-center py-8'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto'></div>
								<p className='mt-2 text-gray-600'>Loading files...</p>
							</div>
						) : files && files.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Type</TableHead>
										<TableHead>Document Number</TableHead>
										<TableHead>Issue Date</TableHead>
										<TableHead>Expiry Date</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>File</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{files.map((file) => (
										<TableRow key={file.id}>
											<TableCell>
												<Badge variant='outline' className='capitalize'>
													{file.type}
												</Badge>
											</TableCell>
											<TableCell>{file.document_number || '-'}</TableCell>
											<TableCell>
												{file.issue_date
													? new Date(file.issue_date).toLocaleDateString()
													: '-'}
											</TableCell>
											<TableCell>
												<div className='flex items-center gap-2'>
													<Calendar className='h-4 w-4 text-gray-400' />
													{new Date(file.expiry_date).toLocaleDateString()}
												</div>
											</TableCell>
											<TableCell>{getStatusBadge(file.expiry_date)}</TableCell>
											<TableCell>
												{file.file_url ? (
													<a
														href={file.file_url}
														target='_blank'
														rel='noopener noreferrer'
														className='text-blue-600 hover:underline flex items-center gap-1'
													>
														<FileText className='h-4 w-4' />
														View
													</a>
												) : (
													<span className='text-gray-400'>No file</span>
												)}
											</TableCell>
											<TableCell>
												<div className='flex gap-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => {
															setEditingFile(file);
															setShowFileDialog(true);
														}}
													>
														<Edit className='h-3 w-3' />
													</Button>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handleDeleteFile(file.id)}
														className='text-red-600 hover:text-red-700'
													>
														<Trash2 className='h-3 w-3' />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className='text-center py-8'>
								<FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
								<p className='text-gray-600'>No documents found</p>
								<Button
									onClick={() => setShowFileDialog(true)}
									variant='outline'
									className='mt-4'
								>
									<Plus className='h-4 w-4 mr-2' />
									Add First Document
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Set Password Dialog */}
			<Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set Driver Password</DialogTitle>
						<DialogDescription>
							Set a password for {driver.name} to access the driver inspection app.
						</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<Label>New Password</Label>
						<Input
							type='password'
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder='Enter new password'
						/>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setShowPasswordDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleSetPassword} disabled={!newPassword}>
							Set Password
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add/Edit File Dialog */}
			<Dialog
				open={showFileDialog}
				onOpenChange={(open) => {
					setShowFileDialog(open);
					if (!open) {
						setEditingFile(null);
						setNewFile({
							type: 'license',
							expiry_date: '',
						});
						setSelectedFile(null);
					}
				}}
			>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>
							{editingFile ? 'Edit Document' : 'Add New Document'}
						</DialogTitle>
						<DialogDescription>
							{editingFile
								? 'Update document information and upload a new file if needed.'
								: 'Add a new document for this driver.'}
						</DialogDescription>
					</DialogHeader>
					<div className='grid grid-cols-2 gap-4 py-4'>
						<div>
							<Label>Document Type</Label>
							<Select
								value={editingFile ? editingFile.type : newFile.type}
								onValueChange={(value) =>
									editingFile
										? setEditingFile({ ...editingFile, type: value })
										: setNewFile({ ...newFile, type: value as any })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='license'>License</SelectItem>
									<SelectItem value='visa'>Visa</SelectItem>
									<SelectItem value='certification'>Certification</SelectItem>
									<SelectItem value='other'>Other</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Document Number</Label>
							<Input
								value={
									editingFile ? editingFile.document_number || '' : newFile.document_number || ''
								}
								onChange={(e) =>
									editingFile
										? setEditingFile({ ...editingFile, document_number: e.target.value })
										: setNewFile({ ...newFile, document_number: e.target.value })
								}
								placeholder='e.g., DL123456'
							/>
						</div>
						<div>
							<Label>Issue Date</Label>
							<Input
								type='date'
								value={editingFile ? editingFile.issue_date || '' : newFile.issue_date || ''}
								onChange={(e) =>
									editingFile
										? setEditingFile({ ...editingFile, issue_date: e.target.value })
										: setNewFile({ ...newFile, issue_date: e.target.value })
								}
							/>
						</div>
						<div>
							<Label>Expiry Date *</Label>
							<Input
								type='date'
								value={editingFile ? editingFile.expiry_date : newFile.expiry_date}
								onChange={(e) =>
									editingFile
										? setEditingFile({ ...editingFile, expiry_date: e.target.value })
										: setNewFile({ ...newFile, expiry_date: e.target.value })
								}
								required
							/>
						</div>
						<div className='col-span-2'>
							<Label>Notes</Label>
							<Input
								value={editingFile ? editingFile.notes || '' : newFile.notes || ''}
								onChange={(e) =>
									editingFile
										? setEditingFile({ ...editingFile, notes: e.target.value })
										: setNewFile({ ...newFile, notes: e.target.value })
								}
								placeholder='Additional notes...'
							/>
						</div>
						<div className='col-span-2'>
							<Label>Upload File</Label>
							<div className='flex items-center gap-2'>
								<Input
									type='file'
									onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
									accept='image/*,.pdf'
								/>
								{selectedFile && (
									<Badge className='bg-green-500'>{selectedFile.name}</Badge>
								)}
							</div>
							{editingFile && editingFile.file_url && !selectedFile && (
								<p className='text-sm text-gray-500 mt-2'>
									Current file:{' '}
									<a
										href={editingFile.file_url}
										target='_blank'
										rel='noopener noreferrer'
										className='text-blue-600 hover:underline'
									>
										View current file
									</a>
								</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setShowFileDialog(false);
								setEditingFile(null);
								setNewFile({
									type: 'license',
									expiry_date: '',
								});
								setSelectedFile(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={editingFile ? handleUpdateFile : handleAddFile}
							disabled={
								editingFile
									? !editingFile.expiry_date
									: !newFile.expiry_date
							}
						>
							{editingFile ? 'Update' : 'Add'} Document
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
