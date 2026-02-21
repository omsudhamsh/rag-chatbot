import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Trash2, Download } from 'lucide-react';

const MessageActions = ({ onDelete, theme = 'dark' }) => (
  <div className="mt-2 flex justify-end opacity-80 transition-opacity duration-200 hover:opacity-100">
    <button
      type="button"
      onClick={onDelete}
      className={
        theme === 'light'
          ? 'rounded p-1 text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:text-slate-700'
          : 'rounded p-1 text-slate-200 transition-all duration-200 hover:bg-white/20 hover:text-white'
      }
      title="Delete message"
      aria-label="Delete message"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const Chat = ({ theme = 'dark' }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChat = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    const userMessage = { text: query, sender: 'user', id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/chat-stream?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      const assistantMessageId = Date.now();
      let messageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            assistantText += data.text || '';

            if (!messageAdded) {
              setMessages((prev) => [
                ...prev,
                { id: assistantMessageId, text: assistantText, sender: 'assistant' },
              ]);
              messageAdded = true;
            } else {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, text: assistantText }
                    : msg
                )
              );
            }
          } catch (e) {
            // Silent fail on JSON parse
          }
        }
      }
    } catch (err) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/chat`, {
          params: { query },
        });
        const assistantMessage = { text: response.data.answer, sender: 'assistant', id: Date.now() };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (fallbackErr) {
        setError('Error fetching answer');
        const errorMessage = { text: 'Failed to get response', sender: 'error', id: Date.now() };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      setError(null);
    }
  };

  const handleExportChat = () => {
    const chatExport = messages.map((msg) => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: new Date().toISOString(),
    }));
    
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(chatExport, null, 2))}`);
    element.setAttribute('download', `chat_${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  const isLight = theme === 'light';

  const cardClass = isLight
    ? 'mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-xl backdrop-blur-xl'
    : 'mx-auto w-full max-w-5xl rounded-2xl border border-white/15 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl';

  const titleClass = isLight
    ? 'flex items-center gap-2 text-2xl font-semibold text-slate-900 sm:text-3xl'
    : 'flex items-center gap-2 text-2xl font-semibold text-white sm:text-3xl';

  const actionButtonClass = isLight
    ? 'rounded-lg p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900'
    : 'rounded-lg p-2 text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white';

  const clearActionButtonClass = isLight
    ? 'rounded-lg p-2 text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-500'
    : 'rounded-lg p-2 text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-red-300';

  const messageContainerClass = isLight
    ? 'mb-6 h-96 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/90 p-4 backdrop-blur-sm'
    : 'mb-6 h-96 space-y-4 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-sm';

  const emptyTextClass = isLight
    ? 'flex h-full items-center justify-center text-slate-500'
    : 'flex h-full items-center justify-center text-slate-300';

  const assistantBubbleClass = isLight
    ? 'rounded-bl-none border border-slate-200 bg-white text-slate-800'
    : 'rounded-bl-none border border-white/10 bg-slate-800/70 text-slate-100';

  const loadingClass = isLight ? 'flex items-center gap-2 text-slate-700' : 'flex items-center gap-2 text-white';

  const inputClass = isLight
    ? 'flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400'
    : 'flex-1 rounded-lg border border-white/20 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className={cardClass}
    >
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={titleClass}>
          💬 Chat with RAG
        </h2>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportChat}
                className={actionButtonClass}
                title="Export chat"
              >
                <Download className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearChat}
                className={clearActionButtonClass}
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className={messageContainerClass}>
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={emptyTextClass}
            >
              <p className="text-center">Start a conversation... Ask about your documents!</p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    msg.sender === 'user'
                      ? 'rounded-br-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : assistantBubbleClass
                  } rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.sender !== 'error' && (
                    <MessageActions 
                      theme={theme}
                      onDelete={() => handleDeleteMessage(msg.id)}
                    />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={loadingClass}
          >
            <Loader className="w-4 h-4 animate-spin" />
            <span>AI is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-2 rounded-lg border border-red-400/50 bg-red-500/20 px-4 py-3 text-sm text-red-100"
          >
            <span>⚠️</span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask something about the documents..."
          className={inputClass}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleChat}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Chat;