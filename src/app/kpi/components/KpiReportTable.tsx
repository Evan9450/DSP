import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Eye, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { KPIReportResponse } from '@/lib/api/client';
// import { formatDate } from '@/lib/utils'; // Assuming this utility exists, otherwise will use standard date handling

interface KpiReportTableProps {
	reports: KPIReportResponse[];
	onView: (id: number) => void;
	onDelete: (id: number) => void;
}

export function KpiReportTable({
	reports,
	onView,
	onDelete,
}: KpiReportTableProps) {
	return (
		<div className='rounded-md border'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Period</TableHead>
						<TableHead>Created At</TableHead>
						<TableHead>Overall Standing  </TableHead>
						{/* <TableHead>Files</TableHead> */}
						<TableHead className='text-right'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reports.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={5}
								className='h-24 text-center'>
								No KPI reports found.
							</TableCell>
						</TableRow>
					) : (
						reports.map((report) => (
							<TableRow key={report.id}>
								<TableCell className='font-medium'>
									{report.week} - {report.year}
								</TableCell>
								<TableCell>
									{new Date(
										report.created_at
									).toLocaleDateString()}
								</TableCell>
								<TableCell>
									{report.overall_standing}


								</TableCell>
								{/* <TableCell>
									<div className='flex flex-col gap-1 text-xs text-muted-foreground'>
										{report.pdf_filename && (
											<span title={report.pdf_filename} className="truncate max-w-[150px]">
												PDF: {report.pdf_filename}
											</span>
										)}
										{report.csv_filename && (
											<span title={report.csv_filename} className="truncate max-w-[150px]">
												CSV: {report.csv_filename}
											</span>
										)}
									</div>
								</TableCell> */}
								<TableCell className='text-right'>
									<div className='flex justify-end gap-2'>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => onView(report.id)}
											title='View Details'>
											<Eye className='h-4 w-4' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='text-destructive hover:text-destructive'
											onClick={() => onDelete(report.id)}
											title='Delete Report'>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
