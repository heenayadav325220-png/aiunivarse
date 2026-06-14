/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: string; // 'image/*' or 'text/*' or 'application/pdf'
    dataUrl: string; // base64 or source text
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string; // base64 or static image
  aspectRatio: string;
  timestamp: string;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  operationName?: string;
  status: 'pending' | 'completed' | 'failed';
  url?: string; // final stream URL
  timestamp: string;
}

export interface SavedNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  category?: string;
}

export interface GeneratedCode {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
  timestamp: string;
}

export interface SavedContent {
  id: string;
  title: string;
  prompt: string;
  content: string;
  tone: string;
  timestamp: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudySession {
  id: string;
  topic: string;
  summary: string;
  quiz: QuizQuestion[];
  timestamp: string;
}

export interface UsageStats {
  chatsCount: number;
  tokensEstimated: number;
  imagesCreated: number;
  videosCreated: number;
  documentsExplained: number;
  voiceDialogsCount: number;
}
