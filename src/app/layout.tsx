import './globals.css';

import { AuthProvider } from '@/contexts/auth-context';
import { Inter } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'DSP Schedule Management',
	description: 'Manage driver schedules, vehicles, and notifications',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<AuthProvider>
					<LayoutWrapper>{children}</LayoutWrapper>
				</AuthProvider>
				<Toaster />
			</body>
		</html>
	);
}
