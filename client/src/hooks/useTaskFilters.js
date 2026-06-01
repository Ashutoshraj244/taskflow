import { useState, useCallback } from 'react';

const defaultFilters = {
  search: '',
  status: '',
  priority: '',
  assignedTo: '',
  tag: '',
  sort: 'newest',
};

const useTaskFilters = () => {
  const [filters, setFilters] = useState(defaultFilters);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'sort' && v !== ''
  ).length;

  return { filters, setFilter, resetFilters, activeCount };
};

export default useTaskFilters;
