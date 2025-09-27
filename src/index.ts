#!/usr/bin/env node

import { Command } from 'commander'
import pc from 'picocolors'
const { red, yellow, green, bold } = pc
import { ConfigManager } from './config.js'
import { OpenRouterClient } from './openrouter.js'
import { AgentSystem } from './agents.js'
import { InteractiveCLI } from './cli.js'

// Simplified CLI entry point for OneBuff
// Local-only operation with OpenRouter integration

interface OnebuffOptions {
  initialInput?: string
  model?: string
  trace?: boolean
  cwd?: string
  config?: boolean
  setKey?: string
  initConfig?: boolean
  force?: boolean
  interactive?: boolean
}

async function onebuff(options: OnebuffOptions) {
  const configManager = new ConfigManager()
  const onebuffConfig = configManager.getOnebuffConfig()

  // Handle config commands
  if (options.config) {
    console.log(bold('OneBuff Configuration:'))
    const config = onebuffConfig.exportConfig()
    for (const [key, value] of Object.entries(config)) {
      console.log(`  ${key}: ${value}`)
    }
    return
  }

  if (options.setKey) {
    onebuffConfig.setApiKey(options.setKey)
    console.log(green('✅ API key saved successfully'))
    return
  }

  if (options.initConfig) {
    onebuffConfig.initConfig(options.force || false)
    console.log(green('✅ Configuration initialized'))
    return
  }

  console.log(bold(green('🚀 OneBuff - Local AI Coding Assistant')))
  
  if (options.trace) {
    console.log(yellow('🔍 Trace mode enabled'))
  }

  // Initialize client with config-aware API key
  const apiKey = onebuffConfig.getApiKey()
  if (!apiKey) {
    console.log(red('❌ No OpenRouter API key found.'))
    console.log('Set one with: onebuff --set-key YOUR_KEY')
    console.log('Or initialize config: onebuff --init-config')
    console.log('Get a key at: https://openrouter.ai/keys')
    return
  }

  try {
    // Import enhanced components
    const { ProjectContextDetector } = await import('./project-context.js')
    const { EnhancedAgentSystem } = await import('./agents.js')
    const { OpenRouterToolClient } = await import('./openrouter-tools.js')
    
    // Detect project context
    const projectRoot = ProjectContextDetector.detectProjectRoot(process.cwd())
    const projectContext = ProjectContextDetector.analyzeProject(projectRoot)
    
    console.log(`📁 Project: ${projectContext.name} (${projectContext.type})`)
    console.log(`📂 Root: ${projectRoot}`)
    
    const config = onebuffConfig.loadConfig()
    console.log(`🤖 Model: ${config.default_model} ${onebuffConfig.isFreeModel() ? '(FREE)' : ''}`)
    console.log(`🌐 API: ${onebuffConfig.getBaseUrl()}`)
    
    const client = new OpenRouterClient(apiKey, onebuffConfig.getBaseUrl())
    const agentSystem = new EnhancedAgentSystem(client, {
      workingDirectory: process.cwd(),
      projectRoot: projectContext.root
    }, apiKey, onebuffConfig.getBaseUrl())
    
    if (options.initialInput) {
      // Process single input with enhanced tool-calling agent
      console.log(`Input: ${options.initialInput}`)
      console.log(yellow('🤖 Processing with enhanced AI agent...'))
      
      const baseAgent = agentSystem.getToolAgent('base')
      if (baseAgent) {
        const model = options.model || config.default_model
        console.log(`Using model: ${model}`)
        
        // Stream the response
        console.log(green('\nResponse:'))
        const stream = baseAgent.processStream(options.initialInput)
        for await (const chunk of stream) {
          process.stdout.write(chunk)
        }
        console.log('\n')
      } else {
        console.log(red('Enhanced agent not available, trying fallback...'))
        const simpleAgent = agentSystem.getAgent('base')
        if (simpleAgent) {
          const response = await simpleAgent.process(options.initialInput)
          console.log(`\n${green('Response:')}\n${response}`)
        }
      }
    } else {
      // Start interactive mode
      const cli = new InteractiveCLI()
      await cli.start()
    }
  } catch (error) {
    console.error(red(`Error: ${error instanceof Error ? error.message : String(error)}`))
    process.exit(1)
  }
}

const program = new Command()

program
  .name('onebuff')
  .description('Local-first AI coding assistant with multi-agent system')
  .version('1.0.0')

program
  .argument('[input]', 'Initial input to process')
  .option('--model <model>', 'Model to use (OpenRouter format)')
  .option('--trace', 'Enable trace mode for debugging')
  .option('--cwd <path>', 'Working directory')
  .option('--config', 'Show current configuration')
  .option('--set-key <key>', 'Set OpenRouter API key')
  .option('--init-config', 'Initialize onebuff-config.json')
  .option('--force', 'Force overwrite existing config')
  .option('-i, --interactive', 'Force interactive mode')
  .action(async (initialInput: string | undefined, options) => {
    try {
      await onebuff({
        initialInput: options.interactive ? undefined : initialInput,
        ...options
      })
    } catch (error) {
      console.error(red(`Error: ${error instanceof Error ? error.message : String(error)}`))
      process.exit(1)
    }
  })

program.parse()
