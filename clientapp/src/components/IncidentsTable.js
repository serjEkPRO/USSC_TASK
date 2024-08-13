import React, { useEffect, useState } from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Важно для корректного отображения
import '../styles/UsersTable.css';
import '../styles/SearchButton.css'; // Добавляем новые стили для поиска

const IncidentsTable = ({ onIncidentClick, onCreateIncidentClick, isSidebarCollapsed }) => {
  const [incidents, setIncidents] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleFields, setVisibleFields] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');
  const [columnWidths, setColumnWidths] = useState({});

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
      setFields(data);
      if (visibleFields.length === 0) {
        setVisibleFields(data);
      }
    } catch (error) {
      console.error('Ошибка при получении полей:', error);
    }
  };

  const fetchIncidents = async (query = '') => {
    try {
      const url = query ? `http://127.0.0.1:5000/api/search-incidents?query=${query}` : 'http://127.0.0.1:5000/api/incidents';
      const response = await fetch(url);
      const data = await response.json();
      setIncidents(data.incidents);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents(searchQuery);
  };

  const handleFieldVisibilityChange = (field) => {
    setVisibleFields((prevVisibleFields) =>
      prevVisibleFields.includes(field)
        ? prevVisibleFields.filter((f) => f !== field)
        : [...prevVisibleFields, field]
    );
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFieldSearchChange = (e) => {
    setFieldSearchQuery(e.target.value);
  };

  const filteredFields = fields.filter((field) =>
    field.toLowerCase().includes(fieldSearchQuery.toLowerCase())
  );

  const handleResize = (index, event, { size }) => {
    setColumnWidths((prevWidths) => ({
      ...prevWidths,
      [index]: size.width
    }));
  };

  return (
    <div className={`table-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="action-bar">
        <div className="search-container">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="search-button" type="submit"></button>
          </form>
        </div>
        <button className="action-button" onClick={toggleDropdown}>
          Настроить поля
        </button>
        <button className="action-button" onClick={onCreateIncidentClick}>
          Создать инцидент
        </button>
      </div>
      {dropdownOpen && (
        <div className="dropdown-menu">
          <input
            type="text"
            placeholder="Поиск полей..."
            value={fieldSearchQuery}
            onChange={handleFieldSearchChange}
          />
          {filteredFields.map((field) => (
            <label key={field}>
              <input
                type="checkbox"
                checked={visibleFields.includes(field)}
                onChange={() => handleFieldVisibilityChange(field)}
              />
              {field}
            </label>
          ))}
        </div>
      )}
      <div className="table-wrapper">
        <table className="UserTableClass">
          <thead>
            <tr>
              {visibleFields.map((field, index) => (
                <th key={field}>
                  <ResizableBox
                    width={columnWidths[index] || 100}
                    height={20}
                    axis="x"
                    handle={<span className="resize-handle" />}
                    onResizeStop={(event, data) => handleResize(index, event, data)}
                    minConstraints={[50, 20]}
                    maxConstraints={[500, 20]}
                    className="resizable-box"
                  >
                    <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', paddingRight: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {field}
                    </div>
                  </ResizableBox>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => onIncidentClick(incident.id)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: incident.isSelected ? '#333333' : 'transparent'
                }}
              >
                {visibleFields.map((field) => (
                  <td key={field} className={`status-${incident[field]}`}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: columnWidths[visibleFields.indexOf(field)] || 100 }}>
                      {incident[field]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentsTable;
