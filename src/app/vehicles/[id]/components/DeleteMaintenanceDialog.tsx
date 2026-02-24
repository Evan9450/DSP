'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceRecord {
	id: number;
	maintenance_date: string;
	location?: string;
	description?: string;
	cost?: number | string;
	supplier_id?: number;
	supplier?: {
		id: number;
		name: string;
	};
}

interface DeleteMaintenanceProps {
	showDeleteDialog: boolean;
	setShowDeleteDialog: (open: boolean) => void;
	recordToDelete: MaintenanceRecord | null;
	setRecordToDelete: (record: MaintenanceRecord | null) => void;
	handleDeleteRecord: () => void;
}

const DeleteMaintenanceDialog = ({
	showDeleteDialog,
	setShowDeleteDialog,
	recordToDelete,
	setRecordToDelete,
	handleDeleteRecord,
}: DeleteMaintenanceProps) => {
	return (
		<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Maintenance Record</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this maintenance record? This action
						cannot be undone.
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
									{recordToDelete?.description || 'Maintenance Record'}
								</p>
								<p className='text-sm text-gray-600 truncate'>
									{recordToDelete?.maintenance_date ? format(new Date(recordToDelete.maintenance_date), 'dd/MM/yyyy') : 'Unknown Date'}
									{recordToDelete?.location && ` - ${recordToDelete.location}`}
									{recordToDelete?.supplier?.name && ` - ${recordToDelete.supplier.name}`}
								</p>
								<p className='text-sm text-gray-600 mt-1'>
									This record will be permanently deleted.
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
							setRecordToDelete(null);
						}}>
						Cancel
					</Button>
					<Button variant='destructive' onClick={handleDeleteRecord}>
						<Trash2 className='h-4 w-4 mr-2' />
						Delete Record
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteMaintenanceDialog;
