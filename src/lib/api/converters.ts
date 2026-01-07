/**
 * Utility functions to convert API response types to frontend types
 * This allows us to maintain compatibility with existing frontend code
 * while integrating with the backend API
 */

import type {
	Asset,
	BorrowRecord,
	Driver,
	DriverDocument,
	Schedule,
	Vehicle,
	VehicleInspection,
	VehicleInspectionStatus,
	VehiclePhoto,
} from '@/types/schedule';
import type {
	AssetResponse,
	BorrowRecordResponse,
	DriverDocumentResponse,
	DriverResponse,
	ScheduleResponse,
	VehicleInspectionResponse,
	VehicleResponse,
} from './client';

// ============================================================================
// Driver Conversions
// ============================================================================

export function convertDriver(apiDriver: DriverResponse): Driver {
	return {
		id: apiDriver.id.toString(),
		name: apiDriver.name,
		phone: apiDriver.phone,
		email: apiDriver.email,
		address: apiDriver.address,
		amazonId: apiDriver.amazon_id,
		amazonPassword: apiDriver.amazon_password,
		deputyId: apiDriver.deputy_id,
		isActive: apiDriver.is_active,
		// License fields
		license_number: apiDriver.license_number,
		license_expiry_date: apiDriver.license_expiry_date,
		license_file_url: apiDriver.license_file_url,
		// Visa fields
		visa_number: apiDriver.visa_number,
		visa_expiry_date: apiDriver.visa_expiry_date,
		visa_file_url: apiDriver.visa_file_url,
	};
}

export function convertDriverDocument(
	apiDoc: DriverDocumentResponse
): DriverDocument {
	return {
		id: apiDoc.id.toString(),
		driverId: apiDoc.driver_id.toString(),
		type: apiDoc.type as 'license' | 'visa' | 'certification' | 'other',
		documentNumber: apiDoc.document_number || undefined,
		issueDate: apiDoc.issue_date ? new Date(apiDoc.issue_date) : undefined,
		expiryDate: new Date(apiDoc.expiry_date),
		fileUrl: apiDoc.file_url || undefined,
		notes: apiDoc.notes,
	};
}

// ============================================================================
// Vehicle Conversions
// ============================================================================

export function convertVehicle(apiVehicle: VehicleResponse): Vehicle {
	// API now uses strings that match frontend Vehicle type
	return {
		id: apiVehicle.id.toString(),
		rego: apiVehicle.rego,
		alias: apiVehicle.alias,
		brand: apiVehicle.brand,
		model: apiVehicle.model,
		condition: apiVehicle.condition, // API strings: 'available', 'need-repair', 'unavailable'
		status: apiVehicle.status, // API strings: 'in-use', 'not-in-use'
		maintenanceCycle: apiVehicle.maintenance_cycle_days,
		maintenanceLocation: apiVehicle.maintenance_location,
		garageEmail: apiVehicle.workshop_email,
		mileage: apiVehicle.mileage,
		notes: apiVehicle.notes,
		lastMaintenanceDate: apiVehicle.last_maintenance_date
			? new Date(apiVehicle.last_maintenance_date)
			: undefined,
		nextMaintenanceDate: apiVehicle.next_maintenance_date
			? new Date(apiVehicle.next_maintenance_date)
			: undefined,
	};
}

export function convertVehicleInspection(
	apiInspection: VehicleInspectionResponse
): VehicleInspection {
	// Convert photo URLs to VehiclePhoto objects
	const photos: VehiclePhoto[] = (apiInspection.inspection_urls || []).map((url: string, index: number) => ({
		id: `${apiInspection.id}-photo-${index}`,
		vehicleId: apiInspection.vehicle_id.toString(),
		url: url,
		uploadedBy: apiInspection.driver_id.toString(),
		uploadedAt: new Date(apiInspection.created_at),
	}));

	// Map inspection_status to VehicleInspectionStatus
	// API now uses strings: 'pending', 'passed', 'failed'
	let status: VehicleInspectionStatus;
	if (apiInspection.inspection_status === 'passed') {
		status = 'normal'; // passed -> normal
	} else if (apiInspection.inspection_status === 'failed') {
		status = 'needs-repair'; // failed -> needs-repair
	} else {
		status = 'has-issues'; // pending -> has-issues
	}

	return {
		id: apiInspection.id.toString(),
		vehicleId: apiInspection.vehicle_id.toString(),
		driverId: apiInspection.driver_id.toString(),
		scheduleId: undefined, // No longer part of inspection response
		date: new Date(apiInspection.inspection_date),
		photos: photos,
		odometer: apiInspection.mileage_at_inspection,
		status: status,
		notes: undefined, // Notes field removed from new API
		adminReviewed: apiInspection.reviewed_by_admin,
		adminReviewedBy: undefined, // No longer tracked separately
		adminReviewedAt: apiInspection.reviewed_by_admin ? new Date(apiInspection.updated_at) : undefined,
		adminNotes: apiInspection.admin_notes,
		driverName: '', // Will need to be fetched from driver data
	};
}

// ============================================================================
// Schedule Conversions
// ============================================================================

export function convertSchedule(apiSchedule: ScheduleResponse): Schedule {
	// API now returns ISO datetime strings (YYYY-MM-DDTHH:MM:SS)
	const startDate = new Date(apiSchedule.start_time);
	const endDate = new Date(apiSchedule.end_time);

	return {
		id: apiSchedule.id.toString(),
		driverId: apiSchedule.deputy_id, // Use deputy_id as driverId
		driverName: apiSchedule.driver_name,
		vehicleId: undefined, // No vehicle_id in new API
		startTime: startDate,
		endTime: endDate,
		route: apiSchedule.route ?? undefined,
		status: apiSchedule.confirm_status as 'pending' | 'confirmed' | 'completed',
		deputyShiftId: apiSchedule.deputy_schedule_id,
		smsSent: apiSchedule.reminder_sms_sent || apiSchedule.assignment_sms_sent,
		smsSentAt: undefined, // No longer tracked separately
		driverConfirmed: apiSchedule.confirm_status === 'confirmed',
		driverConfirmedAt: undefined, // No longer tracked separately
		notes: undefined, // No notes field in new API
		isNew: false, // Backend doesn't track this, it's a frontend-only flag
	};
}

// ============================================================================
// Asset Conversions
// ============================================================================

export function convertAsset(apiAsset: AssetResponse): Asset {
	return {
		id: apiAsset.id.toString(),
		name: apiAsset.name,
		description: apiAsset.description || undefined,
		availableQuantity: apiAsset.available_stock,
		minStockThreshold: apiAsset.min_stock_threshold,
		lowStockThreshold: apiAsset.min_stock_threshold, // Alias for compatibility
		minThreshold: apiAsset.min_stock_threshold, // Alias for compatibility
		lowStockAlertSent: apiAsset.low_stock_alert_sent,
		needsPurchase: apiAsset.needs_purchase,
		createdAt: new Date(apiAsset.created_at),
		updatedAt: new Date(apiAsset.updated_at),
	};
}

export function convertBorrowRecord(
	apiRecord: BorrowRecordResponse
): BorrowRecord {
	return {
		id: apiRecord.id.toString(),
		assetId: apiRecord.product_id.toString(),
		assetName: '', // Will need to be enriched from product data
		driverId: apiRecord.driver_id.toString(),
		driverName: '', // Will need to be enriched from driver data
		quantity: apiRecord.quantity,
		borrowDate: new Date(apiRecord.borrow_date),
		expectedReturnDate: apiRecord.expected_return_date
			? new Date(apiRecord.expected_return_date)
			: undefined,
		actualReturnDate: apiRecord.actual_return_date
			? new Date(apiRecord.actual_return_date)
			: undefined,
		status: apiRecord.is_returned ? 'returned' : 'borrowed',
		notes: apiRecord.notes,
	};
}
