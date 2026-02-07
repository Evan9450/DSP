export type ScheduleStatus =
	| 'pending'
	| 'confirmed'
	| 'completed'
	| 'cancelled';
export type DocumentStatus = 'valid' | 'expiring' | 'expired';
export type VehicleCondition = 'green' | 'yellow' | 'red';
export type VehicleInspectionStatus = 'normal' | 'has-issues' | 'needs-repair';
export type UserRole = 'admin' | 'staff';

// Vehicle Types
export interface Vehicle {
	id: string;
	alias: string;
	nickname?: string;
	rego: string; // Registration number (primary identifier per PRD)
	brand?: string;
	model?: string;
	condition: 'available' | 'need-repair' | 'unavailable'; // API strings: available, need-repair, unavailable
	status: 'in-use' | 'not-in-use'; // API strings: in-use, not-in-use
	maintenanceCycle?: number; // in days or km
	maintenanceLocation?: string;
	garageEmail?: string;
	mileage?: number;
	notes?: string; // Required when status is need-repair/unavailable
	lastMaintenanceDate?: Date;
	nextMaintenanceDate?: Date;
	scheduledMaintenanceDate?: Date;
}

export interface VehiclePhoto {
	id: string;
	vehicleId: string;
	url: string;
	uploadedBy: string; // driver ID or admin ID
	uploadedAt: Date;
	notes?: string;
}

export interface VehicleInspection {
	id: string;
	vehicleId: string;
	driverId: string;
	driverName: string;
	scheduleId?: string;
	date: Date;
	photos: VehiclePhoto[];
	odometer: number;
	status: VehicleInspectionStatus;
	notes?: string;
	adminReviewed: boolean;
	adminReviewedBy?: string;
	adminReviewedAt?: Date;
	adminNotes?: string;
}

export interface VehicleMaintenance {
	id: string;
	vehicleId: string;
	vehicleNumber: string;
	scheduledDate: Date;
	completedDate?: Date;
	location: string;
	garageEmail: string;
	type: 'routine' | 'repair' | 'inspection';
	notes?: string;
	cost?: number;
	reminderSent: boolean;
	emailSent: boolean;
}

// Driver Types
export interface DriverDocument {
	id: string;
	driverId: string;
	type: 'license' | 'visa' | 'certification' | 'other';
	documentNumber?: string; // License number or visa number
	documentName?: string;
	issueDate?: Date;
	fileUrl?: string; // Photo/PDF URL
	expiryDate: Date;
	status?: DocumentStatus;
	notes?: string;
	uploadedAt?: Date;
	uploadedBy?: string;
}

export interface Driver {
	id: string;
	name: string;
	amazonId: string;
	amazonPassword?: string; // Encrypted storage in real implementation
	phone?: string;
	email?: string;
	address?: string;
	deputyId?: string; // Synced from Deputy
	isActive?: boolean;
	// License fields
	license_number?: string;
	license_expiry_date?: string;
	license_file_url?: string[]; // Array of file URLs (allows multiple)
	// Visa fields
	visa_number?: string;
	visa_expiry_date?: string;
	visa_file_url?: string[]; // Array of file URLs (single file, replaces on new upload)
	documents?: DriverDocument[];
	kpi?: DriverKPI;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface DriverKPI {
	driverId: string;
	totalShifts: number;
	completedShifts: number;
	onTimeRate: number;
	customerRating: number;
	packagesPerHour: number;
	weeklyStats?: {
		week: string;
		shiftsCompleted: number;
		packagesDelivered: number;
	}[];
}

export interface Schedule {
	id: string;
	driverId: string;
	driverName: string;
	amazonId?: string;
	vehicleId?: string;
	vehicleNumber?: string;
	route?: string;
	status: ScheduleStatus;
	startTime: Date;
	endTime: Date;
	deputyShiftId?: string;
	smsSent?: boolean;
	smsSentAt?: Date;
	driverConfirmed?: boolean;
	driverConfirmedAt?: Date;
	notes?: string;
	isNew?: boolean;
	isModified?: boolean;
	fromDeputy?: boolean;
	confirmed?: boolean;
	confirmedAt?: Date;
}

export interface SMSHistory {
	id: string;
	scheduleId: string;
	recipient: string;
	message: string;
	sentAt: Date;
	deliveryStatus: 'sent' | 'delivered' | 'failed';
}

export interface DeputySync {
	lastSyncTime: Date | null;
	isSyncing: boolean;
}

// Asset/Inventory Types
export interface Asset {
	id: string;
	name: string;
	description?: string;
	availableQuantity: number; // Available stock
	minStockThreshold: number; // Low stock alert threshold
	lowStockThreshold?: number; // Alias for compatibility
	minThreshold?: number; // Alias for compatibility
	lowStockAlertSent?: boolean;
	needsPurchase?: boolean;
	status?: 'available' | 'low-stock' | 'out-of-stock';
	createdAt?: Date;
	updatedAt?: Date;
}

export interface AssetBorrowRecord {
	id: string;
	assetId: string;
	assetName: string;
	driverId: string;
	driverName: string;
	borrowedAt: Date;
	returnedAt?: Date;
	quantity: number;
	notes?: string;
	borrowedBy?: string; // Admin user ID
}

export interface BorrowRecord {
	id: string;
	assetId: string;
	assetName: string;
	driverId: string | null;
	driverName: string;
	quantity: number;
	operatedBy: string;
	borrowDate?: Date;
	notes?: string;
}

export interface AssetPurchase {
	id: string;
	assetId: string;
	assetName: string;
	quantity: number;
	purchaseDate: Date;
	cost?: number;
	vendor?: string;
	notes?: string;
	purchasedBy: string; // Admin user ID
}

// System Settings Types
export interface SystemSettings {
	id: string;
	// Reminder settings
	adminNotificationPhone: string;
	documentExpiryReminderDays: number; // 10, 15, or 30 days
	driverConfirmationSMSTime: string; // HH:MM format (e.g., "08:00")
	maintenanceReminderDays: number;
	lowStockNotificationEnabled: boolean;

	// SMS/Email templates
	scheduleReminderTemplate?: string;
	vehicleAssignmentTemplate?: string;
	documentExpiryTemplate?: string;

	// Deputy sync settings
	deputySyncEnabled: boolean;
	deputyAPIKey?: string;
	deputySyncIntervalHours?: number;

	updatedAt: Date;
	updatedBy: string;
}

// System User Types
export interface SystemUser {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: UserRole;
	passwordHash: string; // Never store plain text
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt?: Date;
}

// Notification/Reminder Types
export interface Reminder {
	id: string;
	type:
		| 'document-expiry'
		| 'vehicle-maintenance'
		| 'low-stock'
		| 'schedule-confirmation';
	entityId: string; // Driver ID, Vehicle ID, Asset ID, or Schedule ID
	entityType: 'driver' | 'vehicle' | 'asset' | 'schedule';
	message: string;
	scheduledFor: Date;
	sentAt?: Date;
	status: 'pending' | 'sent' | 'failed';
	recipientPhone?: string;
	recipientEmail?: string;
}
