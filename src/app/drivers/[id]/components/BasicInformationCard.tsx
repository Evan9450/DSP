'use client';

import { Key, Mail, MapPin, Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface BasicInformationCardProps {
	driver: any;
	editedDriver: any;
	isEditing: boolean;
	onEdit: (field: string, value: string) => void;
	validationErrors?: {
		email?: string;
		phone?: string;
	};
}

export function BasicInformationCard({
	driver,
	editedDriver,
	isEditing,
	onEdit,
	validationErrors = {},
}: BasicInformationCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<User className='h-5 w-5' />
					Basic Information
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div>
						<Label className='mb-2 block'>Name</Label>
						{isEditing ? (
							<Input
								value={editedDriver?.name || ''}
								onChange={(e) => onEdit('name', e.target.value)}
							/>
						) : (
							<p className='text-gray-900 font-medium'>
								{driver.name}
							</p>
						)}
					</div>
					<div>
						<Label className='flex items-center gap-2 mb-2'>
							<Key className='h-4 w-4' />
							Amazon ID
						</Label>
						{isEditing ? (
							<Input
								value={editedDriver?.amazon_id || ''}
								onChange={(e) =>
									onEdit('amazon_id', e.target.value)
								}
							/>
						) : (
							<p className='text-gray-900 font-mono'>
								{driver.amazon_id}
							</p>
						)}
					</div>
					<div>
						<Label className='flex items-center gap-2 mb-2'>
							<Phone className='h-4 w-4' />
							Phone
						</Label>
						{isEditing ? (
							<>
								<Input
									value={editedDriver?.phone || ''}
									onChange={(e) => onEdit('phone', e.target.value)}
									className={validationErrors.phone ? 'border-red-500' : ''}
									placeholder='04XX XXX XXX or +61 4XX XXX XXX'
								/>
								{validationErrors.phone && (
									<p className='text-red-500 text-xs mt-1'>
										{validationErrors.phone}
									</p>
								)}
							</>
						) : (
							<p className='text-gray-900'>{driver.phone || '-'}</p>
						)}
					</div>
					<div>
						<Label className='flex items-center gap-2 mb-2'>
							<Mail className='h-4 w-4' />
							Email
						</Label>
						{isEditing ? (
							<>
								<Input
									type='email'
									value={editedDriver?.email || ''}
									onChange={(e) => onEdit('email', e.target.value)}
									className={validationErrors.email ? 'border-red-500' : ''}
									placeholder='example@email.com'
								/>
								{validationErrors.email && (
									<p className='text-red-500 text-xs mt-1'>
										{validationErrors.email}
									</p>
								)}
							</>
						) : (
							<p className='text-gray-900'>{driver.email || '-'}</p>
						)}
					</div>
					<div>
						<Label className='flex items-center gap-2 mb-2'>
							Deputy ID
							<span className='text-xs text-gray-500 font-normal'>
								(Auto-synced from Deputy)
							</span>
						</Label>
						<Input
							value={driver.deputy_id || ''}
							disabled
							className='bg-gray-50 cursor-not-allowed'
							placeholder='Not synced yet'
						/>
					</div>
					<div>
						<Label className='mb-2 block'>Status</Label>
						<p>
							{driver.is_active ? (
								<Badge className='bg-green-500'>Active</Badge>
							) : (
								<Badge variant='destructive'>Inactive</Badge>
							)}
						</p>
					</div>
					<div className='md:col-span-2'>
						<Label className='flex items-center gap-2 mb-2'>
							<MapPin className='h-4 w-4' />
							Address
						</Label>
						{isEditing ? (
							<Input
								value={editedDriver?.address || ''}
								onChange={(e) => onEdit('address', e.target.value)}
							/>
						) : (
							<p className='text-gray-900'>{driver.address || '-'}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
