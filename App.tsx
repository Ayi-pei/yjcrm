import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import LoginPage from './components/pages/LoginPage';
import AdminPage from './components/pages/AdminPage';
import AgentPage from './components/pages/AgentPage';
import VisitorChatPage from './components/pages/VisitorChatPage';
import NotFoundPage from './components/pages/NotFoundPage';

const App: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role.name;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={role === 'admin' ? '/admin' : '/agent'} replace />} />
        <Route path="/chat/:shareId" element={<VisitorChatPage />} />
        
        <Route path="/admin/*" element={role === 'admin' ? <AdminPage /> : <Navigate to="/login" replace />} />
        <Route path="/agent/*" element={role === 'agent' ? <AgentPage /> : <Navigate to="/login" replace />} />

        <Route path="/" element={<Navigate to={user ? (role === 'admin' ? '/admin' : '/agent') : '/login'} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
