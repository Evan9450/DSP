'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
	name: string;
	email: string;
}

interface AuthContextType {
	user: User | null;
	login: (user: User) => void;
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

	const login = (userData: User) => {
		setUser(userData);
		localStorage.setItem('user', JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem('user');
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
