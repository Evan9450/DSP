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
	// API uses numbers: condition (0=green, 1=yellow, 2=red), status (0=available, 1=in-use, 2=maintenance)
	// Frontend uses the numbers directly now
	return {
		id: apiVehicle.id.toString(),
		rego: apiVehicle.rego,
		alias: apiVehicle.alias,
		brand: apiVehicle.brand,
		model: apiVehicle.model,
		condition: apiVehicle.condition,
		status: apiVehicle.status,
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
	return {
		id: apiInspection.id.toString(),
		vehicleId: apiInspection.vehicle_id.toString(),
		driverId: apiInspection.driver_id.toString(),
		scheduleId: apiInspection.schedule_id?.toString(),
		date: new Date(apiInspection.date),
		photos: [], // Photos are fetched separately
		odometer: apiInspection.odometer,
		status: apiInspection.status,
		notes: apiInspection.notes,
		adminReviewed: apiInspection.admin_reviewed,
		adminReviewedBy: apiInspection.admin_reviewed_by?.toString(),
		adminReviewedAt: apiInspection.admin_reviewed_at
			? new Date(apiInspection.admin_reviewed_at)
			: undefined,
		adminNotes: apiInspection.admin_notes,
		driverName: '', // Will need to be fetched from driver data
	};
}

// ============================================================================
// Schedule Conversions
// ============================================================================

export function convertSchedule(apiSchedule: ScheduleResponse): Schedule {
	const [startHour, startMinute] = apiSchedule.start_time
		.split(':')
		.map(Number);
	const [endHour, endMinute] = apiSchedule.end_time.split(':').map(Number);

	const startDate = new Date(apiSchedule.date);
	startDate.setHours(startHour, startMinute);

	const endDate = new Date(apiSchedule.date);
	endDate.setHours(endHour, endMinute);

	return {
		id: apiSchedule.id.toString(),
		driverId: apiSchedule.driver_id.toString(),
		driverName: '', // Will need to be enriched from driver data
		vehicleId: apiSchedule.vehicle_id?.toString(),
		startTime: startDate,
		endTime: endDate,
		route: apiSchedule.route,
		status: apiSchedule.status as 'pending' | 'confirmed' | 'completed',
		deputyShiftId: apiSchedule.deputy_shift_id,
		smsSent: apiSchedule.sms_sent,
		smsSentAt: apiSchedule.sms_sent_at
			? new Date(apiSchedule.sms_sent_at)
			: undefined,
		driverConfirmed: apiSchedule.driver_confirmed,
		driverConfirmedAt: apiSchedule.driver_confirmed_at
			? new Date(apiSchedule.driver_confirmed_at)
			: undefined,
		notes: apiSchedule.notes,
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
		category: apiAsset.category,
		totalQuantity: apiAsset.total_quantity,
		availableQuantity: apiAsset.available_stock,
		borrowedQuantity: apiAsset.borrowed_quantity,
		unitPrice: apiAsset.unit_price,
		supplier: apiAsset.supplier,
		notes: apiAsset.notes,
		lowStockThreshold: apiAsset.low_stock_threshold,
	};
}

export function convertBorrowRecord(
	apiRecord: BorrowRecordResponse
): BorrowRecord {
	return {
		id: apiRecord.id.toString(),
		assetId: apiRecord.asset_id.toString(),
		assetName: '', // Will need to be enriched from asset data
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
		status: apiRecord.status,
		notes: apiRecord.notes,
	};
}
