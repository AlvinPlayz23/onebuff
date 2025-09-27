import { AgentDefinition } from './types.js';
import { OpenRouterClient } from './openrouter.js';
import { ToolCallingAgent } from './tool-calling-agent.js';
export declare class Agent {
    definition: AgentDefinition;
    private client;
    private context;
    constructor(definition: AgentDefinition, client: OpenRouterClient, context: {
        workingDirectory: string;
        projectRoot: string;
    });
    process(input: string, additionalContext?: string): Promise<string>;
}
export declare class EnhancedAgentSystem {
    private client;
    private context;
    private agents;
    private toolClient;
    constructor(client: OpenRouterClient, context: {
        workingDirectory: string;
        projectRoot: string;
    }, apiKey: string, baseURL?: string);
    private registerBuiltinAgents;
    getToolAgent(id: string): ToolCallingAgent | undefined;
    getAgent(id: string): Agent | undefined;
    listAgents(): AgentDefinition[];
    registerAgent(definition: AgentDefinition): void;
    updateContext(context: {
        workingDirectory?: string;
        projectRoot?: string;
    }): void;
    executeTool(toolName: string, params: any, agentId?: string): Promise<any>;
}
export declare class AgentSystem extends EnhancedAgentSystem {
    constructor(client: OpenRouterClient, context: {
        workingDirectory: string;
        projectRoot: string;
    });
}
