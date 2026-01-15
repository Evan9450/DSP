import { useState, useEffect } from 'react';
import {
	apiClient,
	AssetResponse,
	BorrowRecordResponse,
	InventoryChangeResponse,
} from '@/lib/api/client';

export function useAssets() {
	const [assets, setAssets] = useState<AssetResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchAssets = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getAssets();
			setAssets(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch assets:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAssets();
	}, []);

	return {
		assets,
		isLoading,
		error,
		refetch: fetchAssets,
	};
}

export function useAsset(assetId: number | null) {
	const [asset, setAsset] = useState<AssetResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchAsset = async () => {
		if (!assetId) {
			setAsset(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const data = await apiClient.getAsset(assetId);
			setAsset(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch asset:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAsset();
	}, [assetId]);

	return {
		asset,
		isLoading,
		error,
		refetch: fetchAsset,
	};
}

export function useBorrowRecords(assetId?: number, driverId?: number) {
	const [records, setRecords] = useState<BorrowRecordResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchRecords = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getBorrowRecords(assetId, driverId);
			setRecords(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch borrow records:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchRecords();
	}, [assetId, driverId]);

	return {
		records,
		isLoading,
		error,
		refetch: fetchRecords,
	};
}

export function useInventoryChanges(params?: {
	product_id?: number;
	change_type?: 'IN' | 'OUT';
	skip?: number;
	limit?: number;
}) {
	const [changes, setChanges] = useState<InventoryChangeResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchChanges = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.getInventoryChanges(params);
			setChanges(data);
			setError(null);
		} catch (err) {
			setError(err as Error);
			console.error('Failed to fetch inventory changes:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchChanges();
	}, [params?.product_id, params?.change_type, params?.skip, params?.limit]);

	return {
		changes,
		isLoading,
		error,
		refetch: fetchChanges,
	};
}
