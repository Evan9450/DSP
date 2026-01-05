'use client';

import { ArrowLeft, Edit, Save, Shield, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface DriverHeaderProps {
	driverName: string;
	isEditing: boolean;
	hasChanges: boolean;
	onBack: () => void;
	onSetPassword: () => void;
	onEdit: () => void;
	onSave: () => void;
	onCancel: () => void;
}

export function DriverHeader({
	driverName,
	isEditing,
	hasChanges,
	onBack,
	onSetPassword,
	onEdit,
	onSave,
	onCancel,
}: DriverHeaderProps) {
	return (
		<div className='mb-6'>
			<Button variant='ghost' onClick={onBack} className='mb-4'>
				<ArrowLeft className='h-4 w-4 mr-2' />
				Back
			</Button>
			<div className='flex items-start justify-between'>
				<div>
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						{driverName}
					</h1>
					<p className='text-sm text-gray-600 mt-1'>Driver Details</p>
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						onClick={onSetPassword}
						className='border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-700'>
						<Shield className='h-4 w-4 mr-2' />
						Set Password
					</Button>
					{isEditing ? (
						<>
							<Button variant='outline' onClick={onCancel}>
								<X className='h-4 w-4 mr-2' />
								Cancel
							</Button>
							<Button
								onClick={onSave}
								disabled={!hasChanges}
								className='bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'>
								<Save className='h-4 w-4 mr-2' />
								Save
							</Button>
						</>
					) : (
						<Button
							onClick={onEdit}
							className='bg-blue-700 hover:bg-blue-800'>
							<Edit className='h-4 w-4 mr-2' />
							Edit
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
