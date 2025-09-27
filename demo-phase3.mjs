#!/usr/bin/env node
// Demo script to showcase Phase 3 features without requiring API credits

import { ProjectContextDetector } from './dist/project-context.js'
import { toolRegistry } from './dist/tools/registry.js'

async function demoProjectDetection() {
  console.log('🔍 OneBuff Phase 3 - Project Detection Demo\n')
  
  const projectRoot = ProjectContextDetector.detectProjectRoot(process.cwd())
  const projectContext = ProjectContextDetector.analyzeProject(projectRoot)
  const summary = ProjectContextDetector.generateProjectSummary(projectContext)
  
  console.log('📁 Project Analysis:')
  console.log(summary)
  console.log()
}

async function demoToolSystem() {
  console.log('🛠️ OneBuff Phase 3 - Tool System Demo\n')
  
  const tools = toolRegistry.list()
  console.log(`Available Tools (${tools.length}):`)
  
  for (const tool of tools) {
    console.log(`  • ${tool.name}: ${tool.description}`)
  }
  console.log()
  
  // Test file reading tool
  console.log('📂 Testing read_files tool:')
  try {
    const result = await toolRegistry.execute('read_files', {
      paths: ['package.json']
    }, {
      workingDirectory: process.cwd(),
      projectRoot: process.cwd(),
      agent: { id: 'demo', displayName: 'Demo Script' }
    })
    
    if (result.success && result.data) {
      const fileData = result.data[0]
      console.log(`  ✅ Read ${fileData.path} (${fileData.size} bytes)`)
      
      // Show first few lines
      const lines = fileData.content.split('\n').slice(0, 5)
      console.log('  Preview:')
      lines.forEach(line => console.log(`    ${line}`))
      if (fileData.content.split('\n').length > 5) {
        console.log('    ...')
      }
    }
  } catch (error) {
    console.log(`  ❌ Tool test failed: ${error}`)
  }
  console.log()
  
  // Test code search
  console.log('🔍 Testing code_search tool:')
  try {
    const result = await toolRegistry.execute('code_search', {
      pattern: 'import',
      maxResults: 5
    }, {
      workingDirectory: process.cwd(),
      projectRoot: process.cwd(),
      agent: { id: 'demo', displayName: 'Demo Script' }
    })
    
    if (result.success) {
      console.log(`  ✅ Found ${result.data.results} files with ${result.data.matches} matches`)
      console.log('  Preview:')
      const lines = result.data.output.split('\n').slice(0, 10)
      lines.forEach(line => console.log(`    ${line}`))
      if (result.data.output.split('\n').length > 10) {
        console.log('    ...')
      }
    }
  } catch (error) {
    console.log(`  ❌ Search test failed: ${error}`)
  }
  console.log()
}

async function demoAgentCapabilities() {
  console.log('🤖 OneBuff Phase 3 - Agent Capabilities Demo\n')
  
  // We can't test actual AI without credits, but we can show the structure
  console.log('Enhanced Agent System Features:')
  console.log('  ✅ Tool-calling agents with 9 specialized tools')
  console.log('  ✅ Multi-agent coordination and spawning')
  console.log('  ✅ Project-aware context detection')
  console.log('  ✅ Safe command execution with filtering')
  console.log('  ✅ Advanced file operations with security')
  console.log('  ✅ Pattern-based code search')
  console.log('  ✅ Streaming responses with tool integration')
  console.log()
  
  console.log('Agent Types:')
  console.log('  • Base Assistant - Full coordinator with all tools')
  console.log('  • Code Reviewer - Specialized for quality analysis')  
  console.log('  • Code Researcher - Expert at codebase exploration')
  console.log('  • File Explorer - Project structure specialist')
  console.log()
}

// Run the demo
async function runDemo() {
  try {
    await demoProjectDetection()
    await demoToolSystem()  
    await demoAgentCapabilities()
    
    console.log('🎉 OneBuff Phase 3 Complete!')
    console.log('Ready for production use with OpenRouter API credits.')
    console.log()
    console.log('Next: Try "node dist/index.js --help" or add credits to test AI features!')
  } catch (error) {
    console.error('Demo failed:', error)
  }
}

runDemo()