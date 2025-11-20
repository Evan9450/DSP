'use client';

import { Menu, PanelLeftOpen } from 'lucide-react';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { isLoading } = useAuth();

	// Show loading state
	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading...</p>
				</div>
			</div>
		);
	}

	// Don't show sidebar on public pages (login and driver pages)
	const publicPages = ['/login', '/driver-login', '/driver-inspection'];
	if (publicPages.includes(pathname)) {
		return <>{children}</>;
	}

	// Show sidebar layout for authenticated pages
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4'>
					<SidebarTrigger>
						<Button
							variant='ghost'
							size='icon'
							className='hover:bg-gray-100'>
							<Menu className='h-5 w-5 md:hidden' />
							<PanelLeftOpen className='h-5 w-5 hidden md:block hover:text-black' />
						</Button>
					</SidebarTrigger>
					<h1 className='text-xl font-bold text-blue-700 md:hidden'>
						DSP Manager
					</h1>
					<div className='ml-auto'>
						<UserNav />
					</div>
				</header>
				<main className='flex-1 bg-gray-50'>{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
