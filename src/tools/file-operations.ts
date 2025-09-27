import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { join, resolve, relative, dirname } from 'path'
import { mkdirSync } from 'fs'
import { 
  ToolDefinition, 
  ToolContext, 
  ToolResult,
  ReadFilesParams,
  ReadFilesSchema,
  WriteFileParams,
  WriteFileSchema,
  StrReplaceParams,
  StrReplaceSchema,
  FileContent
} from './types.js'

// Read Files Tool
export const readFilesTool: ToolDefinition = {
  name: 'read_files',
  description: 'Read multiple files from disk and return their contents',
  parameters: ReadFilesSchema,
  handler: async (params: ReadFilesParams, context: ToolContext): Promise<ToolResult> => {
    try {
      const files: FileContent[] = []
      
      for (const filePath of params.paths) {
        const fullPath = resolve(context.projectRoot, filePath)
        
        // Security check - ensure file is within project
        const relativePath = relative(context.projectRoot, fullPath)
        if (relativePath.startsWith('..')) {
          files.push({
            path: filePath,
            content: '[ERROR: File outside project root]',
            size: 0
          })
          continue
        }
        
        if (!existsSync(fullPath)) {
          files.push({
            path: filePath,
            content: '[FILE_DOES_NOT_EXIST]',
            size: 0
          })
          continue
        }
        
        try {
          const stat = statSync(fullPath)
          if (stat.isDirectory()) {
            files.push({
              path: filePath,
              content: '[ERROR: Path is a directory]',
              size: 0
            })
            continue
          }
          
          // Check file size (limit to 1MB for safety)
          if (stat.size > 1024 * 1024) {
            files.push({
              path: filePath,
              content: '[FILE_TOO_LARGE: > 1MB]',
              size: stat.size
            })
            continue
          }
          
          const content = readFileSync(fullPath, 'utf8')
          files.push({
            path: filePath,
            content,
            size: stat.size,
            modified: stat.mtime
          })
        } catch (error) {
          files.push({
            path: filePath,
            content: `[FILE_READ_ERROR: ${error}]`,
            size: 0
          })
        }
      }
      
      return {
        success: true,
        data: files,
        message: `Read ${files.length} files`
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to read files: ${error}`
      }
    }
  }
}

// Write File Tool
export const writeFileTool: ToolDefinition = {
  name: 'write_file',
  description: 'Create or write content to a file',
  parameters: WriteFileSchema,
  handler: async (params: WriteFileParams, context: ToolContext): Promise<ToolResult> => {
    try {
      const fullPath = resolve(context.projectRoot, params.path)
      
      // Security check - ensure file is within project
      const relativePath = relative(context.projectRoot, fullPath)
      if (relativePath.startsWith('..')) {
        return {
          success: false,
          error: 'Cannot write files outside project root'
        }
      }
      
      // Create directory if it doesn't exist
      const dir = dirname(fullPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      
      // Check if file exists (for messaging)
      const fileExists = existsSync(fullPath)
      
      // Write the file
      writeFileSync(fullPath, params.content, 'utf8')
      
      return {
        success: true,
        data: {
          path: params.path,
          action: fileExists ? 'modified' : 'created',
          size: params.content.length
        },
        message: `${fileExists ? 'Modified' : 'Created'} file: ${params.path}`
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to write file: ${error}`
      }
    }
  }
}

// String Replace Tool
export const strReplaceTool: ToolDefinition = {
  name: 'str_replace',
  description: 'Replace strings in a file with new strings',
  parameters: StrReplaceSchema,
  handler: async (params: StrReplaceParams, context: ToolContext): Promise<ToolResult> => {
    try {
      const fullPath = resolve(context.projectRoot, params.path)
      
      // Security check
      const relativePath = relative(context.projectRoot, fullPath)
      if (relativePath.startsWith('..')) {
        return {
          success: false,
          error: 'Cannot modify files outside project root'
        }
      }
      
      if (!existsSync(fullPath)) {
        return {
          success: false,
          error: `File does not exist: ${params.path}`
        }
      }
      
      // Read current content
      const originalContent = readFileSync(fullPath, 'utf8')
      let modifiedContent = originalContent
      const appliedReplacements: any[] = []
      
      // Apply each replacement
      for (const replacement of params.replacements) {
        const { old: oldStr, new: newStr, allowMultiple = false } = replacement
        
        if (!modifiedContent.includes(oldStr)) {
          appliedReplacements.push({
            old: oldStr,
            new: newStr,
            applied: false,
            reason: 'Old string not found'
          })
          continue
        }
        
        if (allowMultiple) {
          // Replace all occurrences
          const regex = new RegExp(escapeRegExp(oldStr), 'g')
          const matches = modifiedContent.match(regex)
          modifiedContent = modifiedContent.replace(regex, newStr)
          appliedReplacements.push({
            old: oldStr,
            new: newStr,
            applied: true,
            count: matches?.length || 0
          })
        } else {
          // Replace only first occurrence
          const occurrences = (modifiedContent.match(new RegExp(escapeRegExp(oldStr), 'g')) || []).length
          if (occurrences > 1) {
            appliedReplacements.push({
              old: oldStr,
              new: newStr,
              applied: false,
              reason: `Multiple occurrences found (${occurrences}), but allowMultiple is false`
            })
            continue
          }
          
          modifiedContent = modifiedContent.replace(oldStr, newStr)
          appliedReplacements.push({
            old: oldStr,
            new: newStr,
            applied: true,
            count: 1
          })
        }
      }
      
      // Write the modified content
      if (modifiedContent !== originalContent) {
        writeFileSync(fullPath, modifiedContent, 'utf8')
      }
      
      return {
        success: true,
        data: {
          path: params.path,
          replacements: appliedReplacements,
          modified: modifiedContent !== originalContent,
          originalSize: originalContent.length,
          newSize: modifiedContent.length
        },
        message: `Applied ${appliedReplacements.filter(r => r.applied).length} of ${params.replacements.length} replacements`
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to replace strings: ${error}`
      }
    }
  }
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}