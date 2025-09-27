import * as readline from 'readline'
import pc from 'picocolors'
const { bold, green, yellow, cyan, red, dim } = pc
import { ConfigManager } from './config.js'
import { OnebuffConfigManager } from './onebuff-config.js'
import { UniversalClient } from './universal-client.js'
import { AgentSystem } from './agents.js'

export class InteractiveCLI {
  private rl: readline.Interface
  private configManager: ConfigManager
  private client: UniversalClient | null = null
  private agentSystem: AgentSystem | null = null

  constructor() {
    this.configManager = new ConfigManager()
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: green('onebuff> ')
    })
  }

  async start(): Promise<void> {
    // Beautiful startup banner
    console.clear()
    console.log(bold(cyan('╔══════════════════════════════════════════════════════════════╗')))
    console.log(bold(cyan('║') + '                         ' + green('OneBuff') + '                        ' + cyan('║')))
    console.log(bold(cyan('║') + '              ' + yellow('🚀 Local AI Coding Assistant') + '             ' + cyan('║')))
    console.log(bold(cyan('╚══════════════════════════════════════════════════════════════╝')))
    console.log('')
    
    console.log(dim('Type ' + cyan('"help"') + ' for commands or start chatting!'))
    console.log('')

    // Check for API key and initialize
    if (!await this.initializeClient()) {
      return
    }

    this.setupEventListeners()
    this.rl.prompt()
  }

  private async initializeClient(): Promise<boolean> {
    const apiKey = this.configManager.getApiKey()
    
    if (!apiKey) {
      console.log(yellow('⚠️  No OpenRouter API key found.'))
      console.log('Please set your API key using one of these methods:')
      console.log('1. Environment variable: export OPENROUTER_API_KEY=your_key')
      console.log('2. Use the config command: onebuff config set-key your_key')
      console.log('3. Get a key at: https://openrouter.ai/keys')
      return false
    }

    try {
      // Import project context detector
      const { ProjectContextDetector } = await import('./project-context.js')
      const { EnhancedAgentSystem } = await import('./agents.js')
      
      // Detect project context
      const projectRoot = ProjectContextDetector.detectProjectRoot(process.cwd())
      const projectContext = ProjectContextDetector.analyzeProject(projectRoot)
      
      console.log(bold(green('📁 Project detected:')))
      console.log(`  ${cyan('Name:')} ${projectContext.name}`)
      console.log(`  ${cyan('Type:')} ${projectContext.type}`)
      console.log(`  ${cyan('Languages:')} ${projectContext.language.join(', ')}`)
      console.log(`  ${cyan('Root:')} ${dim(projectContext.root)}`)
      console.log('')
      
      this.client = new UniversalClient()
      
      // Get config for connection test
      const onebuffConfig = this.configManager.getOnebuffConfig()
      const config = onebuffConfig.loadConfig()
      
      // Initialize enhanced agent system with project context
      this.agentSystem = new EnhancedAgentSystem(this.client as any, {
        workingDirectory: process.cwd(),
        projectRoot: projectContext.root
      }, apiKey, onebuffConfig.getBaseUrl())
      
      // Test the connection with minimal tokens (use very small request)
      await this.client.chat([{ role: 'user', content: 'Hi' }], undefined, { maxTokens: 10 })
      
      const model = this.configManager.getDefaultModel()
      const isFree = model.includes(':free') || model.includes('free')
      
      console.log(bold(green('✅ Connected to OpenRouter successfully!')))
      console.log(`${cyan('Default model:')} ${isFree ? green(model) : cyan(model)}${isFree ? green(' (FREE)') : ''}`)
      console.log(`${cyan('Base URL:')} ${onebuffConfig.getBaseUrl()}`)
      console.log(`${cyan('Working directory:')} ${dim(process.cwd())}`)
      console.log('')
      return true
    } catch (error) {
      console.log(red(`❌ Failed to connect to OpenRouter: ${error}`))
      console.log('Please check your API key and try again.')
      return false
    }
  }

  private setupEventListeners(): void {
    this.rl.on('line', async (input) => {
      const trimmed = input.trim()
      
      if (!trimmed) {
        this.rl.prompt()
        return
      }

      try {
        await this.handleCommand(trimmed)
      } catch (error) {
        console.log(red(`Error: ${error}`))
      }
      
      this.rl.prompt()
    })

    this.rl.on('close', () => {
      console.log(dim('Goodbye!'))
      process.exit(0)
    })
  }

  private async handleCommand(input: string): Promise<void> {
    // Handle commands that start with / or are plain commands
    let command: string
    let parts: string[]
    
    if (input.startsWith('/')) {
      // Remove the / prefix and split
      const withoutSlash = input.slice(1)
      parts = withoutSlash.split(' ')
      command = parts[0].toLowerCase()
    } else {
      parts = input.split(' ')
      command = parts[0].toLowerCase()
    }

    switch (command) {
      case 'help':
        this.showHelp()
        break
        
      case 'agents':
        this.showAgents()
        break
        
      case 'tools':
        this.showTools()
        break
        
      case 'models':
        await this.showModels()
        break
        
      case 'config':
        await this.handleConfig(parts.slice(1))
        break
        
      case 'test-tool':
        await this.handleTestTool(parts.slice(1))
        break
        
      case 'project':
        await this.showProjectInfo()
        break

      case 'credits':
      case 'account':
        await this.showAccountInfo()
        break
        

        
      case 'quit':
      case 'exit':
        this.rl.close()
        break
        
      default:
        // Only treat as chat if it doesn't start with / or isn't a recognized command
        if (input.startsWith('/')) {
          console.log(yellow(`Unknown command: ${command}`))
          console.log('Type "help" or "/help" to see available commands')
        } else {
          await this.handleChat(input)
        }
        break
    }
  }

  private showHelp(): void {
    console.log('')
    console.log(bold(cyan('╔════════════════════════════════════════════════════════════════════════════════════════╗')))
    console.log(bold(cyan('║') + '                           ' + green('OneBuff Help & Commands') + '                          ' + cyan('║')))
    console.log(bold(cyan('╚════════════════════════════════════════════════════════════════════════════════════════╝')))
    console.log('')
    
    console.log(bold(yellow('📋 Available Commands:')))
    console.log(`  ${cyan('help')} or ${cyan('/help')}     - Show this help message`)
    console.log(`  ${cyan('agents')}             - List available AI agents`)
    console.log(`  ${cyan('tools')}              - List available tools`)
    console.log(`  ${cyan('models')}             - List available AI models`)
    console.log(`  ${cyan('config')}             - Configure OneBuff settings`)
    console.log(`  ${cyan('credits')}            - Check OpenRouter account/credits`)
    console.log(`  ${green('/provider')}         - ${bold('Setup AI provider (OpenRouter/Custom)')}`)
    console.log(`  ${cyan('test-tool')}          - Test a specific tool directly`)
    console.log(`  ${cyan('project')}            - Show project context information`)
    console.log(`  ${cyan('quit')}/${cyan('exit')}            - Exit OneBuff`)
    console.log('')
    
    console.log(bold(yellow('⚙️  Configuration Examples:')))
    console.log(`  ${dim('config init                      # Initialize config file')}`)
    console.log(`  ${dim('config free-models               # Show free models')}`)
    console.log(`  ${dim('config set-model grok-4-turbo:free # Use free Grok model')}`)
    console.log('')
    
    console.log(bold(yellow('🛠️  Tool Testing:')))
    console.log(`  ${dim('test-tool read_files {"paths": ["package.json"]}')}`)
    console.log(`  ${dim('test-tool run_terminal_command {"command": "ls -la"}')}`)
    console.log('')
    console.log(bold('💬 Natural Language Chat:'))
    console.log('  Just type naturally to chat with the AI assistant!')
    console.log('  Examples:')
    console.log(`  ${dim('• "What files are in this project?"')}`)
    console.log(`  ${dim('• "Read the README file and summarize it"')}`)
    console.log(`  ${dim('• "Help me understand this codebase"')}`)
    console.log(`  ${dim('• "Find all TypeScript files with errors"')}`)
    console.log('')
    console.log(bold('🤖 Current Setup:'))
    const config = this.configManager.getOnebuffConfig().loadConfig()
    console.log(`  Model: ${cyan(config.default_model)} ${config.default_model.includes(':free') ? green('(FREE)') : ''}`)
    console.log(`  Max Tokens: ${config.max_tokens}`)
    console.log(`  Working Directory: ${process.cwd()}`)
  }

  private async handleTestTool(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.log(yellow('Usage: test-tool <tool-name> [params-json]'))
      console.log('Example: test-tool read_files {"paths": ["package.json"]}')
      return
    }

    const toolName = args[0]
    const paramsJson = args.slice(1).join(' ') || '{}'
    
    try {
      const params = JSON.parse(paramsJson)
      console.log(`Testing tool: ${cyan(toolName)}`)
      console.log(`Parameters: ${dim(JSON.stringify(params, null, 2))}`)
      
      if (this.agentSystem) {
        const result = await (this.agentSystem as any).executeTool(toolName, params)
        console.log(`\n${bold('Result:')}`)
        console.log(JSON.stringify(result, null, 2))
      }
    } catch (error) {
      console.log(red(`Tool test failed: ${error}`))
    }
  }

  private async showProjectInfo(): Promise<void> {
    try {
      const { ProjectContextDetector } = await import('./project-context.js')
      const projectRoot = ProjectContextDetector.detectProjectRoot(process.cwd())
      const projectContext = ProjectContextDetector.analyzeProject(projectRoot)
      const summary = ProjectContextDetector.generateProjectSummary(projectContext)
      
      console.log(bold('📁 Project Context:'))
      console.log(summary)
    } catch (error) {
      console.log(red(`Failed to analyze project: ${error}`))
    }
  }

  private showTools(): void {
    const { toolRegistry } = require('./tools/registry.js')
    const tools = toolRegistry.list()
    
    console.log(bold('Available tools:'))
    for (const tool of tools) {
      console.log(`  ${cyan(tool.name)}`)
      console.log(`    ${tool.description}`)
    }
  }

  private showAgents(): void {
    if (!this.agentSystem) return
    
    const agents = this.agentSystem.listAgents()
    console.log(bold('Available agents:'))
    
    for (const agent of agents) {
      console.log(`  ${cyan(agent.displayName)} (${dim(agent.id)})`)
      console.log(`    ${agent.purpose}`)
      console.log(`    Tools: ${dim(agent.tools.join(', '))}`)
      if (agent.spawnable && agent.spawnable.length > 0) {
        console.log(`    Can spawn: ${dim(agent.spawnable.join(', '))}`)
      }
      console.log()
    }
  }

  private async showModels(): Promise<void> {
    if (!this.client) return
    
    try {
      console.log('Fetching available models...')
      const models = await this.client.getModels()
      console.log(bold(`Available models (${models.length}):`))
      
      // Show popular models first
      const popular = models.filter((m: any) => 
        m.id.includes('claude') || m.id.includes('gpt') || m.id.includes('gemini')
      ).slice(0, 10)
      
      for (const model of popular) {
        console.log(`  ${cyan(model.id)} - ${dim(model.name)}`)
      }
      console.log(`  ... and ${models.length - popular.length} more`)
    } catch (error) {
      console.log(red(`Failed to fetch models: ${error}`))
    }
  }

  private async handleConfig(args: string[]): Promise<void> {
    const onebuffConfig = this.configManager.getOnebuffConfig()
    
    if (args.length === 0) {
      // Show current config
      console.log(bold('Current OneBuff Configuration:'))
      const config = onebuffConfig.exportConfig()
      
      for (const [key, value] of Object.entries(config)) {
        console.log(`  ${key}: ${value}`)
      }
      return
    }

    const subcommand = args[0]
    
    switch (subcommand) {
      case 'init':
        const force = args.includes('--force')
        onebuffConfig.initConfig(force)
        console.log(green('✅ Configuration initialized'))
        break
        
      case 'set-key':
        if (args[1]) {
          onebuffConfig.setApiKey(args[1])
          console.log(green('✅ API key updated'))
        } else {
          console.log(yellow('Please provide an API key: config set-key your_key'))
        }
        break
        
      case 'set-baseurl':
        if (args[1]) {
          onebuffConfig.setBaseUrl(args[1])
          console.log(green(`✅ Base URL updated to: ${args[1]}`))
        } else {
          console.log(yellow('Please provide a base URL: config set-baseurl https://api.example.com/v1'))
        }
        break
        
      case 'set-model':
        if (args[1]) {
          onebuffConfig.setModel(args[1])
          console.log(green(`✅ Default model set to: ${args[1]}`))
        } else {
          console.log(yellow('Please provide a model name: config set-model model_name'))
        }
        break
        
      case 'free-models':
        const freeModels = onebuffConfig.getFreeModels()
        console.log(bold('Available Free Models:'))
        for (const [name, model] of Object.entries(freeModels)) {
          console.log(`  ${cyan(name)}: ${model}`)
        }
        console.log(`\nTo use: ${dim('config set-model <model>')}`)
        break
        
      case 'recommend':
        const usage = args[1] as 'testing' | 'development' | 'production' || 'testing'
        const recommended = onebuffConfig.getRecommendedModel(usage)
        console.log(`Recommended model for ${bold(usage)}: ${cyan(recommended)}`)
        console.log(`To set: ${dim(`config set-model ${recommended}`)}`)
        break
        
      default:
        console.log(bold('Available config commands:'))
        console.log('  init [--force]     - Initialize config file')
        console.log('  set-key <key>      - Set API key')
        console.log('  set-baseurl <url>  - Set base URL for API provider')
        console.log('  set-model <model>  - Set default model')
        console.log('  free-models        - List available free models')
        console.log('  recommend [usage]  - Get model recommendation (testing/development/production)')
    }
  }

  private async handleChat(input: string): Promise<void> {
    if (!this.client || !this.agentSystem) {
      console.log(red('Client not initialized. Please check your API key.'))
      return
    }

    try {
      console.log(dim('🤖 Agent working...'))
      
      // Use enhanced tool-calling agent
      const baseAgent = (this.agentSystem as any).getToolAgent('base')
      if (!baseAgent) {
        console.log(red('Base agent not available'))
        return
      }

      // Stream the response with tool calling
      let response = ''
      const stream = baseAgent.processStream(input)
      
      for await (const chunk of stream) {
        process.stdout.write(chunk)
        response += chunk
      }
      
      console.log('\n') // Add final newline
    } catch (error) {
      console.log(red(`Chat error: ${error}`))
      
      // Fallback to simple agent if tool calling fails
      try {
        const simpleAgent = this.agentSystem.getAgent('base')
        if (simpleAgent) {
          console.log(dim('Falling back to simple mode...'))
          const response = await simpleAgent.process(input)
          console.log(`\n${response}\n`)
        }
      } catch (fallbackError) {
        console.log(red(`Fallback failed: ${fallbackError}`))
      }
    }
  }

  private async showAccountInfo(): Promise<void> {
    if (!this.client) {
      console.log(red('Client not initialized. Please check your API key.'))
      return
    }

    try {
      console.log(bold('🔍 Checking API Provider Account Information...'))
      
      const accountInfo = await this.client.getAccountInfo()
      
      if ('error' in accountInfo) {
        console.log(red(`❌ ${accountInfo.error}`))
        if (accountInfo.status) {
          console.log(yellow(`HTTP Status: ${accountInfo.status}`))
        }
      } else {
        console.log(green('✅ Account information retrieved:'))
        console.log(`Endpoint: ${accountInfo.endpoint}`)
        console.log('Data:', JSON.stringify(accountInfo.data, null, 2))
      }
    } catch (error) {
      console.log(red(`Failed to get account info: ${error}`))
    }
  }
}