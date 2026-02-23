'use client';

import { AlertCircle, Calendar, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
	const { login } = useAuth();
	const { toast } = useToast();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		// Check for logout reason in sessionStorage
		const reason = sessionStorage.getItem('logout_reason');
		if (reason) {
			setLogoutMessage(reason);
			sessionStorage.removeItem('logout_reason');

			// Also show toast
			toast({
				title: 'Session Expired',
				description: reason,
				variant: 'destructive',
			});
		}
	}, [toast]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			// Call API login through AuthContext
			await login(email, password);

			toast({
				title: 'Login Successful',
				description: `Welcome back!`,
			});

			// Navigation will be handled by AuthContext
		} catch (error: any) {
			console.error('❌ Admin login error:', error);

			// Extract backend error message (consistent with driver-login)
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
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4'>
			<Card className='w-full max-w-md p-8 bg-white shadow-xl'>
				<div className='flex flex-col items-center mb-8'>
					<div className='p-4 bg-blue-100 rounded-full mb-4'>
						<Calendar className='h-12 w-12 text-blue-700' />
					</div>
					<h1 className='text-3xl font-bold text-gray-900'>
						DSP Manager
					</h1>
					<p className='text-sm text-gray-600 mt-2'>
						Operations System
					</p>
				</div>

				{/* Session expired message */}
				{logoutMessage && (
					<div className='mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3'>
						<AlertCircle className='h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5' />
						<div>
							<p className='text-sm font-medium text-orange-900'>
								Session Expired
							</p>
							<p className='text-sm text-orange-700 mt-1'>
								{logoutMessage}
							</p>
						</div>
					</div>
				)}

				{/* Login error message */}
				{error && (
					<div className='mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
						<AlertCircle className='h-4 w-4 text-red-600 flex-shrink-0' />
						<p className='text-sm text-red-700'>{error}</p>
					</div>
				)}

				<form onSubmit={handleLogin} className='space-y-6'>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							type='email'
							placeholder='admin@dsp.com'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<div className='relative'>
							<Input
								id='password'
								type={showPassword ? 'text' : 'password'}
								placeholder='••••••••'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
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

					<div className='flex items-center justify-between mb-2'>
						<a
							href='/forgot-password'
							className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
							Forgot Password?
						</a>
					</div>
					<Button
						type='submit'
						className='w-full bg-blue-700 hover:bg-blue-800'
						disabled={isLoading}>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</Button>
				</form>
			</Card>
		</div>
	);
}
