import React, { useEffect, useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../components/keycloak';
import Cookies from 'js-cookie'; // Подключаем библиотеку для работы с cookies

export const KeycloakContext = createContext(null);

const KeycloakProvider = ({ children }) => {
  const [keycloakAuthenticated, setKeycloakAuthenticated] = useState(false);
  const [kcInitialized, setKcInitialized] = useState(false);
  const navigate = useNavigate(); // для перенаправления

  useEffect(() => {
    const initKeycloak = async () => {
      // Проверяем, инициализирован ли Keycloak и есть ли токен
      const token = Cookies.get('kcToken');
      const refreshToken = Cookies.get('kcRefreshToken');

      if (token && refreshToken) {
        keycloak.token = token;
        keycloak.refreshToken = refreshToken;
        keycloak.authenticated = true;
        setKeycloakAuthenticated(true);
        setKcInitialized(true);
        keycloak.initialized = true; // Флаг инициализации
      } else {
        console.log('Пользователь не авторизован');
        navigate('/login'); // Перенаправляем на страницу логина
      }
    };

    initKeycloak();
  }, [navigate]);

  const clearSession = () => {
    console.log('Очистка сессии и перенаправление на страницу логина...');
    Cookies.remove('kcToken');
    Cookies.remove('kcRefreshToken');
    setKeycloakAuthenticated(false);
    setKcInitialized(false);
    keycloak.initialized = false;
    navigate('/login'); // Перенаправляем на страницу логина
  };

  const checkTokenValidity = async () => {
    try {
      if (keycloak.token) {
        const refreshed = await keycloak.updateToken(60);
        if (refreshed) {
          Cookies.set('kcToken', keycloak.token, { expires: 1 });
          Cookies.set('kcRefreshToken', keycloak.refreshToken, { expires: 1 });
        } else if (!keycloak.authenticated) {
          clearSession();
        }
      } else {
        clearSession();
      }
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      clearSession();
    }
  };

  useEffect(() => {
    const intervalId = setInterval(checkTokenValidity, 300000); // Проверка токена каждые 5 минут
    return () => clearInterval(intervalId); // Очищаем интервал при размонтировании компонента
  }, []);

  if (!kcInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <KeycloakContext.Provider value={{ keycloakAuthenticated, keycloak }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;
