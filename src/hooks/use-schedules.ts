import { useState, useEffect } from 'react';
import { apiClient, ScheduleResponse } from '@/lib/api/client';

export function useSchedules(startDate?: string, endDate?: string) {
	const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchSchedules = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getSchedules(startDate, endDate);
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
	}, [startDate, endDate]);

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
