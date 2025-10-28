import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import ChatInput from './ChatInput';
import MessageComponent from './Message';
import QuickReply from './QuickReply';

const LoadingIndicator: React.FC = () => (
    <div className="flex items-start my-4 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center mr-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-300">
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.15l-2.215 2.215a.656.656 0 0 1-.928 0L9.42 17.52a.39.39 0 0 0-.297-.15 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
            </svg>
        </div>
        <div className="max-w-md px-4 py-3 rounded-2xl bg-slate-700 text-slate-200 rounded-tl-none">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      text: 'Xin chào! Tôi là trợ lý ảo của Tổng Kho Mã Vạch. Tôi có thể giúp bạn tìm hiểu về các sản phẩm như máy quét, máy in mã vạch, và nhiều hơn nữa. Bạn cần tư vấn về vấn đề gì ạ?',
      sender: Sender.Bot,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = ['Báo giá sản phẩm', 'Thông tin công ty', 'Sản phẩm nổi bật'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (messageText: string) => {
    if (showQuickReplies) {
      setShowQuickReplies(false);
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: Sender.User,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const { text, sources, imageUrl } = await getChatbotResponse(messageText);

    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      text: text,
      sender: Sender.Bot,
      sources,
      imageUrl,
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 shadow-2xl rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
      <div className="p-4 bg-slate-900 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white text-center">Tư Vấn Viên Tổng Kho Mã Vạch</h1>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map(msg => (
          <MessageComponent key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      {showQuickReplies && !isLoading && (
        <QuickReply replies={quickReplies} onReplyClick={handleSendMessage} />
      )}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;