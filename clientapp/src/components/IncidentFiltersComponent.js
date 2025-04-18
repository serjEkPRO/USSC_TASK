import React, { useState, useRef, useEffect } from 'react';
import '../styles/incidentList/IncidentFilters.scss';
import "../assets/fontawesome/all.min.css";
import Tooltipp from './Tooltipp';
const IncidentFiltersComponent = ({ fields, setFilterValues, setSavedFilters, filterValues, filterOperators = {}, setFilterOperators, userId, typeId}) => {
  const [isSavedFiltersPanelOpen, setIsSavedFiltersPanelOpen] = useState(false); // Управление панелью сохранённых фильтров
  const [isAddFilterPanelOpen, setIsAddFilterPanelOpen] = useState(false);
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterTexts, setFilterTexts] = useState({});
  const [logicalOperators, setLogicalOperators] = useState([]);
  const [negations, setNegations] = useState({});
  const [isEditingSavedFilter, setIsEditingSavedFilter] = useState(false); // Новый state для отслеживания режима редактирования сохраненного фильтра
  const filterContainerRef = useRef(null);
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


  const getFieldTypeByName = (name) => {
    const field = fields.find((f) => f.name === name);
    return field ? field.field_type : 'text'; // если поле не найдено, по умолчанию text
  };
  

  // Загрузка состояния `isEditingFilter` из sessionStorage при загрузке компонента
  useEffect(() => {
    const savedIsEditingFilter = sessionStorage.getItem(`isEditingFilter_${userId}`);
    if (savedIsEditingFilter !== null) {
      setIsEditingFilter(JSON.parse(savedIsEditingFilter));
    }
  }, [userId]);

  // Сохранение состояния `isEditingFilter` в sessionStorage при каждом изменении
  useEffect(() => {
    sessionStorage.setItem(`isEditingFilter_${userId}`, JSON.stringify(isEditingFilter));
  }, [isEditingFilter, userId]);


  
// Добавляем эффект для закрытия панели при клике вне её области
// Функция переключения открытия/закрытия панели add-filter-container
// Функция для переключения состояния панели добавления фильтра
const handleAddFilterClick = () => {
  setIsAddFilterPanelOpen((prev) => !prev);
};



useEffect(() => {
  const handleClickOutsideFilterSettings = (event) => {
    // Если клик произошел внутри filter-attribute, выходим из обработчика
    if (
      event.target.closest('.filter-attribute')
    ) {
      return;
    }

    // Закрываем панель настроек фильтра, если клик произошел вне её области
    if (filterOperatorPanelRef.current && !filterOperatorPanelRef.current.contains(event.target)) {
      setIsFilterSettingsOpen(false);
      setActiveAttribute(null);
    }
  };

  // Добавляем слушатель событий для клика
  document.addEventListener("mousedown", handleClickOutsideFilterSettings);
  return () => {
    document.removeEventListener("mousedown", handleClickOutsideFilterSettings);
  };
}, []);




const handleRemoveActiveFilter = () => {
  setActiveFilter(null);
  setIsEditingSavedFilter(false); // Выходим из режима редактирования сохраненного фильтра
  setSelectedAttributes([]);
  setFilterValues({});
  setIsEditingFilter(false); // Выключаем режим редактирования
  setFilterOperators({});
  setNegations({});
  setLogicalOperators([]);
  setSelectedFilterId(null); // Сбрасываем выбранный фильтр
  
};

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
      setFilterTexts(savedFilters.filterTexts || {});
      setActiveFilter(savedFilters.activeFilter || null); // восстанавливаем activeFilter
      setSelectedFilterId(savedFilters.selectedFilterId || null); // восстанавливаем selectedFilterId

  }
}, [userId]);



const sanitizedSelectedAttributes = selectedAttributes.filter(
  (attr) => attr && typeof attr === "string"
);

const sanitizedFields = fields.filter(
  (field) => field && typeof field.name === "string"
);

// Разделяем поля на выбранные и невыбранные
const selectedFields = sanitizedSelectedAttributes.map((attr) => ({
  field: sanitizedFields.find((field) => field.name === attr) || { name: attr },
  isSelected: true,
}));

const unselectedFields = sanitizedFields
  .filter((field) => !sanitizedSelectedAttributes.includes(field.name))
  .map((field) => ({
    field,
    isSelected: false,
  }));

// Объединяем выбранные и невыбранные поля
const combinedFields = isEditingFilter
  ? [...selectedFields, ...unselectedFields]
  : [...unselectedFields];




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
            filterTexts,
            selectedFilterId, // добавляем сохранение selectedFilterId

            activeFilter // добавляем сохранение activeFilter
        })
    );
  }, [filterValues, filterOperators, negations, selectedAttributes, logicalOperators, filterTexts, activeFilter, userId]);

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


useEffect(() => {
  const handleClickOutsidePanel = (event) => {
    // Если клик произошел внутри filter-panel или внутри filter-attribute, выходим из обработчика
    if (
      filterPanelRef.current && filterPanelRef.current.contains(event.target) ||
      event.target.closest('.filter-panel')
    ) {
      return;
    }

    // Закрываем панель, если клик был снаружи
    setIsAddFilterPanelOpen(false);
  };

  // Добавляем слушатель событий для клика
  document.addEventListener("mousedown", handleClickOutsidePanel);

  return () => {
    // Удаляем слушатель при размонтировании компонента
    document.removeEventListener("mousedown", handleClickOutsidePanel);
  };
}, []);


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
    // Сбрасываем фильтры только если мы НЕ в режиме редактирования сохраненного фильтра
    if (!isEditingSavedFilter) {
      setActiveFilter(null);
      setFilterValues({});
      setFilterOperators({});
      setNegations({});
      setLogicalOperators([]);
      setFilterTexts({});
    }

    // Добавляем новый атрибут
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
    // Выключаем режим редактирования, так как мы только что выбрали фильтр
    setIsEditingFilter(false);
    setIsEditingSavedFilter(false); // Для обеспечения согласованного поведения
    setIsAddFilterPanelOpen(false);
};



  
const handleEditFilterClick = async (event, filterId) => {
  if (event && event.stopPropagation) event.stopPropagation();

  const currentEditingState = isEditingFilter;

  if (currentEditingState) {
    // Выход из режима редактирования
    setSelectedAttributes([]);
    setIsEditingFilter(false); // Обновляем состояние
    setIsSavedFiltersPanelOpen(true); // Переход к панели сохранённых фильтров
    toggleEditMode(false); // Указываем, что это выход
  } else {
    toggleEditMode(true); // Указываем, что это вход
    try {
      const response = await fetch(`http://localhost:5000/api/filters/${filterId}`);
      if (response.ok) {
        const filter = await response.json();
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

        setSelectedAttributes(attributes);
        setFilterValues(values);
        setFilterOperators(operators);
        setNegations(negations);
        setLogicalOperators(logicalOperators);
        setIsEditingSavedFilter(true); // Включаем режим редактирования сохраненного фильтра

        setIsEditingFilter(true); // Обновляем состояние после успешного запроса
        setIsSavedFiltersPanelOpen(false);
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
    console.log("Clicked Attribute:", attribute);
    console.log("Current Active Attribute:", activeAttribute);
    console.log("Is Filter Settings Open:", isFilterSettingsOpen);
  
    if (activeAttribute === attribute && isFilterSettingsOpen) {
      // Если уже открыта панель для текущего атрибута — закрываем её
      setIsFilterSettingsOpen(false);
      setActiveAttribute(null);
      console.log("Closing the panel for attribute:", attribute);
    } else {
      // Рассчитываем положение панели
      const buttonRect = event.target.getBoundingClientRect();
      const panel = document.querySelector('.filter-operator-panel');
      if (panel) {
        panel.style.top = `${buttonRect.bottom}px`;
        panel.style.left = `${buttonRect.left}px`;
      }
  
      // Устанавливаем новое активное состояние
      setActiveAttribute(attribute);
      setIsFilterSettingsOpen(true);
      console.log("Opening the panel for a new attribute:", attribute);
    }
  };
  
  
  
  
  
  

  const handleSaveFilter = () => {
    setActiveFilter(null);
    setIsFilterSettingsOpen(false);
  };



  const filteredFields = fields.filter((field) =>
  field.name.toLowerCase().includes(searchTerm.toLowerCase())
);

const handleRemoveAttribute = (attribute, index) => {
  setSelectedAttributes((prev) => {
    const updatedAttributes = prev.filter((attr) => attr !== attribute);

    if (updatedAttributes.length === 0 && isEditingFilter) {
      // Если больше нет полей и включён режим редактирования
      setIsEditingFilter(false);
    }

    return updatedAttributes;
  });

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
  


  const toggleEditMode = () => {
    const arrow = document.querySelector('span.filter-arrow');

    // Проверяем, существует ли элемент стрелки
    if (!arrow) {
        console.error("Элемент стрелки не найден.");
        return;
    }

    // Определяем текущее состояние через класс edit-mode
    if (arrow.classList.contains('edit-mode')) {
        // Выход из режима редактирования
        arrow.classList.remove('edit-mode'); // Удаляем класс
        arrow.style.transform = 'translateX(-5px) scale(0.9)'; // Отпрыгивание влево
        setTimeout(() => {
            arrow.style.transform = 'translateX(0)'; // Возврат в исходное положение
        }, 200);
    } else {
        // Вход в режим редактирования
        arrow.classList.add('edit-mode'); // Добавляем класс
        arrow.style.transform = 'translateX(5px) scale(1)'; // Отпрыгивание вправо
        setTimeout(() => {
            arrow.style.transform = 'translateX(0)'; // Возврат в исходное положение
        }, 200);
    }
};



// Определение текста для кнопки в зависимости от состояния activeFilter
const backButtonText = activeFilter ? "Редактировать фильтр" : "Настроить поля для фильтра";

// Определение обработчика для кнопки
const handleBackButtonClick = (e) => {
  if (activeFilter) {
    // Проверяем, включен ли уже режим редактирования
    if (!isEditingFilter) {
      handleEditFilterClick(e, selectedFilterId); // Выполняем действие редактирования, если режим еще не включен
    }
    toggleSavedFiltersPanel();
  } else {
    toggleSavedFiltersPanel();
    handleRemoveActiveFilter(); // Сбрасываем фильтры
  }
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

  const getAddFilterButtonText = () => {
    if (activeFilter) {
      return activeFilter; // Отображение имени активного фильтра
    }
    if (selectedAttributes.length > 0) {
      return <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h18"></path>
      <path d="M8 10h8"></path>
      <path d="M10 16h4"></path>
    </svg>; // Если выбраны поля, но фильтр не сохранён
    }
    return "Нет активного фильтра"; // Если ничего не выбрано
  };
  
  
  const operatorLabels = {
    eq: 'Равно',
    contains: 'Содержит',
    startswith: 'Начинается с',
    endswith: 'Заканчивается на',
    isnull: 'Пусто',
  };
  

  return (


    <div className="filter-settings">
         

    <div className="filter-settings-content">

      {/* Начало контейнера для объединения add-filter-button и active-filter-button */}
      <div className="add-filter-container">

      <div className="tooltip-container">
  <button className="add-filter-button" onClick={handleAddFilterClick}>
    
    <span>{getAddFilterButtonText()}</span>
    {activeFilter && (
      <Tooltipp text="Перевернуть стрелку">
        <span
          className={`filter-arrow ${isEditingFilter ? 'edit-mode' : ''}`}
          onClick={(e) => handleEditFilterClick(e, selectedFilterId)}
        >
          ➤ {/* Иконка редактирования */}
        </span>
      </Tooltipp>
    )}
  </button>

</div>


        </div>
        {(selectedAttributes.length > 0 || isEditingFilter) && (
                  <div className="filter-container" ref={filterContainerRef}>
     <button
    className="close-all-filters-button"
    onClick={handleRemoveActiveFilter}
  >
    X
  </button> 
        

       {/* Закрывающий тег для filter-container */}

      {/* Отображение выбранных атрибутов */}
      {selectedAttributes.map((attribute, index) => (
  <div key={attribute} className="filter-attribute-container">
    <div className="filter-item-group">
      <button
        className="filter-attribute"
        ref={filterButtonRef}
        onClick={(e) => handleOpenFilterSettings(attribute, e)}
      >
        <span className="filter-name">{attribute}</span> {/* Название фильтра */}
        
        {negations[attribute] && (
          <span className="filter-negation">!</span>
        )}
        
        <span className="filter-operator">
  {operatorLabels[filterOperators[attribute]] || filterOperators[attribute]}
</span> {/* Читаемое отображение оператора */}
        
        <span className="filter-value">
          {filterTexts[attribute] || 'не задано'}
        </span> {/* Значение */}
        
        <span
          className="remove-filter-button"
          onClick={() => handleRemoveAttribute(attribute, index)}
        >
          X
        </span>
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
        {(() => {
          const fieldType = getFieldTypeByName(attribute); 
          // поле может быть "text", "checkbox", "dictionary", "date" и т.д.

          // --- 1. Если это ТЕКСТ (или неизвестный тип) – рендерим ваш исходный код ---
          if (fieldType === 'text' || !fieldType) {
            return (
              <>
                {/* -------- ВАШ ПРЕЖНИЙ КОД ДЛЯ ОПЕРАТОРОВ TEXT -------- */} 
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
                    {operatorLabels['eq']}
                  </label>

                  {filterOperators[attribute] === 'eq' && (
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>

                <div
                  className={`filter-text-input ${
                    filterOperators[attribute] === 'eq' ? 'visible' : ''
                  }`}
                >
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
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>
                <div
                  className={`filter-text-input ${
                    filterOperators[attribute] === 'contains' ? 'visible' : ''
                  }`}
                >
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
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>
                <div
                  className={`filter-text-input ${
                    filterOperators[attribute] === 'startswith' ? 'visible' : ''
                  }`}
                >
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
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>
                <div
                  className={`filter-text-input ${
                    filterOperators[attribute] === 'endswith' ? 'visible' : ''
                  }`}
                >
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
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>
              </>
            );
          }

          // --- 2. Если это ЧЕКБОКС ---
          else if (fieldType === 'checkbox') {
            return (
              <>
                {/* Для checkbox логично оставить только eq и isnull */}
                <div style={{ display: 'flex', alignItems: 'left' }}>
                  <label>
                    <input
                      type="radio"
                      name={`operator-${attribute}`}
                      value="eq"
                      checked={filterOperators[attribute] === 'eq'}
                      onChange={() => handleOperatorChange(attribute, 'eq')}
                    />
                    {operatorLabels['eq']}
                  </label>

                  {filterOperators[attribute] === 'eq' && (
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>

                {/* Для значения чекбокса удобно хранить либо "true"/"false", либо boolean */}
                {filterOperators[attribute] === 'eq' && (
                  <div className="filter-text-input visible">
                    <label>
                      <input
                        type="checkbox"
                        checked={filterTexts[attribute] === 'true'}
                        onChange={(e) =>
                          handleFilterTextChange(attribute, e.target.checked ? 'true' : 'false')
                        }
                      />
                      Значение чекбокса
                    </label>
                  </div>
                )}

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
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>
              </>
            );
          }

          // --- 3. Если это СПРАВОЧНИК ---
          else if (fieldType === 'dictionary') {
            return (
              <>
                {/* Оставим тоже eq и isnull (можно добавить contains, если нужно) */}
                <div style={{ display: 'flex', alignItems: 'left' }}>
                  <label>
                    <input
                      type="radio"
                      name={`operator-${attribute}`}
                      value="eq"
                      checked={filterOperators[attribute] === 'eq'}
                      onChange={() => handleOperatorChange(attribute, 'eq')}
                    />
                    {operatorLabels['eq']}
                  </label>

                  {filterOperators[attribute] === 'eq' && (
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>

                {/* Заглушка: выберите значение из справочника */}
                {filterOperators[attribute] === 'eq' && (
                  <select
                    className="custom-text-filter-input"
                    value={filterTexts[attribute] || ''}
                    onChange={(e) => handleFilterTextChange(attribute, e.target.value)}
                  >
                    <option value="">Не выбрано</option>
                    <option value="dictVal1">dictVal1</option>
                    <option value="dictVal2">dictVal2</option>
                    {/* ...и т.д... */}
                  </select>
                )}

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
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>
              </>
            );
          }

          // --- 4. Если это ДАТА ---
          else if (fieldType === 'date') {
            return (
              <>
                {/* Можно оставить eq, isnull; либо добавить before/after */}
                <div style={{ display: 'flex', alignItems: 'left' }}>
                  <label>
                    <input
                      type="radio"
                      name={`operator-${attribute}`}
                      value="eq"
                      checked={filterOperators[attribute] === 'eq'}
                      onChange={() => handleOperatorChange(attribute, 'eq')}
                    />
                    {operatorLabels['eq']}
                  </label>

                  {filterOperators[attribute] === 'eq' && (
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>

                {filterOperators[attribute] === 'eq' && (
                  <div className="filter-text-input visible">
                    <input
                      type="date"
                      className="custom-text-filter-input"
                      value={filterTexts[attribute] || ''}
                      onChange={(e) => handleFilterTextChange(attribute, e.target.value)}
                    />
                  </div>
                )}

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
                    <label
                      className="negation-checkbox"
                      style={{ marginLeft: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={negations[attribute] || false}
                        onChange={() => handleNegationToggle(attribute)}
                      />
                      Отрицание
                    </label>
                  )}
                </div>
              </>
            );
          }

          // --- 5. На всякий случай fallback ---
          else {
            // Если попадётся неизвестный тип
            return (
              <>
                <p>Неизвестный тип поля: {fieldType}</p>
                {/* Или можно вернуть логику, как для text */}
              </>
            );
          }
        })()}
      </div>

      <div className="filter-operator-actions">
        <button
          onClick={() => {
            setIsFilterSettingsOpen(false);
            setActiveAttribute(null);
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      ))}
      
  </div>
  )}
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
            {activeFilter && (
  <div className="active-filter-header">
    <span className="active-filter-text">Поля фильтра:</span>
    <div className="filter-row">
      <span className="active-filter">{activeFilter}</span>
      <button
        className="remove-filter-button"
        onClick={handleRemoveActiveFilter}
      >
        X
      </button>
    </div>
  </div>
)}



{combinedFields.map(({ field }) => (
  <div key={field.name} className="filter-field">
    <label>
      <input
        type="checkbox"
        checked={selectedAttributes.includes(field.name)}
        onChange={() =>
          selectedAttributes.includes(field.name)
            ? handleRemoveAttribute(field.name)
            : handleAddAttribute(field.name)
        }
      />
      {field.name}
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
          <button className="back-button-mini" onClick={handleBackButtonClick}>
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
      <path d="M12 8l-4 4 4 4M8 12h8" />
  </svg>
  <span className="edit-filter-back">{backButtonText}</span>
</button>


            <div className="saved-filter-list custom-scrollbar">
              {savedFiltersData.length > 0 ? (
                savedFiltersData.map((filter) => (
<div
  key={filter.id}
  className={`saved-filter-row ${selectedFilterId === filter.id ? 'selected-filter' : ''}`}
  onClick={() => applySavedFilter(filter)}
  onContextMenu={(e) => handleContextMenu(e, filter.id)}
>
  <span className="saved-filter-cell">{filter.filter_name}</span>
  {selectedFilterId === filter.id && (
    <span className="checkmark">✔</span>
  )}
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
