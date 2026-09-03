import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, Code2, CheckSquare, MessageSquare } from 'lucide-react';
import { Button, Card } from '../components/ui';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your DevFlow AI Assistant. How can I help you automate your sprint tasks or review code blocks today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [activePlayground, setActivePlayground] = useState<'chat' | 'subtasks' | 'code'>('chat');
  const [loading, setLoading] = useState(false);

  // Subtasks playground state
  const [taskTitle, setTaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  
  // Code explainer state
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeExplanation, setCodeExplanation] = useState('');

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Direct prompt request to backend AI or use task details as generic chat context
      const res = await api.post('/ai/task-description', {
        title: userMessage,
        context: 'Answer this question directly as a helpful project assistant.'
      });
      const reply = res.data.data.description;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      toast.error('AI chat failed. Ensure backend environment has OpenAI configurations.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I couldn't process that query. Please make sure the backend `.env` has a valid `OPENAI_API_KEY`, or try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSubtasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || loading) return;
    setLoading(true);
    setSubtasks([]);
    try {
      const res = await api.post('/ai/subtasks', { title: taskTitle });
      setSubtasks(res.data.data.subtasks || []);
      toast.success('Subtasks generated!');
    } catch (err) {
      toast.error('AI generation failed. Using local mock fallback.');
      setSubtasks([
        'Scaffold database schemas',
        'Create REST endpoints',
        'Implement validation middleware',
        'Build frontend page components',
        'Wire up state management store'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSnippet.trim() || loading) return;
    setLoading(true);
    setCodeExplanation('');
    try {
      const res = await api.post('/ai/task-description', {
        title: 'Explain the following code block in detail',
        context: codeSnippet
      });
      setCodeExplanation(res.data.data.description);
      toast.success('Explanation generated!');
    } catch (err) {
      toast.error('AI generation failed.');
      setCodeExplanation('Failed to explain code snippet. Check backend LLM settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>AI Assistant</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Automate engineering workflows and generate sprint standups.</p>
        </div>
      </div>

      {/* Grid Quick Navigation Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          onClick={() => setActivePlayground('chat')}
          className={`cursor-pointer border-2 transition-all p-4 flex items-center gap-3 ${
            activePlayground === 'chat' ? 'border-purple-500/60 bg-purple-500/[0.03]' : 'hover:border-surface-600'
          }`}
        >
          <MessageSquare className="text-purple-500 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white">Sprint Chat Sandbox</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Chat directly with your development guide.</p>
          </div>
        </Card>

        <Card
          onClick={() => setActivePlayground('subtasks')}
          className={`cursor-pointer border-2 transition-all p-4 flex items-center gap-3 ${
            activePlayground === 'subtasks' ? 'border-indigo-500/60 bg-indigo-500/[0.03]' : 'hover:border-surface-600'
          }`}
        >
          <CheckSquare className="text-indigo-500 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white">Subtask Breakdown</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Decompose parent tasks into micro action steps.</p>
          </div>
        </Card>

        <Card
          onClick={() => setActivePlayground('code')}
          className={`cursor-pointer border-2 transition-all p-4 flex items-center gap-3 ${
            activePlayground === 'code' ? 'border-pink-500/60 bg-pink-500/[0.03]' : 'hover:border-surface-600'
          }`}
        >
          <Code2 className="text-pink-500 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white">Code Block Explainer</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Explain functions and outline vulnerabilities.</p>
          </div>
        </Card>
      </div>

      {/* Main Sandbox Container */}
      <div className="rounded-2xl border min-h-[500px] flex flex-col justify-between overflow-hidden shadow-xl" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        
        {/* 1. CHAT TAB */}
        {activePlayground === 'chat' && (
          <>
            <div className="flex-1 p-6 space-y-4 max-h-[450px] overflow-y-auto">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-sm p-4 rounded-2xl max-w-[85%] ${
                    m.role === 'user'
                      ? 'ml-auto bg-primary-600 text-white'
                      : 'bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700'
                  } animate-fade-in`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Sparkles size={12} />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed" style={{ color: m.role === 'user' ? 'white' : 'var(--text-primary)' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 text-sm p-4 rounded-2xl bg-surface-50 dark:bg-surface-800 max-w-[80%] items-center animate-pulse">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                    <Sparkles size={12} />
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>AI is pondering...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <input
                type="text"
                placeholder="Ask about project architectures or test scripts..."
                className="flex-1 py-3 px-4 border rounded-xl text-sm bg-transparent outline-none focus:ring-2 focus:ring-purple-500"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 border-none">
                <Send size={16} />
              </Button>
            </form>
          </>
        )}

        {/* 2. SUBTASKS TAB */}
        {activePlayground === 'subtasks' && (
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Subtask Generator</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Input a feature title to get a step-by-step checklist recommended by DevFlow AI.</p>
              
              <form onSubmit={handleGenerateSubtasks} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. JWT Token Refresh Mechanism"
                  className="flex-1 py-2.5 px-4 border rounded-xl text-sm bg-transparent outline-none focus:border-indigo-500"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <Button type="submit" isLoading={loading} className="bg-indigo-600 hover:bg-indigo-700 border-none">
                  Decompose
                </Button>
              </form>

              {subtasks.length > 0 && (
                <div className="space-y-2 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.01]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Action Steps Checklists</h4>
                  {subtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-white">
                      <input type="checkbox" className="rounded border-surface-600 focus:ring-indigo-500" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. CODE TAB */}
        {activePlayground === 'code' && (
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Code Block Explainer</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Paste code snippets to explain complex logic in plain English.</p>

              <form onSubmit={handleExplainCode} className="space-y-4">
                <textarea
                  className="w-full p-4 border rounded-xl text-xs bg-transparent outline-none focus:border-pink-500 min-h-[150px] font-mono"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  placeholder="paste code snippet here..."
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                />
                <Button type="submit" isLoading={loading} className="bg-pink-600 hover:bg-pink-700 border-none w-full">
                  Generate Explanation
                </Button>
              </form>

              {codeExplanation && (
                <div className="p-4 rounded-xl border border-pink-500/10 bg-pink-500/[0.01] text-xs font-mono leading-relaxed whitespace-pre-wrap text-white">
                  {codeExplanation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage;
