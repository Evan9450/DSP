'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Car, CalendarCheck, AlertCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard';

export default function DashboardPage() {
	const { stats, isLoading, error } = useDashboardStats();

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
				<div className='container mx-auto p-6'>
					<div className='text-center py-12'>
						<AlertCircle className='h-12 w-12 text-red-600 mx-auto mb-4' />
						<p className='text-red-600'>Failed to load dashboard data</p>
						<p className='text-sm text-gray-500 mt-2'>{error.message}</p>
					</div>
				</div>
			</div>
		);
	}

	const statsCards = stats
		? [
				{
					title: 'Total Drivers',
					value: stats.total_drivers,
					icon: Users,
					description: `${stats.active_drivers} active`,
					color: 'text-blue-600',
					bgColor: 'bg-blue-50',
				},
				{
					title: 'Total Vehicles',
					value: stats.total_vehicles,
					icon: Car,
					description: `${stats.vehicles_in_use} in use`,
					color: 'text-green-600',
					bgColor: 'bg-green-50',
				},
				{
					title: "Today's Schedules",
					value: stats.today_schedules,
					icon: CalendarCheck,
					description: 'Active schedules',
					color: 'text-purple-600',
					bgColor: 'bg-purple-50',
				},
				{
					title: 'Vehicles Need Attention',
					value: stats.vehicles_need_attention,
					icon: AlertCircle,
					description: `${stats.vehicle_status.need_repair} repair, ${stats.vehicle_status.unavailable} unavailable`,
					color: 'text-orange-600',
					bgColor: 'bg-orange-50',
				},
		  ]
		: [];

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto p-6'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
					<p className='text-gray-600 mt-2'>
						Welcome back! Here's an overview of your operations.
					</p>
				</div>

				{/* Loading State */}
				{isLoading ? (
					<div className='flex items-center justify-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
						<p className='ml-4 text-gray-600'>Loading dashboard...</p>
					</div>
				) : (
					<>
						{/* Statistics Cards */}
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8'>
							{statsCards.map((stat, index) => {
								const Icon = stat.icon;
								return (
									<Card key={index} className='hover:shadow-lg transition-shadow'>
										<CardHeader className='flex flex-row items-center justify-between pb-2'>
											<CardTitle className='text-sm font-medium text-gray-600'>
												{stat.title}
											</CardTitle>
											<div className={`${stat.bgColor} p-2 rounded-lg`}>
												<Icon className={`h-5 w-5 ${stat.color}`} />
											</div>
										</CardHeader>
										<CardContent>
											<div className='text-3xl font-bold text-gray-900'>
												{stat.value}
											</div>
											<p className='text-xs text-gray-500 mt-1'>
												{stat.description}
											</p>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{/* Quick Stats */}
						<div className='grid gap-6 md:grid-cols-2 mb-8'>
							{/* Vehicle Status */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Car className='h-5 w-5' />
										Vehicle Status Overview
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='w-3 h-3 rounded-full bg-green-500'></div>
												<span className='text-sm'>Available</span>
											</div>
											<span className='font-semibold'>
												{stats?.vehicle_status.available || 0}
											</span>
										</div>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='w-3 h-3 rounded-full bg-yellow-500'></div>
												<span className='text-sm'>Need Repair</span>
											</div>
											<span className='font-semibold'>
												{stats?.vehicle_status.need_repair || 0}
											</span>
										</div>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='w-3 h-3 rounded-full bg-red-500'></div>
												<span className='text-sm'>Unavailable</span>
											</div>
											<span className='font-semibold'>
												{stats?.vehicle_status.unavailable || 0}
											</span>
										</div>
										<div className='pt-2 border-t'>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-2'>
													<div className='w-3 h-3 rounded-full bg-blue-500'></div>
													<span className='text-sm font-medium'>In Use</span>
												</div>
												<span className='font-bold'>
													{stats?.vehicle_status.in_use || 0}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Driver Status */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Users className='h-5 w-5' />
										Driver Status Overview
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='w-3 h-3 rounded-full bg-green-500'></div>
												<span className='text-sm'>Active</span>
											</div>
											<span className='font-semibold'>
												{stats?.driver_status.active || 0}
											</span>
										</div>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='w-3 h-3 rounded-full bg-gray-500'></div>
												<span className='text-sm'>Inactive</span>
											</div>
											<span className='font-semibold'>
												{stats?.driver_status.inactive || 0}
											</span>
										</div>
										<div className='pt-2 border-t'>
											<div className='flex items-center justify-between'>
												<span className='text-sm font-medium'>Total Drivers</span>
												<span className='font-bold'>
													{stats?.driver_status.total || 0}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='grid gap-4 md:grid-cols-4'>
									<a
										href='/schedules'
										className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'>
										<CalendarCheck className='h-8 w-8 text-blue-600 mb-2' />
										<span className='text-sm font-medium'>View Schedules</span>
									</a>
									<a
										href='/drivers'
										className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'>
										<Users className='h-8 w-8 text-green-600 mb-2' />
										<span className='text-sm font-medium'>Manage Drivers</span>
									</a>
									<a
										href='/vehicles'
										className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'>
										<Car className='h-8 w-8 text-purple-600 mb-2' />
										<span className='text-sm font-medium'>Manage Vehicles</span>
									</a>
									<a
										href='/inspections'
										className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'>
										<AlertCircle className='h-8 w-8 text-orange-600 mb-2' />
										<span className='text-sm font-medium'>Inspections</span>
									</a>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
