import { useState } from 'react';

interface UsePaginationProps<T> {
	data: T[];
	itemsPerPage?: number;
	alignToEnd?: boolean; // If true, the first page will handle the remainder, and subsequent pages will be full.
}

interface UsePaginationReturn<T> {
	currentItems: T[];
	currentPage: number;
	totalPages: number;
	goToPage: (page: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export function usePagination<T>({
	data,
	itemsPerPage = 10,
	alignToEnd = false,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(data.length / itemsPerPage);

	// Ensure current page is valid when data changes
	if (currentPage > totalPages && totalPages > 0) {
		setCurrentPage(totalPages);
	} else if (currentPage < 1 && totalPages > 0) {
		setCurrentPage(1);
	}

	let currentItems: T[] = [];

	if (data.length > 0) {
		let begin: number;
		let end: number;

		if (alignToEnd) {
			const remainder = data.length % itemsPerPage;
			const firstPageSize = remainder === 0 ? itemsPerPage : remainder;

			if (currentPage === 1) {
				begin = 0;
				end = firstPageSize;
			} else {
				begin = firstPageSize + (currentPage - 2) * itemsPerPage;
				end = begin + itemsPerPage;
			}
		} else {
			begin = (currentPage - 1) * itemsPerPage;
			end = begin + itemsPerPage;
		}

		// Ensure bounds
		begin = Math.max(0, begin);
		// slice handles end > length automatically, but we can clamp if needed
		currentItems = data.slice(begin, end);
	}

	const goToPage = (page: number) => {
		const pageNumber = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(pageNumber);
	};

	const nextPage = () => {
		goToPage(currentPage + 1);
	};

	const prevPage = () => {
		goToPage(currentPage - 1);
	};

	return {
		currentItems,
		currentPage,
		totalPages,
		goToPage,
		nextPage,
		prevPage,
		hasNextPage: currentPage < totalPages,
		hasPrevPage: currentPage > 1,
	};
}
