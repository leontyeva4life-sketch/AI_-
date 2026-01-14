
import { LearningMode } from './types';

export const SYSTEM_PROMPT = `
Role: AI English Teacher for School Students (Multimodal, Multi-Chat)

Ты — нейро-учитель английского языка для школьников.
Твоя задача — обучение, проверка знаний и тренировка.

Общие правила:
- Объясняй материал доступно, структурировано.
- Адаптируй сложность под выбранный уровень ученика.
- Всегда отвечай на РУССКОМ ЯЗЫКЕ, если не попросили иное.
- Не путай контексты разных чатов.
- Учитывай текущую дату и время в ответах.
`;

export const MODE_INSTRUCTIONS: Record<string, string> = {
  vocabulary: "Режим: Проверка слов. Спрашивай перевод слов (En-Ru/Ru-En), давай транскрипцию и примеры. Исправляй ошибки.",
  grammar: "Режим: Грамматика. Объясняй правила, давай задания на конкретные темы (Tenses, Passive Voice и др.), анализируй ответы.",
  trainer: "Режим: Тренажер. Давай короткие задания, мини-тесты, повторения. Постепенно усложняй.",
  learning: "Режим: Обучение. Подробно объясняй темы, используй таблицы и сравнения с русским языком.",
  composition: "Режим: Сочинение. Помогай писать тексты, рассказы. Разбирай их построчно, объясняй лексику."
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Легкий (A1-A2)",
  medium: "Средний (B1-B2)",
  hard: "Сложный (C1+)"
};

export const MODE_SUGGESTIONS: Record<LearningMode, string[]> = {
  vocabulary: ["Тест на уровень лексики", "Топ 100 глаголов", "Еда и напитки", "Путешествия", "Спорт и хобби", "Профессии", "Чувства и эмоции"],
  grammar: ["Тест на уровень грамматики", "Present Simple", "Irregular Verbs", "Articles", "Conditional Sentences", "Passive Voice", "Reported Speech"],
  trainer: ["Быстрая разминка", "Мини-тест: Времена", "Перевод предложений", "Заполни пропуски", "Найди ошибку"],
  learning: ["Как учить английский?", "Разница между Do и Make", "Секреты произношения", "Идиомы о погоде", "Фразовые глаголы"],
  composition: ["Написать письмо другу", "Рассказ о себе", "Описание картинки", "Мой любимый фильм", "План на лето", "Эссе: Плюсы технологий"]
};

export const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', category: 'Google' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', category: 'Google' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Image', category: 'Google' },
];

export const MODES = [
  { id: 'vocabulary', label: 'Слова', icon: 'Book' },
  { id: 'grammar', label: 'Грамматика', icon: 'Code' },
  { id: 'trainer', label: 'Тренажер', icon: 'Dumbbell' },
  { id: 'learning', label: 'Обучение', icon: 'GraduationCap' },
  { id: 'composition', label: 'Сочинение', icon: 'PenTool' },
];
