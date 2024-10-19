import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Импортируем библиотеку для работы с cookies

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/realms/soar-master-realm/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grant_type': 'password',
          'client_id': 'soar-master',
          'username': username,
          'password': password,
          'scope': 'openid profile'  // Убедитесь, что 'openid' включен
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен и refresh токен в cookies
        Cookies.set('kcToken', data.access_token, { expires: 1 });
        Cookies.set('kcRefreshToken', data.refresh_token, { expires: 1 });

        // Перенаправляем на основную страницу
        navigate('/');
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      console.error('Ошибка при аутентификации:', err);
      setError('Ошибка при аутентификации');
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;
