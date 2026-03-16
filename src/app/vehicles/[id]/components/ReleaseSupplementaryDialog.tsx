'use client';

// import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	// DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AssignSupplementaryDialogProps {
	vehicleId: number;
	showReleaseDialog: boolean;
	setShowReleaseDialog: (open: boolean) => void;
	onSuccess?: () => void;
	endDate: string;
	setEndDate: (endDate: string) => void;
	cost: string;
	setCost: (cost: string) => void;
	isLoading: boolean;
	handleRelease: () => void;
}

export function ReleaseSupplementaryDialog({
	vehicleId,
	showReleaseDialog,
	setShowReleaseDialog,
	onSuccess,
	isLoading,
	setCost,
	cost,
	setEndDate,
	endDate,
	handleRelease,
}: AssignSupplementaryDialogProps) {
	return (
		<Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Release Supplementary Vehicle</DialogTitle>
				</DialogHeader>

				<div className='py-2'>
					<Label htmlFor='release-end-date' className='mb-1 block'>
						End date <span className='text-red-500'>*</span>
					</Label>
					<Input
						id='release-end-date'
						type='date'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						disabled={isLoading}
					/>
				</div>

				<div className='py-2'>
					<Label htmlFor='release-cost' className='mb-1 block'>
						Cost{' '}
						<span className='text-gray-400 text-xs font-normal'>
							Optional, leave blank to keep original value
						</span>
					</Label>
					<Input
						id='release-cost'
						type='number'
						min='0'
						step='0.01'
						// placeholder=' 500.00'
						value={cost}
						onChange={(e) => setCost(e.target.value)}
						disabled={isLoading}
					/>
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setShowReleaseDialog(false)}
						disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleRelease}
						disabled={isLoading || !endDate}
						variant='default'
						className='border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'>
						{isLoading ? 'Processing...' : 'Release'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
