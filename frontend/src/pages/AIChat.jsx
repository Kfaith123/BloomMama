import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EMERGENCY_WORDS = ['bleeding', 'severe pain', 'no movement', 'fainted', 'unconscious'];

const QUICK_QUESTIONS = [
  'What should I eat this week?',
  'Is headache normal?',
  'How many kicks per day?',
  'What foods should I avoid?',
  "Tell me about this week's baby development",
];

const EMERGENCY_REPLY =
  "🚨 This sounds like an emergency. Please go to the nearest hospital or call your doctor immediately.\n\nDo not wait — your safety and your baby's safety come first.";

function isEmergency(text) {
  return EMERGENCY_WORDS.some(w => text.toLowerCase().includes(w));
}

function Welcome({ name }) {
  return `Hello ${name || ''}! 🌸 I'm BloomMama AI, your pregnancy companion.\n\nI'm here to support you with pregnancy information, nutrition tips, baby development updates, and emotional reassurance.\n\nHow can I help you today?`;
}

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages]   = useState(null); // null = loading
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [profile, setProfile]     = useState(null);
  const [clearing, setClearing]   = useState(false);
  const [showClear, setShowClear] = useState(false);
  const bottomRef = useRef(null);

  // Load history + pregnancy profile on mount
  useEffect(() => {
    Promise.all([
      api.get('/chat/history').catch(() => ({ data: [] })),
      api.get('/pregnancy').catch(() => ({ data: null })),
    ]).then(([histRes, pregRes]) => {
      const history = histRes.data;
      setProfile(pregRes.data);

      if (history.length === 0) {
        // Fresh start — show welcome message (not persisted)
        setMessages([{ role: 'assistant', text: Welcome({ name: user?.name?.split(' ')[0] }) }]);
      } else {
        setMessages(
          history.map(row => ({
            id: row.id,
            role: row.role,
            text: row.text,
            emergency: row.is_emergency,
          }))
        );
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading || messages === null) return;
    setInput('');

    const userMsg = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    if (isEmergency(userText)) {
      const emergencyMsg = { role: 'assistant', text: EMERGENCY_REPLY, emergency: true };
      setMessages(prev => [...prev, emergencyMsg]);
      setLoading(false);
      // Persist emergency exchange silently
      api.post('/chat/emergency', { userText, replyText: EMERGENCY_REPLY }).catch(() => {});
      return;
    }

    try {
      const context = profile
        ? `User is at pregnancy week ${profile.pregnancy_week}, due date ${profile.due_date}.`
        : '';
      const { data } = await api.post('/chat', { message: userText, context });
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. 💕",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    setClearing(true);
    try {
      await api.delete('/chat/history');
      setMessages([{ role: 'assistant', text: Welcome({ name: user?.name?.split(' ')[0] }) }]);
      setShowClear(false);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-56px)] pb-16 md:pb-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-pink-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-800">💬 BloomMama AI</h1>
          <p className="text-xs text-gray-400">Your pregnancy companion · Not a medical doctor</p>
        </div>
        <button
          onClick={() => setShowClear(v => !v)}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          ⋯
        </button>
      </div>

      {/* Clear confirm banner */}
      {showClear && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-between text-sm">
          <span className="text-red-600">Clear all chat history?</span>
          <div className="flex gap-2">
            <button onClick={() => setShowClear(false)} className="text-gray-500 px-3 py-1 rounded-lg hover:bg-gray-100">Cancel</button>
            <button onClick={clearHistory} disabled={clearing}
              className="text-white bg-red-400 hover:bg-red-500 px-3 py-1 rounded-lg transition-colors">
              {clearing ? 'Clearing…' : 'Clear'}
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages === null ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading history…</div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id ?? i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-bloom-pink flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                  🌸
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                ${m.role === 'user'
                  ? 'bg-bloom-rose text-white rounded-tr-none'
                  : m.emergency
                    ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-none'
                    : 'bg-white border border-pink-100 text-gray-700 rounded-tl-none shadow-sm'}`}>
                {m.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-bloom-pink flex items-center justify-center text-sm mr-2 flex-shrink-0">🌸</div>
            <div className="bg-white border border-pink-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-bloom-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-bloom-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-bloom-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => send(q)}
            className="flex-shrink-0 text-xs bg-bloom-soft border border-pink-200 text-bloom-rose
                       rounded-full px-3 py-1.5 hover:bg-pink-100 transition-colors whitespace-nowrap">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 bg-white border-t border-pink-100">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ask me anything about your pregnancy..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading || messages === null}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading || messages === null}
            className="btn-primary px-4">
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          BloomMama AI is not a doctor. For emergencies, seek medical care immediately.
        </p>
      </div>
    </div>
  );
}
