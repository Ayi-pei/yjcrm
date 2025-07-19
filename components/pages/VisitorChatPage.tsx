import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/mockApi";
import {
  type Agent,
  type Customer,
  type ChatSession,
  type ChatMessage,
} from "../../types";
import { APP_NAME, ICONS } from "../../constants";
import Button from "../ui/Button";

const VisitorChatPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      if (!shareId) {
        setError("无效的聊天链接");
        setIsLoading(false);
        return;
      }
      try {
        const { agent, customer, session, messages } =
          await api.getVisitorChatData(shareId);
        setAgent(agent);
        setCustomer(customer);
        setSession(session);
        setMessages(messages);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "无法启动聊天会话";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, [shareId]);

  // 优化轮询机制
  useEffect(() => {
    if (!session) return;

    const pollMessages = async () => {
      try {
        const newMessages = await api.getNewMessages(
          session.id,
          messages.length
        );
        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages]);
        }
      } catch (err) {
        console.error("获取消息失败:", err);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [session, messages.length]);

  // 智能滚动控制
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const element = messagesContainerRef.current;
    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setIsAtBottom(atBottom);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session || !customer || isSending) return;

    setIsSending(true);
    try {
      const sentMessage = await api.sendMessage(
        session.id,
        customer.id,
        "customer",
        newMessage
      );
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
    } catch (err) {
      setError("发送消息失败，请重试");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        {React.cloneElement(ICONS.spinner, {
          className: "h-12 w-12 text-sky-500",
        })}
        <p className="text-slate-600 mt-4">正在连接客服...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
        <div className="bg-red-100 rounded-full p-3 mb-4">
          {React.cloneElement(ICONS.close, {
            className: "h-10 w-10 text-red-500",
          })}
        </div>
        <h1 className="text-2xl font-bold text-red-600">连接失败</h1>
        <p className="text-slate-600 mt-2">{error || "未找到客服人员"}</p>
        <p className="text-slate-500 mt-4 text-sm max-w-md">
          请检查您的聊天链接或联系技术支持
        </p>
        <button
          className="mt-6 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
          onClick={() => window.location.reload()}
        >
          重试连接
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
      <div className="w-full max-w-lg h-[80vh] flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-4 bg-sky-600 text-white">
          <img
            className="h-12 w-12 rounded-full object-cover border-2 border-white"
            src={agent.avatarUrl}
            alt={agent.name}
            onError={(e) =>
              (e.currentTarget.src = "https://via.placeholder.com/48")
            }
          />
          <div className="ml-4">
            <p className="font-bold text-lg">与 {agent.name} 对话</p>
            <div className="flex items-center mt-1">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2"></span>
              <p className="text-xs opacity-90">在线中 • {APP_NAME}</p>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-6 overflow-y-auto bg-slate-50"
        >
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-sky-200 mb-4">
                {React.cloneElement(ICONS.chat, { className: "h-16 w-16" })}
              </div>
              <p className="text-slate-400">开始与 {agent.name} 对话</p>
              <p className="text-slate-300 text-sm mt-2">
                在下方输入消息开始聊天
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <VisitorMessageItem key={msg.id} message={msg} agent={agent} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息..."
              className="flex-1 block w-full rounded-full border border-slate-300 px-4 py-3 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              disabled={isSending}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!newMessage.trim() || isSending}
              className="rounded-full w-12 h-12 flex items-center justify-center"
            >
              {isSending ? ICONS.spinner : ICONS.send}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const VisitorMessageItem: React.FC<{ message: ChatMessage; agent: Agent }> = ({
  message,
  agent,
}) => {
  const isVisitor = message.senderType === "customer";

  if (message.senderType === "system") {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center">
          {React.cloneElement(
            ICONS.info || (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-500 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            { className: "h-4 w-4 text-slate-500 mr-1" }
          )}
          <span className="text-xs text-slate-500">{message.content}</span>
          <span className="ml-2 text-slate-400 text-xxs">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  }

  const bubbleColor = isVisitor
    ? "bg-slate-200 text-slate-800 rounded-br-none"
    : "bg-sky-600 text-white rounded-bl-none";

  const alignment = isVisitor ? "justify-end" : "justify-start";

  return (
    <div className={`flex my-3 ${alignment}`}>
      {!isVisitor && (
        <img
          className="h-8 w-8 rounded-full object-cover mt-1 mr-2"
          src={agent.avatarUrl}
          alt={agent.name}
          onError={(e) =>
            (e.currentTarget.src = "https://via.placeholder.com/32")
          }
        />
      )}

      <div className="max-w-[75%]">
        <div className={`py-2.5 px-4 rounded-2xl ${bubbleColor}`}>
          <p className="text-sm">{message.content}</p>
        </div>
        <div
          className={`text-xs text-slate-500 mt-1 ${
            isVisitor ? "text-right" : "text-left"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default VisitorChatPage;