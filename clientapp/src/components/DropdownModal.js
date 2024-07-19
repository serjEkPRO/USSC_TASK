import React, { useState } from 'react';
import Modal from 'react-modal';

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

const DropdownModal = ({ isOpen, onRequestClose, onCreate }) => {
    const [dropdownName, setDropdownName] = useState('');
    const [dropdownValues, setDropdownValues] = useState(['']);

    const handleDropdownChange = (index, value) => {
        const values = [...dropdownValues];
        values[index] = value;
        setDropdownValues(values);
    };

    const addDropdownValue = () => {
        setDropdownValues([...dropdownValues, '']);
    };

    const handleSubmit = () => {
        onCreate({ name: dropdownName, values: dropdownValues });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="Создать выпадающий список"
        >
            <h2>Создать выпадающий список</h2>
            <input
                type="text"
                placeholder="Название выпадающего списка"
                value={dropdownName}
                onChange={(e) => setDropdownName(e.target.value)}
            />
            {dropdownValues.map((value, index) => (
                <input
                    key={index}
                    type="text"
                    placeholder="Значение"
                    value={value}
                    onChange={(e) => handleDropdownChange(index, e.target.value)}
                />
            ))}
            <button onClick={addDropdownValue}>Добавить значение</button>
            <button onClick={handleSubmit}>Создать</button>
            <button onClick={onRequestClose}>Отменить</button>
        </Modal>
    );
};

export default DropdownModal;
