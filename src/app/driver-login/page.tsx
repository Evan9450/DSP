'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Truck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

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
			// Call API to login
			await apiClient.driverLogin(amazonId, password);

			// Store driver info in session storage
			// TODO: Get driver info from API after login
			sessionStorage.setItem('amazonId', amazonId);

			// Redirect to driver inspection page
			router.push('/driver-inspection');
		} catch (error: any) {
			console.error('Driver login error:', error);
			setError('Invalid Amazon ID or password');
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
					<h1 className='text-2xl font-bold text-gray-900'>DSP Driver Portal</h1>
					<p className='text-sm text-gray-600 mt-2 text-center'>
						Enter your Amazon credentials to access vehicle inspection
					</p>
				</div>

				<form onSubmit={handleLogin} className='space-y-5'>
					<div>
						<label htmlFor='amazonId' className='block text-sm font-medium text-gray-700 mb-2'>
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
						<label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
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
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
							>
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

					<Button
						type='submit'
						className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg'
						disabled={isLoading}
					>
						{isLoading ? 'Logging in...' : 'Login as Driver'}
					</Button>
				</form>

				<div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
					<p className='text-xs text-blue-900 font-semibold mb-2'>Demo Credentials:</p>
					<div className='space-y-1'>
						<p className='text-xs text-blue-800'>Amazon ID: <span className='font-mono'>AMZ-1001</span></p>
						<p className='text-xs text-blue-800'>Password: <span className='font-mono'>encrypted_password_1</span></p>
					</div>
				</div>

				<div className='mt-6 text-center'>
					<p className='text-xs text-gray-500'>
						Need help? Contact your fleet manager
					</p>
					<p className='text-xs text-gray-400 mt-2'>
						Admin? <a href='/login' className='text-blue-600 hover:underline'>Login here</a>
					</p>
				</div>
			</Card>
		</div>
	);
}
