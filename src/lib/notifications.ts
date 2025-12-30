/**
 * Global Notification Utility
 *
 * This utility provides a consistent way to show notifications across the app.
 * Uses Sonner for modern, beautiful toast notifications.
 */

import { toast } from 'sonner';

/**
 * Notification Helper
 *
 * Usage:
 * import { notify } from '@/lib/notifications';
 *
 * notify.success('Driver created successfully');
 * notify.error('Failed to create driver');
 * notify.warning('Document expiring soon');
 * notify.info('Deputy sync started');
 */
export const notify = {
	/**
	 * Show a success notification
	 * @param message - Main message to display
	 * @param title - Optional title/subtitle
	 */
	success: (message: string, title?: string) => {
		toast.success(message, title ? { description: title } : undefined);
	},

	/**
	 * Show an error notification
	 * @param message - Main error message to display
	 * @param title - Optional title/subtitle
	 */
	error: (message: string, title?: string) => {
		toast.error(message, title ? { description: title } : undefined);
	},

	/**
	 * Show a warning notification
	 * @param message - Main warning message to display
	 * @param title - Optional title/subtitle
	 */
	warning: (message: string, title?: string) => {
		toast.warning(message, title ? { description: title } : undefined);
	},

	/**
	 * Show an info notification
	 * @param message - Main info message to display
	 * @param title - Optional title/subtitle
	 */
	info: (message: string, title?: string) => {
		toast.info(message, title ? { description: title } : undefined);
	},

	/**
	 * Show a loading notification (returns toast id for dismissal)
	 * @param message - Loading message to display
	 * @param title - Optional title/subtitle
	 */
	loading: (message: string, title?: string) => {
		return toast.loading(
			message,
			title ? { description: title } : undefined
		);
	},

	/**
	 * Dismiss a specific toast by id, or all toasts if no id provided
	 */
	dismiss: (toastId?: string | number) => {
		toast.dismiss(toastId);
	},

	/**
	 * Promise-based notification (shows loading, then success/error)
	 */
	promise: <T>(
		promise: Promise<T>,
		messages: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((error: any) => string);
		}
	) => {
		return toast.promise(promise, messages);
	},
};

/**
 * API Error Handler
 *
 * Usage:
 * import { handleApiError } from '@/lib/notifications';
 *
 * try {
 *   await apiClient.createDriver(data);
 * } catch (error) {
 *   handleApiError(error, 'Failed to create driver');
 * }
 */
export const handleApiError = (
	error: any,
	defaultMessage: string = 'An error occurred'
) => {
	const errorMessage =
		error.response?.data?.detail || error.message || defaultMessage;
	notify.error(errorMessage);
};

/**
 * Success Message Templates
 *
 * All messages support optional parameters for flexibility
 *
 * Usage:
 * notify.success(successMessages.driver.created());
 * notify.success(successMessages.driver.created('John Doe'));
 */
export const successMessages = {
	driver: {
		created: (name?: string) =>
			name
				? `Driver "${name}" created successfully`
				: 'Driver created successfully',
		updated: (name?: string) =>
			name
				? `Driver "${name}" updated successfully`
				: 'Driver information updated successfully',
		deleted: (name?: string) =>
			name
				? `Driver "${name}" deleted successfully`
				: 'Driver deleted successfully',
		passwordSet: (name?: string) =>
			name ? `Password set for ${name}` : 'Password set successfully',
		documentUploaded: (type?: string) =>
			type
				? `${type} uploaded successfully`
				: 'Document uploaded successfully',
		documentUpdated: (type?: string) =>
			type
				? `${type} updated successfully`
				: 'Document updated successfully',
		fileDeleted: (name?: string, type?: string) =>
			name && type
				? `${type} file deleted for ${name}`
				: 'File deleted successfully',
	},
	vehicle: {
		created: (name?: string) =>
			name
				? `Vehicle "${name}" created successfully`
				: 'Vehicle created successfully',
		updated: (name?: string) =>
			name
				? `Vehicle "${name}" updated successfully`
				: 'Vehicle updated successfully',
		deleted: (name?: string) =>
			name
				? `Vehicle "${name}" deleted successfully`
				: 'Vehicle deleted successfully',
	},
	user: {
		created: (name?: string) =>
			name
				? `User "${name}" created successfully`
				: 'User created successfully',
		updated: (name?: string) =>
			name
				? `User "${name}" updated successfully`
				: 'User updated successfully',
		deleted: (name?: string) =>
			name
				? `User "${name}" deleted successfully`
				: 'User deleted successfully',
	},
	sync: {
		deputy: (stats?: {
			synced: number;
			newDrivers: number;
			updated: number;
		}) =>
			stats
				? `Deputy sync completed!`
				: 'Deputy sync completed successfully',
		amazonIds: (count?: number) =>
			count
				? `${count} Amazon IDs imported successfully`
				: 'Amazon IDs imported successfully',
	},
};

/**
 * Error Message Templates
 *
 * All messages support optional parameters for flexibility
 *
 * Usage:
 * notify.error(errorMessages.driver.createFailed());
 * notify.error(errorMessages.driver.createFailed('John Doe'));
 */
export const errorMessages = {
	driver: {
		createFailed: (name?: string) =>
			name
				? `Failed to create driver "${name}"`
				: 'Failed to create driver',
		updateFailed: (name?: string) =>
			name
				? `Failed to update driver "${name}"`
				: 'Failed to update driver information',
		deleteFailed: (name?: string) =>
			name
				? `Failed to delete driver "${name}"`
				: 'Failed to delete driver',
		passwordFailed: (name?: string) =>
			name
				? `Failed to set password for ${name}`
				: 'Failed to set password',
		documentFailed: (type?: string) =>
			type ? `Failed to upload ${type}` : 'Failed to upload document',
		fileDeleteFailed: (name?: string, type?: string) =>
			name && type
				? `Failed to delete ${type} file for ${name}`
				: 'Failed to delete file',
		notFound: (id?: string | number) =>
			id ? `Driver with ID ${id} not found` : 'Driver not found',
	},
	vehicle: {
		createFailed: (name?: string) =>
			name
				? `Failed to create vehicle "${name}"`
				: 'Failed to create vehicle',
		updateFailed: (name?: string) =>
			name
				? `Failed to update vehicle "${name}"`
				: 'Failed to update vehicle',
		deleteFailed: (name?: string) =>
			name
				? `Failed to delete vehicle "${name}"`
				: 'Failed to delete vehicle',
		notFound: (id?: string | number) =>
			id ? `Vehicle with ID ${id} not found` : 'Vehicle not found',
	},
	user: {
		createFailed: (name?: string) =>
			name
				? `Failed to create user "${name}"`
				: 'Failed to create user',
		updateFailed: (name?: string) =>
			name
				? `Failed to update user "${name}"`
				: 'Failed to update user',
		deleteFailed: (name?: string) =>
			name
				? `Failed to delete user "${name}"`
				: 'Failed to delete user',
		notFound: (id?: string | number) =>
			id ? `User with ID ${id} not found` : 'User not found',
	},
	sync: {
		deputyFailed: (reason?: string) =>
			reason
				? `Failed to sync Deputy drivers: ${reason}`
				: 'Failed to sync Deputy drivers',
		amazonIdsFailed: (reason?: string) =>
			reason
				? `Failed to import Amazon IDs: ${reason}`
				: 'Failed to import Amazon IDs',
	},
	validation: {
		requiredField: (fieldName?: string) =>
			fieldName
				? `Please fill in the ${fieldName} field`
				: 'Please fill in all required fields',
		invalidEmail: () => 'Please enter a valid email address',
		invalidPhone: () => 'Please enter a valid phone number',
		invalidFormat: (fieldName: string) => `Invalid ${fieldName} format`,
		minLength: (fieldName: string, min: number) =>
			`${fieldName} must be at least ${min} characters`,
		maxLength: (fieldName: string, max: number) =>
			`${fieldName} must not exceed ${max} characters`,
	},
};
