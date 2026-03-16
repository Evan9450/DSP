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

interface DeleteVehicleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	vehicleRego?: string;
}

export function DeleteVehicleDialog({
	open,
	onOpenChange,
	onConfirm,
	vehicleRego,
}: DeleteVehicleDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Archive Vehicle</DialogTitle>
					<DialogDescription>
						Are you sure you want to archive vehicle{' '}
						<span className='font-semibold'>{vehicleRego}</span>?
						This will logically delete the vehicle.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button variant='destructive' onClick={onConfirm}>
						Archive Vehicle
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
