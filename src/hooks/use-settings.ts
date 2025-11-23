import { useState, useEffect } from 'react';
import { apiClient, SystemConfigResponse } from '@/lib/api/client';

export function useSettings() {
	const [settings, setSettings] = useState<SystemConfigResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchSettings = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getSystemConfig();
			setSettings(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch settings:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSettings();
	}, []);

	return {
		settings,
		isLoading,
		error,
		refetch: fetchSettings,
	};
}
