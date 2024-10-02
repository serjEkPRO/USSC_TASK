import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTable, useSortBy, usePagination, useFilters } from 'react-table';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../styles/UsersTable.css';

// Компонент для сортировки столбцов через DnD и изменения их ширины
const DraggableHeader = ({ column, moveColumn, index, handleResizeStart, columnWidths, isTarget }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: 'column',
    hover(item, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const mousePosition = monitor.getClientOffset();
      const hoverClientX = mousePosition.x - hoverBoundingRect.left;

      // Перемещаем столбец только если мышь пересекла середину целевого столбца
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: { type: 'column', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <th
      ref={ref}
      className={`draggable-header ${isTarget ? 'target-column' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        width: columnWidths[index] || 100,
        position: 'relative',
        border: isTarget ? '2px dashed #00f' : '', // Подсветка будущего места
      }}
    >
      {column.render('Header')}
      <span {...column.getSortByToggleProps()}>
        {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
      </span>
      <div
        className="resize-handle"
        onMouseDown={(e) => handleResizeStart(index, e)}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '5px',
          height: '100%',
          cursor: 'col-resize',
        }}
      />
    </th>
  );
};

const IncidentsTable = ({ onIncidentClick, onCreateIncidentClick, isSidebarCollapsed }) => {
  const [incidents, setIncidents] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleFields, setVisibleFields] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [targetIndex, setTargetIndex] = useState(null); // Для отслеживания целевого индекса при перетаскивании

  const resizingColumnRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    fetchFields();
    fetchIncidents();
    const intervalId = setInterval(() => fetchIncidents(searchQuery), 5000);
    return () => clearInterval(intervalId);
  }, [searchQuery]);

  const fetchFields = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/fields');
      const data = await response.json();
      if (fields.length === 0) {
        setFields(data);
        setVisibleFields(data); // Изначально показываем все поля
      }
    } catch (error) {
      console.error('Ошибка при получении полей:', error);
    }
  };

  const fetchIncidents = async (query = '') => {
    try {
      const url = query
        ? `http://127.0.0.1:5000/api/search-incidents?query=${query}`
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

    if (newWidth >= 50) {
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
    setTargetIndex(hoverIndex); // Устанавливаем индекс целевого столбца
  }, [fields]);

  // Используем useMemo для предотвращения лишних рендеров столбцов
  const columns = useMemo(() => fields.map((field, index) => ({
    Header: field,
    accessor: field,
    Filter: TextFilter,
    isTarget: targetIndex === index, // Проверяем, является ли столбец целевым
  })), [fields, targetIndex]);

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
      data: incidents,
      initialState: { pageSize: 10 }, // Количество строк на странице
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <div className={`table-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="action-bar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button" onClick={() => fetchIncidents(searchQuery)}>
            Поиск
          </button>
        </div>
        <button className="action-button" onClick={onCreateIncidentClick}>
          Создать инцидент
        </button>
      </div>
      <DndProvider backend={HTML5Backend}>
        <div className="table-wrapper">
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
                      isTarget={column.isTarget} // Подсвечиваем целевой столбец
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
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
      </DndProvider>
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
