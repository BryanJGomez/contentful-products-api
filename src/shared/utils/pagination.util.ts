import { PaginatedResult } from '../dto/paginated-result.dto';

export const paginateResult = <T>(
  count: number,
  results: T[],
  limit = 5,
  page = 1,
  maxPageLinks = 5,
  extras?: Record<string, any>,
): PaginatedResult<T> & Record<string, any> => {
  if (
    !Number.isInteger(count) ||
    !Array.isArray(results) ||
    !Number.isInteger(limit) ||
    !Number.isInteger(page) ||
    !Number.isInteger(maxPageLinks)
  ) {
    throw new Error('Invalid input parameters');
  }
  const totalPages = Math.ceil(count / limit);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const previousPage = hasPreviousPage ? currentPage - 1 : null;
  const nextPage = hasNextPage ? currentPage + 1 : null;
  const hasEllipsisBefore = currentPage > (maxPageLinks + 1) / 2;
  const hasEllipsisAfter = currentPage < totalPages - (maxPageLinks - 1) / 2;

  const pageLinks: any[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - (maxPageLinks - 1) / 2 &&
        i <= currentPage + (maxPageLinks - 1) / 2)
    ) {
      pageLinks.push(i);
    } else if (
      (i === currentPage - (maxPageLinks - 1) / 2 - 1 && hasEllipsisBefore) ||
      (i === currentPage + (maxPageLinks - 1) / 2 + 1 && hasEllipsisAfter)
    ) {
      pageLinks.push('...');
    }
  }

  if (pageLinks[0] === '...' && pageLinks[1] !== '...' && pageLinks[1] !== 2) {
    pageLinks.shift();
  }

  if (
    pageLinks[pageLinks.length - 1] === '...' &&
    pageLinks[pageLinks.length - 2] !== '...' &&
    pageLinks[pageLinks.length - 2] !== totalPages - 1
  ) {
    pageLinks.pop();
  }

  return {
    ...extras,
    results,
    totalRecords: count,
    totalPages,
    currentPage,
    hasPreviousPage,
    hasNextPage,
    previousPage,
    nextPage,
    hasEllipsisBefore,
    hasEllipsisAfter,
    pageLinks,
  };
};
