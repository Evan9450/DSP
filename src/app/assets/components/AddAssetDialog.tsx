'use client';

import { Plus } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { apiClient, ProductCreate } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';

interface AddAssetDialogProps {
	onSuccess?: () => void;
}

const AddAssetDialog = ({ onSuccess }: AddAssetDialogProps) => {
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<ProductCreate>({
		name: '',
		description: '',
		min_stock_threshold: 5,
		available_stock: 0,
	});

	const handleSubmit = async () => {
		// Validation
		if (!formData.name || formData.name.trim() === '') {
			toast({
				title: 'Error',
				description: 'Please enter a product name',
				variant: 'destructive',
			});
			return;
		}

		try {
			setIsSubmitting(true);

			// Create the product with initial stock
			await apiClient.createProduct({
				name: formData.name,
				description: formData.description || undefined,
				min_stock_threshold: formData.min_stock_threshold,
				available_stock: formData.available_stock,
			});

			toast({
				title: 'Success',
				description: `Product "${formData.name}" added successfully${formData.available_stock && formData.available_stock > 0 ? ` with ${formData.available_stock} units` : ''}`,
			});

			// Reset form
			setFormData({
				name: '',
				description: '',
				min_stock_threshold: 5,
				available_stock: 0,
			});

			setOpen(false);

			// Trigger refresh
			if (onSuccess) {
				onSuccess();
			}
		} catch (error: any) {
			console.error('Failed to create product:', error);
			toast({
				title: 'Error',
				description: error.response?.data?.detail || 'Failed to add product',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className='bg-blue-700 hover:bg-blue-800 w-40'>
					<Plus className='h-4 w-4 mr-2' />
					Add Asset
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Product</DialogTitle>
					<DialogDescription>
						Add a new product to the inventory
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>
							Product Name <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='name'
							placeholder='Enter product name'
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='description'>Description (Optional)</Label>
						<Input
							id='description'
							placeholder='Enter product description'
							value={formData.description || ''}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='availableStock'>Initial Stock Quantity</Label>
						<Input
							id='availableStock'
							type='number'
							min='0'
							placeholder='0'
							value={formData.available_stock || ''}
							onChange={(e) =>
								setFormData({
									...formData,
									available_stock: e.target.value
										? parseInt(e.target.value)
										: 0,
								})
							}
						/>
						<p className='text-xs text-gray-500'>
							Initial stock quantity for this product
						</p>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='minThreshold'>Low Stock Threshold</Label>
						<Input
							id='minThreshold'
							type='number'
							min='0'
							placeholder='5'
							value={formData.min_stock_threshold || ''}
							onChange={(e) =>
								setFormData({
									...formData,
									min_stock_threshold: e.target.value
										? parseInt(e.target.value)
										: 5,
								})
							}
						/>
						<p className='text-xs text-gray-500'>
							Alert when stock falls below this level
						</p>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setOpen(false)}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
						className='bg-blue-700 hover:bg-blue-800'>
						{isSubmitting ? 'Adding...' : 'Add Product'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddAssetDialog;
