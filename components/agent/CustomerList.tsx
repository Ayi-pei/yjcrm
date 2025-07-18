
import React from 'react';
import { useAgentStore } from '../../stores/agentStore';
import { type ChatSession } from '../../types';

const CustomerList: React.FC = () => {
  const { sessions, customers, messages, activeSessionId, setActiveSessionId } = useAgentStore();

  const getSessionDisplayData = (session: ChatSession) => {
    const customer = customers.find(c => c.id === session.customerId);
    const lastMessage = messages
      .filter(m => m.sessionId === session.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return { customer, lastMessage };
  };

  return (
    <div className="w-80 border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Conversations</h2>
        {/* Search could be added here */}
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.map(session => {
          const { customer, lastMessage } = getSessionDisplayData(session);
          if (!customer) return null;

          const isActive = session.id === activeSessionId;

          return (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-4 flex items-center cursor-pointer border-l-4 ${isActive ? 'bg-sky-50 border-sky-500' : 'border-transparent hover:bg-slate-50'}`}
            >
              <img className="h-12 w-12 rounded-full object-cover" src={customer.avatarUrl} alt={customer.name} />
              <div className="ml-4 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold text-slate-900 truncate">{customer.name}</p>
                  {lastMessage && <p className="text-xs text-slate-400">{new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
                <p className="text-sm text-slate-500 truncate">{lastMessage?.content || 'No messages yet'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerList;
