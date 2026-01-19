'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api/client';
import { calculateDocumentStatus } from '@/lib/helpers';
import { useDriver } from '@/hooks/use-drivers';
import {
	notify,
	handleApiError,
	successMessages,
	errorMessages,
} from '@/lib/notifications';
import {
	validateDriverFields,
	hasValidationErrors,
	type DriverValidationErrors,
} from '@/lib/validation';

// Import extracted components
import { DocumentInfoCard } from './components/DocumentInfoCard';
import { SetPasswordDialog } from './components/SetPasswordDialog';
import { DriverHeader } from './components/DriverHeader';
import { BasicInformationCard } from './components/BasicInformationCard';

export default function DriverDetailPage() {
	const params = useParams();
	const router = useRouter();
	const driverId = params.id ? parseInt(params.id as string) : null;

	const {
		driver,
		isLoading: driverLoading,
		refetch: refetchDriver,
	} = useDriver(driverId);
	console.log('🚀 => DriverDetailPage => driver:', driver);

	const [isEditing, setIsEditing] = useState(false);
	const [editedDriver, setEditedDriver] = useState<any>(null);
	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
		useState(false);
	const [validationErrors, setValidationErrors] =
		useState<DriverValidationErrors>({});

	useEffect(() => {
		if (driver) {
			// Copy all driver data including document fields
			setEditedDriver({
				...driver,
				license_number: driver.license_number || '',
				license_expiry_date: driver.license_expiry_date || '',
				visa_number: driver.visa_number || '',
				visa_expiry_date: driver.visa_expiry_date || '',
			});
		}
	}, [driver]);

	// Check if there are any changes
	const hasChanges = useMemo((): boolean => {
		if (!driver || !editedDriver) return false;

		const fieldsToCompare = [
			'name',
			'phone',
			'email',
			'address',
			'amazon_id',
			'license_number',
			'license_expiry_date',
			'visa_number',
			'visa_expiry_date',
		] as const;

		return fieldsToCompare.some((field) => {
			const originalValue = (driver as any)[field] || '';
			const editedValue = editedDriver[field] || '';
			return originalValue !== editedValue;
		});
	}, [driver, editedDriver]);

	// Validate fields whenever editedDriver changes
	useEffect(() => {
		if (isEditing && editedDriver) {
			const errors = validateDriverFields({
				email: editedDriver.email,
				phone: editedDriver.phone,
			});
			setValidationErrors(errors);
		}
	}, [editedDriver, isEditing]);

	const handleSaveDriver = async () => {
		if (!driverId || !editedDriver) {
			console.error('❌ Cannot save: missing driverId or editedDriver');
			return;
		}

		// Check for validation errors
		if (hasValidationErrors(validationErrors)) {
			notify.error('Please fix validation errors before saving');
			return;
		}

		console.log('💾 Saving driver with documents:', editedDriver);
		console.log('📊 Original driver data:', driver);

		try {
			// Use new updateDriverWithFiles API (multipart/form-data)
			const updateData: any = {
				name: editedDriver.name,
				phone: editedDriver.phone,
				email: editedDriver.email,
				address: editedDriver.address,
				amazon_id: editedDriver.amazon_id,
				// deputy_id is auto-synced from Deputy, not editable
			};

			// Always include document fields if they have values
			if (editedDriver.license_number) {
				updateData.license_number = editedDriver.license_number;
			}
			if (editedDriver.license_expiry_date) {
				updateData.license_expiry_date =
					editedDriver.license_expiry_date;
			}
			if (editedDriver.visa_number) {
				updateData.visa_number = editedDriver.visa_number;
			}
			if (editedDriver.visa_expiry_date) {
				updateData.visa_expiry_date = editedDriver.visa_expiry_date;
			}

			console.log('📤 Update data being sent:', updateData);
			console.log('🔍 Document fields:', {
				license_number: updateData.license_number,
				license_expiry_date: updateData.license_expiry_date,
				visa_number: updateData.visa_number,
				visa_expiry_date: updateData.visa_expiry_date,
			});

			const result = await apiClient.updateDriverWithFiles(
				driverId,
				updateData
			);
			console.log('✅ Update successful, result:', result);
			console.log('🔍 Result document fields:', {
				license_number: result.license_number,
				license_expiry_date: result.license_expiry_date,
				visa_number: result.visa_number,
				visa_expiry_date: result.visa_expiry_date,
			});

			console.log('🔄 Calling refetchDriver...');
			await refetchDriver();
			console.log('✅ Driver refetched');

			// Log the driver state after refetch
			console.log('🔍 Driver state after refetch:', {
				license_number: driver?.license_number,
				license_expiry_date: driver?.license_expiry_date,
				visa_number: driver?.visa_number,
				visa_expiry_date: driver?.visa_expiry_date,
				deputy_id: driver?.deputy_id,
			});

			setIsEditing(false);
			notify.success(successMessages.driver.updated(driver?.name));
		} catch (error: any) {
			console.error('❌ Failed to update driver:', error);
			console.error('❌ Error details:', error.response?.data);
			handleApiError(
				error,
				errorMessages.driver.updateFailed(driver?.name)
			);
		}
	};

	const handleSetPassword = async (password: string) => {
		if (!driverId || !password) return;

		try {
			await apiClient.setDriverPassword(driverId, password);
			await refetchDriver();
			notify.success(successMessages.driver.passwordSet(driver?.name));
		} catch (error) {
			console.error('Failed to set password:', error);
			handleApiError(
				error,
				errorMessages.driver.passwordFailed(driver?.name)
			);
			throw error; // Re-throw to let dialog handle it
		}
	};

	const handleFileUpload = async (
		type: 'license' | 'visa',
		file: File | null,
		expiryDate: string,
		documentNumber?: string
	) => {
		if (!driverId || !file) {
			notify.error('Missing driver ID or file');
			return;
		}

		console.log('🔄 handleFileUpload called:', {
			type,
			file: file.name,
			expiryDate,
			documentNumber,
		});

		try {
			// Step 1: Upload file to MinIO/Wasabi using new file upload API
			console.log('📤 Step 1: Uploading file to storage...');
			const fileRecord = await apiClient.uploadFile(file, 'drivers');
			console.log('✅ File uploaded successfully!');
			console.log('📋 File record:', fileRecord);
			console.log('🔗 File URL:', fileRecord.file_url);

			// Step 2: Get current file URLs array
			console.log('📤 Step 2: Getting current files...');
			const currentFiles =
				type === 'license'
					? driver?.license_file_url || []
					: driver?.visa_file_url || [];
			console.log('📋 Current files:', currentFiles);

			// Step 3: Prepare updated files array based on type
			console.log('📤 Step 3: Preparing updated files array...');
			// License: allows multiple files (add to array)
			// Visa: only one file (replace array)
			const updatedFiles =
				type === 'license'
					? [...currentFiles, fileRecord.file_url] // Add to existing
					: [fileRecord.file_url]; // Replace with new file only
			console.log('📋 Updated files array:', updatedFiles);

			// Step 4: Prepare FormData for multipart/form-data request
			console.log('📤 Step 4: Preparing FormData...');
			const formData = new FormData();

			// Backend expects JSON string for file URLs
			if (type === 'license') {
				formData.append(
					'license_file_url',
					JSON.stringify(updatedFiles)
				);
				if (documentNumber !== undefined && documentNumber !== '') {
					formData.append('license_number', documentNumber);
				}
				if (expiryDate) {
					formData.append('license_expiry_date', expiryDate);
				}
			} else if (type === 'visa') {
				formData.append('visa_file_url', JSON.stringify(updatedFiles));
				if (documentNumber !== undefined && documentNumber !== '') {
					formData.append('visa_number', documentNumber);
				}
				if (expiryDate) {
					formData.append('visa_expiry_date', expiryDate);
				}
			}

			console.log('📤 FormData prepared with:');
			Array.from(formData.entries()).forEach(([key, value]) => {
				console.log(`  ${key}:`, value);
			});

			// Step 5: Update driver record with new file URLs using FormData
			console.log('📤 Step 5: Calling updateDriver API with FormData...');
			console.log('🔍 Request details:', {
				driverId,
				contentType: 'multipart/form-data',
			});

			const updatedDriver = await apiClient.updateDriverWithFormData(
				driverId,
				formData
			);

			console.log('✅ Driver updated successfully!');
			console.log('📋 Response:', JSON.stringify(updatedDriver, null, 2));
			console.log('🔍 File URLs in response:', {
				license_file_url: updatedDriver.license_file_url,
				visa_file_url: updatedDriver.visa_file_url,
			});

			// Step 6: Refetch driver data to update UI
			console.log('📤 Step 6: Refetching driver data...');
			await refetchDriver();
			console.log('✅ Driver data refetched successfully!');

			// Show success notification
		} catch (error: any) {
			console.error('❌ Upload failed:', error);
			console.error('❌ Error details:', error.response?.data);
			handleApiError(
				error,
				`Failed to upload ${type === 'license' ? 'license' : 'visa'} file`
			);
			throw error;
		}
	};

	const handleDeleteFile = async (
		type: 'license' | 'visa',
		fileUrl: string
	) => {
		if (!driverId) return;

		console.log('🗑️ handleDeleteFile called:', { type, fileUrl });

		try {
			// Get current files
			const currentFiles =
				type === 'license'
					? driver?.license_file_url || []
					: driver?.visa_file_url || [];
			console.log('📋 Current files:', currentFiles);

			// Remove the file URL from array
			const updatedFiles = currentFiles.filter((url) => url !== fileUrl);
			console.log('📋 Updated files after removal:', updatedFiles);

			// Prepare FormData for multipart/form-data request
			const formData = new FormData();

			// Backend expects JSON string for file URLs
			if (type === 'license') {
				formData.append(
					'license_file_url',
					JSON.stringify(updatedFiles)
				);
			} else {
				formData.append('visa_file_url', JSON.stringify(updatedFiles));
			}

			console.log('📤 Updating driver with FormData...');
			Array.from(formData.entries()).forEach(([key, value]) => {
				console.log(`  ${key}:`, value);
			});

			await apiClient.updateDriverWithFormData(driverId, formData);

			console.log('🔄 Refetching driver data...');
			await refetchDriver();

			notify.success(
				successMessages.driver.fileDeleted(
					driver?.name,
					type === 'license' ? 'license' : 'visa'
				)
			);
		} catch (error) {
			console.error('❌ Failed to delete file:', error);
			handleApiError(
				error,
				errorMessages.driver.fileDeleteFailed(
					driver?.name,
					type === 'license' ? 'license' : 'visa'
				)
			);
			throw error;
		}
	};

	const handleToggleActive = async (checked: boolean) => {
		if (!driverId) return;

		console.log('🔄 handleToggleActive called:', checked);

		try {
			const formData = new FormData();
			formData.append('is_active', checked.toString());

			console.log('📤 Updating driver is_active status...');
			await apiClient.updateDriverWithFormData(driverId, formData);

			console.log('🔄 Refetching driver data...');
			await refetchDriver();

			notify.success(
				`Driver ${driver?.name} has been ${checked ? 'activated' : 'deactivated'}`
			);
		} catch (error) {
			console.error('❌ Failed to update driver status:', error);
			handleApiError(
				error,
				`Failed to ${checked ? 'activate' : 'deactivate'} driver ${driver?.name}`
			);
			throw error;
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

	const handleBack = () => {
		if (isEditing && hasChanges) {
			setShowUnsavedChangesDialog(true);
		} else {
			router.push('/drivers');
		}
	};

	const handleDiscardChanges = () => {
		setShowUnsavedChangesDialog(false);
		setIsEditing(false);
		setEditedDriver(driver);
		router.push('/drivers');
	};

	const handleSaveAndExit = async () => {
		await handleSaveDriver();
		setShowUnsavedChangesDialog(false);
		router.push('/drivers');
	};

	if (driverLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>
						Loading driver details...
					</p>
				</div>
			</div>
		);
	}

	if (!driver) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-gray-600'>Driver not found</p>
					<Button
						onClick={() => router.push('/drivers')}
						className='mt-4'>
						Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				{/* Header */}
				<DriverHeader
					driverName={driver.name}
					isEditing={isEditing}
					hasChanges={
						hasChanges && !hasValidationErrors(validationErrors)
					}
					onBack={handleBack}
					onSetPassword={() => setShowPasswordDialog(true)}
					onEdit={() => {
						console.log('🖱️ Edit button clicked!');
						console.log('📊 Current driver state:', driver);
						setIsEditing(true);
					}}
					onSave={() => {
						console.log('🖱️ Save button clicked!');
						handleSaveDriver();
					}}
					onCancel={() => {
						setIsEditing(false);
						setEditedDriver(driver);
						setValidationErrors({});
					}}
				/>

				{/* Driver Information */}
				<div className='w-full space-y-6'>
					{/* Basic Information Card */}
					<BasicInformationCard
						driver={driver}
						editedDriver={editedDriver}
						isEditing={isEditing}
						validationErrors={validationErrors}
						onEdit={(field, value) => {
							setEditedDriver({
								...editedDriver,
								[field]: value,
							});
						}}
						onToggleActive={handleToggleActive}
					/>

					{/* Documents Information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<DocumentInfoCard
							type='license'
							title='Driver License'
							driver={driver}
							editedDriver={editedDriver}
							isLoading={driverLoading}
							isEditing={isEditing}
							getStatusBadge={getStatusBadge}
							onEdit={(field, value) => {
								console.log(
									'✏️ Editing license field:',
									field,
									'=',
									value
								);
								setEditedDriver({
									...editedDriver,
									[field]: value,
								});
							}}
							onDeleteFile={handleDeleteFile}
							onUpload={handleFileUpload}
						/>
						<DocumentInfoCard
							type='visa'
							title='Visa'
							driver={driver}
							editedDriver={editedDriver}
							isLoading={driverLoading}
							isEditing={isEditing}
							getStatusBadge={getStatusBadge}
							onEdit={(field, value) => {
								console.log(
									'✏️ Editing visa field:',
									field,
									'=',
									value
								);
								setEditedDriver({
									...editedDriver,
									[field]: value,
								});
							}}
							onDeleteFile={handleDeleteFile}
							onUpload={handleFileUpload}
						/>
					</div>
				</div>
			</div>

			{/* Set Password Dialog */}
			<SetPasswordDialog
				open={showPasswordDialog}
				onOpenChange={setShowPasswordDialog}
				driverName={driver.name}
				onSetPassword={handleSetPassword}
			/>

			{/* Unsaved Changes Dialog */}
			<Dialog
				open={showUnsavedChangesDialog}
				onOpenChange={setShowUnsavedChangesDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Unsaved Changes</DialogTitle>
						<DialogDescription>
							You have unsaved changes. Do you want to save them
							before leaving?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className='flex gap-2'>
						<Button
							variant='outline'
							onClick={handleDiscardChanges}>
							Discard Changes
						</Button>
						<Button
							onClick={handleSaveAndExit}
							className='bg-blue-700 hover:bg-blue-800'>
							Save & Exit
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
