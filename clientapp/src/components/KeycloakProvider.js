import React, { useEffect, useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../components/keycloak';
import Cookies from 'js-cookie'; // Подключаем библиотеку для работы с cookies

export const KeycloakContext = createContext(null);

const KeycloakProvider = ({ children }) => {
  const [keycloakAuthenticated, setKeycloakAuthenticated] = useState(false);
  const [kcInitialized, setKcInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // Сохраняем информацию о пользователе
  const navigate = useNavigate(); // для перенаправления

  useEffect(() => {
    const initKeycloak = async () => {
<<<<<<< HEAD
      if (kcInitialized || keycloak.authenticated) {
        console.log('Keycloak already initialized or authenticated.');
        return;
      }

      console.log('Initializing Keycloak...');

      const storedToken = Cookies.get('kcToken');
      const storedRefreshToken = Cookies.get('kcRefreshToken');

      if (storedToken && storedRefreshToken) {
        keycloak.token = storedToken;
        keycloak.refreshToken = storedRefreshToken;

        // Проверка сессии пользователя через Keycloak
        try {
          const userInfoResponse = await fetch(
            'http://localhost:8080/realms/soar-master-realm/protocol/openid-connect/userinfo',
            {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
              },
            }
          );

          if (userInfoResponse.ok) {
            const userInfoData = await userInfoResponse.json(); // Получаем данные пользователя
            console.log('Session is valid, user info:', userInfoData);
            setKeycloakAuthenticated(true);
            setUserInfo(userInfoData); // Сохраняем данные пользователя
            setKcInitialized(true);
            navigate('/'); // Перенаправляем на главную страницу
            return;
          } else {
            console.log('Session invalid, clearing session.');
            clearSession();
          }
        } catch (error) {
          console.error('Failed to fetch userinfo:', error);
          clearSession();
        }
      }

      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        });

        if (authenticated) {
          Cookies.set('kcToken', keycloak.token, { expires: 1 });
          Cookies.set('kcRefreshToken', keycloak.refreshToken, { expires: 1 });
          setKeycloakAuthenticated(true);
          setKcInitialized(true);
          navigate('/');
        } else {
          clearSession();
        }
=======
      // Проверяем, инициализирован ли Keycloak и есть ли токен
      const token = Cookies.get('kcToken');
      const refreshToken = Cookies.get('kcRefreshToken');
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f

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
<<<<<<< HEAD
    setUserInfo(null); // Очищаем данные пользователя при выходе
    navigate('/login');
=======
    setKcInitialized(false);
    keycloak.initialized = false;
    navigate('/login'); // Перенаправляем на страницу логина
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f
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
<<<<<<< HEAD
    const intervalId = setInterval(checkTokenValidity, 300000);
    return () => clearInterval(intervalId);
=======
    const intervalId = setInterval(checkTokenValidity, 300000); // Проверка токена каждые 5 минут
    return () => clearInterval(intervalId); // Очищаем интервал при размонтировании компонента
>>>>>>> 6e5fd227dbb3621da3e81531eaab50ace63c450f
  }, []);

  if (!kcInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <KeycloakContext.Provider value={{ keycloakAuthenticated, keycloak, userInfo }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;
