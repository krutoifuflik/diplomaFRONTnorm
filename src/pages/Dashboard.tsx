import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import MainContent from '../components/Layout/MainContent';
import { LoginModal } from '../components/Auth/LoginModal';

const Dashboard: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Header onLoginClick={() => setShowLoginModal(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default Dashboard;