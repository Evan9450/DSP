import axios, {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from 'axios';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ============================================================================
// Request/Response Types (matching OpenAPI spec)
// ============================================================================

// Auth Types
export interface LoginRequest {
	username: string;
	password: string;
}

export interface TokenResponse {
	access_token: string;
	token_type: string;
	user: UserResponse;
}

// User Types
export type UserRole = 0 | 1; // 0 = Admin (Superuser), 1 = Manager

export interface UserResponse {
	id: number;
	email: string;
	name: string;
	phone?: string | null;
	role: UserRole;
	is_active: boolean;
	is_superuser: boolean;
	created_at: string;
	updated_at: string;
}

export interface UserCreate {
	email: string;
	name: string;
	password: string;
	phone?: string | null;
	role?: UserRole; // Optional, defaults to 1 (Manager)
}

export interface UserUpdate {
	email?: string | null;
	name?: string | null;
	old_password?: string | null;
	password?: string | null;
	phone?: string | null;
	role?: UserRole | null;
	is_active?: boolean | null;
}

// Driver Types
export interface DriverResponse {
	id: number;
	name: string;
	phone?: string;
	email?: string;
	address?: string;
	amazon_id: string;
	amazon_password?: string;
	deputy_id?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface DriverCreate {
	name: string;
	phone?: string;
	email?: string;
	address?: string;
	amazon_id: string;
	amazon_password?: string;
	deputy_id?: string;
}

export interface DriverUpdate {
	name?: string;
	phone?: string;
	email?: string;
	address?: string;
	amazon_id?: string;
	amazon_password?: string;
	deputy_id?: string;
	is_active?: boolean;
}

// Driver File Types
export interface DriverFileResponse {
	id: number;
	driver_id: number;
	type: 'license' | 'visa' | 'certification' | 'other';
	document_number?: string;
	issue_date?: string;
	expiry_date: string;
	file_url?: string;
	notes?: string;
	created_at: string;
}

export interface DriverFileCreate {
	type: 'license' | 'visa' | 'certification' | 'other';
	document_number?: string;
	issue_date?: string;
	expiry_date: string;
	notes?: string;
}

// Keep old names for backwards compatibility
export type DriverDocumentResponse = DriverFileResponse;
export type DriverDocumentCreate = DriverFileCreate;

// Vehicle Types
export interface VehicleResponse {
	id: number;
	rego: string;
	alias: string;
	brand?: string;
	model?: string;
	condition: number;
	status: number;
	maintenance_cycle_days?: number;
	maintenance_location?: string;
	workshop_email?: string;
	mileage?: number;
	notes?: string;
	last_maintenance_date?: string;
	next_maintenance_date?: string;
	created_at: string;
	updated_at: string;
}

export interface VehiclePhotoResponse {
	photo_urls: string;
	uploaded_at: string;
}

export interface VehicleDetailResponse extends VehicleResponse {
	photo_urls?: string;
	photos: string[];
	photo_full_urls: string[];
	recent_inspections: VehicleInspectionResponse[];
}

export interface VehicleCreate {
	rego: string;
	alias: string;
	brand?: string;
	model?: string;
	condition?: number;
	status?: number;
	maintenance_cycle_days?: number;
	maintenance_location?: string;
	workshop_email?: string;
	mileage?: number;
	notes?: string;
	last_maintenance_date?: string;
	next_maintenance_date?: string;
}

export interface VehicleUpdate {
	rego?: string;
	alias?: string;
	brand?: string;
	model?: string;
	condition?: number;
	status?: number;
	maintenance_cycle_days?: number;
	maintenance_location?: string;
	workshop_email?: string;
	mileage?: number;
	notes?: string;
	last_maintenance_date?: string;
	next_maintenance_date?: string;
}

// Vehicle Inspection Types
export interface VehicleInspectionResponse {
	id: number;
	vehicle_id: number;
	driver_id?: number;
	inspection_date: string;
	mileage_at_inspection?: number;
	notes?: string;
	photo_urls?: string;
	reviewed_by_admin: boolean;
	admin_notes?: string;
	created_at: string;
	updated_at: string;
}

export interface VehicleInspectionCreate {
	inspection_date: string;
	vehicle_id: number;
	mileage_at_inspection?: number;
	notes?: string;
	photo_urls?: string;
}

export interface InspectionPhotoResponse {
	id: number;
	inspection_id: number;
	file_url: string;
	uploaded_at: string;
}

// Schedule Types
export interface ScheduleResponse {
	id: number;
	driver_id: number;
	vehicle_id?: number;
	date: string;
	start_time: string;
	end_time: string;
	route?: string;
	status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
	deputy_shift_id?: string;
	sms_sent: boolean;
	sms_sent_at?: string;
	driver_confirmed: boolean;
	driver_confirmed_at?: string;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export interface ScheduleCreate {
	driver_id: number;
	vehicle_id?: number;
	date: string;
	start_time: string;
	end_time: string;
	route?: string;
	status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
	deputy_shift_id?: string;
	notes?: string;
}

export interface ScheduleUpdate {
	driver_id?: number;
	vehicle_id?: number;
	date?: string;
	start_time?: string;
	end_time?: string;
	route?: string;
	status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
	deputy_shift_id?: string;
	notes?: string;
}

// Asset Types
export interface AssetResponse {
	id: number;
	name: string;
	category: string;
	total_quantity: number;
	available_stock: number;
	borrowed_quantity: number;
	unit_price?: number;
	supplier?: string;
	notes?: string;
	low_stock_threshold?: number;
	created_at: string;
	updated_at: string;
}

export interface AssetCreate {
	name: string;
	category: string;
	total_quantity: number;
	unit_price?: number;
	supplier?: string;
	notes?: string;
	low_stock_threshold?: number;
}

export interface AssetUpdate {
	name?: string;
	category?: string;
	total_quantity?: number;
	unit_price?: number;
	supplier?: string;
	notes?: string;
	low_stock_threshold?: number;
}

// Borrow Record Types
export interface BorrowRecordResponse {
	id: number;
	asset_id: number;
	driver_id: number;
	quantity: number;
	borrow_date: string;
	expected_return_date?: string;
	actual_return_date?: string;
	status: 'borrowed' | 'returned' | 'overdue';
	notes?: string;
	created_at: string;
}

export interface BorrowRecordCreate {
	asset_id: number;
	driver_id: number;
	quantity: number;
	expected_return_date?: string;
	notes?: string;
}

// Settings Types - System Configuration
export interface SystemConfigResponse {
	admin_phone?: string; // 管理员提醒电话
	driver_file_reminder_days?: number; // 司机文件临期提醒周期（10/15/30天）
	daily_sms_time?: string; // 司机每日确认短信时间（HH:MM格式）
	maintenance_booking_reminder_days?: number; // 保养预约提醒周期（10/15/30天）
	next_maintenance_reminder_days?: number; // 下次保养临近提醒周期（10/15/30天）
}

export interface SystemConfigUpdate {
	admin_phone?: string;
	driver_file_reminder_days?: number;
	daily_sms_time?: string;
	maintenance_booking_reminder_days?: number;
	next_maintenance_reminder_days?: number;
}

// Legacy Settings Types (kept for backwards compatibility)
export interface SettingsResponse extends SystemConfigResponse {
	id?: number;
	updated_at?: string;
	updated_by?: number;
}

export interface SettingsUpdate extends SystemConfigUpdate {}

// SMS History Types
export interface SMSHistoryResponse {
	id: number;
	driver_id: number;
	schedule_id?: number;
	phone_number: string;
	message: string;
	status: 'sent' | 'failed' | 'pending';
	sent_at: string;
	error_message?: string;
}

// Dashboard Types
export interface DashboardStatsResponse {
	total_drivers: number;
	active_drivers: number;
	total_vehicles: number;
	vehicles_in_use: number;
	today_schedules: number;
	vehicles_need_attention: number;
	vehicle_status: {
		available: number;
		need_repair: number;
		unavailable: number;
		in_use: number;
	};
	driver_status: {
		active: number;
		inactive: number;
		total: number;
	};
}

export interface DashboardAlertsResponse {
	expiring_documents: any[];
	maintenance_due: any[];
	unreviewed_inspections: any[];
	low_stock_products: any[];
}

// ============================================================================
// Token Utilities
// ============================================================================

export function decodeJWT(token: string): any {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Failed to decode JWT:', error);
		return null;
	}
}

export function getTokenExpiration(token: string): Date | null {
	const decoded = decodeJWT(token);
	if (decoded && decoded.exp) {
		return new Date(decoded.exp * 1000);
	}
	return null;
}

// ============================================================================
// Token Management
// ============================================================================

class TokenManager {
	private static readonly ADMIN_TOKEN_KEY = 'admin_token';
	private static readonly DRIVER_TOKEN_KEY = 'driver_token';

	static getAdminToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(this.ADMIN_TOKEN_KEY);
	}

	static setAdminToken(token: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
	}

	static clearAdminToken(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(this.ADMIN_TOKEN_KEY);
	}

	static getDriverToken(): string | null {
		if (typeof window === 'undefined') return null;
		return sessionStorage.getItem(this.DRIVER_TOKEN_KEY);
	}

	static setDriverToken(token: string): void {
		if (typeof window === 'undefined') return;
		sessionStorage.setItem(this.DRIVER_TOKEN_KEY, token);
	}

	static clearDriverToken(): void {
		if (typeof window === 'undefined') return;
		sessionStorage.removeItem(this.DRIVER_TOKEN_KEY);
	}

	static getToken(): string | null {
		// Try admin token first, then driver token
		return this.getAdminToken() || this.getDriverToken();
	}
}

// ============================================================================
// Axios Instance Configuration
// ============================================================================

class APIClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: API_BASE_URL,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Request interceptor - add auth token
		this.client.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				const token = TokenManager.getToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor - handle errors
		this.client.interceptors.response.use(
			(response) => response,
			async (error: unknown) => {
				const axiosError = error as AxiosError;

				// Log detailed error information for debugging
				if (axiosError.response) {
					console.group('🔴 API Error');
					console.log('Status:', axiosError.response.status);
					console.log('Status Text:', axiosError.response.statusText);
					console.log('URL:', axiosError.config?.url);
					console.log('Method:', axiosError.config?.method?.toUpperCase());
					console.log('Response Data:', axiosError.response.data);
					console.groupEnd();
				}

				// Handle 401 Unauthorized (token expired/invalid)
				// Only logout on 401, not 403 (which might be permissions issue)
				if (axiosError.response?.status === 401) {
					console.warn('⚠️ Token expired or invalid - logging out');

					// Clear all authentication data
					TokenManager.clearAdminToken();
					TokenManager.clearDriverToken();

					// Clear user data from localStorage
					if (typeof window !== 'undefined') {
						localStorage.removeItem('user');

						// Store logout reason for displaying on login page
						sessionStorage.setItem(
							'logout_reason',
							'Session expired. Please login again.'
						);

						// Redirect to appropriate login page
						const isDriverPage =
							window.location.pathname.startsWith('/driver');
						window.location.href = isDriverPage
							? '/driver-login'
							: '/login';
					}
				}

				return Promise.reject(error);
			}
		);
	}

	// ============================================================================
	// Authentication API
	// ============================================================================

	async adminLogin(email: string, password: string): Promise<TokenResponse> {
		const response = await this.client.post<TokenResponse>(
			'/api/v1/auth/login',
			{
				email: email,
				password,
			}
		);
		TokenManager.setAdminToken(response.data.access_token);
		return response.data;
	}

	async driverLogin(
		amazonId: string,
		password: string
	): Promise<TokenResponse> {
		const response = await this.client.post<TokenResponse>(
			'/api/v1/auth/driver-login',
			{
				username: amazonId,
				password,
			}
		);
		TokenManager.setDriverToken(response.data.access_token);
		return response.data;
	}

	logout(isDriver = false): void {
		if (isDriver) {
			TokenManager.clearDriverToken();
		} else {
			TokenManager.clearAdminToken();
		}
	}

	// ============================================================================
	// User API
	// ============================================================================

	async getUsers(): Promise<UserResponse[]> {
		const response =
			await this.client.get<UserResponse[]>('/api/v1/users/');
		console.log('🚀 => APIClient => getUsers => response:', response);
		return response.data;
	}

	async getUser(userId: number): Promise<UserResponse> {
		const response = await this.client.get<UserResponse>(
			`/api/v1/users/${userId}`
		);
		return response.data;
	}

	async getCurrentUser(): Promise<UserResponse> {
		const response = await this.client.get<UserResponse>('/api/v1/users/me');
		return response.data;
	}

	async createUser(data: UserCreate): Promise<UserResponse> {
		const response = await this.client.post<UserResponse>(
			'/api/v1/users/',
			data
		);
		return response.data;
	}

	async updateUser(userId: number, data: UserUpdate): Promise<UserResponse> {
		const response = await this.client.put<UserResponse>(
			`/api/v1/users/${userId}`,
			data
		);
		return response.data;
	}

	async deleteUser(userId: number): Promise<void> {
		await this.client.delete(`/api/v1/users/${userId}`);
	}

	// ============================================================================
	// Driver API
	// ============================================================================

	async getDrivers(): Promise<DriverResponse[]> {
		const response =
			await this.client.get<DriverResponse[]>('/api/v1/drivers/');
		console.log('🚀 => APIClient => getDrivers => response:', response);
		return response.data;
	}

	async getDriver(driverId: number): Promise<DriverResponse> {
		const response = await this.client.get<DriverResponse>(
			`/api/v1/drivers/${driverId}`
		);
		return response.data;
	}

	async createDriver(data: DriverCreate): Promise<DriverResponse> {
		const response = await this.client.post<DriverResponse>(
			'/api/v1/drivers/',
			data
		);
		return response.data;
	}

	async updateDriver(
		driverId: number,
		data: DriverUpdate
	): Promise<DriverResponse> {
		const response = await this.client.put<DriverResponse>(
			`/api/v1/drivers/${driverId}`,
			data
		);
		return response.data;
	}

	async deleteDriver(driverId: number): Promise<void> {
		await this.client.delete(`/api/v1/drivers/${driverId}`);
	}

	// Driver Files (Documents)
	async getDriverFiles(
		driverId: number
	): Promise<DriverFileResponse[]> {
		const response = await this.client.get<DriverFileResponse[]>(
			`/api/v1/drivers/${driverId}/files`
		);
		return response.data;
	}

	async createDriverFile(
		driverId: number,
		data: DriverFileCreate
	): Promise<DriverFileResponse> {
		const response = await this.client.post<DriverFileResponse>(
			`/api/v1/drivers/${driverId}/files`,
			data
		);
		return response.data;
	}

	async updateDriverFile(
		driverId: number,
		fileId: number,
		data: DriverFileCreate
	): Promise<DriverFileResponse> {
		const response = await this.client.put<DriverFileResponse>(
			`/api/v1/drivers/${driverId}/files/${fileId}`,
			data
		);
		return response.data;
	}

	async uploadDriverFile(
		driverId: number,
		fileId: number,
		file: File
	): Promise<any> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await this.client.post(
			`/api/v1/drivers/${driverId}/files/${fileId}/upload`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	async deleteDriverFile(
		driverId: number,
		fileId: number
	): Promise<void> {
		await this.client.delete(
			`/api/v1/drivers/${driverId}/files/${fileId}`
		);
	}

	async getExpiringDriverFiles(daysAhead: number = 30): Promise<DriverFileResponse[]> {
		const response = await this.client.get<DriverFileResponse[]>(
			'/api/v1/drivers/files/expiring',
			{ params: { days_ahead: daysAhead } }
		);
		return response.data;
	}

	async setDriverPassword(driverId: number, password: string): Promise<any> {
		const response = await this.client.post(
			`/api/v1/drivers/${driverId}/set-password`,
			{ password }
		);
		return response.data;
	}

	async importAmazonIds(file: File): Promise<any> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await this.client.post(
			'/api/v1/drivers/import/amazon-ids',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	// Backwards compatibility methods
	async getDriverDocuments(driverId: number): Promise<DriverDocumentResponse[]> {
		return this.getDriverFiles(driverId);
	}

	async createDriverDocument(driverId: number, data: DriverDocumentCreate): Promise<DriverDocumentResponse> {
		return this.createDriverFile(driverId, data);
	}

	async uploadDriverDocumentFile(driverId: number, documentId: number, file: File): Promise<DriverDocumentResponse> {
		return this.uploadDriverFile(driverId, documentId, file);
	}

	async deleteDriverDocument(driverId: number, documentId: number): Promise<void> {
		return this.deleteDriverFile(driverId, documentId);
	}

	// ============================================================================
	// Vehicle API
	// ============================================================================

	async getVehicles(): Promise<VehicleResponse[]> {
		const response =
			await this.client.get<VehicleResponse[]>('/api/v1/vehicles/');
		console.log('🚀 => APIClient => getVehicles => response:', response);
		return response.data;
	}

	async getVehicle(vehicleId: number): Promise<VehicleResponse> {
		const response = await this.client.get<VehicleResponse>(
			`/api/v1/vehicles/${vehicleId}`
		);
		return response.data;
	}

	async getVehicleDetail(vehicleId: number): Promise<VehicleDetailResponse> {
		const response = await this.client.get<VehicleDetailResponse>(
			`/api/v1/vehicles/${vehicleId}`
		);
		console.log(
			'🚀 => APIClient => getVehicleDetail => response:',
			response
		);
		return response.data;
	}

	async createVehicle(data: VehicleCreate): Promise<VehicleResponse> {
		const response = await this.client.post<VehicleResponse>(
			'/api/v1/vehicles/',
			data
		);
		return response.data;
	}

	async updateVehicle(
		vehicleId: number,
		data: VehicleUpdate
	): Promise<VehicleResponse> {
		const response = await this.client.put<VehicleResponse>(
			`/api/v1/vehicles/${vehicleId}`,
			data
		);
		return response.data;
	}

	async deleteVehicle(vehicleId: number): Promise<void> {
		await this.client.delete(`/api/v1/vehicles/${vehicleId}`);
	}

	async uploadVehiclePhotos(vehicleId: number, files: File[]): Promise<void> {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append('files', file);
		});

		await this.client.post(
			`/api/v1/vehicles/${vehicleId}/upload-photos`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
	}

	async deleteVehiclePhoto(
		vehicleId: number,
		photoIndex: number
	): Promise<void> {
		await this.client.delete(
			`/api/v1/vehicles/${vehicleId}/photos/${photoIndex}`
		);
	}

	// Vehicle Inspections
	async getVehicleInspections(
		vehicleId: number
	): Promise<VehicleInspectionResponse[]> {
		const response = await this.client.get<VehicleInspectionResponse[]>(
			`/api/v1/vehicles/${vehicleId}/inspections`
		);
		return response.data;
	}

	async listInspections(
		vehicleId?: number,
		driverId?: number,
		reviewed?: boolean,
		skip: number = 0,
		limit: number = 100
	): Promise<VehicleInspectionResponse[]> {
		const params: Record<string, number | boolean> = { skip, limit };
		if (vehicleId !== undefined) params.vehicle_id = vehicleId;
		if (driverId !== undefined) params.driver_id = driverId;
		if (reviewed !== undefined) params.reviewed = reviewed;

		const response = await this.client.get<VehicleInspectionResponse[]>(
			'/api/v1/vehicles/inspections',
			{ params }
		);
		return response.data;
	}

	async createVehicleInspection(
		data: VehicleInspectionCreate
	): Promise<VehicleInspectionResponse> {
		const response = await this.client.post<VehicleInspectionResponse>(
			'/api/v1/vehicles/inspections',
			data
		);
		return response.data;
	}

	async uploadInspectionPhotos(
		inspectionId: number,
		files: File[]
	): Promise<InspectionPhotoResponse[]> {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append('files', file);
		});

		const response = await this.client.post<InspectionPhotoResponse[]>(
			`/api/v1/vehicles/inspections/${inspectionId}/photos`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	async reviewInspection(
		inspectionId: number,
		notes?: string
	): Promise<VehicleInspectionResponse> {
		const response = await this.client.post<VehicleInspectionResponse>(
			`/api/v1/vehicles/inspections/${inspectionId}/review`,
			{ admin_notes: notes }
		);
		return response.data;
	}

	// ============================================================================
	// Schedule API
	// ============================================================================

	async getSchedules(
		startDate?: string,
		endDate?: string
	): Promise<ScheduleResponse[]> {
		const params: Record<string, string> = {};
		if (startDate) params.start_date = startDate;
		if (endDate) params.end_date = endDate;

		const response = await this.client.get<ScheduleResponse[]>(
			'/api/v1/schedules/',
			{ params }
		);
		return response.data;
	}

	async getSchedule(scheduleId: number): Promise<ScheduleResponse> {
		const response = await this.client.get<ScheduleResponse>(
			`/api/v1/schedules/${scheduleId}`
		);
		return response.data;
	}

	async createSchedule(data: ScheduleCreate): Promise<ScheduleResponse> {
		const response = await this.client.post<ScheduleResponse>(
			'/api/v1/schedules/',
			data
		);
		return response.data;
	}

	async updateSchedule(
		scheduleId: number,
		data: ScheduleUpdate
	): Promise<ScheduleResponse> {
		const response = await this.client.put<ScheduleResponse>(
			`/api/v1/schedules/${scheduleId}`,
			data
		);
		return response.data;
	}

	async deleteSchedule(scheduleId: number): Promise<void> {
		await this.client.delete(`/api/v1/schedules/${scheduleId}`);
	}

	async assignVehicle(
		scheduleId: number,
		vehicleId: number
	): Promise<ScheduleResponse> {
		const response = await this.client.post<ScheduleResponse>(
			`/api/v1/schedules/${scheduleId}/assign-vehicle`,
			{ vehicle_id: vehicleId }
		);
		return response.data;
	}

	async sendScheduleSMS(scheduleId: number): Promise<SMSHistoryResponse> {
		const response = await this.client.post<SMSHistoryResponse>(
			`/api/v1/schedules/${scheduleId}/send-sms`
		);
		return response.data;
	}

	async syncDeputy(): Promise<{
		synced_count: number;
		new_schedules: ScheduleResponse[];
	}> {
		const response = await this.client.post<{
			synced_count: number;
			new_schedules: ScheduleResponse[];
		}>('/api/v1/schedules/sync-deputy');
		return response.data;
	}

	// ============================================================================
	// Asset API
	// ============================================================================

	async getAssets(): Promise<AssetResponse[]> {
		const response = await this.client.get<AssetResponse[]>(
			'/api/v1/assets/products'
		);
		console.log('🚀 => APIClient => getAssets => response:', response);
		return response.data;
	}

	async getAsset(assetId: number): Promise<AssetResponse> {
		const response = await this.client.get<AssetResponse>(
			`/api/v1/assets/${assetId}`
		);
		return response.data;
	}

	async createAsset(data: AssetCreate): Promise<AssetResponse> {
		const response = await this.client.post<AssetResponse>(
			'/api/v1/assets/',
			data
		);
		return response.data;
	}

	async updateAsset(
		assetId: number,
		data: AssetUpdate
	): Promise<AssetResponse> {
		const response = await this.client.put<AssetResponse>(
			`/api/v1/assets/${assetId}`,
			data
		);
		return response.data;
	}

	async deleteAsset(assetId: number): Promise<void> {
		await this.client.delete(`/api/v1/assets/${assetId}`);
	}

	// Borrow Records
	async getBorrowRecords(
		assetId?: number,
		driverId?: number
	): Promise<BorrowRecordResponse[]> {
		const params: Record<string, number> = {};
		if (assetId) params.asset_id = assetId;
		if (driverId) params.driver_id = driverId;

		const response = await this.client.get<BorrowRecordResponse[]>(
			'/api/v1/assets/borrow-records',
			{ params }
		);
		return response.data;
	}

	async createBorrowRecord(
		data: BorrowRecordCreate
	): Promise<BorrowRecordResponse> {
		const response = await this.client.post<BorrowRecordResponse>(
			'/api/v1/assets/borrow-records',
			data
		);
		return response.data;
	}

	async returnBorrowRecord(
		recordId: number,
		notes?: string
	): Promise<BorrowRecordResponse> {
		const response = await this.client.post<BorrowRecordResponse>(
			`/api/v1/assets/borrow-records/${recordId}/return`,
			{ notes }
		);
		return response.data;
	}

	// ============================================================================
	// Settings API
	// ============================================================================

	// ============================================================================
	// System Settings API
	// ============================================================================

	/**
	 * Get system configuration
	 * 获取系统配置（所有用户可见）
	 */
	async getSystemConfig(): Promise<SystemConfigResponse> {
		const response = await this.client.get<SystemConfigResponse>(
			'/api/v1/settings/config'
		);
		return response.data;
	}

	/**
	 * Create system configuration
	 * 创建/初始化系统配置
	 */
	async createSystemConfig(
		data: SystemConfigUpdate
	): Promise<SystemConfigResponse> {
		const response = await this.client.post<SystemConfigResponse>(
			'/api/v1/settings/config',
			data
		);
		return response.data;
	}

	/**
	 * Update system configuration (batch update)
	 * 更新系统配置（批量更新）
	 */
	async updateSystemConfig(
		data: SystemConfigUpdate
	): Promise<SystemConfigResponse> {
		const response = await this.client.put<SystemConfigResponse>(
			'/api/v1/settings/config',
			data
		);
		return response.data;
	}

	// Legacy methods (for backwards compatibility)
	async getSettings(): Promise<SettingsResponse> {
		return this.getSystemConfig();
	}

	async updateSettings(data: SettingsUpdate): Promise<SettingsResponse> {
		return this.updateSystemConfig(data);
	}

	// ============================================================================
	// SMS History API
	// ============================================================================

	async getSMSHistory(
		driverId?: number,
		startDate?: string,
		endDate?: string
	): Promise<SMSHistoryResponse[]> {
		const params: Record<string, string | number> = {};
		if (driverId) params.driver_id = driverId;
		if (startDate) params.start_date = startDate;
		if (endDate) params.end_date = endDate;

		const response = await this.client.get<SMSHistoryResponse[]>(
			'/api/v1/sms/history',
			{ params }
		);
		return response.data;
	}

	// ============================================================================
	// Dashboard API
	// ============================================================================

	async getDashboardStats(): Promise<DashboardStatsResponse> {
		const response = await this.client.get<DashboardStatsResponse>(
			'/api/v1/dashboard/stats'
		);
		return response.data;
	}

	async getDashboardAlerts(): Promise<DashboardAlertsResponse> {
		const response = await this.client.get<DashboardAlertsResponse>(
			'/api/v1/dashboard/alerts'
		);
		return response.data;
	}
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const apiClient = new APIClient();
export default apiClient;
