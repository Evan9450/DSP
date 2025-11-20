'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Eye, EyeOff } from 'lucide-react';
import { validateUser } from '@/lib/mock-users';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
	const { login } = useAuth();
	const { toast } = useToast();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate login delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		// Validate credentials
		const user = validateUser(email, password);

		if (user) {
			const userData = {
				name: user.name,
				email: user.email,
			};

			// Use AuthContext login method
			login(userData);

			toast({
				title: 'Login Successful',
				description: `Welcome back, ${user.name}!`,
			});

			// Navigation will be handled by AuthContext
		} else {
			toast({
				title: 'Login Failed',
				description: 'Invalid email or password',
				variant: 'destructive',
			});
		}

		setIsLoading(false);
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

					<Button
						type='submit'
						className='w-full bg-blue-700 hover:bg-blue-800'
						disabled={isLoading}>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</Button>
				</form>

				<div className='mt-6 p-4 bg-gray-50 rounded-lg'>
					<p className='text-xs font-semibold text-gray-700 mb-2'>
						Demo Accounts:
					</p>
					<div className='space-y-1 text-xs text-gray-600'>
						<p>
							<span className='font-mono'>admin@dsp.com</span> /{' '}
							<span className='font-mono'>admin123</span>
						</p>
						<p>
							<span className='font-mono'>manager@dsp.com</span> /{' '}
							<span className='font-mono'>manager123</span>
						</p>
						<p>
							<span className='font-mono'>demo@dsp.com</span> /{' '}
							<span className='font-mono'>demo123</span>
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
