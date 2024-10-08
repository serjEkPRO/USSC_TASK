import React, { useState, useRef } from 'react';
import '../styles/incidentList/IncidentFilters.css';

const IncidentFiltersComponent = ({ fields, setFilterValues, setSavedFilters, filterValues, filterOperators, setFilterOperators }) => {
  const [isAddFilterPanelOpen, setIsAddFilterPanelOpen] = useState(false); // Отдельное состояние для панели добавления фильтра
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false); // Отдельное состояние для панели настроек фильтра
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterTexts, setFilterTexts] = useState({});
  const filterPanelRef = useRef(null);
  const [filterSettingsPosition, setFilterSettingsPosition] = useState({ top: 0, left: 0 }); // Отдельное состояние для позиции панели настроек фильтра

  const handleOpenFilterSettings = (attribute, event) => {
    setActiveFilter(attribute);
    if (event && event.target) {
      const buttonRect = event.target.getBoundingClientRect();
      setFilterSettingsPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
      setIsFilterSettingsOpen(true); // Открываем панель настроек фильтра
    }
  };

  const handleSaveFilter = () => {
    setActiveFilter(null);
    setIsFilterSettingsOpen(false); // Закрываем панель настроек фильтра
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

  const toggleAddFilterPanel = () => {
    setIsAddFilterPanelOpen(!isAddFilterPanelOpen);
  };

  return (
    <div className="filter-settings">
      <div className="filter-settings-content">
        <button
          className="add-filter-button"
          onClick={toggleAddFilterPanel}
        >
          +
        </button>
        {selectedAttributes.map((attribute) => (
          <div key={attribute} className="filter-attribute-container">
            <button
              className="filter-attribute"
              onClick={(e) => handleOpenFilterSettings(attribute, e)}
            >
              {attribute} {filterOperators[attribute] ? `${filterOperators[attribute]} ${filterTexts[attribute] || 'не задано'}` : 'Значение не задано'}
            </button>
          </div>
        ))}
      </div>
      
      {/* Панель добавления фильтра */}
      <div ref={filterPanelRef} className={`filter-panel ${isAddFilterPanelOpen ? 'open' : ''}`}> {/* Фиксированная позиция панели добавления фильтра */}
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
          <button onClick={() => setIsAddFilterPanelOpen(false)}>Закрыть</button>
        </div>
      </div>

      {/* Панель настроек фильтра */}
      {activeFilter && isFilterSettingsOpen && (
        <div className="filter-operator-panel" style={{ top: `${filterSettingsPosition.top}px`, left: `${filterSettingsPosition.left}px` }}>
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
              <button onClick={() => setIsFilterSettingsOpen(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentFiltersComponent;
