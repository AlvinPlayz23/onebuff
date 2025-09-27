#!/usr/bin/env node
// Configuration System Demo - showcasing OneBuff's enhanced config capabilities

import { OnebuffConfigManager, FREE_MODELS } from './dist/onebuff-config.js'
import { toolRegistry } from './dist/tools/registry.js'

console.log('🚀 OneBuff Configuration System Demo\n')

// 1. Show config system
console.log('📋 Configuration Management:')
const configManager = new OnebuffConfigManager(process.cwd())

// Initialize config if needed
const config = configManager.initConfig()
console.log('  ✅ Configuration loaded/initialized')
console.log('  📄 Config file: onebuff-config.json')

// Show current configuration
console.log('\n🔧 Current Configuration:')
const exportedConfig = configManager.exportConfig()
for (const [key, value] of Object.entries(exportedConfig)) {
  console.log(`  ${key}: ${value}`)
}

// 2. Show free models
console.log('\n💰 Available Free Models:')
const freeModels = configManager.getFreeModels()
for (const [name, model] of Object.entries(freeModels)) {
  console.log(`  • ${name}: ${model}`)
}

console.log(`\n🎯 Current model is ${configManager.isFreeModel() ? 'FREE' : 'PAID'}`)

// 3. Show model recommendations
console.log('\n🎯 Model Recommendations:')
console.log(`  Testing: ${configManager.getRecommendedModel('testing')}`)
console.log(`  Development: ${configManager.getRecommendedModel('development')}`)
console.log(`  Production: ${configManager.getRecommendedModel('production')}`)

// 4. Test tool with config (file operations work without API)
console.log('\n🛠️ Testing Tool System:')
try {
  const result = await toolRegistry.execute('read_files', {
    paths: ['onebuff-config.json']
  }, {
    workingDirectory: process.cwd(),
    projectRoot: process.cwd(),
    agent: { id: 'demo', displayName: 'Config Demo' }
  })
  
  if (result.success && result.data?.[0]) {
    console.log('  ✅ Configuration file read successfully')
    console.log(`  📊 Size: ${result.data[0].size} bytes`)
    
    // Parse and show config structure
    const configContent = JSON.parse(result.data[0].content)
    console.log('  📋 Config Structure:')
    console.log(`    - Model: ${configContent.default_model}`)
    console.log(`    - Temperature: ${configContent.temperature}`)
    console.log(`    - Max Tokens: ${configContent.max_tokens}`)
    console.log(`    - Ignore Patterns: ${configContent.ignore_patterns.length} items`)
  }
} catch (error) {
  console.log(`  ❌ Tool test failed: ${error}`)
}

// 5. Show ignore patterns
console.log('\n🚫 Ignore Patterns:')
const ignorePatterns = configManager.getIgnorePatterns()
ignorePatterns.forEach(pattern => {
  console.log(`  • ${pattern}`)
})

// 6. Show tool and agent settings
console.log('\n⚙️ Tool Settings:')
const toolSettings = configManager.getToolSettings()
for (const [key, value] of Object.entries(toolSettings)) {
  console.log(`  ${key}: ${value}`)
}

console.log('\n🤖 Agent Settings:')
const agentSettings = configManager.getAgentSettings()
for (const [key, value] of Object.entries(agentSettings)) {
  console.log(`  ${key}: ${value}`)
}

// 7. Show usage instructions
console.log('\n🎯 Usage Instructions:')
console.log('  To use free models:')
console.log('    node dist/index.js --init-config')
console.log('    node dist/index.js --set-key YOUR_OPENROUTER_KEY')
console.log('    # Default is already set to free model!')
console.log('')
console.log('  To change model:')
console.log('    node dist/index.js -i')
console.log('    > config set-model llama-3.2-1b')
console.log('')
console.log('  To see free models:')
console.log('    node dist/index.js -i')  
console.log('    > config free-models')
console.log('')

console.log('✅ Configuration System Demo Complete!')
console.log('🎉 OneBuff is ready for free model usage!')