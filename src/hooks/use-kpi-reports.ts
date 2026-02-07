import { useCallback, useEffect, useState } from 'react';

import { KPIReportResponse } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';

export function useKpiReports() {
	const [reports, setReports] = useState<KPIReportResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const { toast } = useToast();

	const fetchReports = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await apiClient.getKpiReports();
			setReports(data);
		} catch (err) {
			console.error('Failed to fetch KPI reports:', err);
			setError(err instanceof Error ? err : new Error('Unknown error'));
			toast({
				title: 'Error',
				description: 'Failed to fetch KPI reports',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	const refresh = useCallback(() => {
		return fetchReports();
	}, [fetchReports]);

	return {
		reports,
		isLoading,
		error,
		refresh,
	};
}
