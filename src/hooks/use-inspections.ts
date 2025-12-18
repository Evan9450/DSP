import { useState, useEffect } from 'react';
import { apiClient, VehicleInspectionResponse, VehicleInspectionPhotoResponse } from '@/lib/api/client';

interface UseInspectionsParams {
	vehicle_id?: number;
	driver_id?: number;
	reviewed?: boolean;
	inspection_status?: 0 | 1 | 2; // 0=pending, 1=passed, 2=failed
	inspection_date?: string; // YYYY-MM-DD
	start_date?: string; // YYYY-MM-DD
	end_date?: string; // YYYY-MM-DD
	skip?: number;
	limit?: number;
}

/**
 * Hook for fetching vehicle inspections with filters
 * @param params Filter parameters
 * @returns Inspections data, loading state, error, and refetch function
 */
export function useInspections(params?: UseInspectionsParams) {
	const [inspections, setInspections] = useState<VehicleInspectionResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchInspections = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.listInspections(params);
			setInspections(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch inspections:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchInspections();
	}, [
		params?.vehicle_id,
		params?.driver_id,
		params?.reviewed,
		params?.inspection_status,
		params?.inspection_date,
		params?.start_date,
		params?.end_date,
		params?.skip,
		params?.limit,
	]);

	return {
		inspections,
		isLoading,
		error,
		refetch: fetchInspections,
	};
}

/**
 * Hook for fetching inspection photos for a specific vehicle
 * @param vehicleId Vehicle ID
 * @param params Optional filter parameters
 * @returns Inspection photo data, loading state, error, and refetch function
 */
export function useVehicleInspectionPhotos(
	vehicleId: number | null,
	params?: {
		inspection_date?: string;
		skip?: number;
		limit?: number;
	}
) {
	const [photos, setPhotos] = useState<VehicleInspectionPhotoResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchPhotos = async () => {
		if (!vehicleId) {
			setPhotos([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getVehicleInspectionPhotos(vehicleId, params);
			setPhotos(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch inspection photos:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPhotos();
	}, [vehicleId, params?.inspection_date, params?.skip, params?.limit]);

	return {
		photos,
		isLoading,
		error,
		refetch: fetchPhotos,
	};
}

/**
 * Hook for fetching a single inspection by ID (using list with filters)
 * @param inspectionId Inspection ID
 * @returns Single inspection data, loading state, error, and refetch function
 */
export function useInspection(inspectionId: number | null) {
	const [inspection, setInspection] = useState<VehicleInspectionResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchInspection = async () => {
		if (!inspectionId) {
			setInspection(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			// Note: There's no direct get endpoint, so we'd need to list and filter
			// For now, we'll just set this as a placeholder
			// In a real implementation, you might want to cache all inspections
			// or add a dedicated endpoint
			setInspection(null);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch inspection:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchInspection();
	}, [inspectionId]);

	return {
		inspection,
		isLoading,
		error,
		refetch: fetchInspection,
	};
}
