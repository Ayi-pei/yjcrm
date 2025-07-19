import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  userName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible, userName = "对方" }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-3 my-2 animate-fade-in">
      <div className="flex items-center space-x-1 bg-slate-200 rounded-full px-4 py-2">
        <span className="text-xs text-slate-600">{userName} 正在输入</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;