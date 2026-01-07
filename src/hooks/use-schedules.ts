import { ScheduleResponse, apiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

/**
 * Hook for fetching schedules with optional filters
 * Note: New API only supports single date filter, not date range
 * @param params Filter parameters
 * @returns Schedules data, loading state, error, and refetch function
 */
export function useSchedules(params?: {
	schedule_date?: string; // YYYY-MM-DD
	deputy_id?: string;
	checkin_status?: string;
	auto_sync?: boolean;
}) {
	const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchSchedules = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getSchedules(params);
			setSchedules(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch schedules:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSchedules();
	}, [
		params?.schedule_date,
		params?.deputy_id,
		params?.checkin_status,
		params?.auto_sync,
	]);

	return {
		schedules,
		isLoading,
		error,
		refetch: fetchSchedules,
	};
}

export function useSchedule(scheduleId: number | null) {
	const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchSchedule = async () => {
		if (!scheduleId) {
			setSchedule(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getSchedule(scheduleId);
			setSchedule(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch schedule:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSchedule();
	}, [scheduleId]);

	return {
		schedule,
		isLoading,
		error,
		refetch: fetchSchedule,
	};
}
