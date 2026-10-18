export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: Record<string, unknown> | null;
  error?: boolean;
  model?: string;
  isLlm?: boolean;
}

export interface ChatRequest {
  message: string;
  action?: string;
}

export interface ChatResponse {
  answer: string;
  data?: Record<string, unknown> | null;
  model?: string;
  isLlm?: boolean;
  timestamp?: string;
}
