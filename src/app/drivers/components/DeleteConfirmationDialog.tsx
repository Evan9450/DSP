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

interface Driver {
	id: string;
	name: string;
}
interface DeleteConfirmationProps {
	showDeleteDialog: boolean;
	setShowDeleteDialog: (open: boolean) => void;
	driverToDelete: Driver | null;
	setDriverToDelete: (driver: Driver | null) => void;
	handleDeleteDriver: () => void;
}
const DeleteConfirmationDialog = ({
	showDeleteDialog,
	setShowDeleteDialog,
	driverToDelete,
	setDriverToDelete,
	handleDeleteDriver,
}: DeleteConfirmationProps) => {
	return (
		<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Driver</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this driver? This action
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
									{driverToDelete?.name}
								</p>
								<p className='text-sm text-gray-600'>
									This driver and all associated data will be
									permanently deleted.
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
					<Button variant='destructive' onClick={handleDeleteDriver}>
						<Trash2 className='h-4 w-4 mr-2' />
						Delete Driver
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteConfirmationDialog;
