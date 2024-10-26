import React, { useEffect, useState, createContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../components/keycloak';
import Cookies from 'js-cookie';
import LoginForm from '../components/LoginForm';

export const KeycloakContext = createContext(null);

const KeycloakProvider = ({ children }) => {
  const [keycloakAuthenticated, setKeycloakAuthenticated] = useState(false);
  const [kcInitialized, setKcInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false); // Флаг загрузки userInfo
  const navigate = useNavigate();

  // Функция для получения информации о пользователе
  const fetchUserInfo = useCallback(async () => {
    const token = Cookies.get('kcToken');
    if (!token) return;

    try {
      const userInfoResponse = await fetch(
        'http://localhost:8080/realms/soar-master-realm/protocol/openid-connect/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (userInfoResponse.ok) {
        const userInfoData = await userInfoResponse.json();
        setUserInfo(userInfoData);
        setIsUserInfoLoaded(true); // Флаг, что данные загружены
      } else {
        console.warn('Failed to fetch user info: Unauthorized. Retrying after token refresh...');
        await handleTokenRefresh(); // Обновляем токен при ошибке
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      clearSession();
    }
  }, []);

  // Функция для обновления токена, если требуется
  const handleTokenRefresh = async () => {
    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        Cookies.set('kcToken', keycloak.token, { expires: 1 });
        Cookies.set('kcRefreshToken', keycloak.refreshToken, { expires: 1 });
        fetchUserInfo(); // Повторный вызов после обновления токена
      } else {
        clearSession();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearSession();
    }
  };

  // Инициализация Keycloak
  const initializeKeycloak = useCallback(async () => {
    if (kcInitialized) return;

    const storedToken = Cookies.get('kcToken');
    const storedRefreshToken = Cookies.get('kcRefreshToken');

    if (storedToken && storedRefreshToken) {
      keycloak.token = storedToken;
      keycloak.refreshToken = storedRefreshToken;
      setKeycloakAuthenticated(true);
      setKcInitialized(true);
      fetchUserInfo(); // Загружаем информацию пользователя
    } else {
      setKcInitialized(true); // Позволяет отображать форму, если нет токенов
    }
  }, [kcInitialized, fetchUserInfo]);

  useEffect(() => {
    initializeKeycloak();
  }, [initializeKeycloak]);

  // Очистка данных сессии
  const clearSession = () => {
    Cookies.remove('kcToken');
    Cookies.remove('kcRefreshToken');
    setKeycloakAuthenticated(false);
    setUserInfo(null);
    setIsUserInfoLoaded(false); // Сбрасываем флаг загрузки данных пользователя
    navigate('/login');
  };

  // Функция для обработки успешного входа через LoginForm
  const handleSuccessfulLogin = useCallback(async () => {
    const storedToken = Cookies.get('kcToken');
    if (storedToken) {
      setKeycloakAuthenticated(true);
      setKcInitialized(true); // Устанавливаем инициализацию в true
      await fetchUserInfo(); // Загружаем информацию пользователя после входа
      navigate('/'); // Перенаправляем на главную страницу
    }
  }, [fetchUserInfo, navigate]);

  // Если не инициализировано или данные пользователя не загружены, показываем форму
  if (!kcInitialized) {
    return <div>Loading...</div>;
  }

  if (!keycloakAuthenticated) {
    return <LoginForm onLogin={handleSuccessfulLogin} />; // Передаем handleSuccessfulLogin
  }

  return (
    <KeycloakContext.Provider value={{ keycloakAuthenticated, userInfo, kcInitialized }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;
