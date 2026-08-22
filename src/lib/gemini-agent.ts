import { supabase } from './supabase';
import { recordAiRequest, checkRateLimit } from './ai-usage-tracker';
import { SYSTEM_PROMPT, buildDynamicContext } from './ai/agentSystemPrompt';
import { ALL_TOOL_DECLARATIONS, getScopedToolDeclarations } from './ai/agentToolsDeclarations';
import { executeToolCall } from './ai/agentToolExecutors';

export { SYSTEM_PROMPT, buildDynamicContext as buildCompressedWorkspaceContext, ALL_TOOL_DECLARATIONS, getScopedToolDeclarations, executeToolCall };

export interface AgentStepUpdate {
  stepId: string;
  toolName: string;
  label: string;
  status: 'running' | 'success' | 'error';
  entityId?: string;
  details?: string;
}

export interface AgentTurnResult {
  replyText: string;
  executedTools: AgentStepUpdate[];
  confirmedEntities?: Array<{ type: string; id: string; title: string }>;
  suggestedActions?: Array<{ label: string; action: string }>;
}

export interface AgentMessageHistory {
  role: 'user' | 'model' | 'function';
  parts: any[];
}

const PRIMARY_MODEL = 'gemini-3.7-flash';

async function callGeminiApi(
  apiKey: string,
  model: string,
  payload: any
): Promise<any> {
  const rateStatus = checkRateLimit();
  if (!rateStatus.allowed) {
    throw new Error(rateStatus.warningMessage || 'Rate limit reached.');
  }

  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { model, action: 'generateContent', payload },
    headers: { 'x-gemini-key': apiKey.trim() }
  });

  if (error) {
    const msg = error.message || 'Unknown error';
    if (msg.includes('429')) throw new Error('Gemini API rate limit exceeded (429).');
    throw new Error(`Gemini service error: ${msg}`);
  }

  // Handle potential nested error from proxy
  if (data?.error) {
    throw new Error(`Gemini API error: ${data.error.message || 'Unknown'}`);
  }

  const usage = data?.usageMetadata;
  recordAiRequest(usage?.promptTokenCount || 50, usage?.candidatesTokenCount || 20);

  return data;
}

export async function runAgentTurn(
  apiKey: string,
  userPrompt: string,
  conversationHistory: AgentMessageHistory[] = [],
  options: {
    model?: string;
    activeModule?: string;
    onStepUpdate?: (step: AgentStepUpdate) => void;
  } = {}
): Promise<AgentTurnResult> {
  if (!apiKey?.trim()) {
    throw new Error('Gemini API key required. Please set it in Settings.');
  }

  // Enforce new model and truncate history to save tokens
  const primaryModel = PRIMARY_MODEL;
  const tools = getScopedToolDeclarations(userPrompt, options.activeModule);
  const executedSteps: AgentStepUpdate[] = [];
  const confirmedEntities: Array<{ type: string; id: string; title: string }> = [];
  const turnIdempotencyKey = Math.random().toString(36).substring(2, 10);

  // Keep max 4 history messages to preserve tokens
  const truncatedHistory = conversationHistory.slice(-4);
  const contents: any[] = [...truncatedHistory];

  const compressedContext = buildDynamicContext(userPrompt, options.activeModule);
  const userTextWithContext = `[Context: ${compressedContext}]\n\nUser: ${userPrompt}`;

  contents.push({
    role: 'user',
    parts: [{ text: userTextWithContext }],
  });

  let currentTurn = 0;
  const maxTurns = 4; 

  while (currentTurn < maxTurns) {
    currentTurn++;

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      tools: [{ functionDeclarations: tools }],
      generationConfig: {
        temperature: 0.1, // very low temperature for agentic precision
        thinkingConfig: {
          thinkingBudgetTokens: 1024, // low thinking budget as requested
        }
      },
    };

    const responseData = await callGeminiApi(apiKey, primaryModel, payload);

    const candidate = responseData.candidates?.[0];
    const candidateContent = candidate?.content;
    const parts = candidateContent?.parts || [];

    // Filter for tool calls
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length === 0) {
      const replyText = parts.map((p: any) => p.text || '').join('\\n').trim();
      return {
        replyText: replyText || 'Action completed successfully.',
        executedTools: executedSteps,
        confirmedEntities,
      };
    }

    contents.push(candidateContent);

    const functionResponseParts: any[] = [];

    for (const fcPart of functionCalls) {
      const call = fcPart.functionCall;
      const toolName = call.name;
      const toolArgs = call.args || {};
      const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

      const stepUpdate: AgentStepUpdate = {
        stepId,
        toolName,
        label: `Executing ${toolName.replace(/_/g, ' ')}...`,
        status: 'running',
        details: JSON.stringify(toolArgs),
      };

      executedSteps.push(stepUpdate);
      options.onStepUpdate?.(stepUpdate);

      try {
        const { result, entity } = await executeToolCall(toolName, toolArgs, turnIdempotencyKey);
        
        stepUpdate.status = 'success';
        stepUpdate.entityId = entity?.id;
        stepUpdate.label = `Completed: ${toolName.replace(/_/g, ' ')}`;
        options.onStepUpdate?.(stepUpdate);

        if (entity) confirmedEntities.push(entity);

        functionResponseParts.push({
          functionResponse: {
            name: toolName,
            response: result,
          },
        });
      } catch (toolErr: any) {
        stepUpdate.status = 'error';
        stepUpdate.details = toolErr.message || 'Tool execution failed';
        stepUpdate.label = `Failed: ${toolName.replace(/_/g, ' ')}`;
        options.onStepUpdate?.(stepUpdate);

        functionResponseParts.push({
          functionResponse: {
            name: toolName,
            response: { error: toolErr.message || 'Execution error' },
          },
        });
      }
    }

    contents.push({
      role: 'function',
      parts: functionResponseParts,
    });
  }

  return {
    replyText: 'Actions processed and recorded in your workspace.',
    executedTools: executedSteps,
    confirmedEntities,
  };
}
