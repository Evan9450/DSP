export interface MockUser {
	email: string;
	password: string;
	name: string;
	role: string;
}

export const mockUsers: MockUser[] = [
	{
		email: 'admin@dsp.com',
		password: 'admin123',
		name: 'Admin User',
		role: 'Administrator',
	},
	{
		email: 'manager@dsp.com',
		password: 'manager123',
		name: 'Manager User',
		role: 'Manager',
	},
	{
		email: 'demo@dsp.com',
		password: 'demo123',
		name: 'Demo User',
		role: 'Operator',
	},
];

export function validateUser(
	email: string,
	password: string
): MockUser | null {
	const user = mockUsers.find(
		(u) => u.email === email && u.password === password
	);
	return user || null;
}
