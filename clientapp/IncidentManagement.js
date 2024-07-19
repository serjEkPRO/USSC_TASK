import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FieldType from './FieldType';
import DropZone from './DropZone';
import DropdownModal from './DropdownModal';
import '../styles/IncidentManagement.css';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        padding: '20px',
    },
};

Modal.setAppElement('#root');

const IncidentManagement = () => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [fields, setFields] = useState([]);

    const [newOrganization, setNewOrganization] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newType, setNewType] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [dropdownModalIsOpen, setDropdownModalIsOpen] = useState(false);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        const response = await axios.get('http://127.0.0.1:5000/api/organizations');
        setOrganizations(response.data);
    };

    const fetchCategories = async (organizationId) => {
        const response = await axios.get(`http://127.0.0.1:5000/api/categories/${organizationId}`);
        setCategories(response.data);
        setSelectedOrganization(organizationId);
        setSelectedCategory(null);
        setTypes([]);
        setFields([]);
    };

    const fetchTypes = async (categoryId) => {
        const response = await axios.get(`http://127.0.0.1:5000/api/types/${categoryId}`);
        setTypes(response.data);
        setSelectedCategory(categoryId);
        setSelectedType(null);
        setFields([]);
    };

    const fetchFields = async (typeId) => {
        const response = await axios.get(`http://127.0.0.1:5000/api/fields/${typeId}`);
        setFields(response.data);
        setSelectedType(typeId);
    };

    const createOrganization = async () => {
        const response = await axios.post('http://127.0.0.1:5000/api/organizations', { name: newOrganization });
        setOrganizations([...organizations, response.data]);
        setNewOrganization('');
        setModalIsOpen(false);
    };

    const createCategory = async () => {
        const response = await axios.post('http://127.0.0.1:5000/api/categories', { organization_id: selectedOrganization, name: newCategory });
        setCategories([...categories, response.data]);
        setNewCategory('');
        setModalIsOpen(false);
    };

    const createType = async () => {
        const response = await axios.post('http://127.0.0.1:5000/api/types', { category_id: selectedCategory, name: newType });
        setTypes([...types, response.data]);
        setNewType('');
        setModalIsOpen(false);
    };

    const createField = async () => {
        const fieldsToSend = fields.map(field => ({ name: field.name, field_type: field.field_type, dropdown_values: field.dropdown_values }));
        const response = await axios.post('http://127.0.0.1:5000/api/fields', { type_id: selectedType, fields: fieldsToSend });
        setFields([...fields, ...response.data]);
        setModalIsOpen(false);
    };

    const deleteOrganization = async (organizationId) => {
        await axios.delete(`http://127.0.0.1:5000/api/organizations/${organizationId}`);
        setOrganizations(organizations.filter(org => org.id !== organizationId));
        setSelectedOrganization(null);
        setCategories([]);
        setTypes([]);
        setFields([]);
    };

    const deleteCategory = async (categoryId) => {
        await axios.delete(`http://127.0.0.1:5000/api/categories/${categoryId}`);
        setCategories(categories.filter(cat => cat.id !== categoryId));
        setSelectedCategory(null);
        setTypes([]);
        setFields([]);
    };

    const deleteType = async (typeId) => {
        await axios.delete(`http://127.0.0.1:5000/api/types/${typeId}`);
        setTypes(types.filter(typ => typ.id !== typeId));
        setSelectedType(null);
        setFields([]);
    };

    const deleteField = async (fieldId) => {
        await axios.delete(`http://127.0.0.1:5000/api/fields/${fieldId}`);
        setFields(fields.filter(field => field.id !== fieldId));
    };

    const openModal = (type) => {
        setModalType(type);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const openDropdownModal = () => {
        setDropdownModalIsOpen(true);
    };

    const closeDropdownModal = () => {
        setDropdownModalIsOpen(false);
    };

    const handleDrop = (item) => {
        if (item.field_type === 'Выпадающий список') {
            openDropdownModal();
        } else {
            setFields([...fields, item]);
        }
    };

    const handleCreateDropdown = (dropdown) => {
        setFields([...fields, { name: dropdown.name, field_type: 'Выпадающий список', dropdown_values: dropdown.values }]);
        closeDropdownModal();
    };

    const renderTable = (data, onClick, placeholder) => {
        let deleteFunction;
        switch (placeholder) {
            case 'Организации':
                deleteFunction = deleteOrganization;
                break;
            case 'Категории':
                deleteFunction = deleteCategory;
                break;
            case 'Типы':
                deleteFunction = deleteType;
                break;
            case 'Поля':
                deleteFunction = deleteField;
                break;
            default:
                break;
        }

        return (
            <div className="table-container">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{placeholder}</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td onClick={() => onClick(item.id)}>{item.name}</td>
                                <td>
                                    <div className="action-button">
                                        <button>Действия</button>
                                        <div className="dropdown-content">
                                            <button onClick={() => deleteFunction(item.id)}>Удалить</button>
                                            <button>Изменить</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        <tr className="no-hover">
                            <td colSpan="3" className="add-row">
                                <button className="add-button" onClick={() => openModal(placeholder.toLowerCase())}>
                                    Добавить {placeholder.toLowerCase()}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const renderModalContent = () => {
        switch (modalType) {
            case 'организации':
                return (
                    <div>
                        <h2>Создать организацию</h2>
                        <input
                            type="text"
                            placeholder="Название организации"
                            value={newOrganization}
                            onChange={(e) => setNewOrganization(e.target.value)}
                        />
                        <button onClick={createOrganization}>Создать</button>
                        <button onClick={closeModal}>Отменить</button>
                    </div>
                );
            case 'категории':
                return (
                    <div>
                        <h2>Создать категорию</h2>
                        <input
                            type="text"
                            placeholder="Название категории"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <button onClick={createCategory}>Создать</button>
                        <button onClick={closeModal}>Отменить</button>
                    </div>
                );
            case 'типы':
                return (
                    <div>
                        <h2>Создать тип</h2>
                        <input
                            type="text"
                            placeholder="Название типа"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                        />
                        <button onClick={createType}>Создать</button>
                        <button onClick={closeModal}>Отменить</button>
                    </div>
                );
            case 'поля':
                return (
                    <div>
                        <h2>Создать поле</h2>
                        <DndProvider backend={HTML5Backend}>
                            <div className="field-types">
                                {['Дата', 'Текст', 'Номер', 'Выпадающий список'].map((type) => (
                                    <FieldType key={type} type={type} />
                                ))}
                            </div>
                            <DropZone fields={fields} onDrop={handleDrop} />
                        </DndProvider>
                        <button onClick={createField}>Создать</button>
                        <button onClick={closeModal}>Отменить</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <h1>Управление инцидентами</h1>
            <div className="breadcrumb">
                {selectedOrganization && (
                    <span
                        onClick={() => {
                            setSelectedOrganization(null);
                            setCategories([]);
                            setTypes([]);
                            setFields([]);
                        }}
                    >
                        Организации
                    </span>
                )}
                {selectedOrganization && ' > '}
                {selectedOrganization && !selectedCategory && (
                    <span>{organizations.find(org => org.id === selectedOrganization)?.name}</span>
                )}
                {selectedCategory && (
                    <span
                        onClick={() => {
                            setSelectedCategory(null);
                            setTypes([]);
                            setFields([]);
                        }}
                    >
                        Категории
                    </span>
                )}
                {selectedCategory && ' > '}
                {selectedCategory && !selectedType && (
                    <span>{categories.find(cat => cat.id === selectedCategory)?.name}</span>
                )}
                {selectedType && (
                    <span
                        onClick={() => {
                            setSelectedType(null);
                            setFields([]);
                        }}
                    >
                        Типы
                    </span>
                )}
                {selectedType && ' > '}
                {selectedType && <span>{types.find(typ => typ.id === selectedType)?.name}</span>}
            </div>
            <div className="main-table">
                {!selectedOrganization && renderTable(organizations, fetchCategories, 'Организации')}
                {selectedOrganization && !selectedCategory && renderTable(categories, fetchTypes, 'Категории')}
                {selectedCategory && !selectedType && renderTable(types, fetchFields, 'Типы')}
                {selectedType && renderTable(fields.length > 0 ? fields : [{}], () => {}, 'Поля')}
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Создать элемент"
            >
                {renderModalContent()}
            </Modal>
            <DropdownModal
                isOpen={dropdownModalIsOpen}
                onRequestClose={closeDropdownModal}
                onCreate={handleCreateDropdown}
            />
        </div>
    );
};

export default IncidentManagement;
