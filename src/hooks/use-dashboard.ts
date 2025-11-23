import { useEffect, useState } from 'react';
import {
	apiClient,
	type DashboardStatsResponse,
	type DashboardAlertsResponse,
} from '@/lib/api/client';

export function useDashboardStats() {
	const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchStats = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getDashboardStats();
			setStats(data);
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	return { stats, isLoading, error, refetch: fetchStats };
}

export function useDashboardAlerts() {
	const [alerts, setAlerts] = useState<DashboardAlertsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchAlerts = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getDashboardAlerts();
			setAlerts(data);
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAlerts();
	}, []);

	return { alerts, isLoading, error, refetch: fetchAlerts };
}
