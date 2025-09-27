import { ToolDefinition, ToolContext, ToolResult } from './types.js';
export declare class ToolRegistry {
    private tools;
    constructor();
    private registerBuiltinTools;
    register(tool: ToolDefinition): void;
    get(name: string): ToolDefinition | undefined;
    list(): ToolDefinition[];
    getNames(): string[];
    execute(toolName: string, params: any, context: ToolContext): Promise<ToolResult>;
    setAgentSystem(agentSystem: any): void;
}
export declare const toolRegistry: ToolRegistry;
