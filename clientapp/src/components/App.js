import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import CreateIncidentModal from '../components/CreateIncidentModal'; 
import IncidentDetailModal from '../components/IncidentDetailModal';
import IncidentsTable from '../components/IncidentsTable'; 
import BackgroundAnimation from '../components/BackgroundAnimation'; 
import IncidentManagement from '../components/IncidentManagement';
import DictionaryManagement from '../components/DictionaryManagement';

import '../styles/App.css';
import '../styles/UsersTable.css';
import '../styles/BackgroundAnimation.css'; 

function App() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openDetailModal = (incident) => {
    if (incident) {
      setSelectedIncident(incident);
      setIsDetailModalOpen(true);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedIncident(null);
  };

  const handleCreateIncident = async (incident) => {
    const response = await fetch('http://127.0.0.1:5000/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });

    if (response.ok) {
      // вызовите функцию обновления списка инцидентов12345123
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`App ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar setActiveTab={setActiveTab} toggleSidebar={toggleSidebar} /> {/* Передаем функцию для установки активной вкладки */}
      <BackgroundAnimation /> 
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {activeTab === 'incidents' && (
          <>
            <IncidentsTable 
              onIncidentClick={openDetailModal}
              onCreateIncidentClick={openCreateModal}
              isSidebarCollapsed={isSidebarCollapsed}
            /> 
          </>
        )}

        {activeTab === 'incident-management' && (
          <IncidentManagement />
        )}

        {activeTab === 'dictionaries' && (
          <DictionaryManagement /> 
        )}

        <CreateIncidentModal 
          isOpen={isCreateModalOpen} 
          onClose={closeCreateModal} 
          onCreate={handleCreateIncident} 
        />
        {selectedIncident && (
          <IncidentDetailModal 
            isOpen={isDetailModalOpen} 
            onClose={closeDetailModal} 
            incident={selectedIncident} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
