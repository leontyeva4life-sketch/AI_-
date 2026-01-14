
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Image as ImageIcon, 
  Video, 
  X,
  Sparkles,
  Settings2,
  Menu,
  Copy,
  Check,
  Zap,
  RefreshCw,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chat, Message, LearningMode, ModelType, Attachment, Difficulty } from '../types';
import { MODELS, MODES, MODE_SUGGESTIONS, DIFFICULTY_LABELS } from '../constants';

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onStartNewChat: (mode: LearningMode, difficulty: Difficulty, model: ModelType) => void;
  isTyping: boolean;
  onOpenSidebar: () => void;
  currentGlobalMode: LearningMode;
  setGlobalMode: (m: LearningMode) => void;
  currentGlobalDifficulty: Difficulty;
  setGlobalDifficulty: (d: Difficulty) => void;
  currentGlobalModel: ModelType;
  setGlobalModel: (m: ModelType) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onSendMessage,
  onStartNewChat,
  isTyping,
  onOpenSidebar,
  currentGlobalMode,
  setGlobalMode,
  currentGlobalDifficulty,
  setGlobalDifficulty,
  currentGlobalModel,
  setGlobalModel
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestionOffset, setSuggestionOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages, isTyping]);

  const handleSend = (textOverride?: string) => {
    const finalContent = textOverride || input;
    if ((finalContent.trim() || attachments.length > 0) && !isTyping) {
      onSendMessage(finalContent, attachments);
      setInput('');
      setAttachments([]);
    }
  };

  const copyRawMarkdown = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        const base64 = data.split(',')[1];
        const type: 'image' | 'video' | 'audio' = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio';
        setAttachments(prev => [...prev, { type, data: base64, mimeType: file.type, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const currentSuggestions = useMemo(() => {
    const activeMode = chat?.messages.length === 0 ? currentGlobalMode : chat?.mode;
    const activeSuggestions = MODE_SUGGESTIONS[activeMode as LearningMode] || [];
    const start = suggestionOffset % activeSuggestions.length;
    let slice = activeSuggestions.slice(start, start + 4);
    if (slice.length < 4 && activeSuggestions.length > 4) {
      slice = [...slice, ...activeSuggestions.slice(0, 4 - slice.length)];
    }
    return slice;
  }, [chat?.mode, chat?.messages.length, currentGlobalMode, suggestionOffset]);

  const refreshSuggestions = () => setSuggestionOffset(prev => prev + 4);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors overflow-y-auto">
        <button onClick={onOpenSidebar} className="lg:hidden absolute top-4 left-4 p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
          <Menu size={20} />
        </button>
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
          <Sparkles size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">AI English Teacher</h2>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 w-full max-w-md space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Режим обучения</label>
            <select 
              value={currentGlobalMode}
              onChange={(e) => setGlobalMode(e.target.value as LearningMode)}
              className="w-full bg-gray-50 dark:bg-zinc-800 text-sm font-bold border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
            >
              {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Сложность</label>
            <select 
              value={currentGlobalDifficulty}
              onChange={(e) => setGlobalDifficulty(e.target.value as Difficulty)}
              className="w-full bg-gray-50 dark:bg-zinc-800 text-sm font-bold border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
            </select>
          </div>
          <button
            onClick={() => onStartNewChat(currentGlobalMode, currentGlobalDifficulty, currentGlobalModel)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            Начать урок
          </button>
        </div>
      </div>
    );
  }

  const isModeDifferent = chat.messages.length > 0 && chat.mode !== currentGlobalMode;

  return (
    <div className="flex-1 flex flex-col h-screen relative bg-white dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <header className="flex flex-col border-b border-gray-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-30 transition-colors">
        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center justify-between p-3 px-6">
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-800/50 rounded-2xl border border-gray-200/50 dark:border-zinc-700/50">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setGlobalMode(mode.id as LearningMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  (isModeDifferent ? currentGlobalMode === mode.id : chat.mode === mode.id)
                    ? 'bg-white dark:bg-zinc-700 shadow-md text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={currentGlobalDifficulty}
              onChange={(e) => setGlobalDifficulty(e.target.value as Difficulty)}
              className="bg-gray-100 dark:bg-zinc-800 text-xs font-bold border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2 outline-none hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors appearance-none cursor-pointer"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
            </select>

            <div className="relative">
              <button 
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all bg-white dark:bg-zinc-900 shadow-sm"
              >
                <Settings2 size={14} className="text-indigo-500" />
                <span>{MODELS.find(m => m.id === currentGlobalModel)?.name}</span>
                <ChevronDown size={12} className="opacity-40" />
              </button>
              {showModelSelector && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-1">
                  {MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setGlobalModel(model.id as ModelType); setShowModelSelector(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors ${currentGlobalModel === model.id ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                    >
                      <div className="font-bold">{model.name}</div>
                      <div className="text-[10px] opacity-60 font-medium">{model.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Controls (Unified Row) */}
        <div className="lg:hidden flex items-center justify-between p-2.5 gap-2">
          <button onClick={onOpenSidebar} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0">
            <Menu size={20} />
          </button>
          
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <select 
              value={currentGlobalMode}
              onChange={(e) => setGlobalMode(e.target.value as LearningMode)}
              className="flex-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold px-2 py-2 rounded-lg outline-none cursor-pointer text-indigo-600 dark:text-indigo-400 appearance-none border-none truncate"
            >
              {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            
            <select 
              value={currentGlobalDifficulty}
              onChange={(e) => setGlobalDifficulty(e.target.value as Difficulty)}
              className="flex-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold px-2 py-2 rounded-lg outline-none cursor-pointer text-gray-600 dark:text-gray-300 appearance-none border-none truncate"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([val, lab]) => <option key={val} value={val}>{lab.split(' ')[0]}</option>)}
            </select>

            <select 
              value={currentGlobalModel}
              onChange={(e) => setGlobalModel(e.target.value as ModelType)}
              className="flex-[1.2] bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold px-2 py-2 rounded-lg outline-none cursor-pointer text-gray-500 dark:text-gray-400 appearance-none border-none truncate"
            >
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.name.replace('Gemini ', '')}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Mode Change Prompt Overlay (Only for non-empty chats) */}
      {isModeDifferent && (
        <div className="absolute inset-x-0 top-[110px] lg:top-[70px] z-20 flex justify-center pointer-events-none px-4">
          <button 
            onClick={() => onStartNewChat(currentGlobalMode, currentGlobalDifficulty, currentGlobalModel)}
            className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all animate-in slide-in-from-top-4 active:scale-95"
          >
            <Zap size={14} className="animate-pulse" />
            <span className="text-xs font-bold">Начать новый чат: {MODES.find(m => m.id === currentGlobalMode)?.label}</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Messages List */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar transition-colors bg-white dark:bg-zinc-950"
        >
          {chat.messages.length === 0 && (
            <div className="min-h-full flex flex-col items-center justify-center text-center p-6 space-y-8 max-w-2xl mx-auto py-12">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                   <Sparkles size={12} />
                   {MODES.find(m => m.id === chat.mode)?.label}
                 </div>
                 <h3 className="text-3xl font-extrabold tracking-tight">Как мы сегодня позанимаемся?</h3>
                 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Уровень: {DIFFICULTY_LABELS[chat.difficulty]}. Начните диалог или выберите готовую тему.</p>
              </div>
              
              <div className="w-full space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleSend("Проведи тест, чтобы определить мой текущий уровень знаний в этом режиме.")}
                    className="flex items-center justify-between p-5 bg-indigo-600 text-white rounded-2xl hover:scale-[1.02] transition-all text-sm font-bold shadow-xl shadow-indigo-200 dark:shadow-none"
                  >
                    Определить мой уровень
                    <BarChart3 size={20} />
                  </button>
                  {currentSuggestions.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(s)}
                      className="p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm font-bold transition-all text-left shadow-sm hover:shadow-md"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={refreshSuggestions}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-indigo-500 transition-all mx-auto bg-gray-50 dark:bg-zinc-800/50 px-5 py-2.5 rounded-full"
                >
                  <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
                  Предложить другие темы
                </button>
              </div>
            </div>
          )}
          
          {chat.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative group max-w-[92%] md:max-w-[85%] rounded-2xl p-4 md:p-6 shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-indigo-200/50' 
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200/40 dark:border-zinc-700/40'
              }`}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {msg.attachments.map((att, i) => (
                      <div key={i} className="rounded-xl overflow-hidden max-w-[240px] border-2 border-white/30 shadow-sm">
                        {att.type === 'image' && <img src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="w-full h-auto" />}
                        {att.type === 'video' && <video controls src={`data:${att.mimeType};base64,${att.data}`} className="w-full" />}
                      </div>
                    ))}
                  </div>
                )}
                <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:mb-2 prose-p:leading-relaxed prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'assistant' && (
                  <div className="mt-4 flex justify-end border-t border-gray-200/20 dark:border-zinc-700/50 pt-3">
                    <button 
                      onClick={() => copyRawMarkdown(msg.content, msg.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 dark:bg-zinc-700/40 hover:bg-white/20 dark:hover:bg-zinc-600/60 transition-colors text-[10px] font-bold text-gray-500 dark:text-gray-400"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      {copiedId === msg.id ? 'Скопировано' : 'Копировать Markdown'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-5 py-4 flex gap-1.5 items-center shadow-sm border border-gray-200/20 dark:border-zinc-700/20">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          {/* Spacer to ensure input doesn't hide last msg content even when scrolling */}
          <div className="h-32 lg:h-40" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-white dark:from-zinc-950 via-white/95 dark:via-zinc-950/95 to-transparent z-40">
          <div className="max-w-4xl mx-auto">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 animate-in slide-in-from-bottom-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group bg-white dark:bg-zinc-800 rounded-xl p-2 pr-9 border border-gray-200 dark:border-zinc-700 shadow-sm">
                     <div className="flex items-center gap-2">
                       {att.type === 'image' ? <ImageIcon size={14} className="text-indigo-500" /> : <Video size={14} className="text-indigo-500" />}
                       <span className="text-[10px] font-bold truncate max-w-[120px]">{att.name}</span>
                     </div>
                     <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 hover:text-red-500 transition-colors">
                       <X size={14} />
                     </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[1.75rem] border border-gray-200 dark:border-zinc-800 shadow-2xl focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden border-b-4 border-indigo-500/20">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Спросите учителя..."
                className="w-full bg-transparent border-none focus:ring-0 text-[16px] font-medium resize-none px-6 pt-5 pb-3 min-h-[90px] landscape:min-h-[60px] max-h-[30vh] overflow-y-auto custom-scrollbar transition-colors"
                rows={4}
              />
              
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-1.5">
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} accept="image/*,video/*" />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                    <Paperclip size={18} />
                  </button>
                  <button className="p-2.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                    <Mic size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="flex items-center gap-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-xl active:scale-95 font-bold text-sm"
                >
                  <span>Отправить</span>
                  <Send size={16} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2 font-bold uppercase tracking-widest opacity-60">Enter - отправить, Shift+Enter - перенос</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
