'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Pencil,
	Plus,
	Shield,
	Trash2,
	UserPlus,
	Users as UsersIcon,
} from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { UserResponse, apiClient } from '@/lib/api/client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteUserDialog } from './components/delete-user-dialog';
import { UserDialog } from './components/user-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-users';

const getRoleBadgeColor = (role: number) => {
	switch (role) {
		case 0:
			return 'bg-red-100 text-red-800 border-red-300';
		case 1:
			return 'bg-blue-100 text-blue-800 border-blue-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
};

const getRoleText = (role: number) => {
	switch (role) {
		case 0:
			return 'Admin';
		case 1:
			return 'Manager';
		default:
			return 'Unknown';
	}
};

const getRoleIcon = (role: number) => {
	switch (role) {
		case 0:
			return Shield;
		case 1:
			return UserPlus;
		default:
			return UsersIcon;
	}
};

export default function UsersPage() {
	const { users, isLoading, refetch } = useUsers();
	const { toast } = useToast();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
	const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

	// Filter out Admin users (role = 0) - only show Manager users
	const managerUsers = users.filter((user) => user.role !== 0);

	const handleAddUser = () => {
		setEditingUser(null);
		setIsDialogOpen(true);
	};

	const handleEditUser = (user: UserResponse) => {
		setEditingUser(user);
		setIsDialogOpen(true);
	};

	const handleDeleteUser = (user: UserResponse) => {
		setDeletingUser(user);
	};

	const handleDialogClose = (success?: boolean) => {
		setIsDialogOpen(false);
		setEditingUser(null);
		if (success) {
			refetch();
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deletingUser) return;

		try {
			await apiClient.deleteUser(deletingUser.id);
			toast({
				title: 'Success',
				description: `User "${deletingUser.name}" has been deleted.`,
			});
			setDeletingUser(null);
			refetch();
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to delete user. Please try again.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto p-6'>
				{/* Header */}
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							User Management
						</h1>
						<p className='text-gray-600 mt-2'>
							Manage system users and their permissions
						</p>
					</div>
					<Button
						onClick={handleAddUser}
						className='bg-blue-700 hover:bg-blue-800'>
						<Plus className='h-4 w-4 mr-2' />
						Add User
					</Button>
				</div>

				{/* Users Table */}
				<Card>
					<CardHeader>
						<CardTitle>
							Manager Users ({managerUsers.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className='flex items-center justify-center py-12'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
								<p className='ml-4 text-gray-600'>
									Loading users...
								</p>
							</div>
						) : managerUsers.length === 0 ? (
							<div className='text-center py-12'>
								<UsersIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
								<p className='text-gray-600'>No users found</p>
								<Button
									onClick={handleAddUser}
									variant='outline'
									className='mt-4'>
									<Plus className='h-4 w-4 mr-2' />
									Add Your First User
								</Button>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										{/* <TableHead>Role</TableHead>
										<TableHead>Status</TableHead> */}
										<TableHead>Created</TableHead>
										<TableHead className='text-right'>
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{managerUsers.map((user) => {
										const RoleIcon = getRoleIcon(user.role);
										return (
											<TableRow key={user.id}>
												<TableCell className='font-medium'>
													{user.name}
												</TableCell>
												<TableCell className='font-mono text-sm'>
													{user.email}
												</TableCell>
												{/* <TableCell>
													<Badge className={getRoleBadgeColor(user.role)}>
														<RoleIcon className='h-3 w-3 mr-1' />
														{getRoleText(user.role)}
													</Badge>
												</TableCell>
												<TableCell>
													{user.is_active ? (
														<Badge className='bg-green-100 text-green-800 border-green-300'>
															Active
														</Badge>
													) : (
														<Badge className='bg-gray-100 text-gray-800 border-gray-300'>
															Inactive
														</Badge>
													)}
												</TableCell> */}
												<TableCell className='text-sm text-gray-600'>
													{new Date(
														user.created_at
													).toLocaleDateString()}
												</TableCell>
												<TableCell className='text-right'>
													<div className='flex justify-end gap-2'>
														<Button
															variant='ghost'
															size='sm'
															onClick={() =>
																handleEditUser(
																	user
																)
															}
															className='hover:bg-blue-50 text-blue-600 hover:text-blue-700'>
															<Pencil className='h-4 w-4' />
														</Button>
														<Button
															variant='ghost'
															size='sm'
															onClick={() =>
																handleDeleteUser(
																	user
																)
															}
															className='hover:bg-red-50 text-red-600 hover:text-red-700'>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Add/Edit User Dialog */}
			<UserDialog
				open={isDialogOpen}
				user={editingUser}
				onClose={handleDialogClose}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteUserDialog
				open={!!deletingUser}
				user={deletingUser}
				onClose={() => setDeletingUser(null)}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
