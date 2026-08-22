export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  reason?: string;
  type?: string;
  actionType?: string;
  actionLabel?: string;
  contextTag?: string;
  action?: any;
  targetData?: any;
}

export interface AiHistoryItem {
  id: string;
  title: string;
  timestamp?: string;
  createdAt?: string;
  summary?: string;
  isStarred?: boolean;
  actionType?: string;
  messages: any[];
}

export interface AiReplyBlock {
  type: string;
  title?: string;
  text?: string;
  variant?: string;
  content?: any;
  items?: any[];
  itemsList?: any[];
  headers?: string[];
  rows?: any[][];
}

export interface AiClarificationField {
  id: string;
  label: string;
  type: 'text' | 'input' | 'textarea' | 'time' | 'select' | 'checkbox' | 'radio' | 'date';
  placeholder?: string;
  options?: any[];
  defaultValue?: any;
  required?: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  blocks?: any[];
  options?: { label: string; value: string }[];
  questionId?: string;
  resultCard?: any;
  pendingIntent?: string;
  originalPrompt?: string;
  executedTools?: Array<{
    stepId: string;
    toolName: string;
    label: string;
    status: 'running' | 'success' | 'error';
    entityId?: string;
    details?: string;
  }>;
  confirmedEntities?: Array<{ type: string; id: string; title: string }>;
}
