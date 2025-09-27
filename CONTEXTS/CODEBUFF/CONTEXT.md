# Codebuff Context Summary

## What is Codebuff?
Codebuff is an open-source AI coding assistant that edits codebases through natural language instructions. Unlike single-model tools, it coordinates specialized agents that work together to understand projects and make precise changes.

## Key Insights from Analysis

### Architecture
- **Multi-Agent System**: Uses specialized agents (File Explorer, Planner, Editor, Reviewer, etc.)
- **Monorepo Structure**: Contains CLI (npm-app), backend, web, SDK, and shared components
- **Tool-Based**: Agents use tools like `str_replace`, `run_terminal_command`, `spawn_agents`, etc.

### Current Model System
- **Primary Provider**: OpenRouter for accessing multiple models
- **Model Types**: Claude (Anthropic), GPT (OpenAI), Gemini (Google)
- **Cost Modes**: lite, normal, max, experimental, ask
- **Smart Selection**: Different models for different operations

### CLI Structure (npm-app)
```
src/
├── index.ts              # Entry point with Commander.js
├── cli.ts                # Main CLI logic
├── agents/               # Agent loading and management
├── config.ts            # Configuration
├── project-files.ts     # File operations
├── terminal/            # Command execution
└── tools/               # Agent tools
```

### Agent System Flow
1. User gives natural language instruction
2. Base agent analyzes request
3. Spawns specialized agents (file-explorer, planner, etc.)
4. Agents use tools to analyze and modify code
5. Reviewer validates changes
6. Results returned to user

### Current Limitations for Our Use Case
- **Costly**: Uses expensive models (Claude-4, GPT-5, etc.)
- **Backend Dependent**: Requires their server for agent coordination
- **No Model Choice**: Users can't easily switch models
- **Credit System**: Usage tracking and billing

## What We Want to Build

### Goals
1. **Same Functionality**: All agent capabilities and features
2. **Better Model Control**: Easy model switching via OpenRouter
3. **Cost Effective**: Use cheaper models when appropriate
4. **Local Operation**: No backend dependency
5. **Open Source**: Full control over the system

### Key Features to Preserve
- Multi-agent coordination
- Natural language processing
- File system operations
- Git integration
- Terminal command execution
- Progress tracking
- All existing tools and capabilities

### Technical Approach
1. **Fork npm-app**: Copy CLI structure
2. **Keep .agents**: All agent definitions and logic
3. **Direct OpenRouter**: Remove backend, use OpenRouter directly
4. **Simplify Config**: Just need OpenRouter API key
5. **Local Agents**: Run agent coordination locally

## Implementation Strategy

### Phase 1: Core Infrastructure
- Copy and adapt npm-app structure
- Set up direct OpenRouter integration
- Remove backend dependencies
- Basic agent spawning locally

### Phase 2: Agent System
- Port all agent definitions
- Implement local agent coordination
- Adapt tool system
- Test multi-agent workflows

### Phase 3: Enhanced Features
- Model selection UI
- Cost optimization
- Performance improvements
- Additional models/providers

## Key Files Identified

### Must Copy
- `npm-app/src/` - Complete CLI
- `.agents/` - All agent definitions
- `common/src/tools/` - Tool implementations
- `backend/src/llm-apis/openrouter.ts` - OpenRouter integration

### Must Adapt
- Remove WebSocket backend connections
- Simplify authentication to OpenRouter key only
- Modify agent execution for local operation
- Update model selection system

## Technical Challenges

### Agent Coordination
- Currently done via backend WebSocket
- Need to implement local coordination
- Preserve multi-agent capabilities

### Tool Execution
- Some tools may depend on backend
- Need to identify and adapt/replace

### Model Management
- Simplify from complex cost mode system
- Direct OpenRouter model selection
- Preserve performance characteristics

## Success Metrics
- ✅ All existing CLI commands work
- ✅ Multi-agent workflows function
- ✅ Easy model switching
- ✅ No backend dependency
- ✅ Cost savings from model choice
- ✅ Same or better user experience

This context will guide our implementation to create a powerful, local-first version of Codebuff with better model control and cost efficiency.