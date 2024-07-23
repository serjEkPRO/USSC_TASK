import React, { useEffect, useState } from 'react';
import '../styles/UsersTable.css';
import '../styles/SearchButton.css'; // Добавляем новые стили для поиска

const IncidentsTable = ({ onIncidentClick, onCreateIncidentClick, isSidebarCollapsed }) => {
  const [incidents, setIncidents] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleFields, setVisibleFields] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');

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
            <div className="search-button" onClick={handleSearchSubmit}></div>
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
      <table className="UserTableClass">
        <thead>
          <tr>
            {visibleFields.map((field) => (
              <th key={field}>{field}</th>
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
                <td key={field} className={`status-${incident[field]}`}>{incident[field]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentsTable;
