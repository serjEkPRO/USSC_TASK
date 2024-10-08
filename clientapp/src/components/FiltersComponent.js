import React, { useState, useRef } from 'react';
//import '../styles/Filters.css';

const FiltersComponent = ({ fields, setFilterValues, setSavedFilters, filterValues, filterOperators, setFilterOperators }) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterTexts, setFilterTexts] = useState({});
  const filterPanelRef = useRef(null);
  const [filterPanelPosition, setFilterPanelPosition] = useState({ top: 0, left: 0 });

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

  const handleSaveFilter = () => {
    setActiveFilter(null);
    setIsFilterPanelOpen(false);
  };

  const handleAddAttribute = (attribute) => {
    if (!selectedAttributes.includes(attribute)) {
      setSelectedAttributes((prev) => [...prev, attribute]);
      setFilterOperators((prev) => ({ ...prev, [attribute]: 'eq' }));
      setFilterTexts((prev) => ({ ...prev, [attribute]: '' }));
    }
  };

  const handleRemoveAttribute = (attribute) => {
    setSelectedAttributes((prev) => prev.filter((attr) => attr !== attribute));
    setFilterOperators((prev) => {
      const updatedOperators = { ...prev };
      delete updatedOperators[attribute];
      return updatedOperators;
    });
    setFilterTexts((prev) => {
      const updatedTexts = { ...prev };
      delete updatedTexts[attribute];
      return updatedTexts;
    });
  };

  const handleOperatorChange = (attribute, operator) => {
    setFilterOperators((prev) => ({ ...prev, [attribute]: operator }));
  };

  const handleFilterTextChange = (attribute, value) => {
    setFilterTexts((prev) => ({ ...prev, [attribute]: value }));
    setFilterValues((prev) => ({ ...prev, [attribute]: value }));
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  return (
    <div className="filter-settings">
      <div className="filter-settings-content">
        {selectedAttributes.map((attribute) => (
          <div key={attribute} className="filter-attribute-container">
            <button
              className="filter-attribute"
              onClick={(e) => handleOpenFilterSettings(attribute, e)}
            >
              {attribute} {filterOperators[attribute] ? `${filterOperators[attribute]} ${filterTexts[attribute] || 'не задано'}` : 'Значение не задано'}
            </button>
            <button
              className="remove-filter-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveAttribute(attribute);
              }}
            >
              x
            </button>
          </div>
        ))}
        <button
          className="add-filter-button"
          onClick={toggleFilterPanel}
        >
          +
        </button>
      </div>
      <div ref={filterPanelRef} className={`filter-panel ${isFilterPanelOpen ? 'open' : ''}`} style={{ top: `${filterPanelPosition.top}px`, left: `${filterPanelPosition.left}px` }}>
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
          <button onClick={() => setIsFilterPanelOpen(false)}>Закрыть</button>
        </div>
      </div>
      {activeFilter && (
        <div className="filter-operator-panel" style={{ top: `${filterPanelPosition.top}px`, left: `${filterPanelPosition.left}px` }}>
          <div className="filter-operator-settings">
            <h4>Настройка фильтра для {activeFilter}</h4>
            <div className="filter-operator-options">
              <label>
                <input
                  type="radio"
                  name={`operator-${activeFilter}`}
                  value="contains"
                  checked={filterOperators[activeFilter] === 'contains'}
                  onChange={() => handleOperatorChange(activeFilter, 'contains')}
                />
                Содержит
              </label>
              <label>
                <input
                  type="radio"
                  name={`operator-${activeFilter}`}
                  value="eq"
                  checked={filterOperators[activeFilter] === 'eq'}
                  onChange={() => handleOperatorChange(activeFilter, 'eq')}
                />
                Равно
              </label>
              <label>
                <input
                  type="radio"
                  name={`operator-${activeFilter}`}
                  value="startswith"
                  checked={filterOperators[activeFilter] === 'startswith'}
                  onChange={() => handleOperatorChange(activeFilter, 'startswith')}
                />
                Начинается с
              </label>
              <label>
                <input
                  type="radio"
                  name={`operator-${activeFilter}`}
                  value="endswith"
                  checked={filterOperators[activeFilter] === 'endswith'}
                  onChange={() => handleOperatorChange(activeFilter, 'endswith')}
                />
                Заканчивается на
              </label>
              <label>
                <input
                  type="radio"
                  name={`operator-${activeFilter}`}
                  value="isnull"
                  checked={filterOperators[activeFilter] === 'isnull'}
                  onChange={() => handleOperatorChange(activeFilter, 'isnull')}
                />
                Пусто
              </label>
              <label>
                <input
                  type="radio"
                  name={`operator-${activeFilter}`}
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
    </div>
  );
};

export default FiltersComponent;