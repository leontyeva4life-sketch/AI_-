
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { Chat, ChatState, Message, LearningMode, ModelType, Attachment, Difficulty } from './types';
import { sendMessageToGemini } from './services/geminiService';

const STORAGE_KEY = 'ai_english_teacher_v4_state';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore chats with messages
        parsed.chats = (parsed.chats || []).filter((c: Chat) => c.messages.length > 0);
        return parsed;
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return {
      chats: [],
      activeChatId: null,
      theme: 'light'
    };
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [globalMode, setGlobalMode] = useState<LearningMode>('learning');
  const [globalDifficulty, setGlobalDifficulty] = useState<Difficulty>('medium');
  const [globalModel, setGlobalModel] = useState<ModelType>(ModelType.GEMINI_FLASH);

  // Apply theme to document element
  useEffect(() => {
    const html = document.documentElement;
    if (state.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [state.theme]);

  // Persist only non-empty chats
  useEffect(() => {
    const stateToSave = {
      ...state,
      chats: state.chats.filter(c => c.messages.length > 0)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [state]);

  const activeChat = state.chats.find(c => c.id === state.activeChatId) || null;

  // AUTO-SYNC EMPTY CHATS: 
  // If the active chat is empty, update it immediately when user changes global settings
  useEffect(() => {
    if (activeChat && activeChat.messages.length === 0) {
      if (activeChat.mode !== globalMode || activeChat.difficulty !== globalDifficulty || activeChat.model !== globalModel) {
        setState(prev => ({
          ...prev,
          chats: prev.chats.map(c => 
            c.id === prev.activeChatId 
              ? { ...c, mode: globalMode, difficulty: globalDifficulty, model: globalModel } 
              : c
          )
        }));
      }
    }
  }, [globalMode, globalDifficulty, globalModel, activeChat?.id, activeChat?.messages.length]);

  const handleStartNewChat = useCallback((mode: LearningMode, difficulty: Difficulty, model: ModelType) => {
    // Check if we already have an empty chat active
    if (activeChat && activeChat.messages.length === 0) {
      setGlobalMode(mode);
      setGlobalDifficulty(difficulty);
      setGlobalModel(model);
      return;
    }

    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: '',
      mode,
      difficulty,
      model,
      messages: [],
      createdAt: Date.now()
    };

    setState(prev => ({
      ...prev,
      chats: [newChat, ...prev.chats],
      activeChatId: newChat.id
    }));

    setGlobalMode(mode);
    setGlobalDifficulty(difficulty);
    setGlobalModel(model);
  }, [activeChat]);

  const handleSelectChat = useCallback((id: string) => {
    setState(prev => {
      const chat = prev.chats.find(c => c.id === id);
      if (chat) {
        setGlobalMode(chat.mode);
        setGlobalDifficulty(chat.difficulty);
        setGlobalModel(chat.model);
      }
      return { ...prev, activeChatId: id };
    });
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    setState(prev => {
      const newChats = prev.chats.filter(c => c.id !== id);
      const nextActiveId = prev.activeChatId === id ? (newChats[0]?.id || null) : prev.activeChatId;
      return {
        ...prev,
        chats: newChats,
        activeChatId: nextActiveId
      };
    });
  }, []);

  const handleSendMessage = async (content: string, attachments: Attachment[]) => {
    if (!state.activeChatId) return;
    const currentChat = state.chats.find(c => c.id === state.activeChatId);
    if (!currentChat) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      chats: prev.chats.map(c => {
        if (c.id === prev.activeChatId) {
          const updatedMessages = [...c.messages, userMessage];
          // Title from first message
          const newTitle = c.messages.length === 0 && content 
            ? content.slice(0, 32).trim() + (content.length > 32 ? '...' : '') 
            : c.title;
          return { ...c, messages: updatedMessages, title: newTitle };
        }
        return c;
      })
    }));

    setIsTyping(true);

    try {
      const chatAfterUserMsg = state.chats.find(c => c.id === state.activeChatId)!;
      const history = [...chatAfterUserMsg.messages, userMessage];
      
      const responseText = await sendMessageToGemini(
        chatAfterUserMsg.model,
        history,
        chatAfterUserMsg.mode,
        chatAfterUserMsg.difficulty,
        attachments
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        chats: prev.chats.map(c => 
          c.id === prev.activeChatId 
            ? { ...c, messages: [...c.messages, assistantMessage] } 
            : c
        )
      }));
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "### Ошибка\n\nНе удалось получить ответ. Проверьте соединение с интернетом или настройки ключа API.",
        timestamp: Date.now()
      };
      setState(prev => ({
        ...prev,
        chats: prev.chats.map(c => 
          c.id === prev.activeChatId 
            ? { ...c, messages: [...c.messages, errorMessage] } 
            : c
        )
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-500">
      <Sidebar 
        chats={state.chats.filter(c => c.messages.length > 0)}
        activeChatId={state.activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={() => handleStartNewChat(globalMode, globalDifficulty, globalModel)}
        onDeleteChat={handleDeleteChat}
        theme={state.theme}
        onToggleTheme={handleToggleTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ChatWindow 
        chat={activeChat}
        onSendMessage={handleSendMessage}
        onStartNewChat={handleStartNewChat}
        isTyping={isTyping}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        currentGlobalMode={globalMode}
        setGlobalMode={setGlobalMode}
        currentGlobalDifficulty={globalDifficulty}
        setGlobalDifficulty={setGlobalDifficulty}
        currentGlobalModel={globalModel}
        setGlobalModel={setGlobalModel}
      />
    </div>
  );
};

export default App;
