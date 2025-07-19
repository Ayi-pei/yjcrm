import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../../stores/agentStore';
import { type ChatSession, type Agent, type Customer, type ChatMessage } from '../../types';
import { ICONS } from '../../constants';
import Button from '../ui/Button';
import FileUploadModal from './FileUploadModal';
import TypingIndicator from '../ui/TypingIndicator';
import MessageStatus from '../ui/MessageStatus';
import { designSystem } from '../../styles/design-system';

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
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

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
      
      // Simulate customer typing response
      setTimeout(() => {
        setShowTypingIndicator(true);
        setTimeout(() => setShowTypingIndicator(false), 2000);
      }, 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Simulate typing status
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };
  
  const handleFileUpload = (file: File) => {
     sendMessage(session.id, agent.id, `File uploaded: ${file.name}`, 'file');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Enhanced Header */}
      <div className={`flex items-center p-4 border-b border-slate-200 bg-white ${designSystem.shadows.sm}`}>
        <div className="relative">
          <img className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/20" src={customer.avatarUrl} alt={customer.name} />
          {customer.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="font-semibold text-slate-800">{customer.name}</p>
          <p className="text-xs text-slate-500 flex items-center">
            {customer.isOnline ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-slate-400 rounded-full mr-1"></span>
                Offline
              </>
            )}
            {isTyping && <span className="ml-2 text-blue-500">typing...</span>}
          </p>
        </div>
      </div>

      {/* Enhanced Message List */}
      <div className={`flex-1 p-6 overflow-y-auto ${designSystem.gradients.chat}`}>
        {sessionMessages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} agent={agent} customer={customer} />
        ))}
        <TypingIndicator isVisible={showTypingIndicator} userName={customer.name} />
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className={`p-4 bg-white border-t border-slate-200 ${designSystem.shadows.sm}`}>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => setUploadModalOpen(true)}
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            {ICONS.attach}
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className={`w-full ${designSystem.borderRadius.lg} border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 focus:shadow-md`}
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            size="md" 
            disabled={!newMessage.trim()}
            className="transition-all duration-200"
          >
            {ICONS.send}
          </Button>
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
             <div className="text-center my-4 animate-fade-in">
                <span className="text-xs text-slate-500 bg-slate-200/80 backdrop-blur-sm px-3 py-1 rounded-full">{message.content}</span>
            </div>
        )
    }

    const sender = isAgent ? agent : customer;
    const alignment = isAgent ? 'justify-end' : 'justify-start';
    const bubbleColor = isAgent 
      ? `${designSystem.gradients.primary} text-white ${designSystem.shadows.md}` 
      : `bg-white text-slate-700 ${designSystem.shadows.sm} border border-slate-100`;

    return (
        <div className={`flex items-end gap-3 my-3 ${alignment} animate-fade-in`}>
            {!isAgent && (
              <img 
                src={sender.avatarUrl} 
                alt={sender.name} 
                className="h-8 w-8 rounded-full ring-2 ring-slate-200" 
              />
            )}
            <div className={`max-w-md p-3 ${designSystem.borderRadius.lg} ${bubbleColor} transform transition-all duration-200 hover:scale-105`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className={`flex items-center justify-between mt-2 ${isAgent ? 'text-right' : 'text-left'}`}>
                  <p className={`text-xs opacity-70`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {isAgent && <MessageStatus status="delivered" className="ml-2" />}
                </div>
            </div>
            {isAgent && (
              <img 
                src={sender.avatarUrl} 
                alt={sender.name} 
                className="h-8 w-8 rounded-full ring-2 ring-blue-200" 
              />
            )}
        </div>
    )
}

export default ChatWindow;