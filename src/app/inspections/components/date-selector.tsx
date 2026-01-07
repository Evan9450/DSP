'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

interface DateSelectorProps {
	selectedDate: Date | undefined;
	onDateChange: (date: Date | undefined) => void;
}

export function DateSelector({
	selectedDate,
	onDateChange,
}: DateSelectorProps) {
	const [open, setOpen] = useState(false);

	return (
		<Card className='mb-6 w-full'>
			<CardHeader>
				<CardTitle>Select Date</CardTitle>
			</CardHeader>
			<CardContent>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							className={cn(
								'w-full md:w-[280px] justify-between font-normal',
								!selectedDate && 'text-muted-foreground'
							)}>
							{selectedDate ? (
								format(selectedDate, 'PPP')
							) : (
								<span>Pick a date</span>
							)}
							<ChevronDownIcon className='h-4 w-4' />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className='w-auto overflow-hidden p-0'
						align='start'>
						<Calendar
							mode='single'
							selected={selectedDate}
							captionLayout='dropdown'
							onSelect={(date) => {
								onDateChange(date);
								setOpen(false);
							}}
						/>
					</PopoverContent>
				</Popover>
			</CardContent>
		</Card>
	);
}
