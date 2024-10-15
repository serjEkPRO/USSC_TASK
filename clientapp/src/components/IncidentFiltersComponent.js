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
  const filterButtonRef = useRef(null); // Ссылка на кнопку

  const handleOpenFilterSettings = (attribute, event) => {
    setActiveFilter(attribute);
    const buttonRect = event.target.getBoundingClientRect(); // Получаем координаты кнопки
    const panel = document.querySelector('.filter-operator-panel');
    
    if (panel) {
      panel.style.top = `${buttonRect.bottom}px`; // Расположим под кнопкой
      panel.style.left = `${buttonRect.left}px`; // Совместим по левому краю
    }
    setIsFilterSettingsOpen(true);
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
              <button className="filter-attribute" ref={filterButtonRef} onClick={(e) => handleOpenFilterSettings(attribute, e)}>
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
            {activeFilter === attribute && isFilterSettingsOpen && (
              <div className="filter-operator-panel">
                <div className="filter-operator-settings">
                  <div className="filter-operator-options">
                    <div style={{ display: 'flex', alignItems: 'left' }}>
                      <label>
                        <input
                          type="radio"
                          name={`operator-${attribute}`}
                          value="eq"
                          checked={filterOperators[attribute] === 'eq'}
                          onChange={() => handleOperatorChange(attribute, 'eq')}
                        />
                        Равно
                      </label>
                      {filterOperators[attribute] === 'eq' && (
                        <label className="negation-checkbox" style={{ marginLeft: '10px' }}>
                          <input
                            type="checkbox"
                            checked={negations[attribute] || false}
                            onChange={() => handleNegationToggle(attribute)}
                          />
                          Отрицание
                        </label>
                      )}
                    </div>

                    <div className={`filter-text-input ${filterOperators[attribute] === 'eq' ? 'visible' : ''}`}>
                      <input
                        type="text"
                        className="custom-text-filter-input"
                        value={filterTexts[attribute] || ''}
                        onChange={(e) => handleFilterTextChange(attribute, e.target.value)}
                        placeholder="Введите значение для фильтрации"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label>
                        <input
                          type="radio"
                          name={`operator-${attribute}`}
                          value="contains"
                          checked={filterOperators[attribute] === 'contains'}
                          onChange={() => handleOperatorChange(attribute, 'contains')}
                        />
                        Содержит
                      </label>
                      {filterOperators[attribute] === 'contains' && (
                        <label className="negation-checkbox" style={{ marginLeft: '10px' }}>
                          <input
                            type="checkbox"
                            checked={negations[attribute] || false}
                            onChange={() => handleNegationToggle(attribute)}
                          />
                          Отрицание
                        </label>
                      )}
                    </div>

                    <div className={`filter-text-input ${filterOperators[attribute] === 'contains' ? 'visible' : ''}`}>
                      <input
                        type="text"
                        className="custom-text-filter-input"
                        value={filterTexts[attribute] || ''}
                        onChange={(e) => handleFilterTextChange(attribute, e.target.value)}
                        placeholder="Введите значение для фильтрации"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label>
                        <input
                          type="radio"
                          name={`operator-${attribute}`}
                          value="startswith"
                          checked={filterOperators[attribute] === 'startswith'}
                          onChange={() => handleOperatorChange(attribute, 'startswith')}
                        />
                        Начинается с
                      </label>
                      {filterOperators[attribute] === 'startswith' && (
                        <label className="negation-checkbox" style={{ marginLeft: '10px' }}>
                          <input
                            type="checkbox"
                            checked={negations[attribute] || false}
                            onChange={() => handleNegationToggle(attribute)}
                          />
                          Отрицание
                        </label>
                      )}
                    </div>

                    <div className={`filter-text-input ${filterOperators[attribute] === 'startswith' ? 'visible' : ''}`}>
                      <input
                        type="text"
                        className="custom-text-filter-input"
                        value={filterTexts[attribute] || ''}
                        onChange={(e) => handleFilterTextChange(attribute, e.target.value)}
                        placeholder="Введите значение для фильтрации"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label>
                        <input
                          type="radio"
                          name={`operator-${attribute}`}
                          value="endswith"
                          checked={filterOperators[attribute] === 'endswith'}
                          onChange={() => handleOperatorChange(attribute, 'endswith')}
                        />
                        Заканчивается на
                      </label>
                      {filterOperators[attribute] === 'endswith' && (
                        <label className="negation-checkbox" style={{ marginLeft: '10px' }}>
                          <input
                            type="checkbox"
                            checked={negations[attribute] || false}
                            onChange={() => handleNegationToggle(attribute)}
                          />
                          Отрицание
                        </label>
                      )}
                    </div>

                    <div className={`filter-text-input ${filterOperators[attribute] === 'endswith' ? 'visible' : ''}`}>
                      <input
                        type="text"
                        className="custom-text-filter-input"
                        value={filterTexts[attribute] || ''}
                        onChange={(e) => handleFilterTextChange(attribute, e.target.value)}
                        placeholder="Введите значение для фильтрации"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label>
                        <input
                          type="radio"
                          name={`operator-${attribute}`}
                          value="isnull"
                          checked={filterOperators[attribute] === 'isnull'}
                          onChange={() => handleOperatorChange(attribute, 'isnull')}
                        />
                        Пусто
                      </label>
                      {filterOperators[attribute] === 'isnull' && (
                        <label className="negation-checkbox" style={{ marginLeft: '10px' }}>
                          <input
                            type="checkbox"
                            checked={negations[attribute] || false}
                            onChange={() => handleNegationToggle(attribute)}
                          />
                          Отрицание
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="filter-operator-actions">
                    <button onClick={handleSaveFilter}>Сохранить</button>
                    <button onClick={() => setIsFilterSettingsOpen(false)}>Закрыть</button>
                  </div>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default IncidentFiltersComponent;
