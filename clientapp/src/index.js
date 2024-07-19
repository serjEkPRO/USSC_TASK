import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './components/App';
import IncidentManagement from './components/IncidentManagement';

import './styles/index.css';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/incident-management" element={<IncidentManagement />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);
