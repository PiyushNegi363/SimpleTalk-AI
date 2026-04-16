'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgContent = input;
    setInput('');
    setIsLoading(true);

    const tempUserMsg: Message = {
      id: Date.now(),
      sender: 'user',
      content: userMsgContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgContent })
      });
      const botMsg = await res.json();
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        content: "Oops! My backend seems to be offline. Please check if the FastAPI server is running.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/history`, { method: 'DELETE' });
      setMessages([]);
      setShowConfirm(false);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className={styles.container}>
      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--glass-bg)',
            borderRadius: '24px'
          }}>
            <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Clear Conversation?</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
              This will permanently delete all messages in this chat. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                className={styles.clearButton} 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button 
                onClick={clearHistory}
                style={{ 
                  flex: 1, 
                  background: 'var(--error)', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="var(--primary)" />
            <h1>SimpleTalk AI</h1>
          </div>
          <p>Version 2.0 • Local Deep Learning</p>
        </div>
        <button 
          onClick={() => setShowConfirm(true)}
          className={styles.clearButton}
          aria-label="Clear chat history"
        >
          <Trash2 size={16} />
          <span>Clear Chat</span>
        </button>
      </header>

      {/* Chat Area */}
      <div 
        className={styles.chatArea}
        ref={scrollRef}
      >
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <MessageSquare size={80} />
            </div>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>How can I help you today?</h2>
            <p style={{ maxWidth: '300px' }}>
              Ask me anything about local deep learning, or just say hello to start!
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '5px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                 {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                 <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {msg.sender}
                 </span>
               </div>
               {msg.sender === 'bot' && (
                 <button 
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                  title="Copy to clipboard"
                 >
                   {copiedId === msg.id ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                 </button>
               )}
            </div>
            <p>{msg.content}</p>
            <span className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className={styles.loadingBubble}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className={styles.inputForm}
      >
        <div className={styles.inputWrapper}>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Ask me anything..."
            className={styles.input}
            rows={1}
            autoFocus
            style={{ 
              resize: 'none',
              overflowY: 'hidden',
              minHeight: '52px',
              maxHeight: '200px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>
        <button 
          type="submit"
          className={styles.sendButton}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </main>
  );
}
