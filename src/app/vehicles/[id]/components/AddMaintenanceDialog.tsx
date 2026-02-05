import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { VehicleMaintenanceCreate, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RepairSupplierSelect } from './repair-supplier-select';
import { useToast } from '@/components/ui/use-toast';

interface AddMaintenanceDialogProps {
	vehicleId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function AddMaintenanceDialog({
	vehicleId,
	open,
	onOpenChange,
	onSuccess,
}: AddMaintenanceDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newRecord, setNewRecord] = useState<Partial<VehicleMaintenanceCreate>>({
		maintenance_date: new Date().toISOString().split('T')[0],
	});

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			setNewRecord({
				maintenance_date: new Date().toISOString().split('T')[0],
			});
		}
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		console.log('Form submitted, supplier_id:', newRecord.supplier_id);

		if (!newRecord.maintenance_date) {
			toast({
				title: 'Error',
				description: 'Date is required.',
				variant: 'destructive',
			});
			return;
		}

		if (!newRecord.supplier_id || newRecord.supplier_id === 0) {
			console.log('Supplier validation failed');
			toast({
				title: 'Error',
				description: 'Service provider is required.',
				variant: 'destructive',
			});
			return;
		}

		try {
			setIsSubmitting(true);
			await apiClient.createVehicleMaintenanceRecord(vehicleId, {
				...newRecord,
				vehicle_id: vehicleId,
				maintenance_date: newRecord.maintenance_date!,
				supplier_id: newRecord.supplier_id,
			} as any);
			toast({
				title: 'Success',
				description: 'Repair record added successfully.',
			});
			onSuccess();
			onOpenChange(false);
		} catch (error) {
			console.error('Failed to add repair record:', error);
			toast({
				title: 'Error',
				description: 'Failed to add repair record.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Repair Record</DialogTitle>
					<DialogDescription>
						Record a completed repair event.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="add-date">Date</Label>
							<Input
								id="add-date"
								type="date"
								value={newRecord.maintenance_date}
								onChange={(e) =>
									setNewRecord({
										...newRecord,
										maintenance_date: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="add-description">Description</Label>
							<Input
								id="add-description"
								placeholder="e.g. Oil Change, Tyre Replacement"
								value={newRecord.description || ''}
								onChange={(e) =>
									setNewRecord({ ...newRecord, description: e.target.value })
								}
							/>
						</div>

						<div className="space-y-2">
							<Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
								Service Provider
							</Label>
							<RepairSupplierSelect
								value={newRecord.supplier_id}
								onValueChange={(value) =>
									setNewRecord({ ...newRecord, supplier_id: value })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Adding...' : 'Add Record'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
