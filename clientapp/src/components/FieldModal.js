import React from 'react';
import Modal from 'react-modal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FieldType from './FieldType';
import DropZone from './DropZone';
import axios from 'axios';

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

const fieldTypeMapping = {
    'Дата': 'date',
    'Текст': 'text',
    'Справочник': 'dictionary',
    'Чек бокс': 'checkbox',
};

const FieldModal = ({
    modalIsOpen,
    closeModal,
    fields,
    setFields,
    createField,
    dictionaries,
    handleFieldRemove,
}) => {
    const handleDrop = (item) => {
        const newField = { ...item, name: '', dictionaries: dictionaries, isEditable: true };
        setFields(prevFields => [...prevFields, newField]);
    };

    const handleFieldNameChange = (index, name) => {
        setFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index].name = name;
            return updatedFields;
        });
    };

    const handleSelectDictionary = (index, dictionaryId) => {
        const selectedDictionary = dictionaries.find(dict => dict.id === parseInt(dictionaryId));
        setFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index].name = `Справочник (${selectedDictionary.name.replace('Справочник (', '').replace(')', '')})`;
            updatedFields[index].dictionary_id = dictionaryId;
            updatedFields[index].isEditable = false; // Make dictionary selection non-editable after selection
            return updatedFields;
        });
    };

    const handleRemoveField = (index, fieldId) => {
        handleFieldRemove(index, fieldId);
    };

    const handleCreateField = () => {
        if (fields.some(field => field.name === '')) {
            alert('Заполните все поля именами');
            return;
        }
        const fieldsWithTypes = fields.map(field => ({
            ...field,
            field_type: fieldTypeMapping[field.field_type], // Используем field_type для маппинга
        }));
        createField(fieldsWithTypes.filter(field => !field.id));
        closeModal();
    };

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Создать поле"
        >
            <div>
                <h2>Создать поле</h2>
                <DndProvider backend={HTML5Backend}>
                    <div className="modal-field-types">
                        {['Дата', 'Текст', 'Справочник', 'Чек бокс'].map((type) => (
                            <FieldType key={type} type={type} />
                        ))}
                    </div>
                    <DropZone
                        fields={fields}
                        onDrop={handleDrop}
                        handleFieldNameChange={handleFieldNameChange}
                        handleSelectDictionary={handleSelectDictionary}
                        handleRemoveField={handleRemoveField}
                        dictionaries={dictionaries} // Ensure dictionaries prop is passed
                    />
                </DndProvider>
                <button onClick={handleCreateField}>Сохранить</button>
                <button onClick={closeModal}>Отменить</button>
            </div>
        </Modal>
    );
};

export default FieldModal;
