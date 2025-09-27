import { AgentDefinition } from './types.js'
import { OpenRouterClient } from './openrouter.js'
import { OpenRouterToolClient } from './openrouter-tools.js'
import { ToolCallingAgent } from './tool-calling-agent.js'
import { toolRegistry } from './tools/registry.js'

// Legacy agent for backward compatibility
export class Agent {
  constructor(
    public definition: AgentDefinition,
    private client: OpenRouterClient,
    private context: {
      workingDirectory: string
      projectRoot: string
    }
  ) {}

  async process(input: string, additionalContext?: string): Promise<string> {
    // This is now just a wrapper - use ToolCallingAgent for real functionality
    const toolClient = new OpenRouterToolClient(process.env.OPENROUTER_API_KEY || '')
    const toolAgent = new ToolCallingAgent(this.definition, toolClient, this.context)
    return await toolAgent.process(input, additionalContext)
  }
}

export class EnhancedAgentSystem {
  private agents = new Map<string, AgentDefinition>()
  private toolClient: OpenRouterToolClient

  constructor(
    private client: OpenRouterClient,
    private context: {
      workingDirectory: string
      projectRoot: string
    },
    apiKey: string,
    baseURL?: string
  ) {
    // Create enhanced tool client with base URL
    this.toolClient = new OpenRouterToolClient(apiKey, baseURL)
    
    // Register the agent system with the tool registry for spawning
    toolRegistry.setAgentSystem(this)
    
    // Initialize with enhanced agents
    this.registerBuiltinAgents()
  }

  private registerBuiltinAgents(): void {
    const baseAgent: AgentDefinition = {
      id: 'base',
      displayName: 'Base Assistant',
      purpose: 'A general-purpose coding assistant that can read files, write code, run commands, search patterns, and coordinate with other agents to accomplish complex coding tasks.',
      tools: [
        'read_files',
        'write_file', 
        'str_replace',
        'run_terminal_command',
        'code_search',
        'spawn_agents',
        'create_plan',
        'think_deeply',
        'end_turn'
      ],
      spawnable: ['reviewer', 'researcher', 'file-explorer']
    }

    const reviewer: AgentDefinition = {
      id: 'reviewer',
      displayName: 'Code Reviewer',
      purpose: 'A specialized agent that reviews code for quality, security, best practices, and potential issues. Can read files, search for patterns, and provide detailed feedback.',
      tools: [
        'read_files',
        'code_search', 
        'think_deeply',
        'create_plan',
        'end_turn'
      ]
    }

    const researcher: AgentDefinition = {
      id: 'researcher',
      displayName: 'Code Researcher',
      purpose: 'An expert at researching codebases to understand architecture, find relevant information, and explore code structure. Can analyze project organization and dependencies.',
      tools: [
        'read_files',
        'code_search',
        'run_terminal_command',
        'think_deeply',
        'create_plan',
        'end_turn'
      ]
    }

    const fileExplorer: AgentDefinition = {
      id: 'file-explorer',
      displayName: 'File Explorer',
      purpose: 'Specialized in exploring and analyzing file structures, finding relevant files, and understanding project organization and architecture.',
      tools: [
        'read_files',
        'code_search',
        'run_terminal_command',
        'think_deeply',
        'end_turn'
      ]
    }

    this.agents.set(baseAgent.id, baseAgent)
    this.agents.set(reviewer.id, reviewer)
    this.agents.set(researcher.id, researcher)
    this.agents.set(fileExplorer.id, fileExplorer)
  }

  // Get a tool-calling agent (preferred method)
  getToolAgent(id: string): ToolCallingAgent | undefined {
    const definition = this.agents.get(id)
    if (!definition) return undefined
    return new ToolCallingAgent(definition, this.toolClient, this.context)
  }

  // Get legacy agent (for backward compatibility)
  getAgent(id: string): Agent | undefined {
    const definition = this.agents.get(id)
    if (!definition) return undefined
    return new Agent(definition, this.client, this.context)
  }

  listAgents(): AgentDefinition[] {
    return Array.from(this.agents.values())
  }

  registerAgent(definition: AgentDefinition): void {
    this.agents.set(definition.id, definition)
  }

  // Update context (useful for changing directories)
  updateContext(context: { workingDirectory?: string, projectRoot?: string }): void {
    if (context.workingDirectory) {
      this.context.workingDirectory = context.workingDirectory
    }
    if (context.projectRoot) {
      this.context.projectRoot = context.projectRoot
    }
  }

  // Execute a single tool directly (for testing)
  async executeTool(toolName: string, params: any, agentId: string = 'base'): Promise<any> {
    const toolContext = {
      workingDirectory: this.context.workingDirectory,
      projectRoot: this.context.projectRoot,
      agent: {
        id: agentId,
        displayName: this.agents.get(agentId)?.displayName || 'Unknown'
      }
    }
    
    return await toolRegistry.execute(toolName, params, toolContext)
  }
}

// Legacy export for backward compatibility
export class AgentSystem extends EnhancedAgentSystem {
  constructor(
    client: OpenRouterClient,
    context: { workingDirectory: string, projectRoot: string }
  ) {
    // Get API key from environment or config
    const apiKey = process.env.OPENROUTER_API_KEY || ''
    super(client, context, apiKey)
  }
}