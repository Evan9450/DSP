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
export const handleFileAction = async (
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
		try {
			// Fetch the file as a blob to force download instead of opening in browser
			const response = await fetch(fullUrl, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			
			if (!response.ok) throw new Error('Network response was not ok');
			
			const blob = await response.blob();
			const objectUrl = window.URL.createObjectURL(blob);
			
			const a = document.createElement('a');
			a.href = objectUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
		} catch (error) {
			console.error('Download failed:', error);
			// Fallback: open in new tab if fetch fails due to CORS or other issues
			window.open(fullUrl, '_blank');
		}
	}
};
