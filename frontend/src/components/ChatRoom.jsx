import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Users, MessageCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

// Connect to same origin so Vite's WebSocket proxy handles it in dev,
// and the deployed frontend hits the correct backend in production.
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export default function ChatRoom({ chatRoomId, tripDestination, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !chatRoomId) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', { chatRoomId });
    });

    // Load persisted message history sent by server on join
    socket.on('chat_history', (history) => {
      setMessages(history);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'message' }]);
    });

    socket.on('user_joined', (data) => {
      setMessages(prev => [...prev, { ...data, type: 'system', message: `${data.name} joined the chat` }]);
    });

    socket.on('user_left', (data) => {
      setMessages(prev => [...prev, { ...data, type: 'system', message: `${data.name} left the chat` }]);
    });

    socket.on('room_info', ({ onlineCount }) => {
      setOnlineCount(onlineCount);
    });

    socket.on('user_typing', ({ name }) => {
      setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]);
    });

    socket.on('user_stop_typing', ({ name }) => {
      setTypingUsers(prev => prev.filter(n => n !== name));
    });

    return () => {
      socket.emit('leave_room', { chatRoomId });
      socket.disconnect();
    };
  }, [chatRoomId]);

  const handleSend = (e) => {
    e?.preventDefault();
    const msg = input.trim();
    if (!msg || !socketRef.current) return;
    socketRef.current.emit('send_message', { chatRoomId, message: msg });
    socketRef.current.emit('stop_typing', { chatRoomId });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { chatRoomId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { chatRoomId });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="w-full sm:max-w-lg bg-dark-800 border border-white/10 rounded-t-2xl sm:rounded-2xl flex flex-col"
        style={{ height: 'min(600px, 90vh)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-white text-sm truncate">Group Chat · {tripDestination}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-white/30'}`} />
              <span className="text-xs text-white/40">
                {connected ? `${onlineCount} online` : 'Connecting...'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {!connected && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/30">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Connecting to chat...</p>
              </div>
            </div>
          )}

          {messages.length === 0 && connected && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/30">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages yet. Say hi! 👋</p>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              if (msg.type === 'system') {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <span className="text-xs text-white/25 bg-white/5 px-3 py-1 rounded-full">
                      {msg.message}
                    </span>
                  </motion.div>
                );
              }

              const isMe = msg.userId?.toString() === user._id?.toString();
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0 mt-1">
                      {msg.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <span className="text-xs text-white/40 mb-0.5 ml-1">{msg.name}</span>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-brand-500 text-white rounded-br-sm'
                        : 'bg-dark-700 text-white/90 border border-white/8 rounded-bl-sm'
                    }`}>
                      {msg.message}
                    </div>
                    <span className="text-xs text-white/20 mt-0.5 mx-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 pl-9">
              <div className="bg-dark-700 border border-white/8 px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <span className="text-xs text-white/40">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                </span>
                <div className="flex gap-0.5">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-white/40"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="flex-1 input-field resize-none text-sm py-2.5 min-h-[42px] max-h-[100px]"
              style={{ overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
