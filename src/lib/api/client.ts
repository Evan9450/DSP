import axios, {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from 'axios';

// ============================================================================
// API Configuration
// ============================================================================

// API Base URL configuration:
// - Empty string ('') = use Next.js proxy (mobile-friendly, configured in next.config.js)
// - Specific URL = direct API connection (development/production)
// Note: Use ?? instead of || to preserve empty string for proxy mode
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
		? process.env.NEXT_PUBLIC_API_BASE_URL
		: 'http://localhost:8000';

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

export interface DriverTokenResponse {
	access_token: string;
	token_type: string;
	driver: DriverResponse;
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
	// License fields
	license_number?: string;
	license_expiry_date?: string;
	license_file_url?: string[]; // Array of file URLs (allows multiple)
	// Visa fields
	visa_number?: string;
	visa_expiry_date?: string;
	visa_file_url?: string[]; // Array of file URLs (single file, replaces on new upload)
	created_at: string;
	updated_at: string;
}

export interface DriverCreate {
	name: string;
	phone?: string;
	email?: string;
	address?: string;
	amazon_id: string;
	password: string; // Required field for driver login
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
	// License fields
	license_number?: string;
	license_expiry_date?: string;
	license_file_url?: string[]; // Array of file URLs (allows multiple)
	// Visa fields
	visa_number?: string;
	visa_expiry_date?: string;
	visa_file_url?: string[]; // Array of file URLs (single file, replaces on new upload)
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
export type VehicleStatus = 'in-use' | 'not-in-use';
export type VehicleCondition = 'available' | 'need-repair' | 'unavailable';

export interface VehicleResponse {
	id: number;
	rego: string;
	alias: string;
	brand?: string;
	model?: string;
	condition: VehicleCondition;
	status: VehicleStatus;
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
	condition?: VehicleCondition;
	status?: VehicleStatus;
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
	condition?: VehicleCondition;
	status?: VehicleStatus;
	maintenance_cycle_days?: number;
	maintenance_location?: string;
	workshop_email?: string;
	mileage?: number;
	notes?: string;
	last_maintenance_date?: string;
	next_maintenance_date?: string;
}

// Vehicle Inspection Types
export type InspectionStatus = 'pending' | 'passed' | 'failed';

export interface VehicleInspectionResponse {
	id: number;
	vehicle_id: number;
	vehicle_alias?: string;
	driver_id: number;
	driver_name?: string; // Driver name included in detail endpoint
	inspection_date: string;
	mileage_at_inspection: number;
	notes?: string; // Driver's inspection notes
	photos: string[]; // Photo URLs returned by new API
	photo_full_urls?: string[]; // Full photo URLs (optional, for compatibility)
	inspection_urls?: string[]; // Legacy field name for backwards compatibility
	inspection_status: InspectionStatus;
	reviewed_by_admin: boolean;
	admin_notes?: string;
	created_at: string;
	updated_at: string;
}

export interface VehicleInspectionCreate {
	vehicle_id: number;
	driver_id: number;
	inspection_date: string;
	mileage_at_inspection: number;
	inspection_urls?: string[]; // IMPORTANT: Backend uses inspection_urls, not photo_urls
}

export interface VehicleInspectionUpdate {
	inspection_date?: string;
	mileage_at_inspection?: number;
	inspection_urls?: string[]; // IMPORTANT: Backend uses inspection_urls, not photo_urls
}

export interface VehicleInspectionReview {
	inspection_status: InspectionStatus;
	admin_notes?: string;
}

// Simplified previous inspection data (only date, mileage, photos, driver name)
export interface PreviousInspectionSummary {
	inspection_date: string;
	mileage_at_inspection: number;
	photos: string[];
	photo_full_urls?: string[];
	driver_name: string;
}

// Detail response with flattened structure
export interface VehicleInspectionDetailResponse
	extends VehicleInspectionResponse {
	previous: PreviousInspectionSummary | null;
}

export interface VehicleInspectionPhotoResponse {
	id: number;
	vehicle_id: number;
	inspection_date: string;
	mileage_at_inspection: number;
	photos: string[];
	inspection_status: InspectionStatus;
	reviewed_by_admin: boolean;
	admin_notes?: string;
	created_at: string;
}

// Schedule Types
export interface ScheduleResponse {
	id: number;
	deputy_id: string;
	driver_name: string;
	amazon_id?: string | null;
	schedule_date: string;
	route?: string | null;
	vehicle_rego?: string | null;
	vehicle_alias?: string | null;
	deputy_schedule_id: string;
	start_time: string;
	end_time: string;
	checkin_status: 'not_checked_in' | 'checked_in' | 'completed';
	confirm_status: 'pending' | 'confirmed' | 'cancelled';
	reminder_sms_sent: boolean;
	assignment_sms_sent: boolean;
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
	deputy_id?: string;
	route?: string;
	vehicle_rego?: string;
	vehicle_alias?: string;
	checkin_status?: 'not_checked_in' | 'checked_in' | 'completed';
	confirm_status?: 'pending' | 'confirmed' | 'cancelled';
}

// Product Types (replaced Asset)
export interface ProductResponse {
	id: number;
	name: string;
	description?: string | null;
	min_stock_threshold: number;
	available_stock: number;
	low_stock_alert_sent: boolean;
	needs_purchase: boolean;
	created_at: string;
	updated_at: string;
}

export interface ProductCreate {
	name: string;
	description?: string | null;
	min_stock_threshold?: number; // Default 0
	available_stock?: number; // Default 0, initial stock quantity
}

export interface ProductUpdate {
	name?: string;
	description?: string | null;
	min_stock_threshold?: number;
}

// Product Inventory Types
export interface ProductInventoryResponse {
	id: number;
	product_id: number;
	quantity: number;
	purchase_date: string;
	unit_price?: number;
	supplier?: string;
	notes?: string;
	created_at: string;
}

export interface ProductInventoryCreate {
	product_id: number;
	quantity: number;
	purchase_date: string;
	unit_price?: number;
	supplier?: string;
	notes?: string;
}

// Product Borrow Types (replaced BorrowRecord)
export interface ProductBorrowResponse {
	id: number;
	product_id: number;
	driver_id: number;
	quantity: number;
	borrow_date: string;
	expected_return_date?: string;
	actual_return_date?: string;
	is_returned: boolean;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export interface ProductBorrowCreate {
	product_id: number;
	driver_id: number;
	quantity: number;
	borrow_date: string; // Required: YYYY-MM-DD format
	expected_return_date?: string;
	notes?: string;
}

export interface ProductBorrowReturn {
	actual_return_date?: string;
	notes?: string;
}

// Legacy types for backward compatibility
export type AssetResponse = ProductResponse;
export type AssetCreate = ProductCreate;
export type AssetUpdate = ProductUpdate;
export type BorrowRecordResponse = ProductBorrowResponse;
export type BorrowRecordCreate = ProductBorrowCreate;
export type BorrowRecordUpdate = ProductBorrowReturn;

// Settings Types - System Configuration
export interface SystemConfigResponse {
	admin_phone?: string; // Admin reminder phone number
	driver_file_reminder_days?: number; // Driver file expiry reminder cycle (10/15/30 days)
	daily_sms_time?: string; // Daily driver confirmation SMS time (HH:MM format)
	maintenance_booking_reminder_days?: number; // Maintenance booking reminder cycle (10/15/30 days)
	next_maintenance_reminder_days?: number; // Next maintenance approaching reminder cycle (10/15/30 days)
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

// File Management Types
export interface FileRecordResponse {
	id: number;
	filename: string;
	original_filename: string;
	file_url: string;
	file_size: number;
	content_type: string;
	folder: string;
	uploaded_at: string;
}

export interface BatchDeleteFilesRequest {
	file_ids: number[];
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
				.map(
					(c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
				)
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
					console.log(
						'Method:',
						axiosError.config?.method?.toUpperCase()
					);
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
	): Promise<DriverTokenResponse> {
		const response = await this.client.post<DriverTokenResponse>(
			'/api/v1/auth/driver/login',
			{
				amazon_id: amazonId,
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
		const response =
			await this.client.get<UserResponse>('/api/v1/users/me');
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

	// New method for updating driver with files
	async updateDriverWithFiles(
		driverId: number,
		data: {
			name?: string;
			phone?: string;
			email?: string;
			address?: string;
			amazon_id?: string;
			deputy_id?: string;
			license_file?: File;
			license_number?: string;
			license_expiry_date?: string;
			visa_file?: File;
			visa_number?: string;
			visa_expiry_date?: string;
		}
	): Promise<DriverResponse> {
		console.log('📤 Updating driver with files:', { driverId, data });

		const formData = new FormData();

		// Add basic info fields if provided
		if (data.name !== undefined) formData.append('name', data.name);
		if (data.phone !== undefined) formData.append('phone', data.phone);
		if (data.email !== undefined) formData.append('email', data.email);
		if (data.address !== undefined)
			formData.append('address', data.address);
		if (data.amazon_id !== undefined)
			formData.append('amazon_id', data.amazon_id);
		if (data.deputy_id !== undefined)
			formData.append('deputy_id', data.deputy_id);

		// Add license fields if provided
		if (data.license_file)
			formData.append('license_file', data.license_file);
		if (data.license_number !== undefined)
			formData.append('license_number', data.license_number);
		if (data.license_expiry_date !== undefined)
			formData.append('license_expiry_date', data.license_expiry_date);

		// Add visa fields if provided
		if (data.visa_file) formData.append('visa_file', data.visa_file);
		if (data.visa_number !== undefined)
			formData.append('visa_number', data.visa_number);
		if (data.visa_expiry_date !== undefined)
			formData.append('visa_expiry_date', data.visa_expiry_date);

		console.log('📦 FormData entries:');
		formData.forEach((value, key) => {
			console.log(
				`  ${key}:`,
				value instanceof File ? `File(${value.name})` : value
			);
		});

		try {
			const response = await this.client.put<DriverResponse>(
				`/api/v1/drivers/${driverId}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			console.log(
				'✅ Driver updated successfully, full response:',
				response
			);
			console.log('📋 Response data breakdown:');
			console.log('  - Name:', response.data.name);
			console.log('  - Deputy ID:', response.data.deputy_id);
			console.log('  - License Number:', response.data.license_number);
			console.log(
				'  - License Expiry:',
				response.data.license_expiry_date
			);
			console.log('  - Visa Number:', response.data.visa_number);
			console.log('  - Visa Expiry:', response.data.visa_expiry_date);
			console.log('  - License Files:', response.data.license_file_url);
			console.log('  - Visa Files:', response.data.visa_file_url);
			return response.data;
		} catch (error: any) {
			console.error('❌ Failed to update driver:', error.response?.data);
			throw error;
		}
	}

	/**
	 * Update driver with FormData (for file URL updates)
	 * Backend expects license_file_url/visa_file_url as JSON strings
	 */
	async updateDriverWithFormData(
		driverId: number,
		formData: FormData
	): Promise<DriverResponse> {
		const response = await this.client.put<DriverResponse>(
			`/api/v1/drivers/${driverId}`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	async deleteDriver(driverId: number): Promise<void> {
		await this.client.delete(`/api/v1/drivers/${driverId}`);
	}

	// Delete license file
	async deleteLicenseFile(driverId: number, fileUrl: string): Promise<void> {
		await this.client.delete(
			`/api/v1/drivers/${driverId}/delete-license-file`,
			{ params: { file_url: fileUrl } }
		);
	}

	// Delete visa file
	async deleteVisaFile(driverId: number, fileUrl: string): Promise<void> {
		await this.client.delete(
			`/api/v1/drivers/${driverId}/delete-visa-file`,
			{ params: { file_url: fileUrl } }
		);
	}

	// Get expiring documents
	async getExpiringDocuments(daysAhead: number = 30): Promise<any> {
		const response = await this.client.get(
			'/api/v1/drivers/documents/expiring',
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

	async syncDeputyDrivers(): Promise<{
		synced_count?: number;
		new_drivers?: number;
		updated_drivers?: number;
		message?: string;
		[key: string]: any;
	}> {
		const response = await this.client.post<any>(
			'/api/v1/supervise/sync-employees'
		);
		console.log('🔄 Deputy sync response:', response.data);
		return response.data;
	}

	// ============================================================================
	// Vehicle API
	// ============================================================================

	async getVehicles(params?: {
		status_filter?: VehicleStatus;
		condition_filter?: VehicleCondition;
	}): Promise<VehicleResponse[]> {
		const response = await this.client.get<VehicleResponse[]>(
			'/api/v1/vehicles/',
			{ params }
		);
		console.log('🚀 => APIClient => getVehicles => response:', response);
		return response.data;
	}

	async getAvailableVehicles(): Promise<VehicleResponse[]> {
		const response = await this.client.get<VehicleResponse[]>(
			'/api/v1/vehicles/available'
		);
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
	/**
	 * List vehicle inspection records with optional filters
	 * @param params Filter parameters
	 * @returns Array of inspection records
	 */
	async listInspections(params?: {
		vehicle_id?: number;
		driver_id?: number;
		reviewed?: boolean;
		inspection_status?: InspectionStatus;
		inspection_date?: string; // YYYY-MM-DD
		start_date?: string; // YYYY-MM-DD
		end_date?: string; // YYYY-MM-DD
		skip?: number;
		limit?: number;
	}): Promise<VehicleInspectionResponse[]> {
		// Set default pagination values and filter out undefined values
		const cleanParams: Record<string, any> = {
			skip: 0,
			limit: 100,
		};

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					cleanParams[key] = value;
				}
			});
		}

		const response = await this.client.get<VehicleInspectionResponse[]>(
			'/api/v1/vehicles/inspections',
			{ params: cleanParams }
		);
		return response.data;
	}

	/**
	 * Create vehicle inspection record (for driver app)
	 * @param data Inspection data with vehicle_id, driver_id, inspection_date, mileage_at_inspection
	 * @returns Created inspection record
	 */
	async createVehicleInspection(
		data: VehicleInspectionCreate
	): Promise<VehicleInspectionResponse> {
		const response = await this.client.post<VehicleInspectionResponse>(
			'/api/v1/vehicles/inspections',
			data
		);
		return response.data;
	}

	/**
	 * Update inspection record (driver only)
	 * Drivers can update: inspection_date, mileage_at_inspection, photo_urls
	 * @param inspectionId Inspection ID
	 * @param data Update data
	 * @returns Updated inspection record
	 */
	async updateVehicleInspection(
		inspectionId: number,
		data: VehicleInspectionUpdate
	): Promise<VehicleInspectionResponse> {
		const response = await this.client.put<VehicleInspectionResponse>(
			`/api/v1/vehicles/inspections/${inspectionId}`,
			data
		);
		return response.data;
	}

	/**
	 * Upload photos for vehicle inspection
	 * @param inspectionId Inspection ID
	 * @param files Array of image files
	 * @returns Upload response
	 */
	async uploadInspectionPhotos(
		inspectionId: number,
		files: File[]
	): Promise<any> {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append('files', file);
		});

		const response = await this.client.post(
			`/api/v1/vehicles/inspections/${inspectionId}/upload-photos`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	/**
	 * Get single inspection record by ID with comparison to previous inspection
	 * @param inspectionId Inspection ID
	 * @returns Flattened inspection detail with previous inspection summary
	 */
	async getInspection(
		inspectionId: number
	): Promise<VehicleInspectionDetailResponse> {
		const response = await this.client.get<VehicleInspectionDetailResponse>(
			`/api/v1/inspections/${inspectionId}`
		);
		return response.data;
	}

	/**
	 * Admin review/approve inspection (admin only)
	 * Admins can set inspection_status (0=pending, 1=passed, 2=failed) and add admin_notes
	 * @param inspectionId Inspection ID
	 * @param data Review data with inspection_status and optional admin_notes
	 * @returns Updated inspection record
	 */
	async reviewInspection(
		inspectionId: number,
		data: VehicleInspectionReview
	): Promise<VehicleInspectionResponse> {
		const response = await this.client.post<VehicleInspectionResponse>(
			`/api/v1/vehicles/inspections/${inspectionId}/review`,
			data
		);
		return response.data;
	}

	/**
	 * Get inspections by date (optimized endpoint)
	 * @param date Inspection date in YYYY-MM-DD format
	 * @returns Array of inspection records
	 */
	async getInspectionsByDate(
		date: string
	): Promise<VehicleInspectionResponse[]> {
		const response = await this.client.get<VehicleInspectionResponse[]>(
			`/api/v1/inspections/by-date/${date}`
		);
		return response.data;
	}

	/**
	 * Get inspections by vehicle (optimized endpoint)
	 * @param vehicleId Vehicle ID
	 * @param params Optional filter parameters (date range, pagination)
	 * @returns Array of inspection records
	 */
	async getInspectionsByVehicle(
		vehicleId: number,
		params?: {
			start_date?: string; // YYYY-MM-DD
			end_date?: string; // YYYY-MM-DD
			skip?: number;
			limit?: number;
		}
	): Promise<VehicleInspectionResponse[]> {
		const response = await this.client.get<VehicleInspectionResponse[]>(
			`/api/v1/inspections/by-vehicle/${vehicleId}`,
			{ params }
		);
		return response.data;
	}

	/**
	 * Delete inspection record (admin only)
	 * @param inspectionId Inspection ID
	 */
	async deleteInspection(inspectionId: number): Promise<void> {
		await this.client.delete(
			`/api/v1/vehicles/inspections/${inspectionId}`
		);
	}

	/**
	 * Get inspection records with photos for a specific vehicle
	 * @param vehicleId Vehicle ID
	 * @param params Optional filter parameters
	 * @returns Array of inspection photo records grouped by date
	 */
	async getVehicleInspectionPhotos(
		vehicleId: number,
		params?: {
			inspection_date?: string; // YYYY-MM-DD
			skip?: number;
			limit?: number;
		}
	): Promise<VehicleInspectionPhotoResponse[]> {
		// Set default pagination values and filter out undefined values
		const cleanParams: Record<string, any> = {
			skip: 0,
			limit: 50,
		};

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					cleanParams[key] = value;
				}
			});
		}

		const response = await this.client.get<
			VehicleInspectionPhotoResponse[]
		>(`/api/v1/vehicles/${vehicleId}/inspection-photos`, {
			params: cleanParams,
		});
		return response.data;
	}

	// Backwards compatibility methods
	/**
	 * @deprecated Use listInspections with vehicle_id filter instead
	 */
	async getVehicleInspections(
		vehicleId: number
	): Promise<VehicleInspectionResponse[]> {
		return this.listInspections({ vehicle_id: vehicleId });
	}

	// ============================================================================
	// Schedule API
	// ============================================================================

	async getSchedules(params?: {
		schedule_date?: string; // YYYY-MM-DD
		deputy_id?: string;
		checkin_status?: string;
		auto_sync?: boolean;
	}): Promise<ScheduleResponse[]> {
		const response = await this.client.get<ScheduleResponse[]>(
			'/api/v1/schedules/',
			{ params }
		);
		return response.data;
	}

	async getTodaySchedules(
		autoSync: boolean = true
	): Promise<ScheduleResponse[]> {
		const response = await this.client.get<ScheduleResponse[]>(
			'/api/v1/schedules/today',
			{ params: { auto_sync: autoSync } }
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

	async confirmSchedule(scheduleId: number): Promise<ScheduleResponse> {
		const response = await this.client.post<ScheduleResponse>(
			`/api/v1/schedules/${scheduleId}/confirm`
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

	// Deputy Roster API
	async syncSpecificDate(syncDate: string): Promise<any> {
		const response = await this.client.post(
			'/api/v1/schedules/sync-date',
			null,
			{ params: { sync_date: syncDate } }
		);
		return response.data;
	}

	async syncToday(): Promise<any> {
		const response = await this.client.post('/api/v1/schedules/sync-today');
		return response.data;
	}

	async importRoutes(file: File, importDate?: string): Promise<any> {
		const formData = new FormData();
		formData.append('file', file);

		const params = importDate ? { import_date: importDate } : {};

		const response = await this.client.post(
			'/api/v1/schedules/import-routes',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				params,
			}
		);
		return response.data;
	}

	// ============================================================================
	// Product & Inventory API (replaces Asset API)
	// ============================================================================

	// Products
	async getProducts(): Promise<ProductResponse[]> {
		const response = await this.client.get<ProductResponse[]>(
			'/api/v1/assets/products'
		);
		console.log('🚀 => APIClient => getProducts => response:', response);
		return response.data;
	}

	async getProduct(productId: number): Promise<ProductResponse> {
		const response = await this.client.get<ProductResponse>(
			`/api/v1/assets/products/${productId}`
		);
		return response.data;
	}

	async createProduct(data: ProductCreate): Promise<ProductResponse> {
		const response = await this.client.post<ProductResponse>(
			'/api/v1/assets/products',
			data
		);
		return response.data;
	}

	async updateProduct(
		productId: number,
		data: ProductUpdate
	): Promise<ProductResponse> {
		const response = await this.client.put<ProductResponse>(
			`/api/v1/assets/products/${productId}`,
			data
		);
		return response.data;
	}

	async deleteProduct(productId: number): Promise<void> {
		await this.client.delete(`/api/v1/assets/products/${productId}`);
	}

	// Product Inventory
	async getProductInventory(
		productId: number
	): Promise<ProductInventoryResponse[]> {
		const response = await this.client.get<ProductInventoryResponse[]>(
			`/api/v1/assets/products/${productId}/inventory`
		);
		return response.data;
	}

	async addInventory(
		data: ProductInventoryCreate
	): Promise<ProductInventoryResponse> {
		const response = await this.client.post<ProductInventoryResponse>(
			'/api/v1/assets/inventory',
			data
		);
		return response.data;
	}

	// Product Borrows
	async getProductBorrows(params?: {
		product_id?: number;
		driver_id?: number;
		is_returned?: boolean;
	}): Promise<ProductBorrowResponse[]> {
		const response = await this.client.get<ProductBorrowResponse[]>(
			'/api/v1/assets/borrows',
			{ params }
		);
		return response.data;
	}

	async getProductBorrow(borrowId: number): Promise<ProductBorrowResponse> {
		const response = await this.client.get<ProductBorrowResponse>(
			`/api/v1/assets/borrows/${borrowId}`
		);
		return response.data;
	}

	async createProductBorrow(
		data: ProductBorrowCreate
	): Promise<ProductBorrowResponse> {
		const response = await this.client.post<ProductBorrowResponse>(
			'/api/v1/assets/borrows',
			data
		);
		return response.data;
	}

	async returnProductBorrow(
		borrowId: number,
		data: ProductBorrowReturn
	): Promise<ProductBorrowResponse> {
		const response = await this.client.post<ProductBorrowResponse>(
			`/api/v1/assets/borrows/${borrowId}/return`,
			data
		);
		return response.data;
	}

	async listProductBorrowsForProduct(
		productId: number
	): Promise<ProductBorrowResponse[]> {
		const response = await this.client.get<ProductBorrowResponse[]>(
			`/api/v1/assets/products/${productId}/borrows`
		);
		return response.data;
	}

	async listProductBorrowsForDriver(
		driverId: number
	): Promise<ProductBorrowResponse[]> {
		const response = await this.client.get<ProductBorrowResponse[]>(
			`/api/v1/assets/drivers/${driverId}/borrows`
		);
		return response.data;
	}

	// Legacy methods for backward compatibility
	async getAssets(): Promise<AssetResponse[]> {
		return this.getProducts();
	}

	async getAsset(assetId: number): Promise<AssetResponse> {
		return this.getProduct(assetId);
	}

	async createAsset(data: AssetCreate): Promise<AssetResponse> {
		return this.createProduct(data);
	}

	async updateAsset(
		assetId: number,
		data: AssetUpdate
	): Promise<AssetResponse> {
		return this.updateProduct(assetId, data);
	}

	async deleteAsset(assetId: number): Promise<void> {
		return this.deleteProduct(assetId);
	}

	async getBorrowRecords(
		productId?: number,
		driverId?: number
	): Promise<BorrowRecordResponse[]> {
		return this.getProductBorrows({
			product_id: productId,
			driver_id: driverId,
		});
	}

	async createBorrowRecord(
		data: BorrowRecordCreate
	): Promise<BorrowRecordResponse> {
		return this.createProductBorrow(data);
	}

	async returnBorrowRecord(
		recordId: number,
		notes?: string
	): Promise<BorrowRecordResponse> {
		return this.returnProductBorrow(recordId, { notes });
	}

	// ============================================================================
	// Settings API
	// ============================================================================

	// ============================================================================
	// System Settings API
	// ============================================================================

	/**
	 * Get system configuration (visible to all users)
	 */
	async getSystemConfig(): Promise<SystemConfigResponse> {
		const response = await this.client.get<SystemConfigResponse>(
			'/api/v1/settings/config'
		);
		return response.data;
	}

	/**
	 * Create/initialize system configuration
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

	// ============================================================================
	// File Management API
	// ============================================================================

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
		return response.data;
	}

	async batchUploadFiles(
		files: File[],
		folder: string = 'uploads'
	): Promise<FileRecordResponse[]> {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append('files', file);
		});
		formData.append('folder', folder);

		const response = await this.client.post<FileRecordResponse[]>(
			'/api/v1/files/batch-upload',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	async listFiles(folder?: string): Promise<FileRecordResponse[]> {
		const params = folder ? { folder } : {};
		const response = await this.client.get<FileRecordResponse[]>(
			'/api/v1/files/list',
			{ params }
		);
		return response.data;
	}

	async deleteFile(fileId: number): Promise<void> {
		await this.client.delete(`/api/v1/files/delete/${fileId}`);
	}

	async batchDeleteFiles(fileIds: number[]): Promise<void> {
		const formData = new FormData();
		fileIds.forEach((id) => {
			formData.append('file_ids', id.toString());
		});

		await this.client.post('/api/v1/files/batch-delete', formData, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
	}

	async viewFile(fileId: number): Promise<Blob> {
		const response = await this.client.get(
			`/api/v1/files/download/${fileId}`,
			{
				responseType: 'blob',
			}
		);
		return response.data;
	}
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const apiClient = new APIClient();
export default apiClient;
