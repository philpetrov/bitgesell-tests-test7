import React, { useEffect, useState, useCallback, memo } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce';
import { FixedSizeList as List } from 'react-window';
import SkeletonLoader from '../components/SkeletonLoader';

function Items() {
  const { items, pagination, fetchItems } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const stableFetchItems = useCallback(fetchItems, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    stableFetchItems({
      q: debouncedSearchTerm,
      page: currentPage,
      signal: controller.signal,
    }).catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    }).finally(() => {
      setIsLoading(false);
    });

    return () => {
      controller.abort();
    };
  }, [debouncedSearchTerm, currentPage, stableFetchItems]);

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const Row = memo(({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        <Link to={'/items/' + item.id}>{item.name}</Link>
      </div>
    );
  });

  return (
    <div style={{ padding: 16 }}>
      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16, padding: 8, width: '300px' }}
      />
      {isLoading ? <SkeletonLoader count={10} /> : items.length === 0 ? <p>No items found.</p> : (
        <List
          height={400}
          itemCount={items.length}
          itemSize={35}
          width={'100%'}
        >{Row}</List>
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
        <span style={{ margin: '0 10px' }}>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>Next</button>
      </div>
    </div>
  );
}

export default Items;