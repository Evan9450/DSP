'use client';

import {
	AlertTriangle,
	ChevronRight,
	FileText,
	Mail,
	MapPin,
	Phone,
	Plus,
	RefreshCw,
	Search,
	Trash2,
	Upload,
	User,
} from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { calculateDocumentStatus } from '@/lib/helpers';
import { convertDriver } from '@/lib/api/converters';

type Driver = ReturnType<typeof convertDriver>;
interface DriverTableProps {
	filteredDrivers: Driver[];
	driverDocuments: Record<string, any[]>;
	handleRowClick: (driverId: string) => void;
	handleDeleteClick: (driverId: string, driverName: string) => void;
}

const DriverTable = ({
	filteredDrivers,
	driverDocuments,
	handleRowClick,
	handleDeleteClick,
}: DriverTableProps) => {
	// Get document stats for alerts
	const getDriverDocumentStatus = (driverId: string) => {
		const docs = driverDocuments[driverId] || [];
		const expiring = docs.filter((d) => {
			const status = calculateDocumentStatus(new Date(d.expiry_date));
			return status === 'expiring';
		});
		const expired = docs.filter((d) => {
			const status = calculateDocumentStatus(new Date(d.expiry_date));
			return status === 'expired';
		});
		return {
			total: docs.length,
			expiring: expiring.length,
			expired: expired.length,
		};
	};
	return (
		<Card className='bg-white overflow-x-auto'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Driver Name</TableHead>
						<TableHead>Amazon ID</TableHead>
						<TableHead>Contact</TableHead>
						<TableHead>Address</TableHead>
						<TableHead>Documents</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className='w-[80px]'></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredDrivers.map((driver) => {
						const docStatus = getDriverDocumentStatus(driver.id);
						return (
							<TableRow
								key={driver.id}
								className='cursor-pointer hover:bg-gray-50 transition-colors'
								onClick={() => handleRowClick(driver.id)}>
								{/* <TableCell></TableCell> */}
								<TableCell className='flex flex-row'>
									<div className='p-2 bg-blue-100 rounded-full inline-block'>
										<User className='h-5 w-5 text-blue-700' />
									</div>
									<div className='ml-2'>
										<p className='font-semibold text-gray-900'>
											{driver.name}
										</p>
										<div className='flex items-center gap-1 mt-1'>
											{/* <Key className='h-3 w-3 text-gray-400' /> */}
											<div className='flex items-center gap-1'>
												<div className='w-2 h-2 rounded-full bg-green-500'></div>
												<span className='text-xs text-gray-600'>
													{driver.deputyId}
												</span>
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant='outline'
										className='font-mono text-xs'>
										{driver.amazonId}
									</Badge>
									{driver.amazonPassword && (
										<div className='flex items-center gap-1 mt-1'>
											<div className='w-2 h-2 rounded-full bg-green-500'></div>
											<span className='text-xs text-gray-500'>
												Has Password
											</span>
										</div>
									)}
								</TableCell>
								<TableCell className='text-gray-600 text-sm'>
									{driver.phone && (
										<div className='flex items-center gap-1 mb-1'>
											<Phone className='h-3 w-3 text-gray-500' />
											<span>{driver.phone}</span>
										</div>
									)}
									{driver.email && (
										<div className='flex items-center gap-1'>
											<Mail className='h-3 w-3 text-gray-500' />
											<span className='text-xs'>
												{driver.email}
											</span>
										</div>
									)}
								</TableCell>
								<TableCell className='text-gray-600 text-sm'>
									{driver.address ? (
										<div className='flex items-start gap-1 max-w-xs'>
											<MapPin className='h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0' />
											<span className='text-xs'>
												{driver.address}
											</span>
										</div>
									) : (
										<span className='text-gray-400'>-</span>
									)}
								</TableCell>
								<TableCell>
									{docStatus.total > 0 ? (
										<div className='space-y-1'>
											<div className='flex items-center gap-1'>
												<FileText className='h-3 w-3 text-gray-500' />
												<span className='text-xs text-gray-600'>
													{docStatus.total} documents
												</span>
											</div>
											{docStatus.expired > 0 && (
												<Badge
													variant='destructive'
													className='text-xs'>
													{docStatus.expired} Expired
												</Badge>
											)}
										</div>
									) : (
										<span className='text-xs text-gray-400'>
											No documents
										</span>
									)}
								</TableCell>
								<TableCell>
									<div className='flex items-center gap-1'>
										<div
											className={`w-2 h-2 rounded-full ${driver.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
										<span className='text-xs text-gray-600'>
											{driver.isActive
												? 'Active'
												: 'Inactive'}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div className='flex items-center justify-end gap-2'>
										<Button
											variant='ghost'
											size='sm'
											className='text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0'
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteClick(
													driver.id,
													driver.name
												);
											}}>
											<Trash2 className='h-4 w-4' />
										</Button>
										<ChevronRight className='h-5 w-5 text-gray-400' />
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</Card>
	);
};

export default DriverTable;
