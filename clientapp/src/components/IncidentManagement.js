import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import FieldModal from './FieldModal';
import axios from 'axios';
import '../styles/IncidentManagement.css';

Modal.setAppElement('#root');

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
        background: 'linear-gradient(180deg, #f5f7fa, #c3cfe2)',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
};

const IncidentManagement = () => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [fields, setFields] = useState([]);
    const [modalFields, setModalFields] = useState([]);
    const [dictionaries, setDictionaries] = useState([]);
    const [newName, setNewName] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [fieldModalIsOpen, setFieldModalIsOpen] = useState(false);
    const [editMode, setEditMode] = useState({});
    const [editId, setEditId] = useState(null);
    const clickTimeout = useRef(null);

    useEffect(() => {
        fetchOrganizations();
        fetchDictionaries();
    }, []);

    const fetchOrganizations = async () => {
        const response = await axios.get('http://127.0.0.1:5000/api/organizations');
        setOrganizations(response.data);
        clearSelection();
    };

    const fetchDictionaries = async () => {
        const response = await axios.get('http://127.0.0.1:5000/api/dictionaries');
        setDictionaries(response.data);
    };

    const fetchCategories = async (organizationId) => {
        const response = await axios.get(`http://127.0.0.1:5000/api/categories/${organizationId}`);
        setCategories(response.data);
        setSelectedOrganization(organizationId);
        clearCategorySelection();
    };

    const fetchTypes = async (categoryId) => {
        const response = await axios.get(`http://127.0.0.1:5000/api/types/${categoryId}`);
        setTypes(response.data);
        setSelectedCategory(categoryId);
        clearTypeSelection();
    };

    const fetchFields = async (typeId) => {
        const response = await axios.get(`http://127.0.0.1:5000/api/fields/${typeId}`);
        const fieldsData = response.data.map(field => {
            if (field.field_type === 'Справочник') {
                const dictionary = dictionaries.find(dict => dict.id === field.dictionary_id);
                if (dictionary) {
                    field.name = `Справочник (${dictionary.name})`;
                    field.isEditable = false;
                }
            }
            return field;
        });
        setFields(fieldsData);
        setSelectedType(typeId);
    };

    const clearSelection = () => {
        setSelectedOrganization(null);
        setSelectedCategory(null);
        setSelectedType(null);
        setCategories([]);
        setTypes([]);
        setFields([]);
    };

    const clearCategorySelection = () => {
        setSelectedCategory(null);
        setSelectedType(null);
        setTypes([]);
        setFields([]);
    };

    const clearTypeSelection = () => {
        setSelectedType(null);
        setFields([]);
    };

    const createOrganization = async () => {
        const response = await axios.post('http://127.0.0.1:5000/api/organizations', { name: newName });
        setOrganizations([...organizations, response.data]);
        setNewName('');
        setModalIsOpen(false);
    };

    const createCategory = async () => {
        const response = await axios.post('http://127.0.0.1:5000/api/categories', { organization_id: selectedOrganization, name: newName });
        setCategories([...categories, response.data]);
        setNewName('');
        setModalIsOpen(false);
    };

    const createType = async () => {
        const response = await axios.post('http://127.0.0.1:5000/api/types', { category_id: selectedCategory, name: newName });
        setTypes([...types, response.data]);
        setNewName('');
        setModalIsOpen(false);
    };

    const createField = async (newFields) => {
        const response = await axios.post('http://127.0.0.1:5000/api/fields', { type_id: selectedType, fields: newFields });
        setFields(prevFields => [...prevFields, ...response.data]);
        setFieldModalIsOpen(false);
    };

    const deleteOrganization = async (organizationId) => {
        await axios.delete(`http://127.0.0.1:5000/api/organizations/${organizationId}`);
        setOrganizations(organizations.filter(org => org.id !== organizationId));
        clearSelection();
    };

    const deleteCategory = async (categoryId) => {
        await axios.delete(`http://127.0.0.1:5000/api/categories/${categoryId}`);
        setCategories(categories.filter(cat => cat.id !== categoryId));
        clearCategorySelection();
    };

    const deleteType = async (typeId) => {
        await axios.delete(`http://127.0.0.1:5000/api/types/${typeId}`);
        setTypes(types.filter(typ => typ.id !== typeId));
        clearTypeSelection();
    };

    const deleteField = async (fieldId) => {
        await axios.delete(`http://127.0.0.1:5000/api/fields/${fieldId}`);
        setFields(fields.filter(field => field.id !== fieldId));
    };

    const updateOrganizationName = async (organizationId, newName) => {
        await axios.put(`http://127.0.0.1:5000/api/organizations/${organizationId}`, { name: newName });
        fetchOrganizations();
    };

    const updateCategoryName = async (categoryId, newName) => {
        await axios.put(`http://127.0.0.1:5000/api/categories/${categoryId}`, { name: newName });
        fetchCategories(selectedOrganization);
    };

    const updateTypeName = async (typeId, newName) => {
        await axios.put(`http://127.0.0.1:5000/api/types/${typeId}`, { name: newName });
        fetchTypes(selectedCategory);
    };

    const updateFieldName = async (fieldId, newName) => {
        await axios.put(`http://127.0.0.1:5000/api/fields/${fieldId}`, { name: newName });
        fetchFields(selectedType);
    };

    const updateFieldDictionary = async (fieldId, dictionaryId) => {
        await axios.put(`http://127.0.0.1:5000/api/fields/${fieldId}/dictionary`, { dictionary_id: dictionaryId });
        fetchFields(selectedType);
    };

    const handleEdit = (id, name, type) => {
        setEditMode({ id, type });
        setNewName(name.includes('(') ? name.substring(name.indexOf('(') + 1, name.indexOf(')')) : name);
    };

    const handleDictionaryEdit = (fieldId) => {
        setEditMode({ id: fieldId, type: 'справочники' });
    };

    const handleEditSubmit = async () => {
        switch (editMode.type) {
            case 'организации':
                await updateOrganizationName(editMode.id, newName);
                break;
            case 'категории':
                await updateCategoryName(editMode.id, newName);
                break;
            case 'типы':
                await updateTypeName(editMode.id, newName);
                break;
            case 'поля':
                await updateFieldName(editMode.id, newName);
                break;
            default:
                break;
        }
        setEditMode({});
        setNewName('');
    };

    const handleDictionaryChange = async (fieldId, dictionaryId) => {
        await updateFieldDictionary(fieldId, dictionaryId);
        setEditMode({});
    };

    const openModal = (type) => {
        setModalType(type);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const openFieldModal = () => {
        const updatedFields = fields.map(field => {
            if (field.field_type === 'Справочник' && field.dictionary_id) {
                const dictionary = dictionaries.find(dict => dict.id === field.dictionary_id);
                if (dictionary) {
                    field.name = `Справочник (${dictionary.name})`;
                    field.isEditable = false;
                }
            }
            return field;
        });
        setModalFields(updatedFields);
        setFieldModalIsOpen(true);
    };

    const closeFieldModal = () => {
        setFieldModalIsOpen(false);
    };

    const handleFieldRemove = async (index, fieldId) => {
        if (fieldId) {
            await deleteField(fieldId);
            fetchFields(selectedType);
        }
        setModalFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields.splice(index, 1);
            return updatedFields;
        });
    };

    const handleRowClick = (id, onClick) => {
        if (!editMode.id) {
            onClick(id);
        }
    };

    const handleCellClick = (item, onClick, editType) => {
        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
            handleEdit(item.id, item.name, editType);
        } else {
            clickTimeout.current = setTimeout(() => {
                handleRowClick(item.id, onClick);
                clickTimeout.current = null;
            }, 200); // Задержка в 300 мс для двойного клика
        }
    };

    const renderTable = (data, onClick, placeholder) => {
        let deleteFunction;
        let editType;
        switch (placeholder) {
            case 'Организации':
                deleteFunction = deleteOrganization;
                editType = 'организации';
                break;
            case 'Категории':
                deleteFunction = deleteCategory;
                editType = 'категории';
                break;
            case 'Типы':
                deleteFunction = deleteType;
                editType = 'типы';
                break;
            case 'Поля':
                deleteFunction = deleteField;
                editType = 'поля';
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
                                <td onClick={(e) => {
                                    if (!e.target.closest('.action-button')) {
                                        handleCellClick(item, onClick, editType);
                                    }
                                }}>
                                    {editMode.id === item.id && editMode.type === editType ? (
                                        <div>
                                            {item.field_type === 'Справочник' ? (
                                                <select
                                                    value={item.dictionary_id}
                                                    onChange={(e) => handleDictionaryChange(item.id, e.target.value)}
                                                >
                                                    {dictionaries.map(dict => (
                                                        <option key={dict.id} value={dict.id}>{dict.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                />
                                            )}
                                            <button onClick={handleEditSubmit}>Сохранить</button>
                                        </div>
                                    ) : (
                                        <span>
                                            {item.field_type ? `${item.field_type} (${item.name.replace('Справочник (', '').replace(')', '')})` : item.name}
                                        </span>
                                    )}
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className="action-button">
                                        <button>Действия</button>
                                        <div className="dropdown-content">
                                            <button onClick={() => deleteFunction(item.id)}>Удалить</button>
                                            <button onClick={() => handleEdit(item.id, item.name, editType)}>
                                                {item.field_type === 'Справочник' ? 'Изменить справочник' : 'Изменить имя'}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        <tr className="no-hover">
                            <td colSpan="3" className="add-row">
                                <button className="add-button" onClick={() => {
                                    if (placeholder.toLowerCase() === 'поля') {
                                        openFieldModal();
                                    } else {
                                        openModal(placeholder.toLowerCase());
                                    }
                                }}>
                                    Добавить {placeholder.toLowerCase()}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <h1>Управление инцидентами</h1>
            <div className="main-table">
                <div className="breadcrumb">
                    <span onClick={fetchOrganizations}>Организации</span>
                    {selectedOrganization && (
                        <>
                            <span onClick={() => fetchCategories(selectedOrganization)}>
                                {organizations.find(org => org.id === selectedOrganization)?.name}
                            </span>
                        </>
                    )}
                    {selectedCategory && (
                        <>
                            <span onClick={() => fetchTypes(selectedCategory)}>
                                {categories.find(cat => cat.id === selectedCategory)?.name}
                            </span>
                        </>
                    )}
                    {selectedType && (
                        <>
                            <span onClick={() => fetchFields(selectedType)}>
                                {types.find(typ => typ.id === selectedType)?.name}
                            </span>
                        </>
                    )}
                </div>
                {!selectedOrganization && renderTable(organizations, fetchCategories, 'Организации')}
                {selectedOrganization && !selectedCategory && renderTable(categories, fetchTypes, 'Категории')}
                {selectedCategory && !selectedType && renderTable(types, fetchFields, 'Типы')}
                {selectedType && renderTable(fields, () => {}, 'Поля')}
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel={editMode.id ? 'Изменить' : 'Создать'}
            >
                {editMode.id ? null : (
                    <div>
                        <h2>{editMode.id ? 'Изменить' : 'Создать'} {modalType}</h2>
                        <input
                            type="text"
                            placeholder={`Название ${modalType}`}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button onClick={modalType === 'организации' ? createOrganization : modalType === 'категории' ? createCategory : createType}>
                            {editMode.id ? 'Изменить' : 'Создать'}
                        </button>
                        <button onClick={closeModal}>Отменить</button>
                    </div>
                )}
            </Modal>
            <FieldModal
                modalIsOpen={fieldModalIsOpen}
                closeModal={closeFieldModal}
                fields={modalFields}
                setFields={setModalFields}
                createField={createField}
                dictionaries={dictionaries}
                handleFieldRemove={handleFieldRemove}
            />
        </div>
    );
};

export default IncidentManagement;
