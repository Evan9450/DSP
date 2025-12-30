import axios, { AxiosInstance } from 'axios';

// ============================================================================
// Type Definitions - Driver API
// ============================================================================

export interface DriverLoginRequest {
	amazon_id: string;
	password: string;
}

export interface DriverTokenResponse {
	access_token: string;
	token_type: string;
	driver: DriverInfo;
}

export interface DriverInfo {
	id: number;
	name: string;
	phone?: string;
	email?: string;
	amazon_id: string;
	deputy_id?: string;
	is_active: boolean;
}

export interface TodayInfoResponse {
	schedule: ScheduleInfo | null;
	existing_inspection: InspectionInfo | null;
}

export interface ScheduleInfo {
	id: number;
	deputy_id: string;
	driver_name: string;
	amazon_id?: string;
	schedule_date: string;
	route?: string;
	vehicle?: string;
	vehicle_id?: number;
	start_time: string;
	end_time: string;
	checkin_status: 'not_checked_in' | 'checked_in' | 'completed';
	confirm_status: 'pending' | 'confirmed' | 'cancelled';
}

export interface InspectionInfo {
	id: number;
	vehicle_id: number;
	driver_id: number;
	inspection_date: string;
	mileage_at_inspection: number;
	inspection_urls: string[];
	notes?: string;
	inspection_status: 0 | 1 | 2; // 0=pending, 1=passed, 2=failed
	reviewed_by_admin: boolean;
	admin_notes?: string;
	created_at: string;
	updated_at: string;
}

export interface DriverInspectionCreateRequest {
	vehicle_id: number;
	mileage_at_inspection: number;
	inspection_urls: string[];
	notes?: string;
}

export interface DriverInspectionUpdateRequest {
	mileage_at_inspection?: number;
	inspection_urls?: string[];
	notes?: string;
}

export interface FileRecordResponse {
	id: number;
	object_key: string;
	file_url: string;
	file_name: string;
	file_size: number;
	content_type?: string;
	folder?: string;
}

export interface BatchUploadResponse {
	message: string;
	uploaded_files: FileRecordResponse[];
	failed_files: any[];
	total_uploaded: number;
	total_failed: number;
}

// ============================================================================
// Token Manager - Driver Specific
// ============================================================================

class DriverTokenManager {
	private static readonly TOKEN_KEY = 'driver_token';

	static getToken(): string | null {
		if (typeof window === 'undefined') return null;
		return sessionStorage.getItem(this.TOKEN_KEY);
	}

	static setToken(token: string): void {
		if (typeof window === 'undefined') return;
		sessionStorage.setItem(this.TOKEN_KEY, token);
	}

	static clearToken(): void {
		if (typeof window === 'undefined') return;
		sessionStorage.removeItem(this.TOKEN_KEY);
		sessionStorage.removeItem('driverInfo');
		sessionStorage.removeItem('driverId');
		sessionStorage.removeItem('driverName');
		sessionStorage.removeItem('amazonId');
	}

	static isAuthenticated(): boolean {
		return !!this.getToken();
	}
}

// ============================================================================
// Driver API Client
// ============================================================================

class DriverAPIClient {
	private client: AxiosInstance;
	private baseURL: string;

	constructor() {
		// Use empty string for Next.js proxy mode, otherwise fallback to localhost
		this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
			? process.env.NEXT_PUBLIC_API_BASE_URL
			: 'http://localhost:8000';

		this.client = axios.create({
			baseURL: this.baseURL,
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Request interceptor: Add Bearer token
		this.client.interceptors.request.use(
			(config) => {
				const token = DriverTokenManager.getToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Response interceptor: Handle 401 errors
		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					console.error('❌ Driver unauthorized - redirecting to login');
					DriverTokenManager.clearToken();

					// Only redirect if in browser
					if (typeof window !== 'undefined') {
						window.location.href = '/driver-login';
					}
				}
				return Promise.reject(error);
			}
		);
	}

	// ========================================================================
	// Authentication
	// ========================================================================

	/**
	 * Driver login - authenticate using Amazon ID and password
	 * Requirements:
	 * - Driver must have valid amazon_id and password
	 * - Driver must have a schedule for today to login
	 */
	async login(
		amazon_id: string,
		password: string
	): Promise<DriverTokenResponse> {
		const response = await this.client.post<DriverTokenResponse>(
			'/api/v1/driver/login',
			{
				amazon_id,
				password,
			}
		);

		// Save token
		DriverTokenManager.setToken(response.data.access_token);

		// Save driver info to sessionStorage
		if (typeof window !== 'undefined') {
			sessionStorage.setItem(
				'driverInfo',
				JSON.stringify(response.data.driver)
			);
			sessionStorage.setItem(
				'driverId',
				response.data.driver.id.toString()
			);
			sessionStorage.setItem('driverName', response.data.driver.name);
			sessionStorage.setItem('amazonId', response.data.driver.amazon_id);
		}

		console.log('✅ Driver logged in:', response.data.driver);
		return response.data;
	}

	/**
	 * Driver logout - clear token and session data
	 */
	logout(): void {
		DriverTokenManager.clearToken();
		console.log('✅ Driver logged out');

		// Redirect to login
		if (typeof window !== 'undefined') {
			window.location.href = '/driver-login';
		}
	}

	// ========================================================================
	// Today's Information
	// ========================================================================

	/**
	 * Get today's schedule information and existing inspection (if any)
	 * Returns:
	 * - schedule: Today's schedule with vehicle and route assignment
	 * - existing_inspection: Today's inspection record if already created
	 */
	async getTodayInfo(): Promise<TodayInfoResponse> {
		const response = await this.client.get<TodayInfoResponse>(
			'/api/v1/driver/today'
		);

		console.log('✅ Today info loaded:', response.data);
		return response.data;
	}

	// ========================================================================
	// Inspection Management
	// ========================================================================

	/**
	 * Create today's vehicle inspection record
	 * Driver can only create one inspection per day
	 * Photo URLs should be obtained from /api/v1/files/batch-upload first
	 *
	 * Workflow:
	 * 1. Driver uploads photos to /api/v1/files/batch-upload
	 * 2. Get photo URLs from response
	 * 3. Call this endpoint with photo_urls array
	 */
	async createInspection(
		data: DriverInspectionCreateRequest
	): Promise<InspectionInfo> {
		const response = await this.client.post<InspectionInfo>(
			'/api/v1/driver/inspection',
			data
		);

		console.log('✅ Inspection created:', response.data);
		return response.data;
	}

	/**
	 * Update today's inspection record
	 * Driver can only update today's inspection
	 * Allows updating photos, mileage, and notes multiple times within the same day
	 */
	async updateInspection(
		data: DriverInspectionUpdateRequest
	): Promise<InspectionInfo> {
		const response = await this.client.put<InspectionInfo>(
			'/api/v1/driver/inspection',
			data
		);

		console.log('✅ Inspection updated:', response.data);
		return response.data;
	}

	// ========================================================================
	// File Upload (Shared with Admin)
	// ========================================================================

	/**
	 * Upload single file to Wasabi
	 */
	async uploadFile(
		file: File,
		folder: string = 'uploads'
	): Promise<FileRecordResponse> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('folder', folder);

		const response = await this.client.post<FileRecordResponse>(
			'/api/v1/files/upload',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);

		console.log('✅ File uploaded:', response.data.file_url);
		return response.data;
	}

	/**
	 * Batch upload multiple files to Wasabi
	 * Returns array of file records with URLs
	 */
	async batchUploadFiles(
		files: File[],
		folder: string = 'uploads'
	): Promise<FileRecordResponse[]> {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append('files', file);
		});
		formData.append('folder', folder);

		const response = await this.client.post<BatchUploadResponse>(
			'/api/v1/files/batch-upload',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);

		console.log(`✅ ${response.data.total_uploaded} files uploaded successfully`);
		if (response.data.total_failed > 0) {
			console.warn(`⚠️ ${response.data.total_failed} files failed to upload`);
		}

		// Return the uploaded_files array
		return response.data.uploaded_files;
	}

	// ========================================================================
	// Utility Methods
	// ========================================================================

	/**
	 * Check if driver is authenticated
	 */
	isAuthenticated(): boolean {
		return DriverTokenManager.isAuthenticated();
	}

	/**
	 * Get current driver info from sessionStorage
	 */
	getCurrentDriver(): DriverInfo | null {
		if (typeof window === 'undefined') return null;

		const driverInfoStr = sessionStorage.getItem('driverInfo');
		if (!driverInfoStr) return null;

		try {
			return JSON.parse(driverInfoStr) as DriverInfo;
		} catch (error) {
			console.error('Failed to parse driver info:', error);
			return null;
		}
	}

	/**
	 * Get current driver ID
	 */
	getCurrentDriverId(): number | null {
		if (typeof window === 'undefined') return null;

		const driverIdStr = sessionStorage.getItem('driverId');
		if (!driverIdStr) return null;

		return parseInt(driverIdStr);
	}
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const driverApiClient = new DriverAPIClient();
export { DriverTokenManager };
