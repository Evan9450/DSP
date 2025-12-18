/**
 * Validation utilities for form fields
 */

export interface ValidationResult {
	isValid: boolean;
	error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
	if (!email || email.trim() === '') {
		return { isValid: true }; // Optional field
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
		return {
			isValid: false,
			error: 'Invalid email format',
		};
	}

	return { isValid: true };
}

/**
 * Validate Australian phone number
 * Accepts formats:
 * - 04XX XXX XXX
 * - 04XXXXXXXX
 * - +61 4XX XXX XXX
 * - +614XXXXXXXX
 * - 61 4XX XXX XXX
 * - 614XXXXXXXX
 */
export function validateAustralianPhone(phone: string): ValidationResult {
	if (!phone || phone.trim() === '') {
		return { isValid: true }; // Optional field
	}

	// Remove spaces and common separators
	const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

	// Australian mobile number patterns
	const patterns = [
		/^04\d{8}$/, // 04XXXXXXXX
		/^\+614\d{8}$/, // +614XXXXXXXX
		/^614\d{8}$/, // 614XXXXXXXX
	];

	const isValid = patterns.some((pattern) => pattern.test(cleanPhone));

	if (!isValid) {
		return {
			isValid: false,
			error: 'Invalid Australian phone number. Format: 04XX XXX XXX or +61 4XX XXX XXX',
		};
	}

	return { isValid: true };
}

/**
 * Validate all driver fields
 */
export interface DriverValidationErrors {
	email?: string;
	phone?: string;
}

export function validateDriverFields(driver: {
	email?: string;
	phone?: string;
}): DriverValidationErrors {
	const errors: DriverValidationErrors = {};

	const emailResult = validateEmail(driver.email || '');
	if (!emailResult.isValid) {
		errors.email = emailResult.error;
	}

	const phoneResult = validateAustralianPhone(driver.phone || '');
	if (!phoneResult.isValid) {
		errors.phone = phoneResult.error;
	}

	return errors;
}

/**
 * Check if there are any validation errors
 */
export function hasValidationErrors(errors: DriverValidationErrors): boolean {
	return Object.keys(errors).length > 0;
}
