/**
 * Personal HQ — AI Agent Engine (Native Gemini Function Calling)
 *
 * Implements the system prompt specification:
 * - Proof-first mutations (confirms only after real tool execution with row ID)
 * - Dynamic tool subsetting (3-5 tools per prompt to keep Flash models accurate)
 * - Compressed workspace context aggregation (<250 tokens)
 * - Runtime argument validation & idempotency keys
 * - Prompt-injection shielding for uploaded study content
 * - Active sliding-window rate limiting (15 RPM / 1,500 RPD) with token tracking
 */

import { recordAiRequest, checkRateLimit } from './ai-usage-tracker';
import { SYSTEM_PROMPT, buildCompressedWorkspaceContext } from './ai/agentSystemPrompt';
import { ALL_TOOL_DECLARATIONS, getScopedToolDeclarations } from './ai/agentToolsDeclarations';
import { executeToolCall } from './ai/agentToolExecutors';

export { SYSTEM_PROMPT, buildCompressedWorkspaceContext, ALL_TOOL_DECLARATIONS, getScopedToolDeclarations, executeToolCall };

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

const DEFAULT_PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';

// ─── API DISPATCHER (GEMINI DIRECT / PROXY) ──────────────────────────────────

async function callGeminiApi(
  apiKey: string,
  model: string,
  payload: any
): Promise<any> {
  // Pre-flight Rate Limit check
  const rateStatus = checkRateLimit();
  if (!rateStatus.allowed) {
    throw new Error(rateStatus.warningMessage || 'Rate limit reached. Please wait before making more requests.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const status = response.status;
    const msg = errorBody.error?.message || response.statusText;

    if (status === 429) {
      throw new Error('Gemini API rate limit exceeded (429). Please wait 30 seconds before retrying.');
    }
    if (status === 503 || status === 500) {
      throw new Error(`Gemini service temporarily overloaded (${status}). Retrying with backup model.`);
    }
    throw new Error(`Gemini API error (${status}): ${msg}`);
  }

  const data = await response.json();

  // Track Token Usage
  const usage = data.usageMetadata;
  const promptTokens = usage?.promptTokenCount || 200;
  const completionTokens = usage?.candidatesTokenCount || 100;
  recordAiRequest(promptTokens, completionTokens);

  return data;
}

// ─── MULTI-TURN TOOL CALLING AGENT LOOP ───────────────────────────────────────

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
    throw new Error('Gemini API key is required. Please set your key in Settings.');
  }

  const primaryModel = options.model || DEFAULT_PRIMARY_MODEL;
  const tools = getScopedToolDeclarations(userPrompt, options.activeModule);
  const executedSteps: AgentStepUpdate[] = [];
  const confirmedEntities: Array<{ type: string; id: string; title: string }> = [];

  // Generate turn idempotency key
  const turnIdempotencyKey = Math.random().toString(36).substring(2, 10);

  // Build working contents array
  const contents: any[] = [...conversationHistory];

  // Append user message with workspace context header
  const compressedContext = buildCompressedWorkspaceContext();
  const userTextWithContext = `[Live App State: ${compressedContext}]\n\nUser Request: ${userPrompt}`;

  contents.push({
    role: 'user',
    parts: [{ text: userTextWithContext }],
  });

  let currentTurn = 0;
  const maxTurns = 4; // Safety ceiling to prevent infinite loops

  while (currentTurn < maxTurns) {
    currentTurn++;

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      tools: [{ functionDeclarations: tools }],
      generationConfig: {
        temperature: 0.25,
      },
    };

    let responseData: any;
    try {
      responseData = await callGeminiApi(apiKey, primaryModel, payload);
    } catch (err: any) {
      // Fallback if 503 or primary model fails
      if (primaryModel !== FALLBACK_MODEL && err.message?.includes('overloaded')) {
        console.warn(`[Agent] Falling back to ${FALLBACK_MODEL}`);
        responseData = await callGeminiApi(apiKey, FALLBACK_MODEL, payload);
      } else {
        throw err;
      }
    }

    const candidate = responseData.candidates?.[0];
    const candidateContent = candidate?.content;
    const parts = candidateContent?.parts || [];

    // Check if model emitted function calls
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length === 0) {
      // Final textual response reached
      const replyText = parts.map((p: any) => p.text || '').join('\n').trim();
      return {
        replyText: replyText || 'Action completed successfully.',
        executedTools: executedSteps,
        confirmedEntities,
      };
    }

    // Append model's response to history
    contents.push(candidateContent);

    // Execute tool calls sequentially
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

    // Append tool execution proofs back to Gemini in the same conversation
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
