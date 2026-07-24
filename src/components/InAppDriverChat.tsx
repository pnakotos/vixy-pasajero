import React, { useState } from 'react';
import { Driver, ChatMessage } from '../types';
import { QUICK_DRIVER_CHATS } from '../data/mockData';
import { Send, X, MessageSquare, CheckCheck, UserCheck } from 'lucide-react';

interface InAppDriverChatProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const InAppDriverChat: React.FC<InAppDriverChatProps> = ({
  isOpen,
  onClose,
  driver,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickSend = (quickMsg: string) => {
    onSendMessage(quickMsg);
  };

  return (
    <div className="fixed inset-0 z-[2500] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-lg h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-slate-800 p-3.5 px-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={driver.photoUrl}
                alt={driver.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-slate-900"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-white">
                {driver.name} {driver.lastName}
              </h3>
              <p className="text-[10px] text-slate-300">
                {driver.vehicleModel} • Placa <strong className="text-amber-400 font-mono">{driver.vehiclePlate}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-700/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
          <div className="text-center py-2">
            <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
              🔒 Chat cifrado de extremo a extremo VeloX
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1 flex items-center gap-1">
                  {msg.timestamp} {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Canned Messages Bar */}
        <div className="bg-slate-800/90 p-2 border-t border-slate-700 overflow-x-auto flex gap-1.5 scrollbar-none">
          {QUICK_DRIVER_CHATS.map((qc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickSend(qc)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-600 transition active:scale-95"
            >
              {qc}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje al conductor..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2.5 rounded-2xl font-bold transition active:scale-95 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
