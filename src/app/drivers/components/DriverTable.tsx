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
import { TablePagination } from '@/components/TablePagination';
import { calculateDocumentStatus } from '@/lib/helpers';
import { convertDriver } from '@/lib/api/converters';
import { usePagination } from '@/hooks/use-pagination';

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
	console.log('🚀 => DriverTable => filteredDrivers:', filteredDrivers);
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
			total: docs.find((x) => x.type === 'total')?.total,
			expiring: expiring.length,
			expired: expired.length,
		};
	};
	const {
		currentItems: paginatedChanges,
		currentPage,
		totalPages,
		goToPage,
	} = usePagination({
		data: filteredDrivers,
		itemsPerPage: 20,
	});
	// const docStatus = getDriverDocumentStatus(driver.id);

	return (
		<Card className='bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-x-auto p-6'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='text-sm text-gray-500 '>
							ID
						</TableHead>
						<TableHead className='text-sm text-gray-500'>
							Driver Name
						</TableHead>
						<TableHead className='text-sm text-gray-500'>
							Amazon ID
						</TableHead>
						<TableHead className='text-sm text-gray-500'>
							Contact
						</TableHead>
						{/* <TableHead className='text-sm text-gray-500'>
							Address
						</TableHead> */}
						<TableHead className='text-sm text-gray-500'>
							Documents
						</TableHead>
						<TableHead className='text-sm text-gray-500'>
							Status
						</TableHead>
						<TableHead className='w-[80px]'></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{paginatedChanges.map((driver) => {
						const docStatus = getDriverDocumentStatus(driver.id);
						const hasDocs = docStatus.total > 0;
						const hasExpired = docStatus.expired > 0;

						const label = hasDocs
							? docStatus.total
							: 'No documents';
						const labelColor = hasDocs
							? 'text-gray-600'
							: 'text-gray-400';
						return (
							<TableRow
								key={driver.id}
								className='cursor-pointer hover:bg-zinc-50 transition-colors'
								onClick={() => handleRowClick(driver.id)}>
								<TableCell className='text-gray-600 text-sm'>
									{driver.deputyId ? (
										<div className='flex items-start gap-1 max-w-sm'>
											<span className='text-xs'>
												{driver.deputyId}
											</span>
										</div>
									) : (
										<span className='text-gray-400'>-</span>
									)}
								</TableCell>
								<TableCell className='flex flex-row'>
									<div className='ml-2'>
										<p className='font-semibold text-zinc-900'>
											{driver.name}
										</p>
										{/* <div className='flex items-center gap-1 mt-1'>
											<div className='flex items-center gap-1'>
												<div className='w-2 h-2 rounded-full bg-emerald-500'></div>
												<span className='text-sm text-gray-500'>
													{driver.deputyId}
												</span>
											</div>
										</div> */}
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant='outline'
										className='font-mono text-xs border-gray-300'>
										{driver.amazonId}
									</Badge>
									{driver.amazonPassword && (
										<div className='flex items-center gap-1 mt-1'>
											<div className='w-2 h-2 rounded-full bg-emerald-500'></div>
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
									{/* {driver.email && (
										<div className='flex items-center gap-1'>
											<Mail className='h-3 w-3 text-gray-500' />
											<span className='text-xs'>
												{driver.email}
											</span>
										</div>
									)} */}
								</TableCell>
								{/* <TableCell className='text-gray-600 text-sm'>
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
								</TableCell> */}
								{/* <TableCell>
									{docStatus.total > 0 ? (
										<div className='space-y-1'>
											<div className='flex items-center gap-1'>
												<FileText className='h-3 w-3 text-gray-500' />
												<span className='text-xs text-gray-600'>
													{docStatus.total}
												</span>
											</div>
											{docStatus.expired > 0 && (
												<Badge className='bg-rose-500 text-white text-xs hover:bg-rose-600'>
													{docStatus.expired} Expired
												</Badge>
											)}
										</div>
									) : (
										<div className='space-y-1'>
											<div className='flex items-center gap-1'>
												<FileText className='h-3 w-3 text-gray-500' />
												<span className='text-xs text-gray-400'>
													No documents
												</span>
											</div>
											{docStatus.expired > 0 && (
												<Badge className='bg-rose-500 text-white text-xs hover:bg-rose-600'>
													{docStatus.expired} Expired
												</Badge>
											)}
										</div>
									)}
								</TableCell> */}
								<TableCell>
									<div className='space-y-1'>
										<div className='flex items-center gap-1'>
											<FileText className='h-3 w-3 text-gray-500' />
											<span
												className={`text-xs ${labelColor}`}>
												{label}
											</span>
										</div>

										{hasExpired && (
											<Badge className='bg-rose-500 text-white text-xs hover:bg-rose-600'>
												{docStatus.expired} Expired
											</Badge>
										)}
									</div>
								</TableCell>

								<TableCell>
									<div className='flex items-center gap-1'>
										<div
											className={`w-2 h-2 rounded-full ${driver.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
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
											className='text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0'
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteClick(
													driver.id,
													driver.name,
												);
											}}>
											<Trash2 className='h-4 w-4' />
										</Button>
										{/* <ChevronRight className='h-5 w-5 text-gray-400' /> */}
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<TablePagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={goToPage}
			/>
		</Card>
	);
};

export default DriverTable;
