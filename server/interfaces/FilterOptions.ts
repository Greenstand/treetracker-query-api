type FilterOptions = {
  limit?: number;
  offset?: number;
  orderBy?: { column: string; direction?: 'asc' | 'desc' };
};

export default FilterOptions;
