import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { CodeSearchSchema } from './types.js';
// Code Search Tool (simplified grep-like implementation)
export const codeSearchTool = {
    name: 'code_search',
    description: 'Search for patterns in project files using regex',
    parameters: CodeSearchSchema,
    handler: async (params, context) => {
        try {
            const { pattern, flags = '', cwd, maxResults = 30 } = params;
            // Load ignore patterns from config
            let ignorePatterns = [];
            try {
                const { OnebuffConfigManager } = await import('../onebuff-config.js');
                const configManager = new OnebuffConfigManager(context.projectRoot);
                ignorePatterns = configManager.getIgnorePatterns();
            }
            catch (error) {
                // Use default patterns if config loading fails
                ignorePatterns = ['node_modules', '.git', 'dist', 'build', '*.log'];
            }
            // Determine search directory
            const searchDir = cwd ?
                join(context.projectRoot, cwd) :
                context.projectRoot;
            // Parse flags (simplified)
            const isCaseInsensitive = flags.includes('-i');
            const showLineNumbers = true; // Always show line numbers
            const contextBefore = extractContextFlag(flags, '-B') || 0;
            const contextAfter = extractContextFlag(flags, '-A') || 0;
            // Create regex pattern
            const regexFlags = isCaseInsensitive ? 'gi' : 'g';
            let regex;
            try {
                regex = new RegExp(pattern, regexFlags);
            }
            catch (error) {
                return {
                    success: false,
                    error: `Invalid regex pattern: ${pattern}`
                };
            }
            // Search for files
            const results = [];
            const searchedFiles = new Set();
            await searchDirectory(searchDir, context.projectRoot, regex, contextBefore, contextAfter, results, searchedFiles, maxResults, ignorePatterns);
            // Format output similar to ripgrep
            const output = formatSearchResults(results, pattern);
            return {
                success: true,
                data: {
                    pattern,
                    results: results.length,
                    matches: results.reduce((sum, r) => sum + r.matches.length, 0),
                    output
                },
                message: `Found ${results.length} files with ${results.reduce((sum, r) => sum + r.matches.length, 0)} matches`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Code search failed: ${error}`
            };
        }
    }
};
async function searchDirectory(dir, projectRoot, regex, contextBefore, contextAfter, results, searchedFiles, maxResults, ignorePatterns = []) {
    if (results.length >= maxResults)
        return;
    try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            if (results.length >= maxResults)
                break;
            const fullPath = join(dir, entry);
            const relativePath = relative(projectRoot, fullPath);
            // Use configurable ignore patterns
            if (shouldIgnoreConfigurable(entry, relativePath, ignorePatterns)) {
                continue;
            }
            try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    await searchDirectory(fullPath, projectRoot, regex, contextBefore, contextAfter, results, searchedFiles, maxResults, ignorePatterns);
                }
                else if (stat.isFile() && !searchedFiles.has(fullPath)) {
                    searchedFiles.add(fullPath);
                    await searchFile(fullPath, relativePath, regex, contextBefore, contextAfter, results);
                }
            }
            catch (error) {
                // Skip files we can't read
                continue;
            }
        }
    }
    catch (error) {
        // Skip directories we can't read
        return;
    }
}
function shouldIgnoreConfigurable(filename, relativePath, ignorePatterns) {
    // Check each ignore pattern
    for (const pattern of ignorePatterns) {
        // Simple glob matching
        if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\./g, '\\.'));
            if (regex.test(filename) || regex.test(relativePath)) {
                return true;
            }
        }
        else {
            // Exact match
            if (filename === pattern || relativePath.includes(pattern)) {
                return true;
            }
        }
    }
    return false;
}
async function searchFile(filePath, relativePath, regex, contextBefore, contextAfter, results) {
    try {
        // Skip binary files and very large files
        const stat = statSync(filePath);
        if (stat.size > 1024 * 1024)
            return; // Skip files > 1MB
        const content = readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const matches = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (regex.test(line)) {
                const match = {
                    lineNumber: i + 1,
                    line: line
                };
                // Add context if requested
                if (contextBefore > 0 || contextAfter > 0) {
                    match.context = {
                        before: lines.slice(Math.max(0, i - contextBefore), i),
                        after: lines.slice(i + 1, Math.min(lines.length, i + 1 + contextAfter))
                    };
                }
                matches.push(match);
            }
            // Reset regex lastIndex for global regex
            regex.lastIndex = 0;
        }
        if (matches.length > 0) {
            results.push({
                file: relativePath,
                matches
            });
        }
    }
    catch (error) {
        // Skip files we can't read
        return;
    }
}
function shouldIgnore(filename, relativePath) {
    const ignoredDirs = [
        'node_modules',
        '.git',
        '.vscode',
        'dist',
        'build',
        '__pycache__',
        '.pytest_cache',
        '.coverage',
        'coverage',
        '.next',
        '.nuxt',
        'vendor'
    ];
    const ignoredExtensions = [
        '.log',
        '.tmp',
        '.cache',
        '.lock',
        '.min.js',
        '.min.css',
        '.map'
    ];
    // Check if it's an ignored directory
    if (ignoredDirs.includes(filename)) {
        return true;
    }
    // Check if any part of the path contains ignored directories
    if (ignoredDirs.some(ignored => relativePath.includes(ignored))) {
        return true;
    }
    // Check ignored extensions
    if (ignoredExtensions.some(ext => filename.endsWith(ext))) {
        return true;
    }
    // Check if it's a hidden file (starts with .)
    if (filename.startsWith('.') && filename !== '.gitignore' && filename !== '.env') {
        return true;
    }
    return false;
}
function extractContextFlag(flags, flag) {
    const regex = new RegExp(`${flag}\\s+(\\d+)`);
    const match = flags.match(regex);
    return match ? parseInt(match[1], 10) : null;
}
function formatSearchResults(results, pattern) {
    let output = '';
    for (const result of results) {
        output += `${result.file}\n`;
        for (const match of result.matches) {
            // Add context before
            if (match.context?.before) {
                for (let i = 0; i < match.context.before.length; i++) {
                    const lineNum = match.lineNumber - match.context.before.length + i;
                    output += `${lineNum}-${match.context.before[i]}\n`;
                }
            }
            // Add the matching line
            output += `${match.lineNumber}:${match.line}\n`;
            // Add context after
            if (match.context?.after) {
                for (let i = 0; i < match.context.after.length; i++) {
                    const lineNum = match.lineNumber + i + 1;
                    output += `${lineNum}-${match.context.after[i]}\n`;
                }
            }
        }
        output += '\n';
    }
    return output.trim();
}
