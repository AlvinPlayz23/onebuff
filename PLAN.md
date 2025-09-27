# OneBuff Development Plan

## Project Vision
Create a local-first, cost-effective fork of Codebuff that preserves all multi-agent capabilities while providing direct OpenRouter integration and simplified model management.

## Development Phases

### Phase 1: Foundation & Setup ✅
**Goal**: Establish project structure and understand codebuff architecture

**Tasks**:
- [x] Analyze codebuff architecture and document findings
- [x] Create project structure in onebuff folder  
- [x] Document all key components and dependencies
- [ ] Set up basic Node.js/TypeScript project structure
- [ ] Copy core npm-app CLI structure
- [ ] Set up basic OpenRouter integration
- [ ] Create minimal working CLI entry point

**Success Criteria**:
- Basic CLI runs without errors
- OpenRouter API connection works
- Project structure established

### Phase 2: Core CLI Migration
**Goal**: Port the essential CLI functionality without backend dependencies

**Tasks**:
- [ ] Copy and adapt main CLI files (index.ts, cli.ts, etc.)
- [ ] Remove WebSocket/backend client dependencies
- [ ] Implement local configuration system (OpenRouter API key only)
- [ ] Port project file management system
- [ ] Adapt terminal command execution
- [ ] Create local storage for chat history/sessions

**Success Criteria**:
- CLI accepts user input
- Basic file operations work
- Terminal commands execute
- No backend dependencies

### Phase 3: Agent System Core
**Goal**: Implement local multi-agent coordination

**Tasks**:
- [ ] Copy all agent definitions from .agents/
- [ ] Port agent loading and spawning system
- [ ] Implement local agent execution engine (replace WebSocket)
- [ ] Adapt tool system for local operation
- [ ] Create agent message passing system
- [ ] Test basic agent spawning and communication

**Success Criteria**:
- Base agent loads and responds
- Agent spawning works locally
- Tools execute successfully
- Multi-agent workflows function

### Phase 4: Tool System Migration
**Goal**: Port all agent tools and ensure they work locally

**Tasks**:
- [ ] Copy tool definitions from common/src/tools/ and backend/src/tools/
- [ ] Adapt tools to work without backend:
  - [ ] `str_replace` - File editing
  - [ ] `write_file` - File creation
  - [ ] `read_files` - File reading
  - [ ] `run_terminal_command` - Command execution
  - [ ] `code_search` - Code searching
  - [ ] `spawn_agents` - Agent spawning
  - [ ] `create_plan` - Planning
  - [ ] `think_deeply` - Reasoning
- [ ] Test each tool individually
- [ ] Integrate tools with agent system

**Success Criteria**:
- All critical tools work locally
- Agents can use tools effectively
- File operations preserve safety checks
- Terminal execution is secure

### Phase 5: Model Management Enhancement
**Goal**: Implement flexible model selection and configuration

**Tasks**:
- [ ] Create model configuration system
- [ ] Implement model selection UI/CLI options
- [ ] Add support for custom model endpoints
- [ ] Create cost estimation system
- [ ] Add model performance profiling
- [ ] Implement model fallback system

**Success Criteria**:
- Users can easily switch models
- Model costs are transparent
- Performance is optimized
- Fallback handling works

### Phase 6: Advanced Features
**Goal**: Add enhancements and optimizations

**Tasks**:
- [ ] Implement context optimization
- [ ] Add conversation memory management
- [ ] Create project templates system
- [ ] Add plugin/extension system
- [ ] Implement batch operations
- [ ] Add progress tracking and resumption

**Success Criteria**:
- Performance matches or exceeds codebuff
- Advanced features work reliably
- User experience is excellent
- System is extensible

### Phase 7: Testing & Refinement
**Goal**: Ensure reliability and polish user experience

**Tasks**:
- [ ] Create comprehensive test suite
- [ ] Test against various project types
- [ ] Performance benchmarking
- [ ] Documentation creation
- [ ] Error handling improvements
- [ ] User feedback integration

**Success Criteria**:
- All features work reliably
- Performance is acceptable
- Documentation is complete
- Ready for wider use

## Technical Architecture

### Core Components
```
onebuff/
├── src/
│   ├── cli/              # Main CLI interface
│   ├── agents/           # Agent system
│   ├── tools/            # Agent tools
│   ├── models/           # Model management
│   ├── storage/          # Local storage
│   └── utils/            # Utilities
├── agents/               # Agent definitions
├── config/               # Configuration
└── docs/                 # Documentation
```

### Key Design Decisions
1. **Local-First**: No backend dependencies, everything runs locally
2. **OpenRouter Primary**: Use OpenRouter as main model provider
3. **Agent Preservation**: Keep all multi-agent capabilities
4. **Simple Config**: Just API keys, no complex setup
5. **Tool Compatibility**: Maintain tool interface compatibility

## Risk Mitigation

### Technical Risks
- **Agent Complexity**: Start with simpler agents, build up complexity
- **Tool Dependencies**: Identify and replace backend-dependent tools early
- **Performance**: Profile and optimize critical paths
- **Model Costs**: Implement cost controls and estimation

### Implementation Risks
- **Scope Creep**: Stick to core functionality first
- **Architecture Changes**: Keep changes minimal to preserve functionality
- **Testing**: Implement testing early to catch regressions

## Success Metrics

### Functionality
- [ ] All codebuff CLI features work
- [ ] Multi-agent coordination functions
- [ ] All existing tools available
- [ ] Performance comparable to original

### User Experience
- [ ] Easier setup (just API key)
- [ ] Model choice flexibility
- [ ] Cost transparency
- [ ] Reliable operation

### Technical Quality
- [ ] Clean, maintainable code
- [ ] Good test coverage
- [ ] Comprehensive documentation
- [ ] Extensible architecture

## Timeline Estimate
- **Phase 1-2**: 1-2 weeks (Foundation + CLI)
- **Phase 3-4**: 2-3 weeks (Agents + Tools)
- **Phase 5-6**: 2-3 weeks (Models + Advanced)
- **Phase 7**: 1-2 weeks (Testing + Polish)

**Total**: 6-10 weeks for full implementation

## Current Status
✅ **Phase 1 Started**: Architecture analysis complete, project structure created
🔄 **Next**: Begin CLI migration and OpenRouter setup