'use client';

import { AlertCircle, Calendar, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api/client';

export default function ForgotPasswordPage() {
	const router = useRouter();
	const { toast } = useToast();

	const [step, setStep] = useState<1 | 2>(1);
	const [phone, setPhone] = useState('');
	const [code, setCode] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Countdown for resending code
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const handleSendCode = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!phone) {
			setError('Please enter your phone number');
			return;
		}

		setError('');
		setIsLoading(true);

		try {
			await apiClient.adminForgotPasswordSendCode({ phone });
			toast({
				title: 'Code Sent',
				description: 'A 6-digit verification code has been sent to your phone.',
			});
			setStep(2);
			setCountdown(60);
		} catch (error: any) {
			console.error('❌ Send code error:', error);
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to send verification code.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters long');
			return;
		}

		if (code.length !== 6) {
			setError('Please enter a valid 6-digit code');
			return;
		}

		setIsLoading(true);

		try {
			await apiClient.adminForgotPasswordReset({
				phone,
				code,
				new_password: newPassword,
			});

			toast({
				title: 'Password Reset Successful',
				description: 'You can now log in with your new password.',
			});

			// Redirect to login page
			router.push('/login');
		} catch (error: any) {
			console.error('❌ Reset password error:', error);
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to reset password. Please check your code and try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4'>
			<Card className='w-full max-w-md p-8 bg-white shadow-xl'>
				<div className='flex flex-col items-center mb-8'>
					<div className='p-4 bg-blue-100 rounded-full mb-4'>
						<LayoutDashboard className='h-12 w-12 text-blue-700' />
					</div>
					<h1 className='text-3xl font-bold text-gray-900'>
						Reset Password
					</h1>
					<p className='text-sm text-gray-600 mt-2'>
						Enter your phone number to receive a verification code
					</p>
				</div>

				{error && (
					<div className='mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
						<AlertCircle className='h-4 w-4 text-red-600 flex-shrink-0' />
						<p className='text-sm text-red-700'>{error}</p>
					</div>
				)}

				{step === 1 ? (
					<form onSubmit={handleSendCode} className='space-y-6'>
						<div className='space-y-2'>
							<Label htmlFor='phone'>Phone Number</Label>
							<Input
								id='phone'
								type='text'
								placeholder='0412345678 or +61412345678'
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<Button
							type='submit'
							className='w-full bg-blue-700 hover:bg-blue-800'
							disabled={isLoading}>
							{isLoading ? 'Sending...' : 'Send Verification Code'}
						</Button>
					</form>
				) : (
					<form onSubmit={handleResetPassword} className='space-y-6'>
						<div className='space-y-2'>
							<Label htmlFor='phone-readonly'>Phone Number</Label>
							<div className='flex gap-2'>
								<Input
									id='phone-readonly'
									type='text'
									value={phone}
									disabled
									className='bg-gray-50'
								/>
								{/* <Button
									type='button'
									variant='outline'
									onClick={() => setStep(1)}
									disabled={isLoading}
									className='whitespace-nowrap'>
									Change
								</Button> */}
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='code'>Verification Code</Label>
							<div className='flex gap-2'>
								<Input
									id='code'
									type='text'
									placeholder='6-digit code'
									value={code}
									onChange={(e) => setCode(e.target.value)}
									required
									maxLength={6}
									disabled={isLoading}
								/>
								<Button
									type='button'
									variant='outline'
									onClick={() => handleSendCode()}
									disabled={isLoading || countdown > 0}
									className='whitespace-nowrap w-[100px]'>
									{countdown > 0 ? `${countdown}s` : 'Resend'}
								</Button>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='newPassword'>New Password</Label>
							<div className='relative'>
								<Input
									id='newPassword'
									type={showPassword ? 'text' : 'password'}
									placeholder='••••••••'
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
									disabled={isLoading}
									className='pr-10'
								/>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
									onClick={() => setShowPassword(!showPassword)}
									disabled={isLoading}>
									{showPassword ? (
										<EyeOff className='h-4 w-4 text-gray-500' />
									) : (
										<Eye className='h-4 w-4 text-gray-500' />
									)}
								</Button>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='confirmPassword'>Confirm New Password</Label>
							<div className='relative'>
								<Input
									id='confirmPassword'
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder='••••••••'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									disabled={isLoading}
									className='pr-10'
								/>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									disabled={isLoading}>
									{showConfirmPassword ? (
										<EyeOff className='h-4 w-4 text-gray-500' />
									) : (
										<Eye className='h-4 w-4 text-gray-500' />
									)}
								</Button>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full bg-blue-700 hover:bg-blue-800'
							disabled={isLoading}>
							{isLoading ? 'Resetting...' : 'Reset Password'}
						</Button>
					</form>
				)}

				<div className='mt-6 text-center'>
					<a
						href='/login'
						className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
						Back to Login
					</a>
				</div>
			</Card>
		</div>
	);
}
