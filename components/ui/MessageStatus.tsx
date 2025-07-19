import React from 'react';
import { ICONS } from '../../constants';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  className?: string;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, className = '' }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>;
      case 'sent':
        return <div className="w-3 h-3 text-slate-400">{ICONS.check}</div>;
      case 'delivered':
        return <div className="w-3 h-3 text-blue-500">{ICONS.checkDouble}</div>;
      case 'read':
        return <div className="w-3 h-3 text-green-500">{ICONS.checkDouble}</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center justify-end ${className}`}>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatus;