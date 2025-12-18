'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface DocumentInfoCardProps {
	type: 'license' | 'visa';
	title: string;
	driver: any;
	editedDriver: any;
	isLoading: boolean;
	isEditing: boolean;
	getStatusBadge: (expiryDate: string) => JSX.Element;
	onEdit: (field: string, value: string) => void;
}

export function DocumentInfoCard({
	type,
	title,
	driver,
	editedDriver,
	isLoading,
	isEditing,
	getStatusBadge,
	onEdit,
}: DocumentInfoCardProps) {
	const documentNumber =
		type === 'license' ? driver?.license_number : driver?.visa_number;
	const expiryDate =
		type === 'license'
			? driver?.license_expiry_date
			: driver?.visa_expiry_date;
	const fileUrls =
		type === 'license' ? driver?.license_files : driver?.visa_files;

	const editedDocNumber =
		type === 'license'
			? editedDriver?.license_number
			: editedDriver?.visa_number;
	const editedExpiryDate =
		type === 'license'
			? editedDriver?.license_expiry_date
			: editedDriver?.visa_expiry_date;

	const docNumberField =
		type === 'license' ? 'license_number' : 'visa_number';
	const expiryDateField =
		type === 'license' ? 'license_expiry_date' : 'visa_expiry_date';

	// Local state for calendar date
	const [calendarDate, setCalendarDate] = useState<Date | undefined>(
		editedExpiryDate ? new Date(editedExpiryDate) : undefined
	);

	// Sync calendar date when editedDriver changes
	useEffect(() => {
		if (editedExpiryDate) {
			setCalendarDate(new Date(editedExpiryDate));
		} else {
			setCalendarDate(undefined);
		}
	}, [editedExpiryDate]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<FileText className='h-5 w-5' />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className='text-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto'></div>
						<p className='mt-2 text-sm text-gray-600'>Loading...</p>
					</div>
				) : (
					<div className='space-y-4'>
						{expiryDate && !isEditing && (
							<div className='flex items-center justify-between'>
								<Label>Status</Label>
								{getStatusBadge(expiryDate)}
							</div>
						)}
						<div>
							<Label>Document Number</Label>
							{isEditing ? (
								<Input
									value={editedDocNumber || ''}
									onChange={(e) => {
										console.log(
											`📝 ${type} document number changed:`,
											e.target.value
										);
										onEdit(docNumberField, e.target.value);
									}}
									placeholder={`Enter ${title.toLowerCase()} number`}
									className='mt-1'
								/>
							) : (
								<p className='text-gray-900 font-mono mt-1'>
									{documentNumber || '-'}
								</p>
							)}
						</div>
						<div>
							<Label>Expiry Date</Label>
							{isEditing ? (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant='outline'
											className={cn(
												'w-full justify-start text-left font-normal mt-1',
												!calendarDate && 'text-muted-foreground'
											)}>
											<CalendarIcon className='mr-2 h-4 w-4' />
											{calendarDate ? (
												format(calendarDate, 'PPP')
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0'>
										<Calendar
											mode='single'
											selected={calendarDate}
											onSelect={(date) => {
												setCalendarDate(date);
												if (date) {
													const formattedDate = format(date, 'yyyy-MM-dd');
													console.log(
														`📅 ${type} expiry date changed:`,
														formattedDate
													);
													onEdit(expiryDateField, formattedDate);
												}
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							) : (
								<p className='text-gray-900 mt-1'>
									{expiryDate
										? new Date(
												expiryDate
											).toLocaleDateString()
										: '-'}
								</p>
							)}
						</div>
						<div>
							<Label>File URLs</Label>
							{fileUrls && fileUrls.length > 0 ? (
								<div className='space-y-1 mt-1'>
									{fileUrls.map(
										(url: string, index: number) => (
											<a
												key={index}
												href={url}
												target='_blank'
												rel='noopener noreferrer'
												className='text-blue-600 hover:underline text-sm break-all block'>
												File {index + 1}: {url}
											</a>
										)
									)}
								</div>
							) : (
								<p className='text-gray-900 mt-1'>-</p>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
