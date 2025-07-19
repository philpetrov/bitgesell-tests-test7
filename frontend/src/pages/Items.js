import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce';
import { FixedSizeList as List } from 'react-window';

function Items() {
  const { items, pagination, fetchItems } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Используем useCallback, чтобы функция не создавалась заново при каждом рендере
  const stableFetchItems = useCallback(fetchItems, []);

  useEffect(() => {
    const controller = new AbortController();

    stableFetchItems({
      q: debouncedSearchTerm,
      page: currentPage,
      signal: controller.signal,
    }).catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
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

  // Компонент для рендеринга одного элемента в виртуализированном списке
  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        <Link to={'/items/' + item.id}>{item.name}</Link>
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16, padding: 8, width: '300px' }}
      />
      {items.length === 0 ? <p>Loading or no items found...</p> : (
        <List
          height={400} // Высота видимой области списка
          itemCount={items.length}
          itemSize={35} // Высота одного элемента
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