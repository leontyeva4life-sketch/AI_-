
import { GoogleGenAI } from "@google/genai";
import { Message, Attachment, ModelType, Difficulty } from "../types";
import { SYSTEM_PROMPT, MODE_INSTRUCTIONS } from "../constants";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const sendMessageToGemini = async (
  model: ModelType,
  messages: Message[],
  mode: string,
  difficulty: Difficulty,
  newAttachments?: Attachment[]
): Promise<string> => {
  const ai = getAIClient();
  const currentDateTime = new Date().toLocaleString('ru-RU');
  
  const systemInstruction = `
    ${SYSTEM_PROMPT}
    ТЕКУЩИЙ РЕЖИМ: ${MODE_INSTRUCTIONS[mode]}
    УРОВЕНЬ СЛОЖНОСТИ: ${difficulty}
    Текущее время: ${currentDateTime}
    
    ВАЖНО: Если пользователь просит "Тест на уровень", проведи небольшое тестирование из 3-5 вопросов, чтобы определить его текущие знания в рамках режима ${mode}.
  `;

  const chatHistory = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model' as const,
    parts: [
      { text: msg.content },
      ...(msg.attachments?.map(att => ({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      })) || [])
    ]
  }));

  const response = await ai.models.generateContent({
    model: model as any,
    contents: chatHistory as any,
    config: {
      systemInstruction,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    }
  });

  return response.text || "Извините, я не смог сгенерировать ответ.";
};
