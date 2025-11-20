'use client';

import { Car, Clock, User } from 'lucide-react';
import { Schedule, ScheduleStatus } from '@/types/schedule';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ScheduleCardProps {
	schedule: Schedule;
	onClick?: () => void;
}

const statusConfig: Record<
	ScheduleStatus,
	{ label: string; className: string }
> = {
	pending: { label: 'Pending', className: 'bg-gray-500 hover:bg-gray-600' },
	confirmed: {
		label: 'Confirmed',
		className: 'bg-blue-600 hover:bg-blue-700',
	},
	completed: {
		label: 'Completed',
		className: 'bg-green-600 hover:bg-green-700',
	},
};

export function ScheduleCard({ schedule, onClick }: ScheduleCardProps) {
	const statusInfo = statusConfig[schedule.status];
	const isHighlighted = schedule.isNew || schedule.isModified;

	return (
		<Card
			onClick={onClick}
			className={`p-3 cursor-pointer hover: transition-all ${
				isHighlighted
					? 'ring-2 ring-blue-500 bg-blue-50'
					: 'bg-white'
			}`}>
			<div className='space-y-2'>
				<div className='flex items-start justify-between'>
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2'>
							<User className='h-4 w-4 text-blue-700 flex-shrink-0' />
							<p className='font-semibold text-sm text-gray-900 truncate'>
								{schedule.driverName}
							</p>
						</div>
						<p className='text-xs text-gray-600 ml-6'>
							{schedule.amazonId}
						</p>
					</div>
					<Badge
						className={`${statusInfo.className} text-white text-xs`}>
						{statusInfo.label}
					</Badge>
				</div>

				{schedule.vehicleNumber && (
					<div className='flex items-center gap-2 ml-6'>
						<Car className='h-3 w-3 text-blue-600' />
						<p className='text-xs font-medium text-gray-700'>
							{schedule.vehicleNumber}
						</p>
					</div>
				)}

				<div className='flex items-center gap-2 ml-6'>
					<Clock className='h-3 w-3 text-gray-500' />
					<p className='text-xs text-gray-600'>
						{format(schedule.startTime, 'HH:mm')} -{' '}
						{format(schedule.endTime, 'HH:mm')}
					</p>
				</div>

				{isHighlighted && (
					<div className='mt-2 pt-2 border-t border-blue-200'>
						<p className='text-xs font-medium text-blue-700'>
							{schedule.isNew
								? '🆕 New from Deputy'
								: '✏️ Modified'}
						</p>
					</div>
				)}
			</div>
		</Card>
	);
}
