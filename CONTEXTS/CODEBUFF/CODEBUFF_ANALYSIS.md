# Codebuff Architecture Analysis

## Overview
Codebuff is a sophisticated multi-agent AI coding assistant that uses specialized agents to understand codebases and make precise changes. It's built as a monorepo with multiple packages working together.

## Core Architecture

### 1. Project Structure
```
codebuff/
├── .agents/              # Agent definitions and templates
├── backend/              # Server-side logic and API
├── common/               # Shared utilities and constants
├── npm-app/              # CLI application (our main focus)
├── web/                  # Web interface (not needed for our fork)
├── sdk/                  # SDK (not needed for our fork)
├── packages/             # Additional packages
└── scripts/              # Build and deployment scripts
```

### 2. Key Components for CLI

#### npm-app (Main CLI)
- **Entry Point**: `src/index.ts` - Main CLI entry with Commander.js
- **Core CLI**: `src/cli.ts` - Main CLI logic and user interaction
- **Agent Management**: `src/agents/` - Agent loading and execution
- **Configuration**: `src/config.ts` - App configuration
- **Project Files**: `src/project-files.ts` - File system operations
- **Terminal**: `src/terminal/` - Command execution

#### .agents (Agent Definitions)
- **Base Agents**: Core agent templates (base.ts, reviewer.ts, etc.)
- **Factory**: Agent creation patterns in `factory/` folder
- **Specialized Agents**: file-explorer.ts, researcher.ts, etc.
- **Registry**: Agent registration and management

#### backend (API and Logic)
- **LLM APIs**: `src/llm-apis/` - Model inference integrations
  - `openrouter.ts` - OpenRouter integration
  - `claude.ts` - Direct Anthropic integration
  - `gemini-with-fallbacks.ts` - Google models
- **Agent Execution**: `src/run-agent-step.ts` - Agent step processing
- **Tools**: `src/tools/` - Available tools for agents

#### common (Shared Code)
- **Constants**: `src/old-constants.ts` - Model definitions and configs
- **Types**: Shared TypeScript types
- **Utilities**: Helper functions

## 3. Agent System

### Multi-Agent Architecture
1. **File Explorer Agent** - Scans codebase to understand architecture
2. **Planner Agent** - Creates execution plans
3. **Editor Agent** - Makes precise code edits  
4. **Reviewer Agent** - Validates changes
5. **Context Pruner** - Manages context limits
6. **Researcher** - Finds relevant information

### Agent Workflow
```
User Input → Base Agent → Spawns Specialized Agents → Tool Execution → Response
```

## 4. Model System

### Current Model Setup
- **Primary Models**: Uses OpenRouter for Claude, GPT, Gemini
- **Cost Modes**: lite, normal, max, experimental, ask
- **Model Selection**: Based on operation type and cost mode

### Model Definitions (from old-constants.ts)
```typescript
export const openrouterModels = {
  openrouter_claude_sonnet_4: 'anthropic/claude-4-sonnet-20250522',
  openrouter_claude_opus_4: 'anthropic/claude-opus-4.1',
  openrouter_claude_3_5_haiku: 'anthropic/claude-3.5-haiku-20241022',
  openrouter_gpt4o: 'openai/gpt-4o-2024-11-20',
  openrouter_gemini2_5_pro_preview: 'google/gemini-2.5-pro',
  // ... more models
}
```

### Current Model Selection Logic
```typescript
export const getModelForMode = (
  costMode: CostMode,
  operation: 'agent' | 'file-requests' | 'check-new-files',
) => {
  if (operation === 'agent') {
    return {
      lite: models.openrouter_gemini2_5_flash,
      normal: models.openrouter_claude_sonnet_4,
      max: models.openrouter_claude_sonnet_4,
      experimental: models.openrouter_gemini2_5_pro_preview,
      ask: models.openrouter_gemini2_5_pro_preview,
    }[costMode]
  }
  // ... more operation types
}
```

## 5. Key Features to Preserve

### CLI Features
- Natural language input processing
- Multi-agent coordination  
- File system operations
- Git integration
- Terminal command execution
- Progress tracking and display
- Configuration management
- Agent spawning and management

### Tools Available to Agents
- `create_plan` - Create execution plans
- `run_terminal_command` - Execute shell commands
- `str_replace` - Edit files with precise replacements
- `write_file` - Create/write files
- `spawn_agents` - Create sub-agents
- `code_search` - Search codebase
- `read_files` - Read file contents
- `think_deeply` - Deep reasoning
- And many more...

## 6. Authentication & Backend Dependencies

### Current Setup
- Requires backend server connection
- API key authentication
- Credit-based usage tracking
- WebSocket communication for real-time updates

### Our Fork Requirements
- Remove backend dependencies
- Direct OpenRouter integration
- Simplified authentication (just OpenRouter API key)
- Local-only operation

## 7. Critical Files for Fork

### Must Copy/Adapt
1. **npm-app/src/** - Entire CLI codebase
2. **.agents/** - All agent definitions  
3. **common/src/types/** - Type definitions
4. **common/src/tools/** - Tool implementations
5. **backend/src/tools/** - Tool logic
6. **backend/src/llm-apis/openrouter.ts** - OpenRouter integration

### Must Modify
1. Remove backend WebSocket dependencies
2. Simplify model selection to use only OpenRouter
3. Remove authentication/credit system
4. Adapt agent execution to work locally
5. Update configuration system

## 8. Dependencies Analysis

### Core Dependencies (npm-app/package.json)
- `commander` - CLI framework
- `ai` - Vercel AI SDK
- `axios` - HTTP client
- `ws` - WebSocket client (to remove)
- `zod` - Schema validation
- `picocolors` - Terminal colors
- `lodash` - Utilities

### Internal Dependencies
- `@codebuff/common` - Shared code
- `@codebuff/code-map` - Code analysis
- Various workspace packages

## Next Steps for Fork
1. Copy core CLI structure
2. Implement direct OpenRouter integration
3. Modify agent system to work locally
4. Remove backend dependencies
5. Simplify configuration
6. Test agent spawning and tool execution