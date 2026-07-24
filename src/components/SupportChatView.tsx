import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, Headset, X, Sparkles, CheckCheck } from 'lucide-react';

interface SupportChatViewProps {
  initialTripId?: string;
  onClose?: () => void;
}

export const SupportChatView: React.FC<SupportChatViewProps> = ({ initialTripId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sup_1',
      sender: 'support',
      text: initialTripId
        ? `¡Hola! Veo que consultas por el viaje ${initialTripId}. Soy VeloX Bot 24/7. ¿En qué podemos ayudarte (reporte de pago, objeto olvidado o conductor)?`
        : '¡Hola! Soy VeloX Bot, tu soporte técnico 24/7. ¿En qué puedo ayudarte hoy con tu servicio de Moto, Auto, Delivery o Billetera en Venezuela?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: inputMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputMsg;
    setInputMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: messages.map(m => ({ sender: m.sender === 'user' ? 'Usuario' : 'Soporte', text: m.text })),
        }),
      });

      const data = await response.json();
      const botReply: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'support',
        text: data.reply || 'Gracias por tu mensaje. Un operador de VeloX ha tomado tu solicitud.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      const fallbackReply: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'support',
        text: 'Hemos registrado tu reporte. Para emergencias con pagos por Pago Móvil o Zinli, puedes adjuntar tu comprobante directamente en Billetera > Verificación.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl h-[600px] shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto">
      
      {/* Support Chat Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold shadow-md">
            <Headset className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-white">Soporte Técnico VeloX 24/7</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.2 rounded-full font-bold">En línea</span>
            </div>
            <p className="text-[10px] text-slate-400">Asistencia Inteligente & Agentes en Vivo en Venezuela</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/80">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mb-1">
                    <Sparkles className="w-3 h-3" /> VeloX Support AI
                  </div>
                )}
                <p>{msg.text}</p>
              </div>
              <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-slate-800 p-3 rounded-2xl w-fit border border-slate-700">
            <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span>VeloX Bot escribiendo respuesta...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Escribe tu consulta sobre pagos, viajes o conductor..."
          className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl font-bold transition active:scale-95 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
