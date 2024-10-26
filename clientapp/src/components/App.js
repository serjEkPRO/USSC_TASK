import React, { useState, useContext, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';

import IncidentsTable from '../components/IncidentsTable';
import BackgroundAnimation from '../components/BackgroundAnimation';
import IncidentManagement from '../components/IncidentManagement';
import DictionaryManagement from '../components/DictionaryManagement';
import IncidentDetailModal from '../components/IncidentDetailModal';
import CreateIncidentModal from '../components/CreateIncidentModal';
import WorkFlow from '../components/WorkFlow';
import { KeycloakContext } from '../components/KeycloakProvider'; 
import LoginForm from '../components/LoginForm';

import '../styles/App.css';
import '../styles/BackgroundAnimation.css';

function App() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const { userInfo, kcInitialized } = useContext(KeycloakContext);
  const userId = userInfo?.sub; // Получаем userId из userInfo
  
  useEffect(() => {
    const token = Cookies.get('kcToken');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("Переданный userId из App:", userId);
    }
  }, [userId]);

  const handleLogin = (token) => {
    setAuthenticated(true);
  };

  // Если аутентификация не завершена, показываем только загрузку
  if (!kcInitialized) {
    return <p>Загрузка...</p>;
  }

  // Если не аутентифицирован, показываем форму входа
  if (!authenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const openDetail = (incidentId) => {
    if (incidentId) {
      setSelectedIncidentId(incidentId);
    }
  };

  const closeDetail = () => {
    setSelectedIncidentId(null);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateIncident = async (incident) => {
    const token = Cookies.get('kcToken');

    const response = await fetch('http://127.0.0.1:5000/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(incident),
    });

    if (response.ok) {
      // Обновляем список инцидентов
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`App ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar setActiveTab={setActiveTab} toggleSidebar={toggleSidebar} userId={userId} />
      <BackgroundAnimation />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
        {activeTab === 'incidents' && (
          <>
            <IncidentsTable
              onIncidentClick={openDetail}
              onCreateIncidentClick={openCreateModal}
              isSidebarCollapsed={isSidebarCollapsed}
              userId={userId} // Передаем только userId в IncidentsTable
            />
            {selectedIncidentId && (
              <IncidentDetailModal
                incidentId={selectedIncidentId}
                onClose={closeDetail}
              />
            )}
          </>
        )}

        {activeTab === 'incident-management' && <IncidentManagement />}
        {activeTab === 'dictionaries' && <DictionaryManagement />}
        {activeTab === 'workflow' && <WorkFlow />}

        <CreateIncidentModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onCreate={handleCreateIncident}
        />
      </div>
    </div>
  );
}

export default App;
