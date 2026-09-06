import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import {
  Agent,
  Client,
  Key,
  type AnyTaskMessage,
  type Task,
} from '@relevanceai/sdk';

const CHAT_AGENT_ID = '8054b867-8ce4-4250-8710-44feaa2cf640';
const CHAT_AGENT_PROJECT = '3785c80b-2f7e-5958-8205-9ab0bb7ec662';
const CHAT_AGENT_REGION = 'd7b62b';
const CHAT_AGENT_NAME = 'Santiago';
const CHAT_STORAGE_KEY = `r-${CHAT_AGENT_ID}`;

type OptimisticUserMessage = {
  id: 'optimistic';
  type: 'user-message';
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
  isUser: () => boolean;
  isTool: () => boolean;
  isThinking: () => boolean;
  isTyping: () => boolean;
};

type ChatMessage = AnyTaskMessage | OptimisticUserMessage;

interface ChatWidgetPanelProps {
  className?: string;
  chatKey?: number;
  pendingMessage?: string | null;
  onPendingMessageSent?: () => void;
}

// FUNCION: Formatea la fecha/hora actual en español con zona horaria Europe/Madrid
function getCurrentDateTimeES(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Madrid',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return now.toLocaleString('es-ES', options);
}

// FUNCION: Prefija la fecha/hora al mensaje del usuario (SOLO para enviar al agente)
function prefixMessageWithDateTime(text: string): string {
  const fecha = getCurrentDateTimeES();
  return `[Fecha y hora actual: ${fecha}]\n\n${text}`;
}

const ChatWidgetPanel: React.FC<ChatWidgetPanelProps> = ({
  className = '',
  chatKey,
  pendingMessage,
  onPendingMessageSent,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const agentRef = useRef<Agent | null>(null);
  const taskRef = useRef<Task<Agent> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingSentRef = useRef(false);

  // Resetear flag cuando llega un nuevo mensaje pendiente
  useEffect(() => {
    if (pendingMessage) {
      pendingSentRef.current = false;
    }
  }, [pendingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const attachTaskListener = useCallback((task: Task<Agent>) => {
    task.addEventListener('message', ({ detail: { message } }) => {
      setMessages((prev) => {
        const optimisticIndex = prev.findIndex(
          (m) => m.type === 'user-message' && m.id === 'optimistic',
        );
        if (optimisticIndex !== -1) {
          const next = [...prev];
          next[optimisticIndex] = message;
          return next;
        }
        return [...prev, message];
      });
      if (message.isAgent()) setIsTyping(false);
      else if (message.isUser()) setIsTyping(true);
    });
  }, []);

  const sendMessageToAgent = useCallback(
    async (text: string) => {
      if (!agentRef.current || !text.trim() || isTyping) return;

      // Agregar fecha/hora actual al mensaje SOLO para enviar al agente
      const messageWithDate = prefixMessageWithDateTime(text);

      // Mostrar en la UI el mensaje LIMPIO (sin fecha) del usuario
      const optimisticMessage = {
        id: 'optimistic' as const,
        type: 'user-message' as const,
        text: text, // <-- SOLO el texto original, SIN fecha
        createdAt: new Date(),
        isAgent: () => false,
        isUser: () => true,
        isTool: () => false,
        isThinking: () => false,
        isTyping: () => false,
      } as OptimisticUserMessage;
      setMessages((prev) => [...prev, optimisticMessage]);
      setIsTyping(true);
      try {
        const agent = agentRef.current;
        const currentTask = taskRef.current;
        // Enviamos al agente el mensaje CON fecha
        const task = currentTask
          ? await agent.sendMessage(messageWithDate, currentTask)
          : await agent.sendMessage(messageWithDate);
        if (taskRef.current !== task) {
          taskRef.current?.unsubscribe();
          taskRef.current = task;
          attachTaskListener(task);
        }
      } catch (err) {
        setIsTyping(false);
        setMessages((prev) => prev.filter((m) => m.id !== 'optimistic'));
        setError('Error al enviar el mensaje. Intenta de nuevo.');
        console.error('Send message error:', err);
      }
    },
    [isTyping, attachTaskListener],
  );

  useEffect(() => {
    if (pendingMessage && !isLoading && !error && agentRef.current && !pendingSentRef.current) {
      pendingSentRef.current = true;
      sendMessageToAgent(pendingMessage);
      onPendingMessageSent?.();
    }
  }, [pendingMessage, isLoading, error, sendMessageToAgent, onPendingMessageSent]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let key: Key | null = null;
        try {
          const stored = localStorage.getItem(CHAT_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.embedKey && parsed?.conversationPrefix) {
              key = new Key({
                key: parsed.embedKey,
                region: CHAT_AGENT_REGION,
                project: CHAT_AGENT_PROJECT,
                agentId: CHAT_AGENT_ID,
                taskPrefix: parsed.conversationPrefix,
              });
            }
          }
        } catch { /* ignore */ }
        if (!key) {
          key = await Key.generateEmbedKey({
            region: CHAT_AGENT_REGION,
            project: CHAT_AGENT_PROJECT,
            agentId: CHAT_AGENT_ID,
          });
          const { key: embedKey, taskPrefix } = key.toJSON();
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ embedKey, conversationPrefix: taskPrefix }));
        }
        if (cancelled) return;
        const client = new Client(key);
        const agent = await Agent.get(CHAT_AGENT_ID, client);
        if (cancelled) return;
        agentRef.current = agent;
        setIsLoading(false);
        inputRef.current?.focus();
      } catch (err) {
        if (!cancelled) {
          setError('No se pudo conectar con el asistente. Intenta de nuevo.');
          setIsLoading(false);
          console.error('Chat init error:', err);
        }
      }
    };
    init();
    return () => {
      cancelled = true;
      taskRef.current?.unsubscribe();
    };
  }, [attachTaskListener]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isTyping || isLoading || !agentRef.current) return;
    setInputValue('');
    await sendMessageToAgent(text);
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`} data-chat-widget>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-white" aria-live="polite">
        {isLoading && (
          <p className="text-lg text-[#666666] text-center py-8">Conectando con {CHAT_AGENT_NAME}...</p>
        )}
        {error && (
          <p className="text-lg text-[#ef233c] text-center py-4 px-3 rounded-lg bg-[#f5f5f5]">{error}</p>
        )}
        {!isLoading && !error && messages.length === 0 && !pendingMessage && (
          <p className="text-lg text-[#666666] text-center py-8">¡Hola! Soy {CHAT_AGENT_NAME} 👋 ¿Te ayudo con tu pedido?</p>
        )}
        {messages.map((message, index) => {
          const isUser = message.type === 'user-message';
          const isAgentMsg = message.type === 'agent-message';
          if (!isUser && !isAgentMsg) return null;
          const text = 'text' in message ? (message as { text: string }).text : '';
          return (
            <div key={`${message.id}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[95%] text-lg leading-relaxed ${isUser ? 'bg-[#5F7A3A] text-white rounded-2xl rounded-br-sm px-4 py-2.5' : 'bg-transparent text-[#1a1a1a] px-0 py-1'}`} style={!isUser ? { whiteSpace: 'pre-line', wordBreak: 'keep-all' } : undefined}>
                {text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-transparent text-[#666666] rounded-none px-0 py-1 text-lg">
              <span className="inline-flex gap-1 items-center">{CHAT_AGENT_NAME} está escribiendo<span className="animate-pulse">...</span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-[#e5e5e5] bg-white">
        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu mensaje..." disabled={isLoading || !!error} className="flex-1 rounded-lg border border-[#d4d4d4] bg-[#f5f5f5] px-4 py-2.5 text-lg text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#5F7A3A] focus:border-[#5F7A3A] disabled:opacity-50" aria-label="Mensaje para el asistente" />
        <button type="submit" disabled={isLoading || isTyping || !!error || !inputValue.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F7A3A] text-white transition-colors hover:bg-[#4a602e] disabled:opacity-40 disabled:hover:bg-[#5F7A3A]" aria-label="Enviar mensaje">
          <SendHorizonal className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWidgetPanel;