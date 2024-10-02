import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './components/App';
import IncidentManagement from './components/IncidentManagement';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/incident-management" element={<IncidentManagement />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
