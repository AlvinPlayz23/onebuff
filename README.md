# OneBuff

> Local-first AI coding assistant with multi-agent system - fork of Codebuff with OpenRouter integration

## Overview

OneBuff is a local-first alternative to Codebuff that provides the same powerful multi-agent AI coding capabilities while giving you full control over model selection and costs through direct OpenRouter integration.

## Features

- 🚀 **Local-first**: No backend dependencies, everything runs on your machine
- 🤖 **Multi-agent system**: Specialized agents for different coding tasks
- 💰 **Cost-effective**: Direct OpenRouter integration with 150+ models
- 🔧 **Model flexibility**: Easy switching between models based on your needs
- 🛡️ **Privacy-focused**: Your code never leaves your machine
- ⚡ **Fast setup**: Just one API key needed

## Quick Start

### Installation

```bash
git clone https://github.com/yourusername/onebuff.git
cd onebuff
npm install
npm run build
```

### Setup

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Set your API key:
   ```bash
   node dist/index.js --set-key YOUR_API_KEY
   ```

### Usage

**Interactive Mode:**
```bash
node dist/index.js
```

**Single Command:**
```bash
node dist/index.js "Explain this code and suggest improvements"
```

**With Specific Model:**
```bash
node dist/index.js --model anthropic/claude-3.5-sonnet "Review this code"
```

## Available Commands

### CLI Commands
- `--help` - Show help information
- `--config` - Show current configuration
- `--set-key <key>` - Set OpenRouter API key
- `--model <model>` - Specify model to use
- `--trace` - Enable debug tracing
- `-i, --interactive` - Force interactive mode

### Interactive Commands
- `help` - Show available commands
- `agents` - List available agents
- `models` - Show available models
- `config` - Show/modify configuration
- `quit`/`exit` - Exit OneBuff

## Available Agents

- **Base Assistant** - General-purpose coding helper
- **Code Reviewer** - Reviews code for quality and security
- **Code Researcher** - Researches codebases and finds information

## Configuration

OneBuff stores configuration in `~/.onebuff/config.json`:

```json
{
  "openrouterApiKey": "your_key_here",
  "defaultModel": "anthropic/claude-3.5-haiku"
}
```

You can also set the API key via environment variable:
```bash
export OPENROUTER_API_KEY=your_key_here
```

## Development Status

### ✅ **PRODUCTION READY** (Phase 3 Complete!)
- **🤖 Real Tool Calling**: Agents execute tools during conversations
- **📁 Smart Project Detection**: Auto-detects 12+ project types with context
- **🛠️ Complete Tool System**: 10 production-ready tools with security
- **🔧 Enhanced CLI**: Interactive mode, tool testing, project analysis
- **🎯 Multi-Agent Coordination**: Specialized agents with tool capabilities
- **🔒 Security & Safety**: Command filtering, path protection, validation
- **⚡ Performance Optimized**: Fast execution, smart caching, streaming responses

### 🏆 **Core Features Working**
```
✅ File Operations    - read_files, write_file, str_replace
✅ System Integration - run_terminal_command with safety
✅ Code Analysis      - pattern search with ignore filters  
✅ Agent Coordination - spawn_agents, multi-agent workflows
✅ Project Awareness  - automatic context detection
✅ CLI Excellence     - interactive mode, tool testing
✅ Security           - command filtering, path validation
```

### 🚀 **Ready for Production Use**
OneBuff can handle real coding tasks:
- Analyze and understand complex codebases
- Make precise file edits with validation
- Execute system commands safely
- Coordinate multiple specialized agents  
- Detect and work with project structure
- Stream responses with tool integration

### 📋 **Future Enhancements** (Optional Phase 4)
- Advanced multi-step workflows
- Git integration and version control
- Plugin/extension system
- Community agent templates
- Performance analytics

## Why OneBuff?

### vs. Original Codebuff
- ❌ Requires backend service → ✅ Local-only operation
- ❌ Fixed expensive models → ✅ Choose from 150+ models
- ❌ Credit/billing system → ✅ Pay OpenRouter directly
- ❌ Vendor lock-in → ✅ Open source, your data stays local

### vs. Other AI Coding Tools
- More sophisticated multi-agent architecture
- Better context understanding
- Local-first privacy
- Cost transparency and control

## Architecture

```
OneBuff
├── CLI Interface (Commander.js)
├── OpenRouter Client (Direct API)
├── Agent System (Multi-agent coordination)
├── Config Manager (Local storage)
└── Tool System (File ops, terminal, etc.)
```

## Contributing

OneBuff is open source and welcomes contributions! See our development log in `CONTEXTS/CODEBUFF/LOG.md` for technical details and progress.

## License

Apache-2.0 - Same as original Codebuff

## Roadmap

See `PLAN.md` and `GOALS.md` for detailed development plans and objectives.

---

**Get started in 30 seconds:** `npm install && npm run build && node dist/index.js --set-key YOUR_KEY`