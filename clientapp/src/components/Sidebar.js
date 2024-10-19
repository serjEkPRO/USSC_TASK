<<<<<<< HEAD
import React, { useState, useContext } from 'react';
import { KeycloakContext } from '../components/KeycloakProvider'; // Импортируем контекст Keycloak
=======
import React, { useState, useEffect, useContext } from 'react';
import { KeycloakContext } from '../components/KeycloakProvider'; // Импортируем контекст Keycloak
import Cookies from 'js-cookie'; // Для работы с куки
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f
import '../styles/Sidebar.scss';
import CustomIcon from '../assets/12197372.png'; // Путь к вашей иконке

const Sidebar = ({ setActiveTab, toggleSidebar }) => {
  const [isShrinkView, setIsShrinkView] = useState(false);
<<<<<<< HEAD
  const { userInfo } = useContext(KeycloakContext); // Получаем данные пользователя из контекста
=======
  const { keycloakAuthenticated, keycloak } = useContext(KeycloakContext); // Доступ к keycloak и статусу аутентификации
  const [userInfo, setUserInfo] = useState(null); // Состояние для хранения информации о пользователе
  const [isLoading, setIsLoading] = useState(true); // Состояние для отслеживания загрузки

  // Загрузка информации о пользователе
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (keycloakAuthenticated) {
        try {
          console.log('Загрузка информации о пользователе...');
          const info = await keycloak.loadUserInfo();
          console.log('Информация о пользователе:', info);
          setUserInfo(info); // Сохраняем данные пользователя
        } catch (error) {
          console.error('Ошибка загрузки информации о пользователе:', error);
        } finally {
          setIsLoading(false); // Устанавливаем флаг, что загрузка завершена
        }
      }
    };

    fetchUserInfo();
  }, [keycloakAuthenticated, keycloak]);
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f

  const handleSidebarView = () => {
    setIsShrinkView(!isShrinkView);
    toggleSidebar(); // Вызов функции для изменения состояния боковой панели
<<<<<<< HEAD
=======
  };

  // Логика выхода из системы
  const handleLogout = () => {
    if (keycloak && typeof keycloak.logout === 'function') {
      keycloak.logout({
        redirectUri: window.location.origin, // Перенаправление после выхода
      });

      // Очищаем токены из cookies
      Cookies.remove('kcToken');
      Cookies.remove('kcRefreshToken');
    } else {
      console.error('Keycloak не инициализирован или метод logout недоступен');
    }
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f
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
<<<<<<< HEAD
          {userInfo ? (
=======
          {isLoading ? (
            <span>Загрузка...</span> // Показываем состояние загрузки
          ) : userInfo ? (
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f
            <>
              <img
                src="https://assets.codepen.io/3306515/i-know.jpg"
                width="40"
                height="40"
<<<<<<< HEAD
                alt={userInfo.preferred_username}
              />
              <span>{userInfo.preferred_username || "Пользователь"}</span> {/* Отображаем имя пользователя */}
            </>
          ) : (
            <span>Не удалось загрузить информацию о пользователе</span> // Показываем сообщение, если данные не были загружены
          )}
=======
                alt={userInfo.name}
              />
              <span>{userInfo.name}</span> {/* Отображаем реальное имя пользователя */}
            </>
          ) : (
            <span>Ошибка загрузки данных</span> // Показываем сообщение, если данные не были загружены
          )}
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button> {/* Кнопка выхода */}
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
