'use client';

import { Menu, PanelLeftOpen } from 'lucide-react';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { isLoading, user } = useAuth();

	// Define public pages that don't require authentication
	const publicPages = ['/login', '/driver-login', '/driver-inspection', '/forgot-password', '/driver-forgot-password'];
	const isPublicPage = publicPages.includes(pathname);

	// Show loading state during initial auth check
	if (isLoading) {
		return (
			<div className='min-h-screen bg-zinc-100 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto'></div>
					<p className='mt-4 text-sm text-gray-500'>Loading...</p>
				</div>
			</div>
		);
	}

	// For protected pages, show loading state if user is not authenticated
	// This prevents the dashboard from flashing before redirect to login
	if (!isPublicPage && !user) {
		return (
			<div className='min-h-screen bg-zinc-100 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto'></div>
					<p className='mt-4 text-sm text-gray-500'>Redirecting...</p>
				</div>
			</div>
		);
	}

	// Don't show sidebar on public pages (login and driver pages)
	if (isPublicPage) {
		return <>{children}</>;
	}

	// Show sidebar layout for authenticated pages
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4'>
					<SidebarTrigger className='h-10 w-10 hover:bg-zinc-100 rounded-md'>
						<Menu className='h-5 w-5 md:hidden' />
						<PanelLeftOpen className='h-5 w-5 hidden md:block hover:text-zinc-900' />
					</SidebarTrigger>
					<h1 className='text-xl font-bold text-zinc-900 md:hidden'>
						DSP Manager
					</h1>
					<div className='ml-auto'>
						<UserNav />
					</div>
				</header>
				<main className='flex-1 bg-zinc-100'>{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
