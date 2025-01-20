import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useTable, useSortBy, usePagination, useFilters } from 'react-table';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FiltersComponent from './IncidentFiltersComponent';
import '../styles/incidentList/IncidentTable.css';

const DraggableHeader = ({ column, moveColumn, index, handleResizeStart, columnWidths, isTarget }) => {
  const ref = React.useRef(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'column',
    item: { type: 'column', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'column',
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const columnWidth = hoverBoundingRect.right - hoverBoundingRect.left;
      const hoverTriggerArea = columnWidth * 0.1;
      const mousePosition = monitor.getClientOffset();
      const hoverClientX = mousePosition.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverTriggerArea) return;
      if (dragIndex > hoverIndex && hoverClientX > columnWidth - hoverTriggerArea) return;

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const handleDrag = (e) => {
    e.stopPropagation();
  };

  drag(drop(ref));

  return (
    <th
      ref={ref}
      className={`draggable-header ${isTarget ? 'target-column' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'default',
        width: columnWidths[index] || 100,
        position: 'relative',
        border: isTarget ? '2px dashed #00f' : '',
      }}
    >
      <div className="header-wrapper" style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
        <div
          ref={drag}
          onClick={handleDrag}
          style={{
            marginRight: '8px',
            cursor: 'grab',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ⠿
        </div>

        {column.render('Header')}
        <span {...column.getSortByToggleProps()}>
          {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
        </span>

        <div
          className="resize-handle"
          onMouseDown={(e) => handleResizeStart(index, e)}
          style={{
            position: 'absolute',
            right: '-4px',
            top: 0,
            width: '8px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 10,
            backgroundColor: 'transparent',
          }}
        />
      </div>
    </th>
  );
};

const IncidentsTable = ({ onIncidentClick, onCreateIncidentClick, isSidebarCollapsed, userId }) => {
  const [incidents, setIncidents] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleFields, setVisibleFields] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [targetIndex, setTargetIndex] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterOperators, setFilterOperators] = useState({});

  const resizingColumnRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    if (userId) {
      fetchFields(); // Выполняется только при первом монтировании
      fetchIncidents(); // Выполняется только один раз при загрузке
    }
  }, [userId]); // Зависимость только от userId

  useEffect(() => {
    if (userId) {
      const intervalId = setInterval(() => fetchIncidents(searchQuery), 5000);
      return () => clearInterval(intervalId); // Очистка интервала при изменении зависимостей
    }
  }, [searchQuery, filterValues, userId]); // Оставляем только интервал
  

  const fetchFields = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/fields');
      const data = await response.json();
      if (fields.length === 0) {
        const processedFields = data.map((field, index) => ({
          name: field.name,
          field_type: field.field_type, // Если нужно, добавьте дополнительные поля
        }));
        setFields(processedFields);
        setVisibleFields(processedFields);
      }
    } catch (error) {
      console.error('Ошибка при получении полей:', error);
    }
  };
  
  

  const fetchIncidents = async (query = '') => {
    try {
      const filterQuery = Object.entries(filterValues)
        .filter(([key, value]) => value)
        .map(([key, value]) => {
          const operator = filterOperators[key] || 'eq';
          return `${key}__${operator}=${value}`;
        })
        .join('&');

      const url = query || filterQuery
        ? `http://127.0.0.1:5000/api/search-incidents?${query ? `query=${query}&` : ''}${filterQuery}`
        : 'http://127.0.0.1:5000/api/incidents';
      const response = await fetch(url);
      const data = await response.json();
      setIncidents(data.incidents);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  const handleResizeStart = (index, e) => {
    e.preventDefault();
    resizingColumnRef.current = index;
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[index] || 100;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (resizingColumnRef.current === null) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;

    if (newWidth >= 100) {
      setColumnWidths((prevWidths) => ({
        ...prevWidths,
        [resizingColumnRef.current]: newWidth,
      }));
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    resizingColumnRef.current = null;
  };

  const moveColumn = useCallback((dragIndex, hoverIndex) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, movedField);
    setFields(newFields);
    setTargetIndex(hoverIndex);
  }, [fields]);

  const columns = useMemo(() => 
    fields.map((field, index) => ({
      Header: field.name, // Используем поле name для заголовка
      accessor: field.name, // Генерируем уникальный accessor для каждой колонки
      Filter: TextFilter,
      isTarget: targetIndex === index,
      filterValue: filterValues[field.name] || '', // Привязываем фильтр к name
      setFilter: (value) =>
        setFilterValues((prev) => ({ ...prev, [field.name]: value })),
    }))
  , [fields, targetIndex, filterValues]);
  
  

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: userId ? incidents : [],
      initialState: { pageSize: 10 },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  if (!userId) {
    return <p>Загрузка данных пользователя...</p>;
  }

  return (
    <div className={`table-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <FiltersComponent
        fields={fields}
        setFilterValues={setFilterValues}
        setSavedFilters={setSavedFilters}
        filterValues={filterValues}
        filterOperators={filterOperators}
        setFilterOperators={setFilterOperators}
        userId={userId}
      />

      <div className="table-wrapper custom-scrollbar">
        <DndProvider backend={HTML5Backend}>
          <table {...getTableProps()} className="UserTableClass">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column, index) => (
                    <DraggableHeader
                      key={column.id}
                      column={column}
                      index={index}
                      moveColumn={moveColumn}
                      handleResizeStart={handleResizeStart}
                      columnWidths={columnWidths}
                      isTarget={column.isTarget}
                    />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => onIncidentClick(row.original.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: row.isSelected ? '#333333' : 'transparent',
                    }}
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        {...cell.getCellProps()}
                        className={targetIndex === cellIndex ? 'target-column-highlight' : ''}
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DndProvider>
      </div>

      <div className="pagination">
        <button onClick={previousPage} disabled={!canPreviousPage}>
          {'<'}
        </button>
        <button onClick={nextPage} disabled={!canNextPage}>
          {'>'}
        </button>
        <select
          value={state.pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Показать {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Пример фильтрации текста
function TextFilter({
  column: { filterValue, setFilter },
}) {
  return (
    <input
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder="Фильтр..."
    />
  );
}

export default IncidentsTable;
