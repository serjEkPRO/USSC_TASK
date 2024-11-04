import React, { useState, useRef, useEffect } from 'react';
import '../styles/incidentList/IncidentFilters.scss';

const IncidentFiltersComponent = ({ fields, setFilterValues, setSavedFilters, filterValues, filterOperators = {}, setFilterOperators, userId }) => {
  const [isSavedFiltersPanelOpen, setIsSavedFiltersPanelOpen] = useState(false); // Управление панелью сохранённых фильтров
  const [isAddFilterPanelOpen, setIsAddFilterPanelOpen] = useState(false);
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterTexts, setFilterTexts] = useState({});
  const [logicalOperators, setLogicalOperators] = useState([]);
  const [negations, setNegations] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFilterName, setModalFilterName] = useState("");
  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState(''); // состояние для поиска
  const [savedFiltersData, setSavedFiltersData] = useState([]);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedFilterId, setSelectedFilterId] = useState(null);
  const contextMenuRef = useRef(null);
  const [activeAttribute, setActiveAttribute] = useState(null); // Новый state для управления активным атрибутом
  const filterOperatorPanelRef = useRef(null); // Добавьте ref для панели настроек
  const [isEditingFilter, setIsEditingFilter] = useState(false);

  const handleAddFilterClick = () => {
    setIsAddFilterPanelOpen((prev) => !prev);  // Переключаем состояние панели фильтрации
  };
  

// Добавляем эффект для закрытия панели при клике вне её области
useEffect(() => {
  const handleClickOutside = (event) => {
    // Закрываем панель добавления фильтра, если клик произошел вне её области
    if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
      setIsAddFilterPanelOpen(false);
    }

    // Закрываем панель настроек фильтра, если клик произошел вне её области
    if (filterOperatorPanelRef.current && !filterOperatorPanelRef.current.contains(event.target)) {
      setIsFilterSettingsOpen(false);
      setActiveAttribute(null); // Сбрасываем активный атрибут
    }
  };

  // Добавляем слушатель событий для любого клика мыши
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    // Удаляем слушатель событий при размонтировании компонента
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []); // Убираем все зависимости, чтобы этот эффект выполнялся всегда



const toggleAddFilterPanel = (event) => {
  if (event && event.target.classList.contains('edit-filter-icon')) {
    // Если клик был на иконке редактирования, не открываем панель фильтрации
    return;
  }
  setIsAddFilterPanelOpen((prev) => !prev);
};
    // Загрузка фильтров из sessionStorage при инициализации
    useEffect(() => {
      const savedFilters = JSON.parse(sessionStorage.getItem(`user_filters_${userId}`));
      if (savedFilters) {
          setFilterValues(savedFilters.filterValues || {});
          setFilterOperators(savedFilters.filterOperators || {});
          setNegations(savedFilters.negations || {});
          setSelectedAttributes(savedFilters.selectedAttributes || []);
          setLogicalOperators(savedFilters.logicalOperators || []);
          setFilterTexts(savedFilters.filterTexts || {}); // Загрузка текста фильтров
      }
  }, [userId]);



  // Сохранение фильтров в sessionStorage при каждом изменении
  useEffect(() => {
    sessionStorage.setItem(
        `user_filters_${userId}`,
        JSON.stringify({
            filterValues,
            filterOperators,
            negations,
            selectedAttributes,
            logicalOperators,
            filterTexts // Сохранение текста фильтров
        })
    );
}, [filterValues, filterOperators, negations, selectedAttributes, logicalOperators, filterTexts, userId]);

const handleContextMenu = (event, filterId) => {
  event.preventDefault();
  console.log("ID выбранного фильтра при правом клике:", filterId); // Отладка
  setSelectedFilterId(filterId);
  setMenuPosition({ x: event.clientX, y: event.clientY });
  setContextMenuVisible(true);
};


useEffect(() => {
  const handleClickOutside = (event) => {
    if (contextMenuVisible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
      setContextMenuVisible(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [contextMenuVisible]);


  // Перенос функции fetchSavedFilters
  const fetchSavedFilters = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/filters?user_id=${userId}`);
      if (response.ok) {
        const filters = await response.json();
        console.log("Полученные фильтры с сервера:", filters); // Проверка данных
        setSavedFiltersData(filters); // Убедитесь, что каждый объект содержит "id"
      } else {
        console.error("Ошибка при получении фильтров:", response.statusText);
      }
    } catch (error) {
      console.error("Ошибка при получении фильтров:", error);
    }
  };

// Вызываем fetchSavedFilters в useEffect только при монтировании компонента
useEffect(() => {
  fetchSavedFilters();
}, [userId]);

// Обновляем toggleSavedFiltersPanel, чтобы обновлять список при открытии панели
const toggleSavedFiltersPanel = () => {
  if (!isSavedFiltersPanelOpen) {
    fetchSavedFilters(); // Загружаем сохраненные фильтры перед открытием панели
  }
  setIsSavedFiltersPanelOpen((prev) => !prev);
};



const handleAddAttribute = (attribute) => {
  if (!selectedAttributes.includes(attribute)) {
    // Сброс активного фильтра при выборе нового поля
    setActiveFilter(null);

    // Очищаем значения фильтров
    setFilterValues({});
    setFilterOperators({});
    setNegations({});
    setLogicalOperators([]);
    setFilterTexts({});


 setSelectedAttributes((prev) => [...prev, attribute]);
 setFilterOperators((prev) => ({ ...prev, [attribute]: 'eq' }));
 setFilterTexts((prev) => ({ ...prev, [attribute]: '' }));
 setNegations((prev) => ({ ...prev, [attribute]: false }));
 setLogicalOperators((prev) => [...prev, 'AND']);
  }
};



  
const applySavedFilter = (filter) => {
  setFilterValues(filter.filterValues || {});
  setFilterOperators(filter.filterOperators || {});
  setNegations(filter.negations || {});
  setSelectedAttributes(filter.selectedAttributes || []);
  setLogicalOperators(filter.logicalOperators || []);
  setFilterTexts(filter.filterTexts || {});

  // Устанавливаем activeFilter и selectedFilterId для выбранного фильтра
  setActiveFilter(filter.filter_name);
  setSelectedFilterId(filter.id); // добавляем установку selectedFilterId
};



  
const handleEditFilterClick = async (event, filterId) => {
  // Проверяем, является ли event событием, и вызываем stopPropagation только если это так
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }

  setIsEditingFilter((prev) => !prev);

  if (isEditingFilter) {
    // Если режим редактирования активен, скрываем только выбранные атрибуты фильтра
    setSelectedAttributes([]);  // Очищаем только выбранные атрибуты, не трогая другие состояния
    setIsEditingFilter(false);  // Выключаем режим редактирования
    return;
  } else {
    // Если режим редактирования не активен, начинаем редактирование
    setIsEditingFilter(true);
    setIsAddFilterPanelOpen(false); // Устанавливаем панель закрытой, чтобы избежать её открытия

    try {
      const response = await fetch(`http://localhost:5000/api/filters/${filterId}`);
      if (response.ok) {
        const filter = await response.json();

        // Устанавливаем название фильтра и данные для редактирования
        setActiveFilter(filter.filter_name);

        const attributes = filter.conditions.map((cond) => cond.attribute);
        const values = filter.conditions.reduce((acc, cond) => {
          acc[cond.attribute] = cond.value;
          return acc;
        }, {});
        const operators = filter.conditions.reduce((acc, cond) => {
          acc[cond.attribute] = cond.operator;
          return acc;
        }, {});
        const negations = filter.conditions.reduce((acc, cond) => {
          acc[cond.attribute] = cond.negation;
          return acc;
        }, {});
        const logicalOperators = filter.conditions.map((cond) => cond.logical_operator);

        // Устанавливаем состояния с данными фильтра
        setSelectedAttributes(attributes);
        setFilterValues(values);
        setFilterOperators(operators);
        setNegations(negations);
        setLogicalOperators(logicalOperators);
      } else {
        console.error("Ошибка при получении фильтра:", response.statusText);
      }
    } catch (error) {
      console.error("Ошибка при запросе данных фильтра:", error);
    }
  }
};









  
  const handleDeleteFilter = async (filterId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/filters/delete/${filterId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSavedFiltersData((prev) => prev.filter((filter) => filter.id !== filterId));
        alert("Фильтр успешно удалён!");
      } else {
        console.error("Ошибка при удалении фильтра:", response.statusText);
      }
    } catch (error) {
      console.error("Ошибка при удалении фильтра:", error);
    }
    setContextMenuVisible(false);
  };
  


  const handleOpenFilterSettings = (attribute, event) => {
    if (activeAttribute === attribute && isFilterSettingsOpen) {
      // Закрываем панель, если клик по тому же атрибуту
      setIsFilterSettingsOpen(false);
      setActiveAttribute(null);
    } else {
      // Сбрасываем состояние перед открытием новой панели
      setIsFilterSettingsOpen(false);
      setActiveAttribute(null);
      
      // Открываем панель для нового атрибута
      const buttonRect = event.target.getBoundingClientRect();
      const panel = document.querySelector('.filter-operator-panel');
    
      if (panel) {
        panel.style.top = `${buttonRect.bottom}px`;
        panel.style.left = `${buttonRect.left}px`;
      }
  
      // Устанавливаем новое состояние для активного атрибута
      setActiveAttribute(attribute);
      setIsFilterSettingsOpen(true);
    }
  };
  

  const handleSaveFilter = () => {
    setActiveFilter(null);
    setIsFilterSettingsOpen(false);
  };


  const filteredFields = fields.filter((field) =>
  field.toLowerCase().includes(searchTerm.toLowerCase())
);

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

 
  const saveFilterToServer = () => {
    setIsModalOpen(true); // открытие модального окна
  };
  
  const handleSaveModalFilter = async () => {
    if (!userId) {
      console.error("User ID не найден, фильтр не может быть сохранен.");
      return;
    }
  
    const conditions = selectedAttributes.map((attribute, index) => ({
      attribute,
      operator: filterOperators[attribute],
      value: filterTexts[attribute],
      negation: negations[attribute],
      logical_operator: logicalOperators[index] || "AND"
    }));
  
    const filterData = {
      filter_name: modalFilterName, // устанавливаем имя фильтра прямо перед отправкой
      user_id: userId,
      installed_by_user: true,
      is_shared: false,
      shared_with_users: [],
      shared_with_groups: [],
      conditions
    };
  
    try {
      const response = await fetch('http://localhost:5000/api/filters/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterData),
      });
  
      if (response.ok) {
        const savedFilter = await response.json();
        setSavedFiltersData((prev) => [...prev, { ...filterData, id: savedFilter.filter_id }]); // Устанавливаем filter_id
        alert("Фильтр сохранен!");
      } else {
        console.error("Ошибка при сохранении фильтра:", response.statusText);
      }
    } catch (error) {
      console.error("Ошибка при сохранении фильтра:", error);
    }
  
    setIsModalOpen(false); // Закрываем модальное окно
    setModalFilterName(""); // Очищаем имя фильтра после сохранения
  };
  
  
  
  

  return (

    <div className="filter-settings">
    <div className="filter-settings-content">
  
    <button className="add-filter-button" onClick={handleAddFilterClick}>
  {/* Иконка или текст кнопки */}

        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-filter">
          <polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"></polygon>
        </svg>
      </button>
  
      
      {activeFilter && (
        
  <div className="active-filter-button">
    <span onClick={(e) => handleOpenFilterSettings(activeFilter, e)}>{activeFilter}</span>
    <span
  className="edit-filter-icon"
  onClick={(e) => handleEditFilterClick(e, selectedFilterId)} // Используем handleEditFilterClick вместо handleEditFilter
>
  ✏️ {/* Иконка редактирования */}
</span>


    <span
      className="remove-filter-button"
      onClick={() => setActiveFilter(null)}
    >
      X
    </span>
  </div>
)}

  
      {/* Отображение выбранных атрибутов */}
      {selectedAttributes.map((attribute, index) => (
        <div key={attribute} className="filter-attribute-container">
          <div className="filter-item-group">
            <button className="filter-attribute" ref={filterButtonRef} onClick={(e) => handleOpenFilterSettings(attribute, e)}>
              {attribute} {negations[attribute] ? '!' : ''} {filterOperators[attribute]} {filterTexts[attribute] || 'не задано'}
              <span className="remove-filter-button" onClick={() => handleRemoveAttribute(attribute, index)}>X</span>
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
          
         
          {/* Панель настроек для конкретного атрибута */}
          {activeAttribute === attribute && isFilterSettingsOpen && (
            <div ref={filterOperatorPanelRef} className="filter-operator-panel">
              <div className="filter-operator-settings">
                <div className="filter-operator-options">
  
                  {/* Оператор 'eq' */}
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
  
                  {/* Оператор 'contains' */}
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
  
                  {/* Оператор 'startswith' */}
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
  
                  {/* Оператор 'endswith' */}
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
  
                  {/* Оператор 'isnull' */}
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
                  <button onClick={() => { setIsFilterSettingsOpen(false); setActiveAttribute(null); }}>Закрыть</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
  
      {/* Панель для переключения между контентом */}
      <div ref={filterPanelRef} className={`filter-panel ${isAddFilterPanelOpen ? 'open' : ''}`}>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Сохранить фильтр</h3>
              <input
                type="text"
                value={modalFilterName}
                onChange={(e) => setModalFilterName(e.target.value)}
                placeholder="Введите имя фильтра"
              />
              <button onClick={handleSaveModalFilter}>OK</button>
              <button onClick={() => setIsModalOpen(false)}>Отмена</button>
            </div>
          </div>
        )}
        <div className={`panel-content ${isSavedFiltersPanelOpen ? 'shifted' : ''}`}>
  
          {/* Основной контент панели фильтров */}
          <div className={`main-filters-content ${isSavedFiltersPanelOpen ? 'main-hidden' : ''}`}>
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Поиск по полям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.742-9.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z"/>
                </svg>
              </span>
            </div>
  
            {/* Поля для фильтрации */}
            <div className="filter-list custom-scrollbar">
              {filteredFields.map((field) => (
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
            </div>
            <div className="filter-panel-actions">
              <button onClick={saveFilterToServer}>Сохранить фильтр</button>
              <button onClick={toggleSavedFiltersPanel}>Выбрать фильтры</button>
              <button onClick={() => setIsAddFilterPanelOpen(false)}>Закрыть</button>
            </div>
          </div>
  
          {/* Контент сохранённых фильтров */}
          <div className="saved-filters-content">
            <button className="back-button-mini" onClick={toggleSavedFiltersPanel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="black" fill="white" />
                <path d="M12 8l-4 4 4 4M8 12h8" />
              </svg>
            </button>
            <div className="saved-filter-list custom-scrollbar">
              {savedFiltersData.length > 0 ? (
                savedFiltersData.map((filter) => (
                  <div
                    key={filter.id}
                    className="saved-filter-row"
                    onClick={() => applySavedFilter(filter)}
                    onContextMenu={(e) => handleContextMenu(e, filter.id)}
                  >
                    <span className="saved-filter-cell">{filter.filter_name}</span>
                  </div>
                ))
              ) : (
                <p>Нет сохранённых фильтров</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  
    {/* Контекстное меню для сохранённых фильтров */}
    {contextMenuVisible && (
      <div
        ref={contextMenuRef}
        className="context-menu"
        style={{ top: menuPosition.y, left: menuPosition.x }}
      >
<button onClick={() => { handleEditFilterClick(null, selectedFilterId); setContextMenuVisible(false); }}>
  Изменить
</button>
        <button onClick={() => { handleDeleteFilter(selectedFilterId); setContextMenuVisible(false); }}>Удалить</button>
      </div>
    )}
  </div>
  



    
  );
};

export default IncidentFiltersComponent;
