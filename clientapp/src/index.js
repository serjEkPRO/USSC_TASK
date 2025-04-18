import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './components/App';
import IncidentManagement from './components/IncidentManagement';
import KeycloakProvider from './components/KeycloakProvider'; // Импортируем KeycloakProvider
import './styles/index.css';
import LoginForm from './components/LoginForm';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(

    
      <Router>
        <KeycloakProvider> {/* Оборачиваем приложение в KeycloakProvider */}
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/incident-management" element={<IncidentManagement />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
        </KeycloakProvider>
      </Router>
    

);
