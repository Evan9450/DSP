'use client';

import {
	BarChart3,
	Building2,
	Calendar,
	Car,
	ChevronDown,
	ClipboardCheck,
	FolderOpen,
	LayoutDashboard,
	MessageSquare,
	Package,
	Settings,
	ShoppingCart,
	UserCog,
	Users,
} from 'lucide-react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
	href: string;
	label: string;
	icon: any;
	submenu?: { href: string; label: string }[];
}

const menuItems: MenuItem[] = [
	// { href: '/', label: 'Dashboard', icon: LayoutDashboard },
	{
		href: '/schedules',
		label: 'Routes',
		icon: Calendar,
		submenu: [
			{ href: '/schedules', label: 'Schedule' },
			{ href: '/schedules/history', label: 'History' },
		],
	},
	{ href: '/vehicles', label: 'Vehicles', icon: Car },
	{ href: '/workshop-suppliers', label: 'Workshop Suppliers', icon: Building2 },
	{ href: '/drivers', label: 'Drivers', icon: Users },
	{ href: '/inspections', label: 'Inspections', icon: ClipboardCheck },
	{
		href: '/assets',
		label: 'Assets',
		icon: Package,
		submenu: [
			{ href: '/assets', label: 'Inventory' },
			{ href: '/borrows', label: 'Inventory History' },
		],
	},
	// Only show Files in development environment
	...(process.env.NODE_ENV === 'development'
		? [{ href: '/files', label: 'Files', icon: FolderOpen }]
		: []),
];

export function AppSidebar() {
	const pathname = usePathname();

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

								// If item has submenu, render as collapsible
								if (item.submenu) {
									return (
										<Collapsible
											key={item.href}
											defaultOpen={isActive}
											className='group/collapsible'>
											<SidebarMenuItem>
												<CollapsibleTrigger asChild>
													<SidebarMenuButton
														size='lg'
														isActive={isActive}
														className='group-data-[state=collapsed]/sidebar:justify-center'>
														<Icon className='h-5 w-5 shrink-0' />
														<span className='font-medium group-data-[state=collapsed]/sidebar:hidden'>
															{item.label}
														</span>
														<ChevronDown className='ml-auto h-4 w-4 transition-transform group-data-[state=collapsed]/sidebar:hidden group-data-[state=open]/collapsible:rotate-180' />
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub>
														{item.submenu.map(
															(subItem) => {
																const isSubActive =
																	pathname ===
																	subItem.href;
																return (
																	<SidebarMenuSubItem
																		key={
																			subItem.href
																		}>
																		<SidebarMenuSubButton
																			asChild
																			isActive={
																				isSubActive
																			}>
																			<Link
																				href={
																					subItem.href
																				}>
																				<span>
																					{
																						subItem.label
																					}
																				</span>
																			</Link>
																		</SidebarMenuSubButton>
																	</SidebarMenuSubItem>
																);
															},
														)}
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
										</Collapsible>
									);
								}

								// Regular menu item without submenu
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
		</Sidebar>
	);
}
