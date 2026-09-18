import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, FileText, Image as ImageIcon, Smile } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const OrderChat = ({ orderId, recipientName }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${orderId}`);
        if (res.data.success) {
          setMessages(res.data.messages);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error('Failed to load order chat:', err);
      }
    };

    fetchMessages();
  }, [orderId]);

  // Join order socket room & listen for events
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_order', orderId);

    const handleReceiveMessage = (newMsg) => {
      if (newMsg.order === orderId) {
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 50);
      }
    };

    const handleUserTyping = ({ userName }) => {
      setTypingUser(userName);
      setIsTyping(true);
    };

    const handleUserStopTyping = () => {
      setIsTyping(false);
      setTypingUser('');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_order', orderId);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, orderId]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket) {
      socket.emit('typing', { orderId, userName: user?.name || 'Someone' });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { orderId });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachmentFile) || sending) return;

    setSending(true);
    if (socket) socket.emit('stop_typing', { orderId });

    try {
      const formData = new FormData();
      if (inputText.trim()) formData.append('text', inputText.trim());
      if (attachmentFile) formData.append('attachment', attachmentFile);

      const res = await api.post(`/chat/${orderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setInputText('');
        setAttachmentFile(null);
        // Note: Socket emission handles adding message to state or we can append if not duplicated
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === res.data.message._id);
          return exists ? prev : [...prev, res.data.message];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Room Header */}
      <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Order Collaboration Channel
          </h4>
          <p className="text-[11px] text-slate-500">
            Private encrypted chat with {recipientName || 'project counterparty'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-700">Live Socket Active</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400">
            <p>No messages yet.</p>
            <p className="mt-1">Start the conversation to discuss milestones and project updates.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?.id || msg.sender?._id === user?._id || msg.sender === user?.id;
            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">
                    {msg.sender?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}

                <div className="max-w-[75%] space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#1C220E] text-[#FAF9EE] rounded-br-none shadow-sm'
                        : 'bg-white text-[#1C220E] rounded-bl-none border border-[#9EA96F]/20 shadow-sm'
                    }`}
                  >
                    {!isMe && (
                      <span className="block text-[10px] font-bold text-[#758045] mb-1">
                        {msg.sender?.name}
                      </span>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Attachment preview if any */}
                    {msg.fileUrl && (
                      <div className={`mt-2 pt-2 border-t ${isMe ? 'border-white/20' : 'border-[#9EA96F]/20'}`}>
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[11px] underline hover:opacity-80"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Attached File</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[9px] text-slate-400 block ${
                      isMe ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CDDE42] animate-bounce" />
            <span>{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
        {attachmentFile && (
          <div className="mb-2 px-3 py-1.5 bg-[#FAF9EE] border border-[#9EA96F]/30 rounded-xl text-xs text-[#1C220E] flex items-center justify-between">
            <span className="truncate max-w-xs flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-[#758045]" />
              {attachmentFile.name}
            </span>
            <button
              type="button"
              onClick={() => setAttachmentFile(null)}
              className="text-slate-400 hover:text-slate-700 text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="p-2.5 text-[#758045] hover:text-[#1C220E] rounded-xl hover:bg-[#F2F6B1]/40 cursor-pointer transition">
            <Paperclip className="w-4 h-4" />
            <input
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message or share an update..."
            className="flex-1 px-4 py-2.5 bg-[#FAF9EE]/50 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-xs text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !attachmentFile) || sending}
            className="p-2.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-40 text-[#FAF9EE] rounded-xl shadow-sm transition flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-[#CDDE42]" />
          </button>
        </div>
      </form>
    </div>
  );
};
