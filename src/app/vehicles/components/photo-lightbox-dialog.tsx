'use client';

import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

interface PhotoLightboxDialogProps {
	photoUrls: string[];
	selectedPhotoIndex: number | null;
	isEditing: boolean;
	onClose: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onDelete: (index: number) => Promise<void>;
}

export function PhotoLightboxDialog({
	photoUrls,
	selectedPhotoIndex,
	isEditing,
	onClose,
	onPrevious,
	onNext,
	onDelete,
}: PhotoLightboxDialogProps) {
	return (
		<Dialog open={selectedPhotoIndex !== null} onOpenChange={onClose}>
			<DialogContent className='max-w-5xl max-h-[95vh] p-0'>
				<DialogHeader className='px-6 pt-6 pb-2'>
					<DialogTitle className='flex items-center justify-between'>
						<span>
							Photo{' '}
							{selectedPhotoIndex !== null
								? selectedPhotoIndex + 1
								: 0}{' '}
							of {photoUrls.length}
						</span>
						{/* {selectedPhotoIndex !== null && !isEditing && (
							<Button
								variant='destructive'
								size='sm'
								onClick={async () => {
									const index = selectedPhotoIndex;
									try {
										await onDelete(index);
										// Close dialog or move to next photo if available
										if (photoUrls.length <= 1) {
											onClose();
										} else if (index >= photoUrls.length - 1) {
											// Photo will be removed, so we need to adjust
											// This will be handled by the parent component
										}
									} catch (error) {
										// Error already handled in parent
									}
								}}
								className='ml-4'>
								<Trash2 className='h-4 w-4 mr-2' />
								Delete
							</Button>
						)} */}
					</DialogTitle>
				</DialogHeader>
				{selectedPhotoIndex !== null && (
					<div className='relative flex items-center justify-center bg-gray-100 px-4 pb-6'>
						{/* Previous Button */}
						<Button
							variant='outline'
							size='icon'
							onClick={onPrevious}
							className='absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg'
							disabled={photoUrls.length <= 1}>
							<ChevronLeft className='h-6 w-6' />
						</Button>

						{/* Photo */}
						<div className='w-full flex items-center justify-center py-4'>
							<img
								src={photoUrls[selectedPhotoIndex]}
								alt={`Vehicle photo ${selectedPhotoIndex + 1}`}
								className='max-w-full max-h-[75vh] object-contain rounded-lg'
								crossOrigin='anonymous'
							/>
						</div>

						{/* Next Button */}
						<Button
							variant='outline'
							size='icon'
							onClick={onNext}
							className='absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg'
							disabled={photoUrls.length <= 1}>
							<ChevronRight className='h-6 w-6' />
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
