'use client';

import {
	FileText,
	X,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

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
	const [isImgLoading, setIsImgLoading] = useState(false);

	// previewUrl 变化（新图片打开）时重置图片 loading 状态
	useEffect(() => {
		if (previewUrl) {
			setIsImgLoading(true);
		}
	}, [previewUrl]);

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
				<div className='mt-4 flex items-center justify-center h-[calc(90vh-8rem)] min-h-[300px]'>
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
						<div className='w-full h-full flex items-center justify-center overflow-hidden relative'>
							{/* 图片自身加载中的 spinner */}
							{isImgLoading && (
								<div className='absolute inset-0 flex items-center justify-center'>
									<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
								</div>
							)}
							<img
								loading='lazy'
								src={previewUrl}
								alt='File preview'
								className={`max-w-full max-h-full object-contain mx-auto rounded-lg transition-opacity duration-300 ${isImgLoading ? 'opacity-0' : 'opacity-100'}`}
								onLoad={() => setIsImgLoading(false)}
								onError={() => {
									setIsImgLoading(false);
									setPreviewError(true);
								}}
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default FilePreviewDialog;
