import { TokenManager } from './api/client';

/**
 * Checks if a file URL points to an image based on its extension.
 */
export const isImageFile = (url: string): boolean => {
	const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
	const path = url.split('?')[0];
	const extension = path.split('.').pop()?.toLowerCase();
	return extension ? imageExtensions.includes(extension) : false;
};

/**
 * Handles the file action: previews images and downloads other formats.
 */
export const handleFileAction = (
	url: string,
	filename: string,
	setPreviewUrl: (url: string) => void,
	setPreviewOpen: (open: boolean) => void,
	setPreviewLoading: (loading: boolean) => void,
	setPreviewError: (error: boolean) => void,
) => {
	const token = TokenManager.getToken();
	const fullUrl = url.includes('?') ? `${url}&token=${token}` : `${url}?token=${token}`;

	if (isImageFile(url)) {
		setPreviewUrl(fullUrl);
		setPreviewOpen(true);
		setPreviewLoading(false);
		setPreviewError(false);
	} else {
		// Use window.open synchronously to bypass popup blockers.
		// For unsupported formats like DOCX, the browser will download it automatically and close the tab.
		// For supported formats like PDF, it opens safely in a new tab without disrupting the current page state.
		window.open(fullUrl, '_blank', 'noopener,noreferrer');
	}
};
