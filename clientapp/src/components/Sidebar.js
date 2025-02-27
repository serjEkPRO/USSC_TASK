import React, { useState, useContext, useEffect } from 'react';
import { KeycloakContext } from '../components/KeycloakProvider'; // Импортируем контекст Keycloak
import '../styles/Sidebar.scss';
import CustomIcon from '../assets/12197372.png'; // Путь к вашей иконке

const Sidebar = ({ setActiveTab, toggleSidebar }) => {
  const [isShrinkView, setIsShrinkView] = useState(false);
  const { userInfo } = useContext(KeycloakContext); // Получаем данные пользователя из контекста
  const [isLoading, setIsLoading] = useState(true); // Добавляем состояние загрузки

  // Эффект, который устанавливает статус загрузки после получения userInfo
  useEffect(() => {
    if (userInfo) {
      setIsLoading(false); // Останавливаем загрузку, если данные получены
    }
  }, [userInfo]);

  const handleSidebarView = () => {
    setIsShrinkView(!isShrinkView);
    toggleSidebar(); // Вызов функции для изменения состояния боковой панели
  };

  return (
    <div className={`sidebar-container${isShrinkView ? " shrink" : ""}`}>
      <button
        className="custom-sidebar-viewButton"
        type="button"
        aria-label={isShrinkView ? "Expand Sidebar" : "Shrink Sidebar"}
        title={isShrinkView ? "Expand" : "Shrink"}
        onClick={handleSidebarView}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-chevron-left"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div className="sidebar-wrapper">
        <ul className="sidebar-list">
          <li className="sidebar-listItem" onClick={() => setActiveTab('incidents')}>
            <a>
              <img
                src={CustomIcon}
                alt="Incidents Icon"
                className="sidebar-listIcon"
              />
              <span className="sidebar-listItemText">Инциденты</span>
            </a>
          </li>
          <li className="sidebar-listItem" onClick={() => setActiveTab('incident-management')}>
            <a>
              <img
                src={CustomIcon}
                alt="Incident Management Icon"
                className="sidebar-listIcon"
              />
              <span className="sidebar-listItemText">Управление инцидентами</span>
            </a>
          </li>
          <li className="sidebar-listItem" onClick={() => setActiveTab('dictionaries')}>
            <a>
              <img
                src={CustomIcon}
                alt="Dictionaries Icon"
                className="sidebar-listIcon"
              />
              <span className="sidebar-listItemText">Справочники</span>
            </a>
          </li>
          <li className="sidebar-listItem" onClick={() => setActiveTab('flow-editor')}>
            <a>
              <img
                src={CustomIcon}
                alt="Flow Editor Icon"
                className="sidebar-listIcon"
              />
              <span className="sidebar-listItemText">Редактор блок-схем</span>
            </a>
          </li>
          <li className="sidebar-listItem" onClick={() => setActiveTab('workflow')}>
            <a>
              <img
                src={CustomIcon}
                alt="Work Flow Icon"
                className="sidebar-listIcon"
              />
              <span className="sidebar-listItemText">Рабочий поток</span>
            </a>
          </li>
          <li className="sidebar-listItem">
            <a>
              <span className="sidebar-listItemText">Activity</span>
            </a>
          </li>
          <li className="sidebar-listItem">
            <a>
              <span className="sidebar-listItemText">Settings</span>
            </a>
          </li>
        </ul>
        <div className="sidebar-profileSection">
          {isLoading ? (
            <span>Загрузка...</span> // Отображаем состояние загрузки
          ) : userInfo ? (
            <>
              <img
                src="https://assets.codepen.io/3306515/i-know.jpg"
                width="40"
                height="40"
                alt={userInfo.preferred_username}
              />
              <span>{userInfo.preferred_username || "Пользователь"}</span> {/* Отображаем имя пользователя */}
            </>
          ) : (
            <span>Не удалось загрузить информацию о пользователе</span> // Показываем сообщение, если данные не были загружены
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
