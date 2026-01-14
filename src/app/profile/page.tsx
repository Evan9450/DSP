'use client';

import {
	ArrowLeft,
	Eye,
	EyeOff,
	Loader2,
	Mail,
	Phone,
	Save,
	Shield,
	User,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserResponse, UserUpdate, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
	const router = useRouter();
	const { toast } = useToast();
	const { user: authUser, logout } = useAuth();
	const [user, setUser] = useState<UserResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Form data
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		oldPassword: '',
		password: '',
		confirmPassword: '',
	});

	useEffect(() => {
		fetchUserProfile();
	}, []);

	const fetchUserProfile = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getCurrentUser();
			setUser(data);
			setFormData({
				name: data.name,
				email: data.email,
				phone: data.phone || '',
				oldPassword: '',
				password: '',
				confirmPassword: '',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load profile. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);

			// Validate password fields if user is trying to change password
			if (
				formData.password ||
				formData.confirmPassword ||
				formData.oldPassword
			) {
				if (!formData.oldPassword) {
					toast({
						title: 'Error',
						description: 'Please enter your current password',
						variant: 'destructive',
					});
					setIsSaving(false);
					return;
				}

				if (!formData.password) {
					toast({
						title: 'Error',
						description: 'Please enter a new password',
						variant: 'destructive',
					});
					setIsSaving(false);
					return;
				}

				if (formData.password !== formData.confirmPassword) {
					toast({
						title: 'Error',
						description: 'New passwords do not match',
						variant: 'destructive',
					});
					setIsSaving(false);
					return;
				}

				if (formData.password.length < 6) {
					toast({
						title: 'Error',
						description: 'Password must be at least 6 characters',
						variant: 'destructive',
					});
					setIsSaving(false);
					return;
				}
			}

			const updateData: UserUpdate = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone || null,
			};

			// Include password fields if user is changing password
			if (formData.password && formData.oldPassword) {
				updateData.old_password = formData.oldPassword;
				updateData.password = formData.password;
			}

			await apiClient.updateUser(user!.id, updateData);

			toast({
				title: 'Success',
				description: 'Profile updated successfully',
			});

			setIsEditing(false);
			setFormData({
				...formData,
				oldPassword: '',
				password: '',
				confirmPassword: '',
			});
			fetchUserProfile();
		} catch (error: any) {
			toast({
				title: 'Error',
				description:
					error.response?.data?.detail ||
					'Failed to update profile. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setFormData({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			oldPassword: '',
			password: '',
			confirmPassword: '',
		});
		setShowOldPassword(false);
		setShowNewPassword(false);
		setShowConfirmPassword(false);
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

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl'>
					<div className='flex items-center justify-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
						<p className='ml-4 text-gray-600'>Loading profile...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl'>
					<div className='text-center py-12'>
						<p className='text-red-600'>Failed to load profile</p>
						<Button
							onClick={() => router.push('/')}
							className='mt-4'>
							Go to Dashboard
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl'>
				{/* Header */}
				<div className='mb-6'>
					<Button
						variant='ghost'
						onClick={() => router.back()}
						className='mb-4 hover:bg-gray-100'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900'>
								My Profile
							</h1>
							<p className='text-gray-600 mt-1'>
								Manage your account information
							</p>
						</div>
						{!isEditing && (
							<Button
								onClick={() => setIsEditing(true)}
								className='bg-blue-600 hover:bg-blue-700'>
								Edit Profile
							</Button>
						)}
					</div>
				</div>

				{/* Profile Card */}
				<div className='space-y-6'>
					{/* Profile Information */}
					<Card>
						<CardHeader>
							<CardTitle>Profile Information</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							{/* Name */}
							<div className='space-y-2'>
								<Label htmlFor='name'>
									Full Name{' '}
									<span className='text-red-500'>*</span>
								</Label>
								{isEditing ? (
									<Input
										id='name'
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										placeholder='Enter your full name'
									/>
								) : (
									<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-md'>
										<User className='h-4 w-4 text-gray-500' />
										<span className='text-gray-900'>
											{user.name}
										</span>
									</div>
								)}
							</div>

							{/* Email */}
							<div className='space-y-2'>
								<Label htmlFor='email'>
									Email Address{' '}
									<span className='text-red-500'>*</span>
								</Label>
								{isEditing ? (
									<Input
										id='email'
										type='email'
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										placeholder='Enter your email'
									/>
								) : (
									<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-md'>
										<Mail className='h-4 w-4 text-gray-500' />
										<span className='text-gray-900'>
											{user.email}
										</span>
									</div>
								)}
							</div>

							{/* Phone */}
							<div className='space-y-2'>
								<Label htmlFor='phone'>Phone Number</Label>
								{isEditing ? (
									<Input
										id='phone'
										type='tel'
										value={formData.phone}
										onChange={(e) =>
											setFormData({
												...formData,
												phone: e.target.value,
											})
										}
										placeholder='Enter your phone number'
									/>
								) : (
									<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-md'>
										<Phone className='h-4 w-4 text-gray-500' />
										<span className='text-gray-900'>
											{user.phone || (
												<span className='text-gray-400'>
													Not set
												</span>
											)}
										</span>
									</div>
								)}
							</div>

							{/* Password Fields (only show when editing) */}
							{isEditing && (
								<>
									{/* Old Password */}
									<div className='space-y-2'>
										<Label htmlFor='oldPassword'>
											Current Password{' '}
											<span className='text-gray-500 text-sm font-normal'>
												(required to change password)
											</span>
										</Label>
										<div className='relative'>
											<Input
												id='oldPassword'
												type={
													showOldPassword
														? 'text'
														: 'password'
												}
												value={formData.oldPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														oldPassword:
															e.target.value,
													})
												}
												placeholder='Enter current password'
												className='pr-10'
											/>
											<button
												type='button'
												onClick={() =>
													setShowOldPassword(
														!showOldPassword
													)
												}
												className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'>
												{showOldPassword ? (
													<EyeOff className='h-4 w-4' />
												) : (
													<Eye className='h-4 w-4' />
												)}
											</button>
										</div>
									</div>

									{/* New Password */}
									<div className='space-y-2'>
										<Label htmlFor='password'>
											New Password{' '}
											<span className='text-gray-500 text-sm font-normal'>
												(leave blank to keep current)
											</span>
										</Label>
										<div className='relative'>
											<Input
												id='password'
												type={
													showNewPassword
														? 'text'
														: 'password'
												}
												value={formData.password}
												onChange={(e) =>
													setFormData({
														...formData,
														password:
															e.target.value,
													})
												}
												placeholder='Enter new password'
												className='pr-10'
											/>
											<button
												type='button'
												onClick={() =>
													setShowNewPassword(
														!showNewPassword
													)
												}
												className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'>
												{showNewPassword ? (
													<EyeOff className='h-4 w-4' />
												) : (
													<Eye className='h-4 w-4' />
												)}
											</button>
										</div>
										<p className='text-xs text-gray-500'>
											Password must be at least 6
											characters
										</p>
									</div>

									{/* Confirm Password */}
									<div className='space-y-2'>
										<Label htmlFor='confirmPassword'>
											Confirm New Password
										</Label>
										<div className='relative'>
											<Input
												id='confirmPassword'
												type={
													showConfirmPassword
														? 'text'
														: 'password'
												}
												value={formData.confirmPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														confirmPassword:
															e.target.value,
													})
												}
												placeholder='Confirm new password'
												className='pr-10'
											/>
											<button
												type='button'
												onClick={() =>
													setShowConfirmPassword(
														!showConfirmPassword
													)
												}
												className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'>
												{showConfirmPassword ? (
													<EyeOff className='h-4 w-4' />
												) : (
													<Eye className='h-4 w-4' />
												)}
											</button>
										</div>
									</div>
								</>
							)}

							{/* Role (read-only) */}
							<div className='space-y-2'>
								<Label>Role</Label>
								<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-md'>
									<Shield className='h-4 w-4 text-gray-500' />
									<span className='text-gray-900'>
										{getRoleText(user.role)}
									</span>
								</div>
							</div>

							{/* Account Status */}
							<div className='space-y-2'>
								<Label>Account Status</Label>
								<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-md'>
									<span
										className={`inline-block w-2 h-2 rounded-full ${
											user.is_active
												? 'bg-green-500'
												: 'bg-red-500'
										}`}></span>
									<span className='text-gray-900'>
										{user.is_active ? 'Active' : 'Inactive'}
									</span>
								</div>
							</div>

							{/* Action Buttons (only show when editing) */}
							{isEditing && (
								<div className='flex gap-3 pt-4'>
									<Button
										onClick={handleSave}
										disabled={isSaving}
										className='bg-blue-600 hover:bg-blue-700'>
										{isSaving ? (
											<>
												<Loader2 className='h-4 w-4 mr-2 animate-spin' />
												Saving...
											</>
										) : (
											<>
												<Save className='h-4 w-4 mr-2' />
												Save Changes
											</>
										)}
									</Button>
									<Button
										onClick={handleCancel}
										disabled={isSaving}
										variant='outline'>
										Cancel
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
