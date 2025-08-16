import React, { useRef } from "react";

interface Message {
  id: string;
  sender: "assistant" | "user" | "loading";
  name?: string;
  avatarUrl?: string;
  content: string;
  isLoading?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, inputValue, onInputChange, onSend, loading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-[#ff6a00]/30 rounded-2xl p-8 flex flex-col max-w-none w-full mx-auto shadow-2xl h-[600px] min-h-[400px]" style={{ width: "100%" }}>
      {/* Header estilo Preventi Flow */}
      <div className="flex items-center gap-4 mb-6">
  <div className="bg-[#ff6a00]/90 rounded-full w-16 h-16 flex items-center justify-center">
    <svg width="38" height="38" fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24" className="w-10 h-10"><circle cx="12" cy="12" r="11" fill="#ff6a00" stroke="#fff" strokeWidth="1.5"/><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
  </div>
  <div>
    <h2 className="font-bold text-lg text-white leading-tight">Asistente Preventi Flow</h2>
    <span className="text-white/60 text-xs">Siempre listo para ayudarte</span>
  </div>
</div>
      {/* Mensajes */}
      <div className="flex-1 min-h-0 space-y-6 overflow-y-auto pb-2 custom-scrollbar" style={{maxHeight:'100%'}}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "assistant" && (
  <div className="w-12 h-12 rounded-full flex items-center justify-center border border-[#ff6a00]/40 bg-[#ff6a00] text-white font-bold text-lg">
    <svg width="38" height="38" fill="none" stroke="#fff" strokeWidth="1.5" viewBox="0 0 24 24" className="w-10 h-10"><circle cx="12" cy="12" r="11" fill="#ff6a00" stroke="#fff" strokeWidth="1.5"/><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
  </div>
)}
            {msg.sender === "loading" && (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ffae00] flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
              </div>
            )}
            {msg.sender === "user" && (
              msg.avatarUrl ? (
                <img src={msg.avatarUrl} alt="Avatar del usuario" className="w-12 h-12 rounded-full border border-white/30" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/30 bg-[#2563eb] text-white font-bold text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-white"><circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2" fill="#2563eb"/><path d="M4 20c0-4 16-4 16 0" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                </div>
              )
            )}
            <div className="min-w-0 max-w-lg flex items-end gap-2">
              <div className={`mb-1 flex items-center ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "user" && (
  <span className="text-xs font-semibold text-white/80 mr-2">{msg.name}</span>
)}
              </div>
              <div className={`text-white/90 text-base px-5 py-3 ${msg.sender === "user" ? "bg-gradient-to-br from-[#ff6a00]/80 to-[#ffae00]/80 rounded-2xl rounded-br-none shadow-lg" : "bg-white/10 border border-[#ff6a00]/10 rounded-2xl rounded-bl-none shadow"}`} style={{wordBreak:'break-word'}}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="flex-shrink-0 pt-6 sticky bottom-0 bg-white/10 z-10">
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            placeholder="Escriba su consulta aquí"
            className="w-full rounded-lg py-4 pl-4 pr-20 bg-white/10 text-white placeholder-white/60 border border-[#ff6a00]/20 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40 resize-none shadow-inner"
            rows={1}
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            disabled={loading}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !loading && inputValue.trim()) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-[#ff6a00] to-[#ffae00] rounded-full flex items-center justify-center hover:scale-105 hover:brightness-110 transition-all shadow-lg shadow-[#ff6a00]/30"
            onClick={onSend}
            disabled={loading || !inputValue.trim()}
            aria-label="Enviar mensaje"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
