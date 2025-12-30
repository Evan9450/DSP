'use client';

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
import { useState } from 'react';

const MIN_PASSWORD_LENGTH = 6;
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

	const isPasswordValid = newPassword.length >= MIN_PASSWORD_LENGTH;

	const handleSubmit = async () => {
		if (!isPasswordValid) return;

		setIsSubmitting(true);
		try {
			await onSetPassword(newPassword);
			setNewPassword('');
			onOpenChange(false);
		} catch (error) {
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
					{/* Hint message */}
					{newPassword.length > 0 && !isPasswordValid && (
						<p className='text-sm text-destructive'>
							Password must be at least {MIN_PASSWORD_LENGTH}{' '}
							characters.
						</p>
					)}
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
