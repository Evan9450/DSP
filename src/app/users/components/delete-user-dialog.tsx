'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserResponse } from '@/lib/api/client';

interface DeleteUserDialogProps {
	open: boolean;
	user: UserResponse | null;
	onClose: () => void;
	onConfirm: () => void;
}

export function DeleteUserDialog({
	open,
	user,
	onClose,
	onConfirm,
}: DeleteUserDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete User</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete user{' '}
						<span className='font-semibold text-gray-900'>{user?.name}</span> (
						{user?.email})?
						<br />
						<br />
						This action cannot be undone. All data associated with this user will
						be permanently removed.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className='bg-red-600 hover:bg-red-700'>
						Delete User
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
