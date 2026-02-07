'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	MessageTemplateResponse,
	MessageTemplateUpdate,
} from '@/lib/api/client';
import { useEffect, useState } from 'react';

interface MessageTemplateDialogProps {
	template: MessageTemplateResponse | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (key: string, data: MessageTemplateUpdate) => Promise<void>;
}

export function MessageTemplateDialog({
	template,
	open,
	onOpenChange,
	onSave,
}: MessageTemplateDialogProps) {
	const [formData, setFormData] = useState<MessageTemplateUpdate>({
		subject: '',
		content: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (template) {
			setFormData({
				subject: template.subject || '',
				content: template.content,
			});
		}
	}, [template]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!template) return;

		try {
			setIsSaving(true);
			await onSave(template.template_key, formData);
			onOpenChange(false);
		} catch (error) {
			console.error('Failed to save template', error);
		} finally {
			setIsSaving(false);
		}
	};

	if (!template) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>Edit Template: {template.name}</DialogTitle>
					<DialogDescription>
						Make changes to the message template here. Click save
						when you're done.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					{template.template_type === 'email' && (
						<div className='grid gap-2'>
							<Label htmlFor='subject'>Subject</Label>
							<Input
								id='subject'
								value={formData.subject || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										subject: e.target.value,
									})
								}
							/>
						</div>
					)}
					<div className='grid gap-2'>
						<Label htmlFor='content'>Content</Label>
						<Textarea
							id='content'
							value={formData.content || ''}
							onChange={(e) =>
								setFormData({
									...formData,
									content: e.target.value,
								})
							}
							rows={10}
							className='font-mono text-sm'
						/>
						<p className='text-xs text-muted-foreground'>
							Available variables:{' '}
							{template.variables.map((v) => `{${v}}`).join(', ')}
						</p>
					</div>
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type='submit' disabled={isSaving}>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
