
import React, { useEffect, useState } from 'react';
import { useAgentStore } from '../../stores/agentStore';
import { useAuthStore } from '../../stores/authStore';
import CustomerList from './CustomerList';
import ChatWindow from './ChatWindow';
import CustomerDetails from './CustomerDetails';
import { type Agent } from '../../types';
import { responsive } from '../../styles/responsive';
import { ICONS } from '../../constants';

const AgentChatInterface: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    fetchAgentData, 
    isLoading, 
    sessions, 
    activeSessionId,
    customers,
  } = useAgentStore();
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>('list');

  useEffect(() => {
    if (user && user.role.name === 'agent') {
      fetchAgentData(user.id);
    }
  }, [user, fetchAgentData]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeCustomer = activeSession ? customers.find(c => c.id === activeSession.customerId) : null;

  if (isLoading && sessions.length === 0) {
    return <div className="flex-1 flex justify-center items-center bg-white"><p>Loading chat sessions...</p></div>;
  }
  
  if (!activeSessionId || !activeSession || !activeCustomer) {
      return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
              <h2 className="text-lg font-semibold">Live Chat</h2>
            </div>
            
            <div className="flex h-full">
                <div className={`${mobileView === 'list' ? 'block' : 'hidden'} md:block`}>
                  <CustomerList />
                </div>
                <div className={`flex-1 ${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-col items-center justify-center bg-slate-50 text-slate-500`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <h2 className="mt-4 text-xl font-semibold">No Active Chat</h2>
                    <p className="text-center px-4">Select a conversation from the list to begin.</p>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        {mobileView === 'chat' && (
          <button
            onClick={() => setMobileView('list')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            {ICONS.arrowLeft}
            <span className="ml-1">Back</span>
          </button>
        )}
        <h2 className="text-lg font-semibold">
          {mobileView === 'list' ? 'Conversations' : 
           mobileView === 'chat' ? activeCustomer.name : 'Details'}
        </h2>
        {mobileView === 'chat' && (
          <button
            onClick={() => setMobileView('details')}
            className="text-blue-600 hover:text-blue-700"
          >
            Details
          </button>
        )}
      </div>

      <div className="flex h-full">
        {/* Customer List - Hidden on mobile when not in list view */}
        <div className={`${mobileView === 'list' ? 'block' : 'hidden'} md:block`}>
          <CustomerList onSelectCustomer={() => setMobileView('chat')} />
        </div>
        
        {/* Chat Window - Hidden on mobile when not in chat view */}
        <div className={`${mobileView === 'chat' ? 'block' : 'hidden'} md:block flex-1`}>
          <ChatWindow session={activeSession} agent={user as Agent} customer={activeCustomer} />
        </div>
        
        {/* Customer Details - Hidden on mobile when not in details view */}
        <div className={`${mobileView === 'details' ? 'block' : 'hidden'} md:block`}>
          <CustomerDetails customer={activeCustomer} onClose={() => setMobileView('chat')} />
        </div>
      </div>
    </div>
  );
};

export default AgentChatInterface;
