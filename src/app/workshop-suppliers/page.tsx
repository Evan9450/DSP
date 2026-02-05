'use client';

import {
	Building2,
	Mail,
	MapPin,
	MoreVertical,
	Phone,
	Plus,
	Search,
	Trash2,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { RepairSupplierResponse, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RepairSupplierDialog } from './components/repair-supplier-dialog';
import { useToast } from '@/components/ui/use-toast';

export default function RepairSuppliersPage() {
	const { toast } = useToast();
	const [suppliers, setSuppliers] = useState<RepairSupplierResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [editingSupplier, setEditingSupplier] =
		useState<RepairSupplierResponse | null>(null);
	const [deletingSupplier, setDeletingSupplier] =
		useState<RepairSupplierResponse | null>(null);

	useEffect(() => {
		fetchSuppliers();
	}, []);

	const fetchSuppliers = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getRepairSuppliers();
			setSuppliers(data);
		} catch (error) {
			console.error('Failed to fetch repair suppliers:', error);
			toast({
				title: 'Error',
				description: 'Failed to load repair suppliers.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!deletingSupplier) return;

		try {
			await apiClient.deleteRepairSupplier(deletingSupplier.id);
			toast({
				title: 'Success',
				description: `Supplier "${deletingSupplier.name}" deleted successfully.`,
			});
			setDeletingSupplier(null);
			fetchSuppliers();
		} catch (error) {
			console.error('Failed to delete supplier:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete supplier.',
				variant: 'destructive',
			});
		}
	};

	const filteredSuppliers = suppliers.filter((supplier) =>
		supplier.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				{/* Header */}
				<div className='mb-6'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>
						Workshop Suppliers
					</h1>
				</div>

				{/* Actions Bar */}
				<Card className='p-4 mb-6'>
					<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
						<div className='relative flex-1 w-full sm:max-w-md'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
							<Input
								placeholder='Search suppliers...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
						<Button onClick={() => setShowAddDialog(true)}>
							<Plus className='h-4 w-4 mr-2' />
							Add Supplier
						</Button>
					</div>
				</Card>

				{/* Suppliers Table */}
				<Card>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Contact</TableHead>
									{/* <TableHead>Status</TableHead> */}
									<TableHead className='w-[50px]'></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={5} className='text-center py-8'>
											<div className='flex items-center justify-center'>
												<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700'></div>
											</div>
										</TableCell>
									</TableRow>
								) : filteredSuppliers.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className='text-center py-8'>
											<Building2 className='h-12 w-12 text-gray-400 mx-auto mb-2' />
											<p className='text-gray-500'>
												{searchTerm
													? 'No suppliers found'
													: 'No suppliers yet'}
											</p>
										</TableCell>
									</TableRow>
								) : (
									filteredSuppliers.map((supplier) => (
										<TableRow key={supplier.id}>
											<TableCell>
												<div className='font-medium'>{supplier.name}</div>
											</TableCell>
											<TableCell>
												{supplier.location ? (
													<div className='flex items-center gap-1 text-sm text-gray-600'>
														<MapPin className='h-3 w-3' />
														{supplier.location}
													</div>
												) : (
													<span className='text-gray-400'>-</span>
												)}
											</TableCell>
											<TableCell>
												<div className='space-y-1'>
													{supplier.email && (
														<div className='flex items-center gap-1 text-sm text-gray-600'>
															<Mail className='h-3 w-3' />
															{supplier.email}
														</div>
													)}
													{supplier.phone && (
														<div className='flex items-center gap-1 text-sm text-gray-600'>
															<Phone className='h-3 w-3' />
															{supplier.phone}
														</div>
													)}
													{!supplier.email && !supplier.phone && (
														<span className='text-gray-400'>-</span>
													)}
												</div>
											</TableCell>
											{/* <TableCell>
												<Badge
													variant={
														supplier.is_active ? 'default' : 'secondary'
													}>
													{supplier.is_active ? 'Active' : 'Inactive'}
												</Badge>
											</TableCell> */}
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='sm'>
															<MoreVertical className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															onClick={() => setEditingSupplier(supplier)}>
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className='text-red-600'
															onClick={() => setDeletingSupplier(supplier)}>
															<Trash2 className='h-4 w-4 mr-2' />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</Card>
			</div>

			{/* Add/Edit Dialog */}
			<RepairSupplierDialog
				open={showAddDialog || !!editingSupplier}
				onOpenChange={(open) => {
					if (!open) {
						setShowAddDialog(false);
						setEditingSupplier(null);
					}
				}}
				supplier={editingSupplier}
				onSuccess={() => {
					setShowAddDialog(false);
					setEditingSupplier(null);
					fetchSuppliers();
				}}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!deletingSupplier}
				onOpenChange={(open) => !open && setDeletingSupplier(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Supplier</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deletingSupplier?.name}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setDeletingSupplier(null)}>
							Cancel
						</Button>
						<Button variant='destructive' onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
