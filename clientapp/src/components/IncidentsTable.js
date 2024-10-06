import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTable, useSortBy, usePagination, useFilters } from 'react-table';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../styles/UsersTable.css';

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

const IncidentsTable = ({ onIncidentClick, onCreateIncidentClick, isSidebarCollapsed }) => {
  const [incidents, setIncidents] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleFields, setVisibleFields] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [targetIndex, setTargetIndex] = useState(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [savedFilters, setSavedFilters] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterOperators, setFilterOperators] = useState({});
  const [filterTexts, setFilterTexts] = useState({});
  const filterButtonRef = useRef(null); // Ссылка на кнопку фильтра
  const [filterPanelPosition, setFilterPanelPosition] = useState({ top: 0, left: 0 });

  const resizingColumnRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    fetchFields();
    fetchIncidents();
    const intervalId = setInterval(() => fetchIncidents(searchQuery), 5000);
    return () => clearInterval(intervalId);
  }, [searchQuery, filterValues]);

  const handleOpenFilterSettings = (attribute, event) => {
    setActiveFilter(attribute);
    if (event && event.target) {
      const buttonRect = event.target.getBoundingClientRect();
      setFilterPanelPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/fields');
      const data = await response.json();
      if (fields.length === 0) {
        setFields(data);
        setVisibleFields(data);
      }
    } catch (error) {
      console.error('Ошибка при получении полей:', error);
    }
  };

  const fetchIncidents = async (query = '') => {
    try {
      let filterQuery = Object.entries(filterValues)
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

  const handleSaveFilter = () => {
    const newFilters = Object.entries(filterValues)
      .filter(([key, value]) => value)
      .map(([key, value]) => ({ column: key, operator: filterOperators[key] || 'eq', value }));

    setSavedFilters([...savedFilters, ...newFilters]);
    setFilterValues({});
    setFilterOperators({});
    setIsFilterPanelOpen(false);
  };

  const handleAddAttribute = (attribute) => {
    if (!selectedAttributes.includes(attribute)) {
      setSelectedAttributes((prev) => [...prev, attribute]);
    }
  };

  const handleRemoveAttribute = (attribute) => {
    setSelectedAttributes((prev) => prev.filter((attr) => attr !== attribute));
  };



  const handleOperatorChange = (attribute, operator) => {
    setFilterOperators((prev) => ({ ...prev, [attribute]: operator }));
  };

  const handleFilterTextChange = (attribute, value) => {
    setFilterTexts((prev) => ({ ...prev, [attribute]: value }));
    setFilterValues((prev) => ({ ...prev, [attribute]: value }));
  };

  const columns = useMemo(() => fields.map((field, index) => ({
    Header: field,
    accessor: field,
    Filter: TextFilter,
    isTarget: targetIndex === index,
    filterValue: filterValues[field] || '',
    setFilter: (value) => setFilterValues((prev) => ({ ...prev, [field]: value })),
  })), [fields, targetIndex, filterValues]);

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
      initialState: { pageSize: 10 },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <div className={`table-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="filter-settings">
        <div className="filter-settings-content">
          {selectedAttributes.length === 0 ? (
            <span>Настройка фильтров</span>
          ) : (
            selectedAttributes.map((attribute) => (
              <button
                key={attribute}
                className="filter-attribute"
                onClick={(e) => handleOpenFilterSettings(attribute, e)}
                ref={attribute === activeFilter ? filterButtonRef : null} // Сохраняем ссылку на активную кнопку
              >
                Настроить фильтр для {attribute}
                <button onClick={(e) => { e.stopPropagation(); handleRemoveAttribute(attribute); }}>x</button>
              </button>
            ))
          )}
          <button className="add-filter-button" onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}>
            +
          </button>
        </div>
        {isFilterPanelOpen && (
          <div className="filter-panel" style={{ position: 'absolute', top: '100%', left: '0', zIndex: 2 }}>
            {fields.map((field) => (
              <div key={field} className="filter-field">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAttributes.includes(field)}
                    onChange={() =>
                      selectedAttributes.includes(field)
                        ? handleRemoveAttribute(field)
                        : handleAddAttribute(field)
                    }
                  />
                  {field}
                </label>
              </div>
            ))}
            <div className="filter-panel-actions">
              <button onClick={handleSaveFilter}>Сохранить</button>
              <button onClick={() => setIsFilterPanelOpen(false)}>Отменить</button>
            </div>
          </div>
        )}
      </div>

      {activeFilter && (
        <div
          className="filter-operator-panel"
          style={{
            position: 'absolute',
            top: `${filterPanelPosition.top}px`,
            left: `${filterPanelPosition.left}px`,
            zIndex: 5,
            transform: 'translateY(-10px)', // чтобы отображать панель оператора выше кнопки
            transition: 'all 0.3s ease', // добавляем анимацию для плавного появления
          }}
        >
    <div className="filter-operator-settings">
      <h4>Настройка фильтра для {activeFilter}</h4>
            <div className="filter-operator-options">
              <label>
                <input
                  type="radio"
                  name="operator"
                  value="contains"
                  checked={filterOperators[activeFilter] === 'contains'}
                  onChange={() => handleOperatorChange(activeFilter, 'contains')}
                />
                Содержит
              </label>
              <label>
                <input
                  type="radio"
                  name="operator"
                  value="eq"
                  checked={filterOperators[activeFilter] === 'eq'}
                  onChange={() => handleOperatorChange(activeFilter, 'eq')}
                />
                Равно
              </label>
              <label>
                <input
                  type="radio"
                  name="operator"
                  value="startswith"
                  checked={filterOperators[activeFilter] === 'startswith'}
                  onChange={() => handleOperatorChange(activeFilter, 'startswith')}
                />
                Начинается с
              </label>
              <label>
                <input
                  type="radio"
                  name="operator"
                  value="endswith"
                  checked={filterOperators[activeFilter] === 'endswith'}
                  onChange={() => handleOperatorChange(activeFilter, 'endswith')}
                />
                Заканчивается на
              </label>
              <label>
                <input
                  type="radio"
                  name="operator"
                  value="isnull"
                  checked={filterOperators[activeFilter] === 'isnull'}
                  onChange={() => handleOperatorChange(activeFilter, 'isnull')}
                />
                Пусто
              </label>
              <label>
                <input
                  type="radio"
                  name="operator"
                  value="isnotnull"
                  checked={filterOperators[activeFilter] === 'isnotnull'}
                  onChange={() => handleOperatorChange(activeFilter, 'isnotnull')}
                />
                Не пусто
              </label>
              </div>
      {filterOperators[activeFilter] !== 'isnull' && filterOperators[activeFilter] !== 'isnotnull' && (
        <input
          type="text"
          value={filterTexts[activeFilter] || ''}
          onChange={(e) => handleFilterTextChange(activeFilter, e.target.value)}
          placeholder="Введите значение для фильтрации"
        />
      )}
      <div className="filter-operator-actions">
        <button onClick={handleSaveFilter}>Сохранить</button>
        <button onClick={() => setActiveFilter(null)}>Закрыть</button>
      </div>
    </div>
  </div>
)}
        

      <div className="table-wrapper" style={{
  transform: isFilterPanelOpen || activeFilter ? 'translateY(100px)' : 'translateY(0)',
  transition: 'transform 0.3s ease'
}}>
  <table {...getTableProps()} className="UserTableClass">
    {/* таблица без изменений */}
  </table>
</div>

      <div className="saved-filters">
        {savedFilters.map((filter, index) => (
          <div key={index} className="saved-filter">
            {filter.column} {filter.operator} {filter.value}
          </div>
        ))}
      </div>

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
