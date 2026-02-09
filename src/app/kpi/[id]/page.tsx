'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Calendar, FileText, Users, Download } from 'lucide-react';
import { DriverKpiTable } from './components/DriverKpiTable';
import { apiClient, KPIReportDetailResponse } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';

export default function KpiDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [report, setReport] = useState<KPIReportDetailResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const id = params.id as string;

	useEffect(() => {
		async function fetchReport() {
			try {
				setIsLoading(true);
				const data = await apiClient.getKpiReport(parseInt(id));
				setReport(data);
			} catch (err) {
				console.error('Failed to fetch report:', err);
				setError('Failed to load report details.');
			} finally {
				setIsLoading(false);
			}
		}

		if (id) {
			fetchReport();
		}
	}, [id]);

	if (isLoading) {
		return (
			<div className='min-h-screen bg-zinc-100 flex items-center justify-center'>
				<Loader2 className='animate-spin h-8 w-8 text-primary' />
			</div>
		);
	}

	if (error || !report) {
		return (
			<div className='min-h-screen bg-zinc-100 flex flex-col items-center justify-center gap-4'>
				<p className='text-destructive text-lg font-medium'>{error || 'Report not found'}</p>
				<Button variant='outline' onClick={() => router.push('/kpi')}>
					<ArrowLeft className='mr-2 h-4 w-4' /> Back to Reports
				</Button>
			</div>
		);
	}

	// Calculate weights used for display
	const weights = [
		{ name: 'DNR', value: report.weight_dnr },
		{ name: 'DCR', value: report.weight_dcr },
		{ name: 'Netradyne', value: report.weight_netradyne },
		{ name: 'POD', value: report.weight_pod },
		{ name: 'CC', value: report.weight_cc },
	];
	console.log('report',report)


	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
				<Button
						variant='ghost'
						className='mb-4'
						onClick={() => router.push('/kpi')}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>
				{/* <Button
					variant='ghost'
					className='mb-6 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground'
					onClick={() => router.push('/kpi')}>
					<ArrowLeft className='mr-2 h-4 w-4' /> Back to Reports
				</Button> */}

				<div className='grid gap-6 mb-8'>
					<div className='flex flex-col md:flex-row justify-between md:items-start gap-4'>
						<div>
							<h1 className='text-3xl font-bold tracking-tight text-zinc-900'>
								{report.week} - {report.year} Report
							</h1>
							<div className='flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground'>
								<span className='flex items-center gap-1'>
									<Calendar className='h-3 w-3' />
									Created: {new Date(report.created_at).toLocaleDateString()}
								</span>
								<span className="hidden sm:inline">•</span>
								<span className='flex items-center gap-1'>
									<FileText className='h-3 w-3' />
									Min Delivered: {report.min_delivered}
								</span>
								<span className="hidden sm:inline">•</span>
								<span>
									DNR Threshold: {report.dnr_threshold}
								</span>
							</div>
						</div>

						<div className='flex gap-2'>
							{/* Future: Add export buttons here if needed */}
							{/* <Button variant="outline">
								<Download className="mr-2 h-4 w-4" /> Export CSV
							</Button> */}
						</div>
					</div>

					{/* Stats Cards */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-muted-foreground'>
									Overall Standing
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{report.overall_standing}</div>
							</CardContent>
						</Card>

						{/* Weights Info */}
						<Card className="md:col-span-2">
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-muted-foreground'>
									Score Weights Configuration
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{weights.map((w) => (
										<Badge key={w.name} variant="secondary" className="px-3 py-1">
											{w.name}: {(w.value * 100).toFixed(0)}%
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Drivers Table */}
				<Card>
					<CardHeader>
						<CardTitle >Driver Performance Scores</CardTitle>
					</CardHeader>
					<CardContent>
						<DriverKpiTable kpis={report.driver_kpis} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
