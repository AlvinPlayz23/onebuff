import { OpenRouterToolClient } from './openrouter-tools.js';
import { ToolCallingAgent } from './tool-calling-agent.js';
import { toolRegistry } from './tools/registry.js';
// Legacy agent for backward compatibility
export class Agent {
    definition;
    client;
    context;
    constructor(definition, client, context) {
        this.definition = definition;
        this.client = client;
        this.context = context;
    }
    async process(input, additionalContext) {
        // This is now just a wrapper - use ToolCallingAgent for real functionality
        const toolClient = new OpenRouterToolClient(process.env.OPENROUTER_API_KEY || '');
        const toolAgent = new ToolCallingAgent(this.definition, toolClient, this.context);
        return await toolAgent.process(input, additionalContext);
    }
}
export class EnhancedAgentSystem {
    client;
    context;
    agents = new Map();
    toolClient;
    constructor(client, context, apiKey, baseURL) {
        this.client = client;
        this.context = context;
        // Create enhanced tool client with base URL
        this.toolClient = new OpenRouterToolClient(apiKey, baseURL);
        // Register the agent system with the tool registry for spawning
        toolRegistry.setAgentSystem(this);
        // Initialize with enhanced agents
        this.registerBuiltinAgents();
    }
    registerBuiltinAgents() {
        const baseAgent = {
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
        };
        const reviewer = {
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
        };
        const researcher = {
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
        };
        const fileExplorer = {
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
        };
        this.agents.set(baseAgent.id, baseAgent);
        this.agents.set(reviewer.id, reviewer);
        this.agents.set(researcher.id, researcher);
        this.agents.set(fileExplorer.id, fileExplorer);
    }
    // Get a tool-calling agent (preferred method)
    getToolAgent(id) {
        const definition = this.agents.get(id);
        if (!definition)
            return undefined;
        return new ToolCallingAgent(definition, this.toolClient, this.context);
    }
    // Get legacy agent (for backward compatibility)
    getAgent(id) {
        const definition = this.agents.get(id);
        if (!definition)
            return undefined;
        return new Agent(definition, this.client, this.context);
    }
    listAgents() {
        return Array.from(this.agents.values());
    }
    registerAgent(definition) {
        this.agents.set(definition.id, definition);
    }
    // Update context (useful for changing directories)
    updateContext(context) {
        if (context.workingDirectory) {
            this.context.workingDirectory = context.workingDirectory;
        }
        if (context.projectRoot) {
            this.context.projectRoot = context.projectRoot;
        }
    }
    // Execute a single tool directly (for testing)
    async executeTool(toolName, params, agentId = 'base') {
        const toolContext = {
            workingDirectory: this.context.workingDirectory,
            projectRoot: this.context.projectRoot,
            agent: {
                id: agentId,
                displayName: this.agents.get(agentId)?.displayName || 'Unknown'
            }
        };
        return await toolRegistry.execute(toolName, params, toolContext);
    }
}
// Legacy export for backward compatibility
export class AgentSystem extends EnhancedAgentSystem {
    constructor(client, context) {
        // Get API key from environment or config
        const apiKey = process.env.OPENROUTER_API_KEY || '';
        super(client, context, apiKey);
    }
}
