import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import IncidentsTable from '../components/IncidentsTable';
import BackgroundAnimation from '../components/BackgroundAnimation';
import IncidentManagement from '../components/IncidentManagement';
import DictionaryManagement from '../components/DictionaryManagement';
import IncidentDetailModal from '../components/IncidentDetailModal';
import CreateIncidentModal from '../components/CreateIncidentModal';
import WorkFlow from '../components/WorkFlow'; // Импортируем новый компонент

import '../styles/App.css';

import '../styles/BackgroundAnimation.css';

function App() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    const response = await fetch('http://127.0.0.1:5000/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });

    if (response.ok) {
      // call a function to update the incidents list
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`App ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar setActiveTab={setActiveTab} toggleSidebar={toggleSidebar} />
      <BackgroundAnimation />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
        {activeTab === 'incidents' && (
          <>
            <IncidentsTable
              onIncidentClick={openDetail}
              onCreateIncidentClick={openCreateModal}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            {selectedIncidentId && (
              <IncidentDetailModal
                incidentId={selectedIncidentId}
                onClose={closeDetail}
              />
            )}
          </>
        )}

        {activeTab === 'incident-management' && (
          <IncidentManagement />
        )}

        {activeTab === 'dictionaries' && (
          <DictionaryManagement />
        )}

        {activeTab === 'workflow' && (
          <WorkFlow />
        )}

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
