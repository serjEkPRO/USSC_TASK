import React, { useState, useEffect } from 'react';
import '../styles/IncidentDetailModal.css';

const IncidentDetailModal = ({ incidentId, onClose }) => {
  const [incidentData, setIncidentData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIncidentData = async () => {
      setIsLoading(true);
      setIsVisible(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/incidents/${incidentId}`);
        const data = await response.json();
        setIncidentData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching incident data:', error);
        setIsLoading(false);
      }
    };

    if (incidentId) {
      fetchIncidentData();
    }
  }, [incidentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIncidentData({ ...incidentData, [name]: value });
  };

  return (
    <div className={`incident-detail-container ${isVisible ? 'visible' : ''}`}>
      <div className="incident-detail">
        <button className="close-button" onClick={onClose}>&times;</button>
        {isLoading && (
          <div id="preloader">
            <div className="cube">
              <div className="face front"></div>
              <div className="face back"></div>
              <div className="face left"></div>
              <div className="face right"></div>
              <div className="face top"></div>
              <div className="face bottom"></div>
            </div>
          </div>
        )}
        <div className={`incident-content ${isLoading ? 'loading' : ''}`}>
          <div className="incident-detail-header">
            <h2>Детали инцидента</h2>
            <div className="incident-dates">
              <p><strong>Дата создания:</strong> {incidentData?.created_at || 'Загрузка...'}</p>
              <p><strong>Дата изменения:</strong> {incidentData?.updated_at || 'Загрузка...'}</p>
            </div>
          </div>
          <form>
            {!isLoading && incidentData && Object.keys(incidentData).map((key) => {
              if (key === 'created_at' || key === 'updated_at') {
                return null;
              }

              return (
                <div key={key}>
                  <label><strong>{key}:</strong></label>
                  <input
                    type="text"
                    name={key}
                    value={incidentData[key]}
                    onChange={handleChange}
                    disabled={key === 'id' || key.endsWith('_id')}
                  />
                </div>
              );
            })}
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
