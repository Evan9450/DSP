'use client';

import { AlertCircle, Eye, EyeOff, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';

export default function DriverForgotPasswordPage() {
	const router = useRouter();

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
			await apiClient.driverForgotPasswordSendCode({ phone });
			setStep(2);
			setCountdown(60);
		} catch (error: any) {
			console.error('❌ Send code error:', error);
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Failed to send verification code. Please check your phone number.';
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
			await apiClient.driverForgotPasswordReset({
				phone,
				code,
				new_password: newPassword,
			});

			// Show basic native alert as fallback since driver app might not use toast yet
			alert('Password Reset Successful! You can now log in with your new password.');

			// Redirect to driver login page
			router.push('/driver-login');
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
		<div className='min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 flex items-center justify-center p-4'>
			<Card className='w-full max-w-md p-8 bg-white shadow-2xl'>
				<div className='flex flex-col items-center mb-8'>
					<div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4'>
						<Truck className='h-8 w-8 text-white' />
					</div>
					<h1 className='text-xl font-bold text-gray-900 text-center'>
						Driver Portal
						<br />
						Password Reset
					</h1>
					<p className='text-sm text-gray-600 mt-2 text-center'>
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
					<form onSubmit={handleSendCode} className='space-y-5'>
						<div>
							<label
								htmlFor='phone'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Phone Number
							</label>
							<Input
								id='phone'
								type='text'
								placeholder='0412345678'
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className='w-full'
								required
								disabled={isLoading}
							/>
						</div>

						<Button
							type='submit'
							className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg'
							disabled={isLoading}>
							{isLoading ? 'Sending...' : 'Send Code'}
						</Button>
					</form>
				) : (
					<form onSubmit={handleResetPassword} className='space-y-5'>
						<div>
							<label
								htmlFor='phone-readonly'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Phone Number
							</label>
							<div className='flex gap-2'>
								<Input
									id='phone-readonly'
									type='text'
									value={phone}
									disabled
									className='w-full bg-gray-50'
								/>
								{/* <Button
									type='button'
									variant='outline'
									onClick={() => setStep(1)}
									disabled={isLoading}
									className='whitespace-nowrap h-10'>
									Edit
								</Button> */}
							</div>
						</div>

						<div>
							<label
								htmlFor='code'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Verification Code
							</label>
							<div className='flex gap-2'>
								<Input
									id='code'
									type='text'
									placeholder='6-digit code'
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className='w-full'
									required
									maxLength={6}
									disabled={isLoading}
								/>
								<Button
									type='button'
									variant='outline'
									onClick={() => handleSendCode()}
									disabled={isLoading || countdown > 0}
									className='whitespace-nowrap w-[100px] h-10'>
									{countdown > 0 ? `${countdown}s` : 'Resend'}
								</Button>
							</div>
						</div>

						<div>
							<label
								htmlFor='newPassword'
								className='block text-sm font-medium text-gray-700 mb-2'>
								New Password
							</label>
							<div className='relative'>
								<Input
									id='newPassword'
									type={showPassword ? 'text' : 'password'}
									placeholder='New password'
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className='w-full pr-10'
									required
									disabled={isLoading}
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
									disabled={isLoading}>
									{showPassword ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Confirm Password
							</label>
							<div className='relative'>
								<Input
									id='confirmPassword'
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder='Confirm new password'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className='w-full pr-10'
									required
									disabled={isLoading}
								/>
								<button
									type='button'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
									disabled={isLoading}>
									{showConfirmPassword ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</button>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg'
							disabled={isLoading}>
							{isLoading ? 'Resetting...' : 'Reset Password'}
						</Button>
					</form>
				)}

				<div className='mt-6 text-center'>
					<a
						href='/driver-login'
						className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
						Back to Login
					</a>
				</div>
			</Card>
		</div>
	);
}
