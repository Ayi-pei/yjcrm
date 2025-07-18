
import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../../stores/agentStore';
import { type ChatSession, type Agent, type Customer, type ChatMessage } from '../../types';
import { ICONS } from '../../constants';
import Button from '../ui/Button';
import FileUploadModal from './FileUploadModal';


interface ChatWindowProps {
  session: ChatSession;
  agent: Agent;
  customer: Customer;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ session, agent, customer }) => {
  const { messages, sendMessage } = useAgentStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  const sessionMessages = messages
    .filter(m => m.sessionId === session.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [sessionMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(session.id, agent.id, newMessage);
      setNewMessage('');
    }
  };
  
  const handleFileUpload = (file: File) => {
     sendMessage(session.id, agent.id, `File uploaded: ${file.name}`, 'file');
  };


  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-200">
        <img className="h-10 w-10 rounded-full object-cover" src={customer.avatarUrl} alt={customer.name} />
        <div className="ml-3">
          <p className="font-semibold text-slate-800">{customer.name}</p>
          <p className="text-xs text-slate-500">{customer.isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
        {sessionMessages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} agent={agent} customer={customer} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => setUploadModalOpen(true)}>{ICONS.attach}</Button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          />
          <Button type="submit" variant="primary" size="md" disabled={!newMessage.trim()}>{ICONS.send}</Button>
        </form>
      </div>
      <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleFileUpload} />
    </div>
  );
};


const ChatMessageItem: React.FC<{message: ChatMessage; agent: Agent; customer: Customer}> = ({ message, agent, customer }) => {
    const isAgent = message.senderType === 'agent';
    const isSystem = message.senderType === 'system';
    
    if (isSystem) {
        return (
             <div className="text-center my-4">
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{message.content}</span>
            </div>
        )
    }

    const sender = isAgent ? agent : customer;
    const alignment = isAgent ? 'justify-end' : 'justify-start';
    const bubbleColor = isAgent ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 shadow-sm';

    return (
        <div className={`flex items-end gap-3 my-2 ${alignment}`}>
            {!isAgent && <img src={sender.avatarUrl} alt={sender.name} className="h-8 w-8 rounded-full" />}
            <div className={`max-w-md p-3 rounded-lg ${bubbleColor}`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 opacity-70 ${isAgent ? 'text-right' : 'text-left'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {isAgent && <img src={sender.avatarUrl} alt={sender.name} className="h-8 w-8 rounded-full" />}
        </div>
    )
}

export default ChatWindow;
