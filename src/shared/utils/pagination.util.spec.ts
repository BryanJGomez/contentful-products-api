import { paginateResult } from './pagination.util';

describe('paginateResult', () => {
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  it('should return paginated result', () => {
    // Arrange
    // Act
    const result = paginateResult(10, mockData, 5, 1);
    // Assert
    expect(result).toEqual({
      results: mockData,
      totalRecords: 10,
      totalPages: 2,
      currentPage: 1,
      hasPreviousPage: false,
      hasNextPage: true,
      previousPage: null,
      nextPage: 2,
      hasEllipsisBefore: false,
      hasEllipsisAfter: false,
      pageLinks: [1, 2],
    });
  });

  it('should handle empty results', () => {
    // Arrange
    // Act
    const result = paginateResult(0, [], 5, 1);
    // Assert
    expect(result).toEqual({
      results: [],
      totalRecords: 0,
      totalPages: 0,
      currentPage: 0,
      hasPreviousPage: false,
      hasNextPage: false,
      previousPage: null,
      nextPage: null,
      hasEllipsisBefore: false,
      hasEllipsisAfter: false,
      pageLinks: [],
    });
  });
  // clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
