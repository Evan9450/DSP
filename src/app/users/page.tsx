'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Pencil,
	Plus,
	Trash2,
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

import { Button } from '@/components/ui/button';
import { DeleteUserDialog } from './components/delete-user-dialog';
import { UserDialog } from './components/user-dialog';
import { useState } from 'react';
import { notify, successMessages, errorMessages, handleApiError } from '@/lib/notifications';
import { useUsers } from '@/hooks/use-users';

export default function UsersPage() {
	const { users, isLoading, error, refetch } = useUsers();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
	const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

	// Show all users (including Admin users for debugging)
	const allUsers = users;

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
			const userName = deletingUser.name;
			setDeletingUser(null);
			await refetch();
			notify.success(successMessages.user.deleted(userName));
		} catch (error) {
			handleApiError(error, errorMessages.user.deleteFailed(deletingUser?.name));
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
				{/* Header */}
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							User Management
						</h1>

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
							All Users ({allUsers.length})
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
						) : error ? (
							<div className='text-center py-12'>
								<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
									<p className='text-red-800 font-semibold'>Error loading users</p>
									<p className='text-red-600 text-sm mt-1'>{error.message}</p>
									<Button
										onClick={() => refetch()}
										variant='outline'
										className='mt-4'>
										Retry
									</Button>
								</div>
							</div>
						) : allUsers.length === 0 ? (
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
									{allUsers.map((user) => {
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
