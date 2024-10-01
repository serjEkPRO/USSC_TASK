import React from 'react';
import '../styles/Menu.css'; // Импортируем файл со стилями

const Menu = ({ setActiveTab }) => {
  return (
    <div className="card-container">
      <div className="simple-text-field">
        <div className="card-inner">SOAR MASTER</div>
      </div>
      <a className="card2" onClick={() => setActiveTab('incidents')}>
        <div className="card-inner">Инциденты</div>
      </a>
      <a className="card2" onClick={() => setActiveTab('incident-management')}>
        <div className="card-inner">Управление инцидентами</div>
      </a>
      <a className="card2" onClick={() => setActiveTab('dictionaries')}>
        <div className="card-inner">Справочники</div>
      </a>
      <a className="card2" onClick={() => setActiveTab('workflow')}>
        <div className="card-inner">Плейбуки</div>
      </a>
    </div>
  );
};

export default Menu;
