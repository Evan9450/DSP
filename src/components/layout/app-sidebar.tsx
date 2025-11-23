'use client';

import {
	BarChart3,
	Calendar,
	Car,
	ClipboardCheck,
	LayoutDashboard,
	MessageSquare,
	Package,
	Settings,
	Users,
	UserCog,
} from 'lucide-react';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
	{ href: '/', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/schedules', label: 'Schedule', icon: Calendar },
	{ href: '/vehicles', label: 'Vehicles', icon: Car },
	{ href: '/drivers', label: 'Drivers', icon: Users },
	{ href: '/inspections', label: 'Inspections', icon: ClipboardCheck },
	{ href: '/assets', label: 'Assets', icon: Package },
	{ href: '/users', label: 'User Management', icon: UserCog },
	// { href: '/messages', label: 'Messages', icon: MessageSquare },
	// { href: '/reports', label: 'Reports', icon: BarChart3 },
	{ href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
	const pathname = usePathname();
	// const { toggleSidebar, isMobile, state } = useSidebar();

	return (
		<Sidebar collapsible='icon' className='flex flex-col'>
			<SidebarHeader>
				<div className='px-4 py-4 flex items-start justify-between group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-2'>
					<div className='min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden'>
						<h1 className='text-2xl font-bold text-blue-700'>
							DSP Manager
						</h1>
						<p className='text-xs text-gray-500 mt-1'>
							Operations System
						</p>
					</div>
					{/* {!isMobile && (
						<Button
							variant='ghost'
							size='icon'
							onClick={toggleSidebar}
							className='h-8 w-8 -mr-2 shrink-0 group-data-[state=collapsed]:mr-0'>
							<ChevronLeft className='h-4 w-4 transition-transform group-data-[state=collapsed]:rotate-180' />
						</Button>
					)} */}
				</div>
			</SidebarHeader>

			<SidebarContent className='flex-1'>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => {
								const Icon = item.icon;
								const isActive =
									pathname === item.href ||
									(item.href !== '/' &&
										pathname.startsWith(item.href));

								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											size='lg'
											className='group-data-[state=collapsed]/sidebar:justify-center'>
											<Link href={item.href}>
												<Icon className='h-5 w-5 shrink-0' />
												<span className='font-medium group-data-[state=collapsed]/sidebar:hidden'>
													{item.label}
												</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* <SidebarFooter className='mt-auto'>
				<div className='px-4 py-3 group-data-[state=collapsed]/sidebar:px-2'>
					<div className='bg-blue-50 p-3 rounded-lg group-data-[state=collapsed]/sidebar:p-2'>
						<p className='text-xs font-semibold text-blue-900 group-data-[state=collapsed]/sidebar:hidden'>
							System Status
						</p>
						<p className='text-xs text-blue-700 mt-1 group-data-[state=collapsed]/sidebar:mt-0 group-data-[state=collapsed]/sidebar:text-center'>
							<span className='group-data-[state=collapsed]/sidebar:hidden'>
								All systems operational
							</span>
							<span className='hidden group-data-[state=collapsed]/sidebar:inline'>
								✓
							</span>
						</p>
					</div>
				</div>
			</SidebarFooter> */}
		</Sidebar>
	);
}
