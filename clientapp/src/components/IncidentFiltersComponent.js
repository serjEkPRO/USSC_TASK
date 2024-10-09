import React, { useState, useRef } from 'react';
import '../styles/incidentList/IncidentFilters.css';

const IncidentFiltersComponent = ({ fields, setFilterValues, setSavedFilters, filterValues, filterOperators, setFilterOperators }) => {
  const [isAddFilterPanelOpen, setIsAddFilterPanelOpen] = useState(false);
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterTexts, setFilterTexts] = useState({});
  const [logicalOperators, setLogicalOperators] = useState([]);
  const [negations, setNegations] = useState({});
  const filterPanelRef = useRef(null);
  const [filterSettingsPosition, setFilterSettingsPosition] = useState({ top: 0, left: 0 });

  const handleOpenFilterSettings = (attribute, event) => {
    setActiveFilter(attribute);
    if (event && event.target) {
      const buttonRect = event.target.getBoundingClientRect();
      setFilterSettingsPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
      setIsFilterSettingsOpen(true);
    }
  };

  const handleSaveFilter = () => {
    setActiveFilter(null);
    setIsFilterSettingsOpen(false);
  };

  const handleAddAttribute = (attribute) => {
    if (!selectedAttributes.includes(attribute)) {
      setSelectedAttributes((prev) => [...prev, attribute]);
      setFilterOperators((prev) => ({ ...prev, [attribute]: 'eq' }));
      setFilterTexts((prev) => ({ ...prev, [attribute]: '' }));
      setNegations((prev) => ({ ...prev, [attribute]: false }));
      setLogicalOperators((prev) => [...prev, 'AND']);
    }
  };

  const handleRemoveAttribute = (attribute, index) => {
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
    setNegations((prev) => {
      const updatedNegations = { ...prev };
      delete updatedNegations[attribute];
      return updatedNegations;
    });
    setLogicalOperators((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOperatorChange = (attribute, operator) => {
    setFilterOperators((prev) => ({ ...prev, [attribute]: operator }));
  };

  const handleNegationToggle = (attribute) => {
    setNegations((prev) => ({ ...prev, [attribute]: !prev[attribute] }));
  };

  const handleFilterTextChange = (attribute, value) => {
    setFilterTexts((prev) => ({ ...prev, [attribute]: value }));
    setFilterValues((prev) => ({ ...prev, [attribute]: value }));
  };

  const handleLogicalOperatorChange = (index, value) => {
    setLogicalOperators((prev) => prev.map((op, i) => (i === index ? value : op)));
  };

  const toggleAddFilterPanel = () => {
    setIsAddFilterPanelOpen(!isAddFilterPanelOpen);
  };

  return (
    <div className="filter-settings">
      <div className="filter-settings-content">
        <button className="add-filter-button" onClick={toggleAddFilterPanel}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-filter">
            <polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"></polygon>
          </svg>
        </button>
        {selectedAttributes.map((attribute, index) => (
          <div key={attribute} className="filter-attribute-container">
            <div className="filter-item-group">
              <button className="filter-attribute" onClick={(e) => handleOpenFilterSettings(attribute, e)}>
                {attribute} {negations[attribute] ? '!' : ''} {filterOperators[attribute]} {filterTexts[attribute] || 'не задано'}
                <button className="remove-filter-button" onClick={() => handleRemoveAttribute(attribute, index)}>X</button>
              </button>
              {index < selectedAttributes.length - 1 && (
                <select
                  className="logical-operator-select custom-select"
                  value={logicalOperators[index]}
                  onChange={(e) => handleLogicalOperatorChange(index, e.target.value)}
                >
                  <option value="AND">И</option>
                  <option value="OR">ИЛИ</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={filterPanelRef} className={`filter-panel ${isAddFilterPanelOpen ? 'open' : ''}`}>
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

      {activeFilter && isFilterSettingsOpen && (
        <div className="filter-operator-panel" style={{ top: `${filterSettingsPosition.top}px`, left: `${filterSettingsPosition.left}px` }}>
          <div className="filter-operator-settings">
            {/* <h4>Настройка фильтра для {activeFilter}</h4> */}
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
              
            </div>



            {filterOperators[activeFilter] !== 'isnull' && filterOperators[activeFilter] !== 'isnotnull' && (
              <input
                type="text"
                value={filterTexts[activeFilter] || ''}
                onChange={(e) => handleFilterTextChange(activeFilter, e.target.value)}
                placeholder="Введите значение для фильтрации"
              />
            )}
                        {/* Отрицание */}
                        <label>
              <input
                type="checkbox"
                checked={negations[activeFilter] || false}
                onChange={() => handleNegationToggle(activeFilter)}
              />
              Отрицание
            </label>

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
