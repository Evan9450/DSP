import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient, GenerateKPIReportRequest } from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GenerateKpiDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function GenerateKpiDialog({
	open,
	onOpenChange,
	onSuccess,
}: GenerateKpiDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Start with current date defaults
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	// Simple week calculation (can be improved if needed)
	const startOfYear = new Date(currentYear, 0, 1);
	const days = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
	const currentWeekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);

	const [week, setWeek] = useState(`Week ${currentWeekNum}`);
	const [year, setYear] = useState(currentYear.toString());
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [csvFile, setCsvFile] = useState<File | null>(null);

	// Default parameters
	const [minDelivered, setMinDelivered] = useState('430');
	const [dnrThreshold, setDnrThreshold] = useState('8000');

	// Weights
	const [weightDnr, setWeightDnr] = useState('0.4');
	const [weightDcr, setWeightDcr] = useState('0.2');
	const [weightPod, setWeightPod] = useState('0.05');
	const [weightCc, setWeightCc] = useState('0.05');
	const [weightNetradyne, setWeightNetradyne] = useState('0.3');

	const resetForm = () => {
		setWeek(`Week ${currentWeekNum}`);
		setYear(currentYear.toString());
		setPdfFile(null);
		setCsvFile(null);
		setMinDelivered('430');
		setDnrThreshold('8000');
		setWeightDnr('0.4');
		setWeightDcr('0.2');
		setWeightPod('0.05');
		setWeightCc('0.05');
		setWeightNetradyne('0.3');
	};

	const calculateTotalWeight = () => {
		const total =
			parseFloat(weightDnr || '0') +
			parseFloat(weightDcr || '0') +
			parseFloat(weightPod || '0') +
			parseFloat(weightCc || '0') +
			parseFloat(weightNetradyne || '0');
		return parseFloat(total.toFixed(2));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!pdfFile || !csvFile || !week || !year || !minDelivered || !dnrThreshold) {
			toast({
				title: 'Validation Error',
				description: 'All fields are required.',
				variant: 'destructive',
			});
			return;
		}

		const totalWeight = calculateTotalWeight();
		if (Math.abs(totalWeight - 1.0) > 0.001) {
			toast({
				title: 'Validation Error',
				description: `Total weight must be 1.0. Current total: ${totalWeight}`,
				variant: 'destructive',
			});
			return;
		}

		try {
			setIsSubmitting(true);

			const requestData: GenerateKPIReportRequest = {
				pdf_file: pdfFile,
				csv_file: csvFile,
				week: week,
				year: parseInt(year),
				min_delivered: parseInt(minDelivered),
				dnr_threshold: parseInt(dnrThreshold),
				weight_dnr: parseFloat(weightDnr),
				weight_dcr: parseFloat(weightDcr),
				weight_pod: parseFloat(weightPod),
				weight_cc: parseFloat(weightCc),
				weight_netradyne: parseFloat(weightNetradyne),
			};

			await apiClient.generateKpiReport(requestData);

			toast({
				title: 'Success',
				description: 'KPI report generated successfully.',
			});

			onSuccess();
			onOpenChange(false);
			resetForm();
		} catch (error) {
			console.error('Failed to generate report:', error);
			toast({
				title: 'Error',
				description: 'Failed to generate KPI report. Please check your inputs.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const totalWeight = calculateTotalWeight();
	const isWeightValid = Math.abs(totalWeight - 1.0) <= 0.001;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Generate KPI Report</DialogTitle>
					<DialogDescription>
						Upload weekly summary and driver report to generate KPI scores.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Week & Year */}
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='week'>Week</Label>
							<Input
								id='week'
								value={week}
								onChange={(e) => setWeek(e.target.value)}
								placeholder='Week 4'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='year'>Year</Label>
							<Input
								id='year'
								type='number'
								value={year}
								onChange={(e) => setYear(e.target.value)}
								placeholder='2026'
							/>
						</div>
					</div>

					{/* Files */}
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='pdf_file'>DSP Weekly Summary (PDF)</Label>
							<div className='flex items-center gap-2'>
								<Input
									id='pdf_file'
									type='file'
									accept='.pdf'
									onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
									className='cursor-pointer'
								/>
							</div>
							{pdfFile && <p className='text-xs text-muted-foreground truncate'>{pdfFile.name}</p>}
						</div>
						<div className='space-y-2'>
							<Label htmlFor='csv_file'>Driver Report (CSV)</Label>
							<div className='flex items-center gap-2'>
								<Input
									id='csv_file'
									type='file'
									accept='.csv'
									onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
									className='cursor-pointer'
								/>
							</div>
							{csvFile && <p className='text-xs text-muted-foreground truncate'>{csvFile.name}</p>}
						</div>
					</div>

					{/* Thresholds */}
					<div className='grid grid-cols-2 gap-4 border-t pt-4'>
						<div className='space-y-2'>
							<Label htmlFor='min_delivered'>Min Delivered</Label>
							<Input
								id='min_delivered'
								type='number'
								value={minDelivered}
								onChange={(e) => setMinDelivered(e.target.value)}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='dnr_threshold'>DNR Threshold (DPMO)</Label>
							<Input
								id='dnr_threshold'
								type='number'
								value={dnrThreshold}
								onChange={(e) => setDnrThreshold(e.target.value)}
							/>
						</div>
					</div>

					{/* Weights */}
					<div className='space-y-4 border-t pt-4'>
						<div className='flex justify-between items-center'>
							<Label className='font-bold'>Weights Configuration</Label>
							<span className={`text-sm font-medium ${isWeightValid ? 'text-green-600' : 'text-red-600'}`}>
								Total: {totalWeight.toFixed(2)} / 1.00
							</span>
						</div>

						<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='weight_dnr'>DNR Weight</Label>
								<Input
									id='weight_dnr'
									type='number'
									step='0.01'
									min='0'
									max='1'
									value={weightDnr}
									onChange={(e) => setWeightDnr(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='weight_dcr'>DCR Weight</Label>
								<Input
									id='weight_dcr'
									type='number'
									step='0.01'
									min='0'
									max='1'
									value={weightDcr}
									onChange={(e) => setWeightDcr(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='weight_netradyne'>Netradyne Weight</Label>
								<Input
									id='weight_netradyne'
									type='number'
									step='0.01'
									min='0'
									max='1'
									value={weightNetradyne}
									onChange={(e) => setWeightNetradyne(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='weight_pod'>POD Weight</Label>
								<Input
									id='weight_pod'
									type='number'
									step='0.01'
									min='0'
									max='1'
									value={weightPod}
									onChange={(e) => setWeightPod(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='weight_cc'>CC Weight</Label>
								<Input
									id='weight_cc'
									type='number'
									step='0.01'
									min='0'
									max='1'
									value={weightCc}
									onChange={(e) => setWeightCc(e.target.value)}
								/>
							</div>
						</div>
						{!isWeightValid && (
							<Alert variant="destructive" className="py-2">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Total weight must equal 1.0. Current: {totalWeight.toFixed(2)}
								</AlertDescription>
							</Alert>
						)}
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type='submit' disabled={isSubmitting || !isWeightValid}>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Generating...
								</>
							) : (
								'Generate Report'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
