import { useState, useEffect } from 'react';
import { apiClient, DriverResponse, DriverFileResponse } from '@/lib/api/client';

export function useDrivers() {
	const [drivers, setDrivers] = useState<DriverResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchDrivers = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getDrivers();
			setDrivers(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch drivers:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDrivers();
	}, []);

	return {
		drivers,
		isLoading,
		error,
		refetch: fetchDrivers,
	};
}

export function useDriver(driverId: number | null) {
	const [driver, setDriver] = useState<DriverResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchDriver = async () => {
		if (!driverId) {
			setDriver(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getDriver(driverId);
			setDriver(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch driver:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDriver();
	}, [driverId]);

	return {
		driver,
		isLoading,
		error,
		refetch: fetchDriver,
	};
}

export function useDriverFiles(driverId: number | null) {
	const [files, setFiles] = useState<DriverFileResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchFiles = async () => {
		if (!driverId) {
			setFiles([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getDriverFiles(driverId);
			setFiles(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch driver files:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchFiles();
	}, [driverId]);

	return {
		files,
		isLoading,
		error,
		refetch: fetchFiles,
	};
}

// Backwards compatibility
export const useDriverDocuments = useDriverFiles;
