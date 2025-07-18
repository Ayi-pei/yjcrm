
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { ICONS } from '../../constants';
import AdminDashboard from '../admin/AdminDashboard';
import KeyManagement from '../admin/KeyManagement';
import AgentManagement from '../admin/AgentManagement';

const AdminPage: React.FC = () => {
  const adminNavItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: ICONS.dashboard },
    { path: '/admin/keys', name: 'Key Management', icon: ICONS.keys },
    { path: '/admin/agents', name: 'Agent Management', icon: ICONS.agents },
  ];

  return (
    <div className="flex h-screen bg-slate-200">
      <Sidebar navItems={adminNavItems} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="keys" element={<KeyManagement />} />
            <Route path="agents" element={<AgentManagement />} />
            <Route path="/" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
