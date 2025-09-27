import { AgentDefinition, ChatMessage } from './types.js'
import { OpenRouterToolClient, ConversationResult } from './openrouter-tools.js'
import { toolRegistry } from './tools/registry.js'
import { ToolDefinition, ToolContext, ToolResult } from './tools/types.js'

export class ToolCallingAgent {
  private availableTools: ToolDefinition[]

  constructor(
    public definition: AgentDefinition,
    private client: OpenRouterToolClient,
    private context: {
      workingDirectory: string
      projectRoot: string
    }
  ) {
    // Get available tools for this agent
    this.availableTools = this.definition.tools
      .map(toolName => toolRegistry.get(toolName))
      .filter(Boolean) as ToolDefinition[]
  }

  async process(input: string, additionalContext?: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(additionalContext)
      },
      {
        role: 'user',
        content: input
      }
    ]

    // Start conversation with tool calling
    return await this.runConversation(messages)
  }

  async *processStream(input: string, additionalContext?: string): AsyncGenerator<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(additionalContext)
      },
      {
        role: 'user',
        content: input
      }
    ]

    // Run conversation with real-time tool feedback
    const result = await this.runConversationWithLiveFeedback(messages)
    
    // Stream the final response (without tool operations part that was already shown)
    const responseWithoutToolOps = result.replace(/\n\n🔧 Tool Operations:[\s\S]*$/, '')
    const chunks = responseWithoutToolOps.split(' ')
    for (const chunk of chunks) {
      yield chunk + ' '
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 30))
    }
  }

  private async runConversationWithLiveFeedback(messages: ChatMessage[], maxRounds: number = 5): Promise<string> {
    let conversationMessages = [...messages]
    let finalResponse = ''
    
    // Import picocolors properly
    const pc = (await import('picocolors')).default
    
    for (let round = 0; round < maxRounds; round++) {
      const { OnebuffConfigManager } = await import('./onebuff-config.js')
      const configManager = new OnebuffConfigManager()
      const config = configManager.loadConfig()
      const model = this.definition.model || config.default_model
      const result = await this.client.chatWithTools(conversationMessages, this.availableTools, model)
      
      // Add assistant response
      if (result.content) {
        finalResponse += result.content
        conversationMessages.push({
          role: 'assistant',
          content: result.content
        })
      }
      
      // Handle tool calls with live feedback
      if (result.toolCalls && result.toolCalls.length > 0) {
        console.log('\n' + pc.bold('🔧 Executing Tools:'))
        
        for (const toolCall of result.toolCalls) {
          // Show which tool is starting
          process.stdout.write(`  ${pc.cyan('→')} ${toolCall.toolName} `)
          
          // Show spinner while tool executes
          const spinner = this.startSpinner()
          const toolResult = await this.executeTool(toolCall.toolName, toolCall.args)
          this.stopSpinner(spinner)
          
          // Show result
          if (toolResult.success) {
            const success = pc.green('✅')
            const message = toolResult.message || 'Success'
            console.log(`${success} ${message}`)
            
            // Add tool result to conversation
            conversationMessages.push({
              role: 'user',
              content: `Tool ${toolCall.toolName} completed successfully. Result: ${JSON.stringify(toolResult.data)}`
            })
          } else {
            const error = pc.red('❌')
            console.log(`${error} ${toolResult.error}`)
            
            conversationMessages.push({
              role: 'user',
              content: `Tool ${toolCall.toolName} failed: ${toolResult.error}`
            })
          }
        }
        
        console.log('') // Add spacing after tool operations
        // Continue conversation to get AI's response to tool results
        // The key fix: Don't break the conversation flow!
      } else {
        // No tool calls, conversation is complete
        break
      }
    }
    
    return finalResponse
  }

  private startSpinner(): NodeJS.Timeout {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let i = 0
    return setInterval(async () => {
      try {
        const pc = (await import('picocolors')).default
        process.stdout.write(`\r  ${pc.cyan('→')} ${pc.dim(frames[i])} `)
      } catch {
        process.stdout.write(`\r  → ${frames[i]} `)
      }
      i = (i + 1) % frames.length
    }, 100)
  }

  private stopSpinner(spinner: NodeJS.Timeout): void {
    clearInterval(spinner)
    process.stdout.write('\r')
  }

  private async runConversation(messages: ChatMessage[], maxRounds: number = 5): Promise<string> {
    let conversationMessages = [...messages]
    let finalResponse = ''
    
    for (let round = 0; round < maxRounds; round++) {
      const { OnebuffConfigManager } = await import('./onebuff-config.js')
      const configManager = new OnebuffConfigManager()
      const config = configManager.loadConfig()
      const model = this.definition.model || config.default_model
      const result = await this.client.chatWithTools(conversationMessages, this.availableTools, model)
      
      // Add assistant response
      if (result.content) {
        finalResponse += result.content
        conversationMessages.push({
          role: 'assistant',
          content: result.content
        })
      }
      
      // Handle tool calls
      if (result.toolCalls && result.toolCalls.length > 0) {
        finalResponse += '\n\n🔧 Tool Operations:\n'
        
        for (const toolCall of result.toolCalls) {
          finalResponse += `\n• Using ${toolCall.toolName}...`
          
          const toolResult = await this.executeTool(toolCall.toolName, toolCall.args)
          
          if (toolResult.success) {
            finalResponse += ` ✅ ${toolResult.message || 'Success'}`
            
            // Add tool result to conversation
            conversationMessages.push({
              role: 'user',
              content: `Tool ${toolCall.toolName} completed successfully. Result: ${JSON.stringify(toolResult.data)}`
            })
          } else {
            finalResponse += ` ❌ ${toolResult.error}`
            
            conversationMessages.push({
              role: 'user',
              content: `Tool ${toolCall.toolName} failed: ${toolResult.error}`
            })
          }
        }
        
        // Continue conversation to get response to tool results
        continue
      } else {
        // No tool calls, conversation is complete
        break
      }
    }
    
    return finalResponse
  }

  private buildSystemPrompt(additionalContext?: string): string {
    let prompt = `You are ${this.definition.displayName}. ${this.definition.purpose}\n\n`
    
    // Add available agents information
    if (this.definition.spawnable && this.definition.spawnable.length > 0) {
      prompt += `Available agents you can spawn:\n`
      for (const agentId of this.definition.spawnable) {
        prompt += `- ${agentId}: Specialized agent for specific tasks\n`
      }
      prompt += '\n'
    }
    
    // Concise tool list
    prompt += `Tools available:\n`
    for (const tool of this.availableTools) {
      prompt += `- ${tool.name}: ${tool.description}\n`
    }
    
    prompt += `\nUse tools when needed:\n`
    prompt += `- Read files: read_files with {"paths": ["file1.txt"]}\n`
    prompt += `- Edit files: str_replace/write_file\n` 
    prompt += `- Run commands: run_terminal_command with {"command": "your command"}\n`
    prompt += `- Search: code_search\n`
    prompt += `- Spawn agents: spawn_agents\n`
    
    if (additionalContext) {
      prompt += `\nContext: ${additionalContext}\n`
    }
    
    prompt += `\nWorking in: ${this.context.workingDirectory}\n`
    prompt += `Use tools to accomplish user tasks efficiently.`
    
    return prompt
  }

  private async executeTool(toolName: string, params: any): Promise<ToolResult> {
    const toolContext: ToolContext = {
      workingDirectory: this.context.workingDirectory,
      projectRoot: this.context.projectRoot,
      agent: {
        id: this.definition.id,
        displayName: this.definition.displayName
      }
    }
    
    return await toolRegistry.execute(toolName, params, toolContext)
  }

  // Get tool by name for inspection
  getTool(name: string): ToolDefinition | undefined {
    return this.availableTools.find(tool => tool.name === name)
  }

  // List available tools
  getAvailableTools(): ToolDefinition[] {
    return [...this.availableTools]
  }
}