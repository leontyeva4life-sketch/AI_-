
export type LearningMode = 'vocabulary' | 'grammar' | 'trainer' | 'learning' | 'composition';
export type Difficulty = 'easy' | 'medium' | 'hard';

export enum ModelType {
  GEMINI_FLASH = 'gemini-3-flash-preview',
  GEMINI_PRO = 'gemini-3-pro-preview',
  GEMINI_FLASH_IMAGE = 'gemini-2.5-flash-image',
}

export interface Attachment {
  type: 'image' | 'video' | 'audio';
  data: string; // base64
  mimeType: string;
  name: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  mode: LearningMode;
  model: ModelType;
  difficulty: Difficulty;
  messages: Message[];
  createdAt: number;
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  theme: 'light' | 'dark';
}
