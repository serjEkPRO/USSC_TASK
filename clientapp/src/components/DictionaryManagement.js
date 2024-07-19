import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DictionaryManagement.css';

const DictionaryManagement = () => {
  const [dictionaries, setDictionaries] = useState([]);
  const [selectedDictionary, setSelectedDictionary] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [newDictionary, setNewDictionary] = useState('');
  const [newAttribute, setNewAttribute] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchDictionaries();
  }, []);

  const fetchDictionaries = async () => {
    const response = await axios.get('http://127.0.0.1:5000/api/dictionaries');
    setDictionaries(response.data);
    clearSelection();
  };

  const fetchAttributes = async (dictionaryId) => {
    const response = await axios.get(`http://127.0.0.1:5000/api/attributes/${dictionaryId}`);
    setAttributes(response.data);
    setSelectedDictionary(dictionaryId);
  };

  const clearSelection = () => {
    setSelectedDictionary(null);
    setAttributes([]);
  };

  const createDictionary = async () => {
    if (!newDictionary.trim()) {
      alert('Название справочника обязательно');
      return;
    }
    const response = await axios.post('http://127.0.0.1:5000/api/dictionaries', { name: newDictionary });
    setDictionaries([...dictionaries, response.data]);
    setNewDictionary('');
    setModalIsOpen(false);
  };

  const createAttribute = async () => {
    const response = await axios.post('http://127.0.0.1:5000/api/attributes', { dictionary_id: selectedDictionary, name: newAttribute });
    setAttributes([...attributes, response.data]);
    setNewAttribute('');
  };

  const deleteDictionary = async (dictionaryId) => {
    await axios.delete(`http://127.0.0.1:5000/api/dictionaries/${dictionaryId}`);
    setDictionaries(dictionaries.filter(dict => dict.id !== dictionaryId));
    clearSelection();
  };

  const deleteAttribute = async (attributeId) => {
    await axios.delete(`http://127.0.0.1:5000/api/attributes/${attributeId}`);
    setAttributes(attributes.filter(attr => attr.id !== attributeId));
  };

  return (
    <div>
      <h1>Управление справочниками</h1>
      <div className="main-table">
        {!selectedDictionary && (
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Справочники</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {dictionaries.map(dict => (
                  <tr key={dict.id}>
                    <td>{dict.id}</td>
                    <td onClick={() => fetchAttributes(dict.id)}>{dict.name}</td>
                    <td>
                      <button onClick={() => deleteDictionary(dict.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
                <tr className="no-hover">
                  <td colSpan="3" className="add-row">
                    <button className="add-button" onClick={() => setModalIsOpen(true)}>
                      Добавить справочник
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedDictionary && (
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th colSpan="3">
                    <div className="table-header">
                      <button className="back-button" onClick={clearSelection}>Назад</button>
                      <span>Справочник: {dictionaries.find(dict => dict.id === selectedDictionary)?.name}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th>ID</th>
                  <th>Атрибуты</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {attributes.map(attr => (
                  <tr key={attr.id}>
                    <td>{attr.id}</td>
                    <td>{attr.name}</td>
                    <td>
                      <button onClick={() => deleteAttribute(attr.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
                <tr className="no-hover">
                  <td colSpan="3" className="add-row">
                    <input
                      type="text"
                      placeholder="Название атрибута"
                      value={newAttribute}
                      onChange={(e) => setNewAttribute(e.target.value)}
                    />
                    <button className="add-button" onClick={createAttribute}>
                      Добавить атрибут
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Создать справочник</h2>
            <input
              type="text"
              placeholder="Название справочника"
              value={newDictionary}
              onChange={(e) => setNewDictionary(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={createDictionary}>Создать</button>
              <button onClick={() => setModalIsOpen(false)}>Отменить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryManagement;
