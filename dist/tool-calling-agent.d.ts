import { AgentDefinition } from './types.js';
import { OpenRouterToolClient } from './openrouter-tools.js';
import { ToolDefinition } from './tools/types.js';
export declare class ToolCallingAgent {
    definition: AgentDefinition;
    private client;
    private context;
    private availableTools;
    constructor(definition: AgentDefinition, client: OpenRouterToolClient, context: {
        workingDirectory: string;
        projectRoot: string;
    });
    process(input: string, additionalContext?: string): Promise<string>;
    processStream(input: string, additionalContext?: string): AsyncGenerator<string>;
    private runConversationWithLiveFeedback;
    private startSpinner;
    private stopSpinner;
    private runConversation;
    private buildSystemPrompt;
    private executeTool;
    getTool(name: string): ToolDefinition | undefined;
    getAvailableTools(): ToolDefinition[];
}
