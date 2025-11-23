import { useState, useEffect } from 'react';
import { apiClient, VehicleInspectionResponse } from '@/lib/api/client';

interface UseInspectionsParams {
	vehicleId?: number;
	driverId?: number;
	reviewed?: boolean;
	inspectionDate?: string; // YYYY-MM-DD format
}

export function useInspections(params?: UseInspectionsParams) {
	const [inspections, setInspections] = useState<VehicleInspectionResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchInspections = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.listInspections(
				params?.vehicleId,
				params?.driverId,
				params?.reviewed
			);

			// Filter by inspection date if provided
			let filteredData = data;
			if (params?.inspectionDate) {
				filteredData = data.filter(
					(inspection) => inspection.inspection_date === params.inspectionDate
				);
			}

			setInspections(filteredData);
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
	}, [params?.vehicleId, params?.driverId, params?.reviewed, params?.inspectionDate]);

	return {
		inspections,
		isLoading,
		error,
		refetch: fetchInspections,
	};
}
