import { useState, useEffect } from 'react';
import { apiClient, DriverResponse, DriverDocumentResponse } from '@/lib/api/client';

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

export function useDriverDocuments(driverId: number | null) {
	const [documents, setDocuments] = useState<DriverDocumentResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchDocuments = async () => {
		if (!driverId) {
			setDocuments([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getDriverDocuments(driverId);
			setDocuments(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch driver documents:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDocuments();
	}, [driverId]);

	return {
		documents,
		isLoading,
		error,
		refetch: fetchDocuments,
	};
}
