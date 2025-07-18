import React, { useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { ICONS } from '../../constants';
import { type Agent, type Key } from '../../types';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {React.cloneElement(icon, { className: "h-6 w-6 text-white" })}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { agents, keys, fetchDashboardData, isLoading } = useAdminStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activeKeys = keys.filter(k => k.status === 'active').length;
  const onlineAgents = agents.filter(a => a.status === 'online').length;

  if (isLoading && !agents.length && !keys.length) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Agents" value={agents.length} icon={ICONS.agents} color="bg-sky-500" />
        <StatCard title="Online Agents" value={onlineAgents} icon={ICONS.agents} color="bg-green-500" />
        <StatCard title="Total Keys" value={keys.length} icon={ICONS.keys} color="bg-indigo-500" />
        <StatCard title="Active Keys" value={activeKeys} icon={ICONS.activate} color="bg-amber-500" />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Recent Agents</h2>
          <AgentList agents={agents.slice(0, 5)} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Recent Keys</h2>
          <KeyList keys={keys.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
};

const AgentList: React.FC<{agents: Agent[]}> = ({ agents }) => (
  <ul className="divide-y divide-slate-200">
    {agents.map(agent => (
      <li key={agent.id} className="py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img className="h-10 w-10 rounded-full" src={agent.avatarUrl} alt={agent.name} />
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900">{agent.name}</p>
            <p className="text-sm text-slate-500">Max Sessions: {agent.maxSessions}</p>
          </div>
        </div>
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          agent.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
        }`}>
          {agent.status}
        </span>
      </li>
    ))}
  </ul>
);

const KeyList: React.FC<{keys: Key[]}> = ({ keys }) => (
    <ul className="divide-y divide-slate-200">
      {keys.map(key => (
        <li key={key.id} className="py-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-mono text-slate-700 truncate pr-4">{key.keyValue}</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    key.status === 'active' ? 'bg-green-100 text-green-800' : 
                    key.status === 'suspended' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                    {key.status}
                </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{key.note}</p>
        </li>
      ))}
    </ul>
);

export default AdminDashboard;