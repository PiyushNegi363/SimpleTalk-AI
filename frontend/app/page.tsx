'use client';

import { useState, useEffect, useRef } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/history');
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

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: Date.now(),
      sender: 'user',
      content: userMsgContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('http://localhost:8000/chat', {
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
    if (!confirm("Are you sure you want to clear chat history?")) return;
    try {
      await fetch('http://localhost:8000/history', { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <main style={{
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>SimpleTalk AI</h1>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Local Deep Learning Assistant</p>
        </div>
        <button 
          onClick={clearHistory}
          style={{
            padding: '8px 15px',
            borderRadius: '10px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Clear Chat
        </button>
      </header>

      {/* Chat Area */}
      <div 
        className="glass-panel" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
        ref={scrollRef}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.4 }}>
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="animate-fade-in"
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 18px',
              borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
              background: msg.sender === 'user' ? 'var(--primary)' : 'var(--chat-bot)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
              boxShadow: msg.sender === 'user' ? '0 10px 15px -3px rgba(124, 58, 237, 0.3)' : 'none'
            }}
          >
            <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>{msg.content}</p>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '5px', display: 'block' }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px', opacity: 0.5 }}>
            <span>Typing...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        style={{ 
          marginTop: '20px', 
          display: 'flex', 
          gap: '10px',
          padding: '5px'
        }}
      >
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '15px',
            padding: '15px 20px',
            color: 'white',
            outline: 'none',
            fontSize: '1rem'
          }}
        />
        <button 
          type="submit"
          className="glow"
          disabled={isLoading}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            padding: '0 25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          Send
        </button>
      </form>
    </main>
  );
}
