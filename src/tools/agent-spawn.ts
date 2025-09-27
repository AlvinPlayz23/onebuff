import {
  ToolDefinition,
  ToolContext,
  ToolResult,
  SpawnAgentsParams,
  SpawnAgentsSchema
} from './types.js'

// We'll need to import our agent system
// This will be injected at runtime
let agentSystemInstance: any = null

export function setAgentSystemInstance(instance: any) {
  agentSystemInstance = instance
}

// Spawn Agents Tool
export const spawnAgentsTool: ToolDefinition = {
  name: 'spawn_agents',
  description: 'Spawn one or more agents to handle specific tasks',
  parameters: SpawnAgentsSchema,
  handler: async (params: SpawnAgentsParams, context: ToolContext): Promise<ToolResult> => {
    try {
      if (!agentSystemInstance) {
        return {
          success: false,
          error: 'Agent system not initialized'
        }
      }

      const results = []

      for (const agentRequest of params.agents) {
        const { agentType, prompt, params: agentParams } = agentRequest

        try {
          // Get the agent from the system
          const agent = agentSystemInstance.getAgent(agentType)
          if (!agent) {
            results.push({
              agentType,
              success: false,
              error: `Agent type '${agentType}' not found`
            })
            continue
          }

          // Prepare context for the spawned agent
          const spawnContext = {
            ...context,
            spawningAgent: context.agent,
            params: agentParams
          }

          // Process the agent request
          let response: string
          if (prompt) {
            response = await agent.process(prompt, JSON.stringify(spawnContext))
          } else {
            response = await agent.process(
              'You have been spawned to help with a task. Please provide assistance.',
              JSON.stringify(spawnContext)
            )
          }

          results.push({
            agentType,
            success: true,
            response,
            params: agentParams
          })

        } catch (error) {
          results.push({
            agentType,
            success: false,
            error: `Agent execution failed: ${error}`
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      const totalCount = results.length

      return {
        success: successCount > 0,
        data: {
          agents: results,
          summary: {
            total: totalCount,
            successful: successCount,
            failed: totalCount - successCount
          }
        },
        message: `Spawned ${successCount}/${totalCount} agents successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to spawn agents: ${error}`
      }
    }
  }
}

// Inline agent spawn (for single agent)
export const spawnAgentInlineTool: ToolDefinition = {
  name: 'spawn_agent_inline',
  description: 'Spawn a single agent and return its response inline',
  parameters: SpawnAgentsSchema.pick({ agents: true }).transform(data => data.agents[0]),
  handler: async (params: any, context: ToolContext): Promise<ToolResult> => {
    // Wrap single agent in array and use spawn_agents logic
    const wrappedParams: SpawnAgentsParams = {
      agents: [params]
    }
    
    const result = await spawnAgentsTool.handler(wrappedParams, context)
    
    if (result.success && result.data?.agents?.[0]) {
      const agentResult = result.data.agents[0]
      if (agentResult.success) {
        return {
          success: true,
          data: {
            agentType: agentResult.agentType,
            response: agentResult.response
          },
          message: `Agent ${agentResult.agentType} completed successfully`
        }
      } else {
        return {
          success: false,
          error: agentResult.error
        }
      }
    }
    
    return result
  }
}