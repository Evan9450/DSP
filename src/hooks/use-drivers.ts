import { useState, useEffect } from 'react';
import { apiClient, DriverResponse } from '@/lib/api/client';

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
			console.log('🔄 useDriver: Fetching driver with ID:', driverId);
			const data = await apiClient.getDriver(driverId);
			console.log('✅ useDriver: Fetched driver data:', data);
			console.log('📋 useDriver: Document fields:', {
				license_number: data.license_number,
				license_expiry_date: data.license_expiry_date,
				visa_number: data.visa_number,
				visa_expiry_date: data.visa_expiry_date,
				deputy_id: data.deputy_id,
			});
			setDriver(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('❌ useDriver: Failed to fetch driver:', err);
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

