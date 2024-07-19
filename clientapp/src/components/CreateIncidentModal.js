import React, { useState, useEffect } from 'react';
import '../styles/CreateIncidentModal.css';


const CreateIncidentModal = ({ isOpen, onClose, onCreate }) => {
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [formValues, setFormValues] = useState({
    creator: '',
    responsible: '',
    evidence_name: '',
    evidence_link: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const response = await fetch('http://127.0.0.1:5000/api/organizations');
    const data = await response.json();
    setOrganizations(data);
  };

  const fetchCategories = async (organizationId) => {
    const response = await fetch(`http://127.0.0.1:5000/api/categories/${organizationId}`);
    const data = await response.json();
    setCategories(data);
  };

  const fetchTypes = async (categoryId) => {
    const response = await fetch(`http://127.0.0.1:5000/api/types/${categoryId}`);
    const data = await response.json();
    setTypes(data);
  };

  const fetchFields = async (typeId) => {
    const response = await fetch(`http://127.0.0.1:5000/api/fields/${typeId}`);
    const data = await response.json();
    const fieldsWithValues = await Promise.all(data.map(async field => {
      if (field.field_type === 'dictionary') {
        const dictionaryValues = await fetchDictionaryValues(field.dictionary_id);
        return { ...field, dictionary_values: dictionaryValues };
      }
      return field;
    }));
    setFields(fieldsWithValues);
  };

  const fetchDictionaryValues = async (dictionaryId) => {
    const response = await fetch(`http://127.0.0.1:5000/api/dictionary/${dictionaryId}/values`);
    const data = await response.json();
    return data;
  };

  const handleOrganizationChange = (e) => {
    const organizationId = e.target.value;
    setSelectedOrganization(organizationId);
    fetchCategories(organizationId);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    fetchTypes(categoryId);
  };

  const handleTypeChange = (e) => {
    const typeId = e.target.value;
    setSelectedType(typeId);
    fetchFields(typeId);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({ ...formValues, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formValues,
      organization_id: selectedOrganization,
      category_id: selectedCategory,
      type_id: selectedType
    });
    onClose();
  };

  const renderField = (field) => {
    if (!field) return null;

    switch (field.field_type) {
      case 'text':
        return <input type="text" name={field.name} onChange={handleInputChange} />;
      case 'checkbox':
        return <input type="checkbox" name={field.name} onChange={handleInputChange} />;
      case 'date':
        return <input type="date" name={field.name} onChange={handleInputChange} />;
      case 'dropdown':
        return (
          <select name={field.name} onChange={handleInputChange}>
            {field.dropdown_values && field.dropdown_values.map((value, index) => (
              <option key={index} value={value}>{value}</option>
            ))}
          </select>
        );
      case 'dictionary':
        return (
          <select name={field.name} onChange={handleInputChange}>
            {field.dictionary_values && field.dictionary_values.map((value, index) => (
              <option key={index} value={value}>{value}</option>
            ))}
          </select>
        );
      default:
        return <input type="text" name={field.name} onChange={handleInputChange} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Создать инцидент</h2>
        <form onSubmit={handleSubmit}>
          <label>Организация:</label>
          <select onChange={handleOrganizationChange} value={selectedOrganization || ''}>
            <option value="">Выберите организацию</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>

          <label>Категория инцидента:</label>
          <select onChange={handleCategoryChange} value={selectedCategory || ''}>
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <label>Тип инцидента:</label>
          <select onChange={handleTypeChange} value={selectedType || ''}>
            <option value="">Выберите тип</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          {fields.map(field => (
            <div key={field.id}>
              <label>{field.name}:</label>
              {renderField(field)}
            </div>
          ))}

          <label>Создатель:</label>
          <input type="text" name="creator" onChange={handleInputChange} value={formValues.creator} />

          <label>Ответственный:</label>
          <input type="text" name="responsible" onChange={handleInputChange} value={formValues.responsible} />

          <label>Свидетельства (имя файла):</label>
          <input type="text" name="evidence_name" onChange={handleInputChange} value={formValues.evidence_name} />

          <label>Свидетельства (ссылка):</label>
          <input type="text" name="evidence_link" onChange={handleInputChange} value={formValues.evidence_link} />

          <button type="submit">Создать</button>
        </form>
      </div>
    </div>
  );
};

export default CreateIncidentModal;
