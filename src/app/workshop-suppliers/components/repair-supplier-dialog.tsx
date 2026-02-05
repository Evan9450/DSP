'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	RepairSupplierCreate,
	RepairSupplierResponse,
	RepairSupplierUpdate,
	apiClient,
} from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface RepairSupplierDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	supplier?: RepairSupplierResponse | null;
	onSuccess: () => void;
}

export function RepairSupplierDialog({
	open,
	onOpenChange,
	supplier,
	onSuccess,
}: RepairSupplierDialogProps) {
	const { toast } = useToast();
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState<
		Partial<RepairSupplierCreate | RepairSupplierUpdate>
	>({
		name: '',
		location: '',
		email: '',
		phone: '',
		notes: '',
		is_active: true,
	});

	useEffect(() => {
		if (supplier) {
			setFormData({
				name: supplier.name,
				location: supplier.location || '',
				email: supplier.email || '',
				phone: supplier.phone || '',
				notes: supplier.notes || '',
				is_active: supplier.is_active,
			});
		} else {
			setFormData({
				name: '',
				location: '',
				email: '',
				phone: '',
				notes: '',
				is_active: true,
			});
		}
	}, [supplier, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name?.trim()) {
			toast({
				title: 'Error',
				description: 'Supplier name is required.',
				variant: 'destructive',
			});
			return;
		}

		setIsSaving(true);
		try {
			if (supplier) {
				// Update existing supplier
				await apiClient.updateRepairSupplier(
					supplier.id,
					formData as RepairSupplierUpdate,
				);
				toast({
					title: 'Success',
					description: 'Supplier updated successfully.',
				});
			} else {
				// Create new supplier
				await apiClient.createRepairSupplier(
					formData as RepairSupplierCreate,
				);
				toast({
					title: 'Success',
					description: 'Supplier created successfully.',
				});
			}
			onSuccess();
		} catch (error) {
			console.error('Failed to save supplier:', error);
			toast({
				title: 'Error',
				description: `Failed to ${supplier ? 'update' : 'create'} supplier.`,
				variant: 'destructive',
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>
						{supplier ? 'Edit Supplier' : 'Add New Supplier'}
					</DialogTitle>
					<DialogDescription>
						{supplier
							? 'Update the supplier information below.'
							: 'Enter the details for the new repair supplier.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className='space-y-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>
								Name <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='name'
								value={formData.name || ''}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder='ABC Auto Repair'
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='location'>Location</Label>
							<Input
								id='location'
								value={formData.location || ''}
								onChange={(e) =>
									setFormData({ ...formData, location: e.target.value })
								}
								placeholder='123 Main St, City'
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={formData.email || ''}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder='contact@example.com'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='phone'>Phone</Label>
								<Input
									id='phone'
									type='tel'
									value={formData.phone || ''}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									placeholder='(123) 456-7890'
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='notes'>Notes</Label>
							<Textarea
								id='notes'
								value={formData.notes || ''}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								placeholder='Additional notes...'
								rows={3}
							/>
						</div>

						{/* <div className='flex items-center space-x-2'>
							<Checkbox
								id='is_active'
								checked={formData.is_active}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, is_active: checked as boolean })
								}
							/>
							<Label htmlFor='is_active' className='cursor-pointer'>
								Active
							</Label>
						</div> */}
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isSaving}>
							Cancel
						</Button>
						<Button type='submit' disabled={isSaving}>
							{isSaving ? 'Saving...' : supplier ? 'Update' : 'Create'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
