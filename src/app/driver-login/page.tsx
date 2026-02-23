'use client';

import { AlertCircle, Eye, EyeOff, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { driverApiClient } from '@/lib/api/driver-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DriverLoginPage() {
	const router = useRouter();
	const [amazonId, setAmazonId] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			// Call Driver API to login
			// Note: Driver must have a schedule for today to login
			await driverApiClient.login(amazonId, password);

			// Redirect to driver inspection page
			router.push('/driver-inspection');
		} catch (error: any) {
			console.error('❌ Driver login error:', error);

			// Display backend error message directly
			const errorMessage =
				error.response?.data?.detail ||
				error.message ||
				'Login failed. Please try again.';

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
					<h1 className='text-2xl font-bold text-gray-900'>
						DSP Driver Portal
					</h1>
					<p className='text-sm text-gray-600 mt-2 text-center'>
						Enter your Amazon credentials to access vehicle
						inspection
					</p>
				</div>

				<form onSubmit={handleLogin} className='space-y-5'>
					<div>
						<label
							htmlFor='amazonId'
							className='block text-sm font-medium text-gray-700 mb-2'>
							Amazon ID
						</label>
						<Input
							id='amazonId'
							type='text'
							placeholder='AMZ-1001'
							value={amazonId}
							onChange={(e) => setAmazonId(e.target.value)}
							className='w-full'
							required
							autoComplete='username'
						/>
					</div>

					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-gray-700 mb-2'>
							Password
						</label>
						<div className='relative'>
							<Input
								id='password'
								type={showPassword ? 'text' : 'password'}
								placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className='w-full pr-10'
								required
								autoComplete='current-password'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
								{showPassword ? (
									<EyeOff className='h-4 w-4' />
								) : (
									<Eye className='h-4 w-4' />
								)}
							</button>
						</div>
					</div>

					{error && (
						<div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
							<AlertCircle className='h-4 w-4 text-red-600 flex-shrink-0' />
							<p className='text-sm text-red-700'>{error}</p>
						</div>
					)}

					<div className='flex items-center justify-end mt-2 mb-2'>
						<a
							href='/driver-forgot-password'
							className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
							Forgot Password?
						</a>
					</div>
					<Button
						type='submit'
						className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg'
						disabled={isLoading}>
						{isLoading ? 'Logging in...' : 'Login as Driver'}
					</Button>
				</form>

				<div className='mt-6 text-center'>
					<p className='text-xs text-gray-500'>
						Need help? Contact your fleet manager
					</p>
					<p className='text-xs text-gray-400 mt-2'>
						Admin?{' '}
						<a
							href='/login'
							className='text-blue-600 hover:underline'>
							Login here
						</a>
					</p>
				</div>
			</Card>
		</div>
	);
}
