'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, getTokenExpiration } from '@/lib/api/client';

interface User {
	id: number;
	name: string;
	email: string;
	role: 0 | 1; // 0 = Admin, 1 = Manager
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Check for stored user on mount
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		// Public routes that don't require admin authentication
		const publicRoutes = ['/login', '/driver-login', '/driver-inspection'];
		const isPublicRoute = publicRoutes.includes(pathname);

		// Redirect to login if not authenticated and not on a public route
		if (!isLoading && !user && !isPublicRoute) {
			router.push('/login');
		}
		// Redirect to home if authenticated and on login page
		if (!isLoading && user && pathname === '/login') {
			router.push('/');
		}
	}, [user, isLoading, pathname, router]);

	const login = async (email: string, password: string) => {
		try {
			// Call API to login
			const response = await apiClient.adminLogin(email, password);

			// Extract user data from response
			const userData: User = {
				id: response.user.id,
				email: response.user.email,
				name: response.user.name,
				role: response.user.role,
			};

			setUser(userData);
			localStorage.setItem('user', JSON.stringify(userData));

			// Get token expiration
			const tokenExpiration = getTokenExpiration(response.access_token);

			// Log to console
			console.group('🔐 Login Successful');
			console.log('User Info:', {
				id: userData.id,
				name: userData.name,
				email: userData.email,
				role: userData.role,
				is_active: response.user.is_active,
				created_at: response.user.created_at,
			});
			console.log('Token:', response.access_token);
			console.log('Token Type:', response.token_type);
			if (tokenExpiration) {
				console.log('Token Expires At:', tokenExpiration.toLocaleString());
				console.log(
					'Token Valid For:',
					Math.round((tokenExpiration.getTime() - Date.now()) / 1000 / 60),
					'minutes'
				);
			}
			console.groupEnd();
		} catch (error) {
			console.error('❌ Login failed:', error);
			throw error;
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem('user');
		apiClient.logout(false);
		router.push('/login');
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
