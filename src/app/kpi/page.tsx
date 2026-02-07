'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Plus, Search, Loader2 } from 'lucide-react';
import { useKpiReports } from '@/hooks/use-kpi-reports';
import { KpiReportTable } from './components/KpiReportTable';
import { GenerateKpiDialog } from './components/GenerateKpiDialog';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { usePagination } from '@/hooks/use-pagination';
import { TablePagination } from '@/components/TablePagination';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function KpiPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { reports, isLoading, refresh } = useKpiReports();
	const [searchTerm, setSearchTerm] = useState('');
	const [showGenerateDialog, setShowGenerateDialog] = useState(false);
	const [reportToDelete, setReportToDelete] = useState<number | null>(null);

	const filteredReports = reports.filter((report) =>
		report.week.toLowerCase().includes(searchTerm.toLowerCase()) ||
		report.year.toString().includes(searchTerm)
	);

	const {
		currentItems: currentReports,
		currentPage,
		totalPages,
		goToPage,
	} = usePagination({
		data: filteredReports,
		itemsPerPage: 10,
	});

	const handleViewReport = (id: number) => {
		router.push(`/kpi/${id}`);
	};

	const handleDeleteReport = async () => {
		if (!reportToDelete) return;

		try {
			await apiClient.deleteKpiReport(reportToDelete);
			toast({
				title: 'Report deleted',
				description: 'The KPI report has been successfully deleted.',
			});
			refresh();
		} catch (error) {
			console.error('Failed to delete report:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete KPI report.',
				variant: 'destructive',
			});
		} finally {
			setReportToDelete(null);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-zinc-100 flex items-center justify-center'>
				<div className='text-center'>
					<Loader2 className='animate-spin h-8 w-8 text-primary mx-auto' />
					<p className='mt-2 text-muted-foreground'>Loading reports...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50'>
			<div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl'>
				<div className='mb-8'>
					<div className='flex justify-between items-start'>
						<div>
							<h1 className='text-4xl font-bold tracking-tight text-zinc-900'>
								KPI Reports
							</h1>

						</div>

						<Button onClick={() => setShowGenerateDialog(true)}>
							<Plus className='h-4 w-4 mr-2' />
							Generate New Report
						</Button>
					</div>
				</div>

				<div className='mb-6 flex gap-4'>
					<div className='relative flex-1 max-w-sm'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
						<Input
							placeholder='Search by week or year...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
				</div>

				<KpiReportTable
					reports={currentReports}
					onView={handleViewReport}
					onDelete={setReportToDelete}
				/>
				<TablePagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={goToPage}
				/>
			</div>

			<GenerateKpiDialog
				open={showGenerateDialog}
				onOpenChange={setShowGenerateDialog}
				onSuccess={refresh}
			/>

			<AlertDialog
				open={!!reportToDelete}
				onOpenChange={(open) => !open && setReportToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							KPI report and all associated driver scores.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							onClick={handleDeleteReport}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
