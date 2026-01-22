import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function TablePagination({
	currentPage,
	totalPages,
	onPageChange,
}: TablePaginationProps) {
	if (totalPages <= 1) return null;

	const renderPageNumbers = () => {
		const items = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							isActive={currentPage === i}
							onClick={() => onPageChange(i)}>
							{i}
						</PaginationLink>
					</PaginationItem>,
				);
			}
		} else {
			// Always show first page
			items.push(
				<PaginationItem key={1}>
					<PaginationLink
						isActive={currentPage === 1}
						onClick={() => onPageChange(1)}>
						1
					</PaginationLink>
				</PaginationItem>,
			);

			// Ellipsis start
			if (currentPage > 3) {
				items.push(
					<PaginationItem key='ellipsis-start'>
						<PaginationEllipsis />
					</PaginationItem>,
				);
			}

			// Current page and surrounding
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							isActive={currentPage === i}
							onClick={() => onPageChange(i)}>
							{i}
						</PaginationLink>
					</PaginationItem>,
				);
			}

			// Ellipsis end
			if (currentPage < totalPages - 2) {
				items.push(
					<PaginationItem key='ellipsis-end'>
						<PaginationEllipsis />
					</PaginationItem>,
				);
			}

			// Always show last page
			items.push(
				<PaginationItem key={totalPages}>
					<PaginationLink
						isActive={currentPage === totalPages}
						onClick={() => onPageChange(totalPages)}>
						{totalPages}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		return items;
	};

	return (
		<div className='flex items-center justify-end space-x-2 py-4'>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() =>
								currentPage > 1 && onPageChange(currentPage - 1)
							}
							className={
								currentPage === 1
									? 'pointer-events-none opacity-50'
									: 'cursor-pointer'
							}
						/>
					</PaginationItem>

					{renderPageNumbers()}

					<PaginationItem>
						<PaginationNext
							onClick={() =>
								currentPage < totalPages &&
								onPageChange(currentPage + 1)
							}
							className={
								currentPage === totalPages
									? 'pointer-events-none opacity-50'
									: 'cursor-pointer'
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
