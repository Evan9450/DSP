import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { DriverKPIResponse } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface DriverKpiTableProps {
	kpis: DriverKPIResponse[];
}

export function DriverKpiTable({ kpis }: DriverKpiTableProps) {
	const formatScore = (val: number | null) => {
		if (val === null || val === undefined) return '-';
		return val.toFixed(2);
	};

	const formatNumber = (val: number | null) => {
		if (val === null || val === undefined) return '-';
		return val;
	};

	const getScoreColor = (score: number | null) => {
		if (score === null) return 'text-muted-foreground';
		if (score >= 4.5) return 'text-green-600 font-bold';
		if (score >= 3.0) return 'text-amber-600 font-medium';
		return 'text-red-600 font-medium';
	};

	const sortedKpis = [...kpis].sort((a, b) => {
		if (a.rank === null && b.rank === null) return 0;
		if (a.rank === null) return 1;
		if (b.rank === null) return -1;
		return a.rank - b.rank;
	});

	return (
		<div className='rounded-md border'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[50px]'>Rank</TableHead>
						<TableHead>Driver</TableHead>
						<TableHead className='text-center'>Amazon ID</TableHead>
						{/* <TableHead className='text-center'>Status</TableHead> */}
						<TableHead className='text-right'>Overall Score</TableHead>
						<TableHead className='text-right'>Delivered</TableHead>
						<TableHead className='text-right'>Netradyne</TableHead>
						<TableHead className='text-right'>DNR (DPMO)</TableHead>
						<TableHead className='text-right'>DCR</TableHead>
						<TableHead className='text-right'>POD</TableHead>
						<TableHead className='text-right'>CC</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedKpis.length === 0 ? (
						<TableRow>
							<TableCell colSpan={11} className='h-24 text-center'>
								No driver data found in this report.
							</TableCell>
						</TableRow>
					) : (
						sortedKpis.map((kpi) => (
							<TableRow key={kpi.id} className={!kpi.is_matched ? 'bg-destructive/5' : ''}>
								<TableCell className='font-medium'>
									{kpi.rank ? `${kpi.rank}` : '-'}
								</TableCell>
								<TableCell>
									<div className='flex flex-col'>
										<span className='font-medium'>{kpi.driver_name}</span>
									</div>
								</TableCell>
								<TableCell className='text-center font-mono text-xs'>
									{kpi.amazon_id || '-'}
								</TableCell>
								{/* <TableCell className='text-center'>
									<div className='flex justify-center gap-1'>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger>
													{kpi.is_matched ? (
														<Badge variant='secondary' className='bg-green-100 text-green-800 hover:bg-green-100'>Linked</Badge>
													) : (
														<Badge variant='destructive'>Unlinked</Badge>
													)}
												</TooltipTrigger>
												<TooltipContent>
													<p>{kpi.is_matched ? 'Linked to system driver' : 'Driver not found in system'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>

										{(!kpi.pdf_matched || !kpi.csv_matched) && (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<AlertTriangle className='h-4 w-4 text-amber-500' />
													</TooltipTrigger>
													<TooltipContent>
														<p>Missing in: {!kpi.pdf_matched && 'PDF'} {!kpi.csv_matched && 'CSV'}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</div>
								</TableCell> */}
								<TableCell className={cn('text-right text-lg', getScoreColor(kpi.overall_score))}>
									{formatScore(kpi.overall_score)}
								</TableCell>
								<TableCell className='text-right'>{formatNumber(kpi.delivered)}</TableCell>
								<TableCell className='text-right'>{formatScore(kpi.netradyne_score)}</TableCell>
								<TableCell className='text-right'>
									<div className='flex flex-col items-end'>
										<span>{formatNumber(kpi.dnr_dpmo)}</span>
										{/* <span className='text-xs text-muted-foreground'>({formatScore(kpi.dnr_score)})</span> */}
									</div>
								</TableCell>
								<TableCell className='text-right'>{formatScore(kpi.dcr)}</TableCell>
								<TableCell className='text-right'>{formatScore(kpi.pod)}</TableCell>
								<TableCell className='text-right'>{formatScore(kpi.cc)}</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
