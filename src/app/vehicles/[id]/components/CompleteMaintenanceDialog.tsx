import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { VehicleMaintenanceComplete, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface CompleteMaintenanceDialogProps {
	vehicleId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
	defaultSupplier?: {
		id: number;
		name: string;
	};
}

export function CompleteMaintenanceDialog({
	vehicleId,
	open,
	onOpenChange,
	onSuccess,
	defaultSupplier,
}: CompleteMaintenanceDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<VehicleMaintenanceComplete>({
		maintenance_date: new Date().toISOString().split('T')[0],
	});

	// Initialize supplier from default if available
	useEffect(() => {
		if (open && defaultSupplier) {
			setFormData(prev => ({
				...prev,
				supplier_id: defaultSupplier.id
			}));
		}
	}, [open, defaultSupplier]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.maintenance_date) {
			toast({
				title: 'Error',
				description: 'Maintenance date is required.',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await apiClient.completeMaintenance(vehicleId, formData);
			toast({
				title: 'Success',
				description: 'Maintenance completed successfully.',
			});
			onSuccess();
			onOpenChange(false);
			// Reset form
			setFormData({
				maintenance_date: new Date().toISOString().split('T')[0],
				supplier_id: defaultSupplier?.id
			});
		} catch (error) {
			console.error('Failed to complete maintenance:', error);
			toast({
				title: 'Error',
				description: 'Failed to complete maintenance.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Complete Maintenance</DialogTitle>
					<DialogDescription>
						Confirm maintenance completion. This will update the vehicle schedule and create a history record.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="complete-date">Date</Label>
							<Input
								id="complete-date"
								type="date"
								value={formData.maintenance_date}
								onChange={(e) =>
									setFormData({
										...formData,
										maintenance_date: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="complete-description">Description</Label>
							<Input
								id="complete-description"
								placeholder="e.g. Regular Service, Brake Pad Replacement"
								value={formData.description || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										description: e.target.value,
									})
								}
							/>
						</div>

						{defaultSupplier && (
							<div className="space-y-2">
								<Label>Service Provider</Label>
								<div className="p-2 border rounded-md bg-muted text-sm font-medium">
									{defaultSupplier.name}
								</div>
							</div>
						)}

						{/* Only show location if no supplier is set (fallback) */}
						{!defaultSupplier && (
							<div className="space-y-2">
								<Label htmlFor="complete-location">Location</Label>
								<Input
									id="complete-location"
									placeholder="Workshop address or name"
									value={formData.location || ''}
									onChange={(e) =>
										setFormData({
											...formData,
											location: e.target.value,
										})
									}
								/>
							</div>
						)}
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
							{isSubmitting ? 'Saving...' : 'Confirm Completion'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
