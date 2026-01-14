
import React from 'react';
import { 
  Plus, 
  Trash2, 
  Book, 
  Code, 
  Dumbbell, 
  GraduationCap, 
  PenTool, 
  MessageSquare,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { Chat } from '../types';
import { MODES } from '../constants';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const IconMap: Record<string, any> = {
  Book,
  Code,
  Dumbbell,
  GraduationCap,
  PenTool
};

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  theme,
  onToggleTheme,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" 
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col shadow-2xl lg:shadow-none
      `}>
        {/* Header with Theme Toggle */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={18} />
            </div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">English AI</h1>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleTheme(); }}
              className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 transition-colors"
              title="Переключить тему"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
          >
            <Plus size={18} />
            Новый чат
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1.5 pb-20">
          <div className="px-3 mb-2 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Диалоги</div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all ${
                activeChatId === chat.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => { onSelectChat(chat.id); onClose(); }}
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                activeChatId === chat.id 
                  ? 'bg-indigo-100 dark:bg-indigo-800/40' 
                  : 'bg-gray-100 dark:bg-zinc-800'
              }`}>
                {React.createElement(IconMap[MODES.find(m => m.id === chat.mode)?.icon || 'MessageSquare'], { size: 14 })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate text-sm">{chat.title || 'Новый урок'}</div>
                <div className="text-[10px] opacity-60 truncate flex gap-1.5 items-center font-bold">
                  <span>{MODES.find(m => m.id === chat.mode)?.label}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>{chat.difficulty.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="p-8 text-center text-[11px] text-gray-400 font-medium italic">Список диалогов пуст</div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold opacity-60">AI Teacher v4.1.2</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
