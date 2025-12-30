'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, ExternalLink, RefreshCw, Folder, File as FileIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { apiClient, type FileRecordResponse } from '@/lib/api/client';
import {
	notify,
	successMessages,
	errorMessages,
	handleApiError,
} from '@/lib/notifications';

export default function FilesPage() {
	const [files, setFiles] = useState<FileRecordResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [isViewing, setIsViewing] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
	const [folderFilter, setFolderFilter] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);
	const batchFileInputRef = useRef<HTMLInputElement>(null);
	const [folder, setFolder] = useState('uploads');

	const fetchFiles = async () => {
		try {
			setIsLoading(true);
			const data = await apiClient.listFiles(folderFilter || undefined);
			setFiles(data);
		} catch (error) {
			console.error('Failed to fetch files:', error);
			handleApiError(error, 'Failed to fetch files');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchFiles();
	}, [folderFilter]);

	const handleSingleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			setIsUploading(true);
			await apiClient.uploadFile(file, folder);
			notify.success(`File "${file.name}" uploaded successfully`);
			await fetchFiles();
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		} catch (error) {
			console.error('Failed to upload file:', error);
			handleApiError(error, `Failed to upload file "${file.name}"`);
		} finally {
			setIsUploading(false);
		}
	};

	const handleBatchUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const fileList = event.target.files;
		if (!fileList || fileList.length === 0) return;

		const filesArray = Array.from(fileList);

		try {
			setIsUploading(true);
			await apiClient.batchUploadFiles(filesArray, folder);
			notify.success(`${filesArray.length} files uploaded successfully`);
			await fetchFiles();
			if (batchFileInputRef.current) {
				batchFileInputRef.current.value = '';
			}
		} catch (error) {
			console.error('Failed to upload files:', error);
			handleApiError(error, 'Failed to upload files');
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteFile = async (fileId: number, filename: string) => {
		console.log('🗑️ Deleting file:', { fileId, filename });

		try {
			await apiClient.deleteFile(fileId);
			notify.success(`File "${filename}" deleted successfully`);
			await fetchFiles();
			setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
		} catch (error) {
			console.error('Failed to delete file:', error);
			handleApiError(error, `Failed to delete file "${filename}"`);
		}
	};

	const handleBatchDelete = async () => {
		if (selectedFiles.length === 0) {
			notify.error('Please select files to delete');
			return;
		}

		console.log('🗑️ Batch deleting files:', selectedFiles);

		try {
			await apiClient.batchDeleteFiles(selectedFiles);
			notify.success(`${selectedFiles.length} file(s) deleted successfully`);
			await fetchFiles();
			setSelectedFiles([]);
		} catch (error) {
			console.error('Failed to delete files:', error);
			handleApiError(error, 'Failed to delete files');
		}
	};

	const handleViewFile = async (fileId: number, filename: string) => {
		try {
			setIsViewing(true);
			// Fetch file with authentication via apiClient
			const blob = await apiClient.viewFile(fileId);

			// Create a temporary URL for the blob
			const url = window.URL.createObjectURL(blob);

			// Open in new tab
			const newWindow = window.open(url, '_blank');

			// Clean up the URL after a delay (to ensure it loads)
			setTimeout(() => {
				window.URL.revokeObjectURL(url);
			}, 1000);

			notify.success(`Opening "${filename}"`);
		} catch (error) {
			console.error('Failed to view file:', error);
			handleApiError(error, `Failed to open file "${filename}"`);
		} finally {
			setIsViewing(false);
		}
	};

	const toggleSelectFile = (fileId: number) => {
		setSelectedFiles((prev) =>
			prev.includes(fileId)
				? prev.filter((id) => id !== fileId)
				: [...prev, fileId]
		);
	};

	const toggleSelectAll = () => {
		if (selectedFiles.length === files.length) {
			setSelectedFiles([]);
		} else {
			setSelectedFiles(files.map((f) => f.id));
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleString();
	};

	// Get unique folders from files
	const uniqueFolders = Array.from(new Set(files.map((f) => f.folder)));

	if (isLoading) {
		return (
			<div className='min-h-screen bg-zinc-100 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto'></div>
					<p className='mt-4 text-sm text-gray-500'>Loading files...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-zinc-100'>
			<div className='container mx-auto py-12 px-4 max-w-7xl'>
				<div className='mb-8'>
					<div className='flex justify-between items-start'>
						<div>
							<h1 className='text-4xl font-bold tracking-tight text-zinc-900'>
								File Management
							</h1>
							<p className='text-sm text-gray-500 mt-2'>
								Upload, manage, and download files
							</p>
						</div>

						<Button
							variant='outline'
							className='border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md'
							onClick={fetchFiles}>
							<RefreshCw className='h-4 w-4 mr-2' />
							Refresh
						</Button>
					</div>
				</div>

				{/* Upload Section */}
				<Card className='bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg p-6 mb-6'>
					<h2 className='text-2xl font-semibold text-zinc-900 mb-4'>
						Upload Files
					</h2>

					<div className='grid gap-4 md:grid-cols-2'>
						<div>
							<Label className='text-sm text-gray-700'>Folder Path</Label>
							<Input
								value={folder}
								onChange={(e) => setFolder(e.target.value)}
								placeholder='e.g., uploads, drivers, vehicles'
								className='rounded-md'
							/>
						</div>

						<div>
							<Label className='text-sm text-gray-700'>Single File Upload</Label>
							<div className='flex gap-2'>
								<Input
									type='file'
									ref={fileInputRef}
									onChange={handleSingleUpload}
									disabled={isUploading}
									className='rounded-md'
								/>
								<Button
									variant='outline'
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading}
									className='rounded-md'>
									<Upload className='h-4 w-4' />
								</Button>
							</div>
						</div>

						<div className='md:col-span-2'>
							<Label className='text-sm text-gray-700'>Batch Upload (Multiple Files)</Label>
							<div className='flex gap-2'>
								<Input
									type='file'
									multiple
									ref={batchFileInputRef}
									onChange={handleBatchUpload}
									disabled={isUploading}
									className='rounded-md'
								/>
								<Button
									variant='outline'
									onClick={() => batchFileInputRef.current?.click()}
									disabled={isUploading}
									className='rounded-md'>
									<Upload className='h-4 w-4' />
								</Button>
							</div>
						</div>
					</div>

					{isUploading && (
						<div className='mt-4 text-center'>
							<div className='inline-flex items-center gap-2 text-sm text-gray-600'>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900'></div>
								<span>Uploading...</span>
							</div>
						</div>
					)}
				</Card>

				{/* Viewing indicator */}
				{isViewing && (
					<div className='fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50'>
						<div className='flex items-center gap-3'>
							<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600'></div>
							<span className='text-sm text-gray-700'>Loading file...</span>
						</div>
					</div>
				)}

				{/* Filter and Actions */}
				<Card className='bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg p-6 mb-6'>
					<div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
						<div className='flex-1 max-w-md'>
							<Label className='text-sm text-gray-700'>Filter by Folder</Label>
							<div className='flex gap-2'>
								<Input
									value={folderFilter}
									onChange={(e) => setFolderFilter(e.target.value)}
									placeholder='Enter folder name...'
									className='rounded-md'
								/>
								{folderFilter && (
									<Button
										variant='outline'
										onClick={() => setFolderFilter('')}
										className='rounded-md'>
										Clear
									</Button>
								)}
							</div>
							{uniqueFolders.length > 0 && (
								<div className='flex flex-wrap gap-2 mt-2'>
									{uniqueFolders.map((f) => (
										<Badge
											key={f}
											variant='outline'
											className='cursor-pointer hover:bg-indigo-50 border-gray-300'
											onClick={() => setFolderFilter(f)}>
											<Folder className='h-3 w-3 mr-1' />
											{f}
										</Badge>
									))}
								</div>
							)}
						</div>

						<div className='flex gap-2'>
							<Button
								variant='outline'
								onClick={toggleSelectAll}
								className='rounded-md'>
								{selectedFiles.length === files.length
									? 'Deselect All'
									: 'Select All'}
							</Button>
							<Button
								onClick={handleBatchDelete}
								disabled={selectedFiles.length === 0}
								className='bg-rose-500 hover:bg-rose-600 text-white rounded-md disabled:opacity-50'>
								<Trash2 className='h-4 w-4 mr-2' />
								Delete Selected ({selectedFiles.length})
							</Button>
						</div>
					</div>
				</Card>

				{/* Files Table */}
				<Card className='bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-x-auto p-6'>
					<h2 className='text-2xl font-semibold text-zinc-900 mb-4'>
						Files ({files.length})
					</h2>

					{files.length === 0 ? (
						<div className='text-center py-12'>
							<FileIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
							<p className='text-base text-gray-700'>No files found</p>
							<p className='text-sm text-gray-500'>Upload files to get started</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='w-[50px]'>
										<input
											type='checkbox'
											checked={selectedFiles.length === files.length}
											onChange={toggleSelectAll}
											className='h-4 w-4 rounded border-gray-300'
										/>
									</TableHead>
									<TableHead className='text-sm text-gray-500'>Filename</TableHead>
									<TableHead className='text-sm text-gray-500'>Folder</TableHead>
									<TableHead className='text-sm text-gray-500'>Size</TableHead>
									<TableHead className='text-sm text-gray-500'>Type</TableHead>
									<TableHead className='text-sm text-gray-500'>File URL</TableHead>
									<TableHead className='text-sm text-gray-500'>Uploaded</TableHead>
									<TableHead className='text-sm text-gray-500'>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{files.map((file) => (
									<TableRow
										key={file.id}
										className={`hover:bg-zinc-50 transition-colors ${
											selectedFiles.includes(file.id)
												? 'bg-indigo-50'
												: ''
										}`}>
										<TableCell>
											<input
												type='checkbox'
												checked={selectedFiles.includes(file.id)}
												onChange={() => toggleSelectFile(file.id)}
												className='h-4 w-4 rounded border-gray-300'
											/>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												<FileIcon className='h-4 w-4 text-gray-500' />
												<div>
													<p className='font-medium text-zinc-900'>
														{file.original_filename}
													</p>
													<p className='text-xs text-gray-500'>
														ID: {file.id}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant='outline' className='border-gray-300'>
												<Folder className='h-3 w-3 mr-1' />
												{file.folder}
											</Badge>
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{formatFileSize(file.file_size)}
										</TableCell>
										<TableCell>
											<Badge variant='outline' className='text-xs border-gray-300'>
												{file.content_type}
											</Badge>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2 max-w-md'>
												<button
													onClick={() =>
														handleViewFile(
															file.id,
															file.original_filename
														)
													}
													className='text-xs text-indigo-600 hover:text-indigo-700 underline truncate flex-1 text-left'>
													{file.file_url}
												</button>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														handleViewFile(
															file.id,
															file.original_filename
														)
													}
													className='text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-6 w-6 p-0 shrink-0'>
													<ExternalLink className='h-3 w-3' />
												</Button>
											</div>
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{formatDate(file.uploaded_at)}
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														handleViewFile(
															file.id,
															file.original_filename
														)
													}
													className='text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 w-8 p-0'>
													<Eye className='h-4 w-4' />
												</Button>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														handleDeleteFile(
															file.id,
															file.original_filename
														)
													}
													className='text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0'>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</Card>
			</div>
		</div>
	);
}
