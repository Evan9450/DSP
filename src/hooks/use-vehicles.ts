import { useState, useEffect } from 'react';
import { apiClient, VehicleResponse, VehicleInspectionResponse } from '@/lib/api/client';

export function useVehicles() {
	const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchVehicles = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getVehicles();
			// Sort by ID to maintain consistent order
			const sortedData = [...data].sort((a, b) => a.id - b.id);
			setVehicles(sortedData);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch vehicles:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchVehicles();
	}, []);

	return {
		vehicles,
		isLoading,
		error,
		refetch: fetchVehicles,
	};
}

export function useVehicle(vehicleId: number | null) {
	const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchVehicle = async () => {
		if (!vehicleId) {
			setVehicle(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getVehicle(vehicleId);
			setVehicle(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch vehicle:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchVehicle();
	}, [vehicleId]);

	return {
		vehicle,
		isLoading,
		error,
		refetch: fetchVehicle,
	};
}

export function useVehicleInspections(vehicleId: number | null) {
	const [inspections, setInspections] = useState<VehicleInspectionResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchInspections = async () => {
		if (!vehicleId) {
			setInspections([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getVehicleInspections(vehicleId);
			setInspections(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch vehicle inspections:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchInspections();
	}, [vehicleId]);

	return {
		inspections,
		isLoading,
		error,
		refetch: fetchInspections,
	};
}
