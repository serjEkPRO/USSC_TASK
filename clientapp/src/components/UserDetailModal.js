import React from 'react';
import '../styles/UserDetailModal.css';

const UserDetailModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Детали пользователя</h2>
        <p>ID: {user.id}</p>
        <p>Имя: {user.name}</p>
        <p>Возраст: {user.age}</p>
        <p>Город: {user.city}</p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default UserDetailModal;
