'use client';

import {
	CalendarIcon,
	ExternalLink,
	Eye,
	FileText,
	Trash2,
	X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface filePreProps {
	previewOpen: boolean;
	setPreviewOpen: (open: boolean) => void;
	previewLoading: boolean;
	previewError: boolean;
	previewUrl: string;
	setPreviewError: (open: boolean) => void;
}
const FilePreviewDialog = ({
	previewOpen,
	setPreviewOpen,
	previewLoading,
	previewError,
	previewUrl,
	setPreviewError,
}: filePreProps) => {
	return (
		<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
			<DialogContent className='max-w-4xl max-h-[90vh] bg-white'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<DialogTitle className='text-2xl font-bold text-zinc-900'>
							File Preview
						</DialogTitle>
						{/* <Button
							variant='ghost'
							size='sm'
							onClick={() => setPreviewOpen(false)}
							className='h-8 w-8 p-0'>
							<X className='h-4 w-4' />
						</Button> */}
					</div>
				</DialogHeader>
				<div className='mt-4 flex items-center justify-center min-h-[400px]'>
					{previewLoading ? (
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
							<p className='mt-4 text-sm text-gray-500'>
								Loading preview...
							</p>
						</div>
					) : previewError ? (
						<div className='text-center'>
							<FileText className='h-12 w-12 text-rose-500 mx-auto mb-4' />
							<p className='text-base text-gray-700'>
								Failed to load preview
							</p>
							<p className='text-sm text-gray-500 mt-2'>
								The file may be in an unsupported format
							</p>
						</div>
					) : (
						<div className='w-full h-full overflow-auto'>
							<img
								src={previewUrl}
								alt='File preview'
								className='max-w-full h-auto mx-auto rounded-lg'
								onError={() => setPreviewError(true)}
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default FilePreviewDialog;
