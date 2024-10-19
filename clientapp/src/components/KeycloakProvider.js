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

        setKcInitialized(true);
      } catch (error) {
        console.error('Keycloak initialization error:', error);
        clearSession();
      }
    };

    initKeycloak();
  }, [kcInitialized, navigate]);

  const clearSession = () => {
    console.log('Clearing session and redirecting to login...');
    Cookies.remove('kcToken');
    Cookies.remove('kcRefreshToken');
    setKeycloakAuthenticated(false);
    setUserInfo(null); // Очищаем данные пользователя при выходе
    navigate('/login');
  };

  const checkTokenValidity = async () => {
    try {
      const refreshed = await keycloak.updateToken(60);
      if (refreshed) {
        Cookies.set('kcToken', keycloak.token, { expires: 1 });
        Cookies.set('kcRefreshToken', keycloak.refreshToken, { expires: 1 });
      } else if (!keycloak.authenticated) {
        clearSession();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearSession();
    }
  };

  useEffect(() => {
    const intervalId = setInterval(checkTokenValidity, 300000);
    return () => clearInterval(intervalId);
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
