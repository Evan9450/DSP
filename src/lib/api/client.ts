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
}

// User Types
export interface UserResponse {
	id: number;
	email: string;
	name: string;
	role: 'admin' | 'manager' | 'viewer';
	is_active: boolean;
	created_at: string;
}

export interface UserCreate {
	email: string;
	name: string;
	password: string;
	role: 'admin' | 'manager' | 'viewer';
}

export interface UserUpdate {
	email?: string;
	name?: string;
	password?: string;
	role?: 'admin' | 'manager' | 'viewer';
	is_active?: boolean;
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

// Driver Document Types
export interface DriverDocumentResponse {
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

export interface DriverDocumentCreate {
	type: 'license' | 'visa' | 'certification' | 'other';
	document_number?: string;
	issue_date?: string;
	expiry_date: string;
	notes?: string;
}

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
	driver_id: number;
	schedule_id?: number;
	date: string;
	odometer: number;
	status: 'normal' | 'has-issues' | 'needs-repair';
	notes?: string;
	admin_reviewed: boolean;
	admin_reviewed_by?: number;
	admin_reviewed_at?: string;
	admin_notes?: string;
	created_at: string;
}

export interface VehicleInspectionCreate {
	vehicle_id: number;
	driver_id: number;
	schedule_id?: number;
	odometer: number;
	status: 'normal' | 'has-issues' | 'needs-repair';
	notes?: string;
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

// Settings Types
export interface SettingsResponse {
	id: number;
	admin_notification_phone: string;
	document_expiry_reminder_days: number;
	driver_confirmation_sms_time: string;
	maintenance_reminder_days: number;
	low_stock_notification_enabled: boolean;
	schedule_reminder_template?: string;
	vehicle_assignment_template?: string;
	document_expiry_template?: string;
	deputy_sync_enabled: boolean;
	deputy_api_key?: string;
	deputy_sync_interval_hours?: number;
	updated_at: string;
	updated_by: number;
}

export interface SettingsUpdate {
	admin_notification_phone?: string;
	document_expiry_reminder_days?: number;
	driver_confirmation_sms_time?: string;
	maintenance_reminder_days?: number;
	low_stock_notification_enabled?: boolean;
	schedule_reminder_template?: string;
	vehicle_assignment_template?: string;
	document_expiry_template?: string;
	deputy_sync_enabled?: boolean;
	deputy_api_key?: string;
	deputy_sync_interval_hours?: number;
}

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
				// Handle 401 Unauthorized
				if (axiosError.response?.status === 401) {
					TokenManager.clearAdminToken();
					TokenManager.clearDriverToken();

					// Redirect to appropriate login page
					if (typeof window !== 'undefined') {
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
		console.log('🚀 => APIClient => adminLogin => response:', response);
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

	// Driver Documents
	async getDriverDocuments(
		driverId: number
	): Promise<DriverDocumentResponse[]> {
		const response = await this.client.get<DriverDocumentResponse[]>(
			`/api/v1/drivers/${driverId}/documents`
		);
		return response.data;
	}

	async createDriverDocument(
		driverId: number,
		data: DriverDocumentCreate
	): Promise<DriverDocumentResponse> {
		const response = await this.client.post<DriverDocumentResponse>(
			`/api/v1/drivers/${driverId}/documents`,
			data
		);
		return response.data;
	}

	async uploadDriverDocumentFile(
		driverId: number,
		documentId: number,
		file: File
	): Promise<DriverDocumentResponse> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await this.client.post<DriverDocumentResponse>(
			`/api/v1/drivers/${driverId}/documents/${documentId}/upload`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	async deleteDriverDocument(
		driverId: number,
		documentId: number
	): Promise<void> {
		await this.client.delete(
			`/api/v1/drivers/${driverId}/documents/${documentId}`
		);
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

	async getSettings(): Promise<SettingsResponse> {
		const response =
			await this.client.get<SettingsResponse>('/api/v1/settings/');
		console.log('🚀 => APIClient => getSettings => response:', response);
		return response.data;
	}

	async updateSettings(data: SettingsUpdate): Promise<SettingsResponse> {
		const response = await this.client.put<SettingsResponse>(
			'/api/v1/settings/',
			data
		);
		return response.data;
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
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const apiClient = new APIClient();
export default apiClient;
