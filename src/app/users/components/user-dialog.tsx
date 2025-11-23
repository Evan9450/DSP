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
	UserCreate,
	UserResponse,
	UserUpdate,
	apiClient,
} from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface UserDialogProps {
	open: boolean;
	user: UserResponse | null;
	onClose: (success?: boolean) => void;
}

interface UserFormData {
	name: string;
	email: string;
	password: string;
	phone: string;
	is_active: boolean;
}

export function UserDialog({ open, user, onClose }: UserDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const isEdit = !!user;

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<UserFormData>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			phone: '',
			is_active: true,
		},
	});

	const isActive = watch('is_active');

	useEffect(() => {
		if (user) {
			setValue('name', user.name);
			setValue('email', user.email);
			setValue('phone', user.phone || '');
			setValue('is_active', user.is_active);
			setValue('password', ''); // Clear password for edit mode
		} else {
			reset({
				name: '',
				email: '',
				password: '',
				phone: '',
				is_active: true,
			});
		}
	}, [user, setValue, reset]);

	const onSubmit = async (data: UserFormData) => {
		try {
			setIsSubmitting(true);

			if (isEdit) {
				// Update existing user
				const updateData: UserUpdate = {
					name: data.name,
					email: data.email,
					phone: data.phone || null,
					is_active: data.is_active,
				};
				// Only include password if it's provided
				if (data.password) {
					updateData.password = data.password;
				}
				await apiClient.updateUser(user.id, updateData);
				toast({
					title: 'Success',
					description: 'User updated successfully',
				});
			} else {
				// Create new user - always role 1 (Manager)
				const createData: UserCreate = {
					name: data.name,
					email: data.email,
					password: data.password,
					phone: data.phone || null,
					role: 1, // Always Manager
				};
				await apiClient.createUser(createData);
				toast({
					title: 'Success',
					description: 'User created successfully',
				});
			}

			onClose(true);
		} catch (error: any) {
			toast({
				title: 'Error',
				description:
					error.response?.data?.detail || 'Failed to save user',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		reset();
		onClose(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>
						{isEdit ? 'Edit User' : 'Add New User'}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? 'Update user information and permissions'
							: 'Create a new user account'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					{/* Name */}
					<div className='space-y-2'>
						<Label htmlFor='name'>
							Name <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='name'
							{...register('name', {
								required: 'Name is required',
							})}
							placeholder='Enter full name'
						/>
						{errors.name && (
							<p className='text-sm text-red-600'>
								{errors.name.message}
							</p>
						)}
					</div>

					{/* Email */}
					<div className='space-y-2'>
						<Label htmlFor='email'>
							Email <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='email'
							type='email'
							{...register('email', {
								required: 'Email is required',
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: 'Invalid email address',
								},
							})}
							placeholder='user@example.com'
						/>
						{errors.email && (
							<p className='text-sm text-red-600'>
								{errors.email.message}
							</p>
						)}
					</div>

					{/* Phone */}
					<div className='space-y-2'>
						<Label htmlFor='phone'>Phone</Label>
						<Input
							id='phone'
							type='tel'
							{...register('phone', {
								maxLength: {
									value: 20,
									message:
										'Phone number must be at most 20 characters',
								},
							})}
							placeholder='Enter phone number'
						/>
						{errors.phone && (
							<p className='text-sm text-red-600'>
								{errors.phone.message}
							</p>
						)}
					</div>

					{/* Password */}
					<div className='space-y-2'>
						<Label htmlFor='password'>
							Password{' '}
							{!isEdit && <span className='text-red-500'>*</span>}
							{isEdit && (
								<span className='text-gray-500 text-sm font-normal'>
									{' '}
									(leave blank to keep current)
								</span>
							)}
						</Label>
						<div className='relative'>
							<Input
								id='password'
								type={showPassword ? 'text' : 'password'}
								{...register('password', {
									required: !isEdit
										? 'Password is required'
										: false,
									minLength: {
										value: 6,
										message:
											'Password must be at least 6 characters',
									},
								})}
								placeholder='Enter password'
								className='pr-10'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'>
								{showPassword ? (
									<EyeOff className='h-4 w-4' />
								) : (
									<Eye className='h-4 w-4' />
								)}
							</button>
						</div>
						{errors.password && (
							<p className='text-sm text-red-600'>
								{errors.password.message}
							</p>
						)}
					</div>

					{/* Role info (read-only) */}
					{!isEdit && (
						<div className='rounded-lg bg-blue-50 border border-blue-200 p-3'>
							<p className='text-sm text-blue-900'>
								<strong>Note:</strong> New users will be created
								with Manager role
							</p>
						</div>
					)}

					{/* Active Status (only for edit mode) */}
					{/* {isEdit && (
						<div className='flex items-center justify-between space-x-2 py-2'>
							<Label htmlFor='is_active' className='cursor-pointer'>
								Active Status
							</Label>
							<Switch
								id='is_active'
								checked={isActive}
								onCheckedChange={(checked) => setValue('is_active', checked)}
							/>
						</div>
					)} */}

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={handleClose}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							type='submit'
							className='bg-blue-700 hover:bg-blue-800'
							disabled={isSubmitting}>
							{isSubmitting
								? 'Saving...'
								: isEdit
									? 'Update User'
									: 'Create User'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
