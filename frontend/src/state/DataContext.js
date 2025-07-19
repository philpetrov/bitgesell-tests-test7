import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchItems = useCallback(async ({ q = '', page = 1, signal }) => {
    const params = new URLSearchParams({ q, page });
    const res = await fetch(
      `http://localhost:3001/api/items?${params.toString()}`,
      { signal }
    );
    const { items: fetchedItems, ...paginationData } = await res.json();
    setItems(fetchedItems);
    setPagination(paginationData);
  }, []);

  return (
    <DataContext.Provider value={{ items, pagination, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);