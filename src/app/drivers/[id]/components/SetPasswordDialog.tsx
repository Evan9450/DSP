'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface SetPasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	driverName: string;
	onSetPassword: (password: string) => Promise<void>;
}

export function SetPasswordDialog({
	open,
	onOpenChange,
	driverName,
	onSetPassword,
}: SetPasswordDialogProps) {
	const [newPassword, setNewPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!newPassword) return;

		setIsSubmitting(true);
		try {
			await onSetPassword(newPassword);
			setNewPassword('');
			onOpenChange(false);
		} catch (error) {
			// Error handling is done in the parent
			console.error('Failed to set password:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Set Driver Password</DialogTitle>
					<DialogDescription>
						Set a password for {driverName} to access the driver
						inspection app.
					</DialogDescription>
				</DialogHeader>
				<div className='py-4'>
					<Label>New Password</Label>
					<Input
						type='password'
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder='Enter new password'
						onKeyDown={(e) => {
							if (e.key === 'Enter' && newPassword) {
								handleSubmit();
							}
						}}
					/>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => {
							setNewPassword('');
							onOpenChange(false);
						}}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!newPassword || isSubmitting}>
						{isSubmitting ? 'Setting...' : 'Set Password'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
