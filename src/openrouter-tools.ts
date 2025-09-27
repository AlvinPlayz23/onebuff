import axios from 'axios'
import { ChatMessage } from './types.js'
import { ToolDefinition } from './tools/types.js'

export interface EnhancedOpenRouterClient {
  chat(messages: ChatMessage[], model?: string): Promise<string>
  chatWithTools(messages: ChatMessage[], tools: ToolDefinition[], model?: string): Promise<ConversationResult>
}

export interface ConversationResult {
  content: string
  toolCalls: ToolCallResult[]
  finishReason: 'stop' | 'tool-calls' | 'length' | 'error'
}

export interface ToolCallResult {
  id: string
  toolName: string
  args: any
  result?: any
  error?: string
}

export class OpenRouterToolClient implements EnhancedOpenRouterClient {
  private apiKey: string
  private baseURL: string

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey
    this.baseURL = baseURL || 'https://openrouter.ai/api/v1'
  }

  async chat(messages: ChatMessage[], model?: string, options?: { temperature?: number, maxTokens?: number }): Promise<string> {
    // Load configuration for defaults
    const { OnebuffConfigManager } = await import('./onebuff-config.js')
    const configManager = new OnebuffConfigManager()
    const config = configManager.loadConfig()
    
    const actualModel = model || config.default_model
    const temperature = options?.temperature || config.temperature
    
    // Use safe max tokens for free models
    let maxTokens = options?.maxTokens || config.max_tokens
    if (configManager.isFreeModel(actualModel)) {
      maxTokens = configManager.getSafeMaxTokens()
    }
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: actualModel,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature,
          max_tokens: maxTokens,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/onebuff/onebuff',
            'X-Title': 'OneBuff CLI'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message
        if (errorMessage.includes('requires more credits') || errorMessage.includes('max_tokens')) {
          throw new Error(`OpenRouter API Error: ${errorMessage}\n\nTip: Try reducing max_tokens in onebuff-config.json or use a different free model.`)
        }
        throw new Error(`OpenRouter API Error: ${errorMessage}`)
      }
      throw error
    }
  }

  async chatWithTools(
    messages: ChatMessage[], 
    tools: ToolDefinition[], 
    model?: string,
    options?: { temperature?: number, maxTokens?: number }
  ): Promise<ConversationResult> {
    const { OnebuffConfigManager } = await import('./onebuff-config.js')
    const configManager = new OnebuffConfigManager()
    const config = configManager.loadConfig()
    
    const actualModel = model || config.default_model
    const temperature = options?.temperature || config.temperature
    
    // Use max tokens from config - no optimization
    let maxTokens = options?.maxTokens || config.max_tokens
    
    // Prepare enhanced messages with tool context
    const toolsPrompt = this.buildToolsPrompt(tools)
    const enhancedMessages = [
      ...messages.slice(0, -1),
      {
        role: 'system' as const,
        content: toolsPrompt
      },
      messages[messages.length - 1]
    ]
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: actualModel,
          messages: enhancedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature,
          max_tokens: maxTokens,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/onebuff/onebuff',
            'X-Title': 'OneBuff CLI'
          }
        }
      )

      const response_text = response.data.choices[0].message.content
      
      // Simple tool detection - look for tool usage patterns in response
      const toolCalls = this.extractToolCalls(response_text, tools)
      
      return {
        content: response_text,
        toolCalls,
        finishReason: toolCalls.length > 0 ? 'tool-calls' : 'stop'
      }
    } catch (error: any) {
      return {
        content: `Error: ${error.response?.data?.error?.message || error.message}`,
        toolCalls: [],
        finishReason: 'error'
      }
    }
  }

  private buildToolsPrompt(tools: ToolDefinition[]): string {
    let prompt = 'Available tools:\n'
    
    for (const tool of tools) {
      prompt += `- ${tool.name}: ${tool.description}\n`
      // Add parameter hints for common tools
      if (tool.name === 'read_files') {
        prompt += `  Parameters: {"paths": ["file1.txt", "file2.txt"]}\n`
      } else if (tool.name === 'write_file') {
        prompt += `  Parameters: {"path": "filename.txt", "content": "file content"}\n`
      } else if (tool.name === 'run_terminal_command') {
        prompt += `  Parameters: {"command": "your command here"}\n`
      } else if (tool.name === 'spawn_agents') {
        prompt += `  Parameters: {"agents": [{"agentType": "researcher", "prompt": "task description"}]}\n`
      }
    }
    
    prompt += '\nTool format:\n```tool\n{"toolName": "name", "parameters": {...}}\n```\n'
    prompt += 'Use tools to accomplish tasks. Make sure parameter names match exactly.'
    
    return prompt
  }

  private extractToolCalls(response: string, tools: ToolDefinition[]): ToolCallResult[] {
    const toolCalls: ToolCallResult[] = []
    const toolBlockRegex = /```tool\n([\s\S]*?)\n```/g
    
    let match
    while ((match = toolBlockRegex.exec(response)) !== null) {
      try {
        const toolData = JSON.parse(match[1])
        if (toolData.toolName && tools.find(t => t.name === toolData.toolName)) {
          toolCalls.push({
            id: Date.now().toString() + Math.random(),
            toolName: toolData.toolName,
            args: toolData.parameters || {}
          })
        }
      } catch (error) {
        // Ignore invalid JSON tool calls
      }
    }
    
    return toolCalls
  }
}