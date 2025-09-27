import { z } from 'zod'
import { ToolDefinition, ToolContext, ToolResult } from './types.js'
import { readFilesTool, writeFileTool, strReplaceTool } from './file-operations.js'
import { runTerminalCommandTool } from './terminal.js'
import { codeSearchTool } from './code-search.js'
import { spawnAgentsTool, spawnAgentInlineTool, setAgentSystemInstance } from './agent-spawn.js'

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>()
  
  constructor() {
    this.registerBuiltinTools()
  }
  
  private registerBuiltinTools(): void {
    // File operations
    this.register(readFilesTool)
    this.register(writeFileTool)
    this.register(strReplaceTool)
    
    // Terminal operations
    this.register(runTerminalCommandTool)
    
    // Code search
    this.register(codeSearchTool)
    
    // Agent spawning
    this.register(spawnAgentsTool)
    this.register(spawnAgentInlineTool)
    
    // Additional utility tools
    this.register(createPlanTool)
    this.register(endTurnTool)
    this.register(thinkDeeplyTool)
  }
  
  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool)
  }
  
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name)
  }
  
  list(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }
  
  getNames(): string[] {
    return Array.from(this.tools.keys())
  }
  
  async execute(toolName: string, params: any, context: ToolContext): Promise<ToolResult> {
    const tool = this.get(toolName)
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`
      }
    }
    
    try {
      // Validate parameters
      const validatedParams = tool.parameters.parse(params)
      
      // Execute the tool
      return await tool.handler(validatedParams, context)
    } catch (error) {
      return {
        success: false,
        error: `Tool execution failed: ${error}`
      }
    }
  }
  
  // Set the agent system instance for agent spawning
  setAgentSystem(agentSystem: any): void {
    setAgentSystemInstance(agentSystem)
  }
}

// Additional utility tools

// Create Plan Tool
const createPlanTool: ToolDefinition = {
  name: 'create_plan',
  description: 'Create a plan for completing a task',
  parameters: z.object({
    task: z.string(),
    steps: z.array(z.string()),
    priority: z.enum(['low', 'medium', 'high']).optional()
  }),
  handler: async (params: any, context: ToolContext): Promise<ToolResult> => {
    const plan = {
      id: Date.now().toString(),
      task: params.task,
      steps: params.steps.map((step: string, index: number) => ({
        id: index + 1,
        description: step,
        completed: false
      })),
      priority: params.priority || 'medium',
      createdAt: new Date(),
      agent: context.agent?.displayName || 'Unknown'
    }
    
    return {
      success: true,
      data: plan,
      message: `Created plan with ${params.steps.length} steps`
    }
  }
}

// End Turn Tool
const endTurnTool: ToolDefinition = {
  name: 'end_turn',
  description: 'Signal that the agent has completed its turn',
  parameters: z.object({
    summary: z.string().optional(),
    success: z.boolean().optional()
  }),
  handler: async (params: any, context: ToolContext): Promise<ToolResult> => {
    return {
      success: true,
      data: {
        turnComplete: true,
        summary: params.summary || 'Task completed',
        success: params.success !== false,
        agent: context.agent?.displayName || 'Unknown'
      },
      message: 'Turn completed'
    }
  }
}

// Think Deeply Tool (for complex reasoning)
const thinkDeeplyTool: ToolDefinition = {
  name: 'think_deeply',
  description: 'Engage in deeper reasoning about a problem',
  parameters: z.object({
    problem: z.string(),
    context: z.string().optional(),
    approach: z.enum(['analytical', 'creative', 'systematic']).optional()
  }),
  handler: async (params: any, context: ToolContext): Promise<ToolResult> => {
    // This is a meta-tool that helps structure thinking
    const thinking = {
      problem: params.problem,
      context: params.context,
      approach: params.approach || 'analytical',
      timestamp: new Date(),
      agent: context.agent?.displayName || 'Unknown'
    }
    
    return {
      success: true,
      data: thinking,
      message: `Engaged in ${thinking.approach} thinking about: ${params.problem}`
    }
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry()