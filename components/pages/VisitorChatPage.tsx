
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { type Agent, type Customer, type ChatSession, type ChatMessage } from '../../types';
import { APP_NAME, ICONS } from '../../constants';
import Button from '../ui/Button';

const VisitorChatPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (!shareId) {
        setError('Invalid chat link.');
        setIsLoading(false);
        return;
      }
      try {
        const { agent, customer, session, messages } = await api.getVisitorChatData(shareId);
        setAgent(agent);
        setCustomer(customer);
        setSession(session);
        setMessages(messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start chat session.');
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, [shareId]);

  // Polling for new messages
   useEffect(() => {
    if (!session) return;
    const interval = setInterval(async () => {
        // This is a simplified simulation. A real app would use WebSockets.
        // We are checking the mock DB directly for any new messages.
        const allMessages = (api as any).DB.chatMessages as ChatMessage[];
        const latestSessionMessages = allMessages.filter(m => m.sessionId === session.id);
        if (latestSessionMessages.length > messages.length) {
            setMessages(latestSessionMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        }
    }, 3000);
    return () => clearInterval(interval);
  }, [session, messages.length]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && session && customer) {
      const sentMessage = await api.sendMessage(session.id, customer.id, 'customer', newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center"><p>Connecting to agent...</p></div>;
  }

  if (error || !agent) {
    return <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-2xl font-bold text-red-600">Connection Failed</h1>
        <p className="text-slate-600 mt-2">{error || 'The agent could not be found.'}</p>
        <p className="text-slate-500 mt-4 text-sm">Please check the link or contact support.</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
      <div className="w-full max-w-lg h-[80vh] flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-4 bg-sky-600 text-white">
          <img className="h-12 w-12 rounded-full object-cover border-2 border-white" src={agent.avatarUrl} alt={agent.name} />
          <div className="ml-4">
            <p className="font-bold text-lg">Chat with {agent.name}</p>
            <p className="text-sm opacity-90">{APP_NAME} Support</p>
          </div>
        </div>
        
        {/* Message List */}
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.map(msg => <VisitorMessageItem key={msg.id} message={msg} agent={agent} />)}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            />
            <Button type="submit" variant="primary" size="md" disabled={!newMessage.trim()} className="rounded-full w-12 h-12 flex items-center justify-center">{ICONS.send}</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const VisitorMessageItem: React.FC<{message: ChatMessage; agent: Agent}> = ({ message, agent }) => {
    const isVisitor = message.senderType === 'customer';
     if (message.senderType === 'system') {
        return <div className="text-center my-3"><span className="text-xs text-slate-500">{message.content}</span></div>
    }
    const bubbleColor = isVisitor ? 'bg-slate-200 text-slate-800' : 'bg-sky-600 text-white';
    const alignment = isVisitor ? 'ml-auto' : 'mr-auto';
    return (
        <div className={`flex my-2 max-w-sm ${alignment}`}>
            <div className={`py-2 px-4 rounded-2xl ${bubbleColor}`}>
                <p className="text-sm">{message.content}</p>
            </div>
        </div>
    )
}

export default VisitorChatPage;
