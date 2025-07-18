
import React, { useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';

const AgentManagement: React.FC = () => {
    const { agents, fetchDashboardData, isLoading } = useAdminStore();

    useEffect(() => {
      fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Agent Management</h1>
             {isLoading && <p>Loading agents...</p>}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Agent</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Share ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full" src={agent.avatarUrl} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">{agent.name}</div>
                                            <div className="text-sm text-slate-500">{agent.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        agent.status === 'online' ? 'bg-green-100 text-green-800' : 
                                        agent.status === 'offline' ? 'bg-slate-100 text-slate-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {agent.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{agent.currentSessions} / {agent.maxSessions}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{agent.shareId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 text-center text-slate-500">
                <p>Full agent CRUD functionality is planned for a future update.</p>
            </div>
        </div>
    );
};

export default AgentManagement;
