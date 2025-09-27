import { z } from 'zod';
import { readFilesTool, writeFileTool, strReplaceTool } from './file-operations.js';
import { runTerminalCommandTool } from './terminal.js';
import { codeSearchTool } from './code-search.js';
import { spawnAgentsTool, spawnAgentInlineTool, setAgentSystemInstance } from './agent-spawn.js';
export class ToolRegistry {
    tools = new Map();
    constructor() {
        this.registerBuiltinTools();
    }
    registerBuiltinTools() {
        // File operations
        this.register(readFilesTool);
        this.register(writeFileTool);
        this.register(strReplaceTool);
        // Terminal operations
        this.register(runTerminalCommandTool);
        // Code search
        this.register(codeSearchTool);
        // Agent spawning
        this.register(spawnAgentsTool);
        this.register(spawnAgentInlineTool);
        // Additional utility tools
        this.register(createPlanTool);
        this.register(endTurnTool);
        this.register(thinkDeeplyTool);
    }
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    get(name) {
        return this.tools.get(name);
    }
    list() {
        return Array.from(this.tools.values());
    }
    getNames() {
        return Array.from(this.tools.keys());
    }
    async execute(toolName, params, context) {
        const tool = this.get(toolName);
        if (!tool) {
            return {
                success: false,
                error: `Tool '${toolName}' not found`
            };
        }
        try {
            // Validate parameters
            const validatedParams = tool.parameters.parse(params);
            // Execute the tool
            return await tool.handler(validatedParams, context);
        }
        catch (error) {
            return {
                success: false,
                error: `Tool execution failed: ${error}`
            };
        }
    }
    // Set the agent system instance for agent spawning
    setAgentSystem(agentSystem) {
        setAgentSystemInstance(agentSystem);
    }
}
// Additional utility tools
// Create Plan Tool
const createPlanTool = {
    name: 'create_plan',
    description: 'Create a plan for completing a task',
    parameters: z.object({
        task: z.string(),
        steps: z.array(z.string()),
        priority: z.enum(['low', 'medium', 'high']).optional()
    }),
    handler: async (params, context) => {
        const plan = {
            id: Date.now().toString(),
            task: params.task,
            steps: params.steps.map((step, index) => ({
                id: index + 1,
                description: step,
                completed: false
            })),
            priority: params.priority || 'medium',
            createdAt: new Date(),
            agent: context.agent?.displayName || 'Unknown'
        };
        return {
            success: true,
            data: plan,
            message: `Created plan with ${params.steps.length} steps`
        };
    }
};
// End Turn Tool
const endTurnTool = {
    name: 'end_turn',
    description: 'Signal that the agent has completed its turn',
    parameters: z.object({
        summary: z.string().optional(),
        success: z.boolean().optional()
    }),
    handler: async (params, context) => {
        return {
            success: true,
            data: {
                turnComplete: true,
                summary: params.summary || 'Task completed',
                success: params.success !== false,
                agent: context.agent?.displayName || 'Unknown'
            },
            message: 'Turn completed'
        };
    }
};
// Think Deeply Tool (for complex reasoning)
const thinkDeeplyTool = {
    name: 'think_deeply',
    description: 'Engage in deeper reasoning about a problem',
    parameters: z.object({
        problem: z.string(),
        context: z.string().optional(),
        approach: z.enum(['analytical', 'creative', 'systematic']).optional()
    }),
    handler: async (params, context) => {
        // This is a meta-tool that helps structure thinking
        const thinking = {
            problem: params.problem,
            context: params.context,
            approach: params.approach || 'analytical',
            timestamp: new Date(),
            agent: context.agent?.displayName || 'Unknown'
        };
        return {
            success: true,
            data: thinking,
            message: `Engaged in ${thinking.approach} thinking about: ${params.problem}`
        };
    }
};
// Export singleton instance
export const toolRegistry = new ToolRegistry();
