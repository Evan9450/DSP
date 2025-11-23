import { useState, useEffect } from 'react';
import { apiClient, UserResponse } from '@/lib/api/client';

export function useUsers() {
	const [users, setUsers] = useState<UserResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchUsers = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await apiClient.getUsers();
			setUsers(data);
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return {
		users,
		isLoading,
		error,
		refetch: fetchUsers,
	};
}
