'use client';

import {
	AlertCircle,
	ArrowLeft,
	Award,
	Calendar,
	Edit,
	FileText,
	Mail,
	MessageSquare,
	Phone,
	TrendingUp,
	Upload,
	User,
} from 'lucide-react';
import {
	Driver,
	DriverDocument,
	DriverKPI,
	SMSHistory,
	Schedule,
} from '@/types/schedule';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	mockDriverDocuments,
	mockDriverKPIs,
	mockDrivers,
	mockSMSHistory,
	mockSchedules,
} from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function DriverDetailsPage() {
	const router = useRouter();
	const params = useParams();
	const driverId = params.id as string;

	const [driver, setDriver] = useState<Driver | null>(null);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [smsHistory, setSmsHistory] = useState<SMSHistory[]>([]);
	const [documents, setDocuments] = useState<DriverDocument[]>([]);
	const [kpi, setKpi] = useState<DriverKPI | null>(null);

	useEffect(() => {
		const foundDriver = mockDrivers.find((d) => d.id === driverId);
		setDriver(foundDriver || null);

		const driverSchedules = mockSchedules.filter(
			(s) => s.driverId === driverId
		);
		setSchedules(driverSchedules);

		const driverSMS = mockSMSHistory.filter((sms) =>
			driverSchedules.some((s) => s.id === sms.scheduleId)
		);
		setSmsHistory(driverSMS);

		const driverDocs = mockDriverDocuments.filter(
			(doc) => doc.driverId === driverId
		);
		setDocuments(driverDocs);

		const driverKPI = mockDriverKPIs.find((k) => k.driverId === driverId);
		setKpi(driverKPI || null);
	}, [driverId]);

	if (!driver) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
				<div className='container mx-auto px-6 py-8 max-w-7xl'>
					<div className='text-center py-12'>
						<User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-600'>Driver not found</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => router.push('/drivers')}>
							Back to Drivers
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl'>
				<Button
					variant='ghost'
					className='mb-4 sm:mb-6'
					onClick={() => router.push('/drivers')}>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Drivers
				</Button>

				<div className='grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6'>
					<div className='lg:col-span-1'>
						<Card className='p-6 bg-white '>
							<div className='flex flex-col items-center mb-6'>
								<div className='p-6 bg-blue-100 rounded-full mb-4'>
									<User className='h-16 w-16 text-blue-700' />
								</div>
								<h1 className='text-2xl font-bold text-gray-900 mb-2'>
									{driver.name}
								</h1>
								<Badge className='bg-blue-600 text-white mb-4'>
									{driver.amazonId}
								</Badge>
							</div>

							<div className='space-y-4 mb-6'>
								<div className='border-t border-gray-200 pt-4'>
									<h3 className='text-sm font-semibold text-gray-900 mb-3'>
										Contact Information
									</h3>
									<div className='space-y-3'>
										{driver.phone && (
											<div className='flex items-center gap-2 text-sm'>
												<Phone className='h-4 w-4 text-gray-500' />
												<span className='text-gray-700'>
													{driver.phone}
												</span>
											</div>
										)}
										<div className='flex items-center gap-2 text-sm'>
											<Mail className='h-4 w-4 text-gray-500' />
											<span className='text-gray-700'>
												{driver.name
													.toLowerCase()
													.replace(' ', '.')}
												@dsp.com
											</span>
										</div>
									</div>
								</div>

								{/* {kpi && (
									<div className='border-t border-gray-200 pt-4'>
										<h3 className='text-sm font-semibold text-gray-900 mb-3'>
											Performance Statistics
										</h3>
										<div className='space-y-3'>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													Total Shifts:
												</span>
												<span className='font-medium text-gray-900'>
													{kpi.totalShifts}
												</span>
											</div>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													Completed Shifts:
												</span>
												<span className='font-medium text-gray-900'>
													{kpi.completedShifts}
												</span>
											</div>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													On-Time Rate:
												</span>
												<span className='font-medium text-green-600'>
													{kpi.onTimeRate}%
												</span>
											</div>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													Customer Rating:
												</span>
												<span className='font-medium text-green-600'>
													{kpi.customerRating}/5.0
												</span>
											</div>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600'>
													Avg. Packages/Hour:
												</span>
												<span className='font-medium text-gray-900'>
													{kpi.packagesPerHour}
												</span>
											</div>
										</div>
									</div>
								)} */}

								<div className='border-t border-gray-200 pt-4'>
									<div className='flex items-center justify-between mb-3'>
										<h3 className='text-sm font-semibold text-gray-900'>
											Documents
										</h3>
										<Button size='sm' variant='ghost'>
											<Upload className='h-3 w-3 mr-1' />
											Upload
										</Button>
									</div>
									{documents.length > 0 ? (
										<div className='space-y-2'>
											{documents.map((doc) => (
												<div
													key={doc.id}
													className='flex items-center justify-between p-2 bg-gray-50 rounded-lg'>
													<div className='flex items-center gap-2 min-w-0 flex-1'>
														<FileText className='h-4 w-4 text-gray-500 shrink-0' />
														<div className='min-w-0 flex-1'>
															<p className='text-sm font-medium text-gray-900 truncate'>
																{
																	doc.documentName
																}
															</p>
															<p className='text-xs text-gray-500'>
																Expires:{' '}
																{format(
																	doc.expiryDate,
																	'MMM dd, yyyy'
																)}
															</p>
														</div>
													</div>
													<Badge
														className={
															doc.status ===
															'valid'
																? 'bg-green-500 shrink-0'
																: doc.status ===
																	  'expiring'
																	? 'bg-yellow-500 shrink-0'
																	: 'bg-red-500 shrink-0'
														}>
														{doc.status}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<div className='text-center py-4 bg-gray-50 rounded-lg'>
											<FileText className='h-8 w-8 text-gray-400 mx-auto mb-2' />
											<p className='text-xs text-gray-500'>
												No documents uploaded
											</p>
										</div>
									)}
								</div>

								<div className='border-t border-gray-200 pt-4'>
									<h3 className='text-sm font-semibold text-gray-900 mb-3'>
										Employment Details
									</h3>
									<div className='space-y-3'>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-600'>
												Start Date:
											</span>
											<span className='font-medium text-gray-900'>
												Sep 15, 2023
											</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-600'>
												Status:
											</span>
											<Badge className='bg-green-600 text-white'>
												Active
											</Badge>
										</div>
									</div>
								</div>
							</div>

							<Button variant='outline' className='w-full'>
								<Edit className='h-4 w-4 mr-2' />
								Edit Driver
							</Button>
						</Card>
					</div>

					{/* <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
						<Card className='p-4 sm:p-6 bg-white  overflow-x-auto'>
							<h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
								<Calendar className='h-5 w-5' />
								Schedule History
							</h2>

							{schedules.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>Vehicle</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{schedules.map((schedule) => (
											<TableRow key={schedule.id}>
												<TableCell className='text-gray-900 font-medium'>
													{format(
														schedule.startTime,
														'MMM dd, yyyy'
													)}
												</TableCell>
												<TableCell className='text-gray-600'>
													{format(
														schedule.startTime,
														'h:mm a'
													)}{' '}
													-{' '}
													{format(
														schedule.endTime,
														'h:mm a'
													)}
												</TableCell>
												<TableCell>
													{schedule.vehicleNumber ? (
														<Badge className='bg-blue-700 text-white'>
															{
																schedule.vehicleNumber
															}
														</Badge>
													) : (
														<span className='text-gray-400'>
															Not assigned
														</span>
													)}
												</TableCell>
												<TableCell>
													<Badge
														className={
															schedule.status ===
															'completed'
																? 'bg-green-600 text-white'
																: schedule.status ===
																	  'confirmed'
																	? 'bg-blue-600 text-white'
																	: 'bg-gray-500 text-white'
														}>
														{schedule.status}
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className='text-center py-12'>
									<Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-600'>
										No schedule history for this driver
									</p>
								</div>
							)}
						</Card>

						<Card className='p-4 sm:p-6 bg-white  overflow-x-auto'>
							<h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
								<MessageSquare className='h-5 w-5' />
								SMS Communication History
							</h2>

							{smsHistory.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date & Time</TableHead>
											<TableHead>Message</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{smsHistory.map((sms) => (
											<TableRow key={sms.id}>
												<TableCell className='text-gray-600'>
													{format(
														sms.sentAt,
														'MMM dd, yyyy h:mm a'
													)}
												</TableCell>
												<TableCell className='text-gray-900 max-w-md'>
													{sms.message}
												</TableCell>
												<TableCell>
													<Badge
														className={
															sms.deliveryStatus ===
															'delivered'
																? 'bg-green-600 text-white'
																: sms.deliveryStatus ===
																	  'sent'
																	? 'bg-blue-600 text-white'
																	: 'bg-red-600 text-white'
														}>
														{sms.deliveryStatus}
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className='text-center py-12'>
									<MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-600'>
										No SMS history for this driver
									</p>
								</div>
							)}
						</Card>

						{kpi && kpi.weeklyStats && (
							<Card className='p-4 sm:p-6 bg-white '>
								<h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
									<TrendingUp className='h-5 w-5' />
									Weekly Performance Trends
								</h2>
								<div className='space-y-3'>
									{kpi.weeklyStats.map((week, index) => (
										<div
											key={index}
											className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
											<div className='flex-1'>
												<div className='text-sm font-semibold text-gray-900'>
													{week.week}
												</div>
												<div className='text-xs text-gray-500 mt-1'>
													{week.shiftsCompleted}{' '}
													shifts completed
												</div>
											</div>
											<div className='text-right'>
												<div className='text-lg font-bold text-blue-700'>
													{week.packagesDelivered}
												</div>
												<div className='text-xs text-gray-500'>
													packages
												</div>
											</div>
										</div>
									))}
								</div>
								<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6'>
									<div className='p-4 bg-blue-50 rounded-lg'>
										<div className='text-sm text-gray-600 mb-1'>
											Total Shifts
										</div>
										<div className='text-2xl font-bold text-blue-700'>
											{kpi.totalShifts}
										</div>
										<div className='text-xs text-green-600 mt-1'>
											{kpi.completedShifts} completed
										</div>
									</div>
									<div className='p-4 bg-green-50 rounded-lg'>
										<div className='text-sm text-gray-600 mb-1'>
											On-Time Rate
										</div>
										<div className='text-2xl font-bold text-green-700'>
											{kpi.onTimeRate}%
										</div>
										<div className='text-xs text-green-600 mt-1'>
											Excellent
										</div>
									</div>
									<div className='p-4 bg-blue-50 rounded-lg'>
										<div className='text-sm text-gray-600 mb-1'>
											Avg. Rating
										</div>
										<div className='text-2xl font-bold text-blue-700'>
											{kpi.customerRating} ⭐
										</div>
										<div className='text-xs text-gray-600 mt-1'>
											{kpi.packagesPerHour} pkg/hr
										</div>
									</div>
								</div>
							</Card>
						)}
					</div> */}
				</div>
			</div>
		</div>
	);
}
