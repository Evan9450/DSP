'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	apiClient,
	MessageTemplateResponse,
	MessageTemplateUpdate,
} from '@/lib/api/client';
import { Mail, MessageSquare, RefreshCcw, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { MessageTemplateDialog } from './message-template-dialog';
import { useToast } from '@/hooks/use-toast';

export function MessageTemplateList() {
	const { toast } = useToast();
	const [templates, setTemplates] = useState<MessageTemplateResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingTemplate, setEditingTemplate] =
		useState<MessageTemplateResponse | null>(null);

	const fetchTemplates = useCallback(async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getMessageTemplates();
			setTemplates(data);
		} catch (error) {
			console.error('Failed to fetch templates', error);
			toast({
				title: 'Error',
				description: 'Failed to load message templates',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchTemplates();
	}, [fetchTemplates]);

	const handleSave = async (key: string, data: MessageTemplateUpdate) => {
		try {
			await apiClient.updateMessageTemplate(key, data);
			toast({
				title: 'Success',
				description: 'Template updated successfully',
			});
			fetchTemplates();
		} catch (error) {
			console.error('Failed to update template', error);
			toast({
				title: 'Error',
				description: 'Failed to update template',
				variant: 'destructive',
			});
			throw error;
		}
	};

	const handleReset = async (template: MessageTemplateResponse) => {
		if (
			!confirm(
				'Are you sure you want to reset this template to its default content?',
			)
		) {
			return;
		}

		try {
			await apiClient.resetMessageTemplate(template.template_key);
			toast({
				title: 'Success',
				description: 'Template reset successfully',
			});
			fetchTemplates();
		} catch (error) {
			console.error('Failed to reset template', error);
			toast({
				title: 'Error',
				description: 'Failed to reset template',
				variant: 'destructive',
			});
		}
	};

	return (
		<Card className='p-6 bg-white'>
			<CardHeader className='px-0 pt-0'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='p-2 bg-purple-100 rounded-lg'>
							<MessageSquare className='h-5 w-5 text-purple-700' />
						</div>
						<div>
							<CardTitle className='text-xl font-bold text-gray-900'>
								Message Templates
							</CardTitle>
							<CardDescription>
								Manage email and SMS templates used by the
								system
							</CardDescription>
						</div>
					</div>
					<Button
						variant='outline'
						size='sm'
						onClick={fetchTemplates}
						disabled={isLoading}>
						<RefreshCcw
							className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
						/>
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent className='px-0 pb-0'>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								{/* <TableHead>Subject</TableHead> */}
								<TableHead className='text-center'>
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className='text-center py-8 text-muted-foreground'>
										Loading templates...
									</TableCell>
								</TableRow>
							) : templates.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className='text-center py-8 text-muted-foreground'>
										No templates found
									</TableCell>
								</TableRow>
							) : (
								templates.map((template) => (
									<TableRow key={template.id}>
										<TableCell className='font-medium'>
											{template.name}
											{template.is_system && (
												<span className='ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded'>
													System
												</span>
											)}
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												{template.template_type ===
												'email' ? (
													<Mail className='h-4 w-4 text-gray-500' />
												) : (
													<MessageSquare className='h-4 w-4 text-gray-500' />
												)}
												<span className='capitalize'>
													{template.template_type}
												</span>
											</div>
										</TableCell>
										{/* <TableCell className='max-w-[200px] truncate'>
											{template.subject || '-'}
										</TableCell> */}
										<TableCell className='flex items-center justify-center'>
											<div className='flex items-center justify-end gap-2'>
												{template.is_system && (
													<Button
														variant='outline'
													size='sm'
														onClick={() =>
															handleReset(
																template,
															)
														}
														title='Reset to default'>
														Reset
														{/* <RotateCcw className='h-4 w-4 text-orange-500' /> */}
													</Button>
												)}
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														setEditingTemplate(
															template,
														)
													}>
													Edit
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>

			<MessageTemplateDialog
				open={!!editingTemplate}
				onOpenChange={(open) => !open && setEditingTemplate(null)}
				template={editingTemplate}
				onSave={handleSave}
			/>
		</Card>
	);
}
