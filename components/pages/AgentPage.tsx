
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { ICONS } from '../../constants';
import AgentChatInterface from '../agent/AgentChatInterface';
import AgentSettingsPage from '../agent/AgentSettingsPage';

const AgentPage: React.FC = () => {
  const agentNavItems = [
    { path: '/agent/chat', name: 'Live Chat', icon: ICONS.chat },
    { path: '/agent/settings', name: 'Settings', icon: ICONS.settings },
  ];

  return (
    <div className="flex h-screen bg-slate-200">
      <Sidebar navItems={agentNavItems} />
      <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="chat" element={<AgentChatInterface />} />
            <Route path="settings" element={<AgentSettingsPage />} />
            <Route path="/" element={<Navigate to="chat" replace />} />
          </Routes>
      </main>
    </div>
  );
};

export default AgentPage;
