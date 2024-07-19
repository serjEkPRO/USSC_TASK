import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ fields, dictionaries, onDrop, handleFieldNameChange, handleSelectDictionary, handleRemoveField }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'FIELD',
        drop: (item) => onDrop(item),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={drop}
            className="modal-drop-zone"
        >
            {fields.map((field, index) => (
                <div key={index} className="field">
                    {field.field_type !== 'Справочник' ? (
                        <>
                            <input
                                type="text"
                                value={field.name}
                                placeholder="Введите имя"
                                onChange={(e) => handleFieldNameChange(index, e.target.value)}
                                style={{
                                    border: field.name === '' ? '1px solid red' : '1px solid #ddd',
                                    padding: '5px',
                                    borderRadius: '5px',
                                    width: 'calc(100% - 10px)',
                                }}
                            />
                        </>
                    ) : (
                        <div>
                            <label>{field.name || 'Выберите справочник:'}</label>
                            <select
                                value={field.dictionary_id || ''}
                                onChange={(e) => handleSelectDictionary(index, e.target.value)}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '5px',
                                    borderRadius: '5px',
                                    width: 'calc(100% - 10px)',
                                    display: field.isEditable === false ? 'none' : 'block'
                                }}
                                disabled={field.isEditable === false}
                            >
                                <option value="" disabled>Выберите справочник</option>
                                {dictionaries.map((dict) => (
                                    <option key={dict.id} value={dict.id}>{dict.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={() => handleRemoveField(index, field.id)}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export default DropZone;
