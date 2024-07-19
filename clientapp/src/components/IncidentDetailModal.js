import React from 'react';
import '../styles/UserDetailModal.css';

const IncidentDetailModal = ({ isOpen, onClose, incident }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Детали инцидента</h2>
        <p><strong>ID:</strong> {incident.id}</p>
        <p><strong>Организация:</strong> {incident.organization_id}</p>
        <p><strong>Категория:</strong> {incident.category_id}</p>
        <p><strong>Тип:</strong> {incident.type_id}</p>
        <p><strong>Создатель:</strong> {incident.creator}</p>
        <p><strong>Ответственный:</strong> {incident.responsible}</p>
        <p><strong>Свидетельства (имя файла):</strong> {incident.evidence_name}</p>
        <p><strong>Свидетельства (ссылка):</strong> {incident.evidence_link}</p>
        <p><strong>Дата создания:</strong> {incident.created_at}</p>
        <p><strong>Дата изменения:</strong> {incident.updated_at}</p>
        <p><strong>Статус:</strong> {incident.status}</p>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
