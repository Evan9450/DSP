'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { notify, handleApiError, successMessages, errorMessages } from '@/lib/notifications';
import {
	validateDriverFields,
	hasValidationErrors,
	type DriverValidationErrors,
} from '@/lib/validation';

// Import extracted components
import { DocumentInfoCard } from './components/DocumentInfoCard';
import { DocumentUploadCard } from './components/DocumentUploadCard';
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
	const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
	const [validationErrors, setValidationErrors] = useState<DriverValidationErrors>({});

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
	const hasChanges = useMemo(() => {
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
		];

		return fieldsToCompare.some((field) => {
			const originalValue = driver[field] || '';
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
			handleApiError(error, errorMessages.driver.updateFailed(driver?.name));
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
			handleApiError(error, errorMessages.driver.passwordFailed(driver?.name));
			throw error; // Re-throw to let dialog handle it
		}
	};

	const handleFileUpload = async (
		type: 'license' | 'visa',
		file: File | null,
		expiryDate: string,
		documentNumber?: string
	) => {
		if (!driverId || !file) return;

		console.log('🔄 handleFileUpload called:', {
			type,
			file,
			expiryDate,
			documentNumber,
		});

		try {
			// Use new unified update API
			const updateData: any = {};

			if (type === 'license') {
				if (file) updateData.license_file = file;
				if (documentNumber !== undefined && documentNumber !== '') {
					updateData.license_number = documentNumber;
				}
				if (expiryDate) updateData.license_expiry_date = expiryDate;
			} else if (type === 'visa') {
				if (file) updateData.visa_file = file;
				if (documentNumber !== undefined && documentNumber !== '') {
					updateData.visa_number = documentNumber;
				}
				if (expiryDate) updateData.visa_expiry_date = expiryDate;
			}

			console.log('📤 Calling updateDriverWithFiles with:', updateData);
			const updatedDriver = await apiClient.updateDriverWithFiles(
				driverId,
				updateData
			);
			console.log(
				'✅ updateDriverWithFiles completed, response:',
				updatedDriver
			);

			console.log('🔄 Refetching driver data...');
			await refetchDriver();
			console.log('✅ Driver data refetched');
		} catch (error) {
			console.error('❌ Failed to upload file:', error);
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
				<DriverHeader
					driverName={driver.name}
					isEditing={isEditing}
					hasChanges={hasChanges && !hasValidationErrors(validationErrors)}
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
						/>
					</div>

					{/* Document Files Management */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FileText className='h-5 w-5' />
								Document Files
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<DocumentUploadCard
									type='license'
									title='Driver License'
									driver={driver}
									onUpload={handleFileUpload}
								/>
								<DocumentUploadCard
									type='visa'
									title='Visa'
									driver={driver}
									onUpload={handleFileUpload}
								/>
							</div>
						</CardContent>
					</Card>
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
			<Dialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Unsaved Changes</DialogTitle>
						<DialogDescription>
							You have unsaved changes. Do you want to save them before leaving?
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
