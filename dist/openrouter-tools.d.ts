import { ChatMessage } from './types.js';
import { ToolDefinition } from './tools/types.js';
export interface EnhancedOpenRouterClient {
    chat(messages: ChatMessage[], model?: string): Promise<string>;
    chatWithTools(messages: ChatMessage[], tools: ToolDefinition[], model?: string): Promise<ConversationResult>;
}
export interface ConversationResult {
    content: string;
    toolCalls: ToolCallResult[];
    finishReason: 'stop' | 'tool-calls' | 'length' | 'error';
}
export interface ToolCallResult {
    id: string;
    toolName: string;
    args: any;
    result?: any;
    error?: string;
}
export declare class OpenRouterToolClient implements EnhancedOpenRouterClient {
    private apiKey;
    private baseURL;
    constructor(apiKey: string, baseURL?: string);
    chat(messages: ChatMessage[], model?: string, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
    chatWithTools(messages: ChatMessage[], tools: ToolDefinition[], model?: string, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<ConversationResult>;
    private buildToolsPrompt;
    private extractToolCalls;
}
