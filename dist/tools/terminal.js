import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { RunTerminalCommandSchema } from './types.js';
const execAsync = promisify(exec);
// Map to track background processes
const backgroundProcesses = new Map();
// Terminal Command Tool
export const runTerminalCommandTool = {
    name: 'run_terminal_command',
    description: 'Execute CLI commands from the project root',
    parameters: RunTerminalCommandSchema,
    handler: async (params, context) => {
        try {
            const { command, cwd: relativeCwd, timeout = 30, processType = 'SYNC' } = params;
            // Determine working directory
            const workingDir = relativeCwd ?
                resolve(context.projectRoot, relativeCwd) :
                context.projectRoot;
            // Security checks
            const dangerousCommands = [
                'rm -rf /',
                'format',
                'del /f /s /q',
                'rmdir /s',
                'shutdown',
                'reboot',
                'halt'
            ];
            const isDangerous = dangerousCommands.some(dangerous => command.toLowerCase().includes(dangerous.toLowerCase()));
            if (isDangerous) {
                return {
                    success: false,
                    error: 'Command appears dangerous and has been blocked for safety'
                };
            }
            if (processType === 'BACKGROUND') {
                return await runBackgroundCommand(command, workingDir, context);
            }
            else {
                return await runSyncCommand(command, workingDir, timeout, context);
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Terminal command failed: ${error}`
            };
        }
    }
};
async function runSyncCommand(command, cwd, timeout, context) {
    try {
        const options = { cwd, encoding: 'utf8' };
        if (timeout > 0) {
            options.timeout = timeout * 1000; // Convert to milliseconds
        }
        const { stdout, stderr } = await execAsync(command, options);
        return {
            success: true,
            data: {
                command,
                cwd,
                stdout: stdout || '',
                stderr: stderr || '',
                exitCode: 0
            },
            message: `Command executed successfully`
        };
    }
    catch (error) {
        // Handle timeout and other errors
        const isTimeout = error.killed && error.signal === 'SIGTERM';
        return {
            success: false,
            data: {
                command,
                cwd,
                stdout: error.stdout || '',
                stderr: error.stderr || '',
                exitCode: error.code || 1,
                timeout: isTimeout
            },
            error: isTimeout ?
                `Command timed out after ${timeout}s` :
                `Command failed with exit code ${error.code || 1}`,
            message: isTimeout ? 'Command timed out' : 'Command failed'
        };
    }
}
async function runBackgroundCommand(command, cwd, context) {
    return new Promise((resolve) => {
        const childProcess = spawn(command, [], {
            cwd,
            shell: true,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        const processId = childProcess.pid || Math.random();
        backgroundProcesses.set(processId, {
            process: childProcess,
            command,
            cwd,
            startTime: new Date()
        });
        let stdout = '';
        let stderr = '';
        childProcess.stdout?.on('data', (data) => {
            stdout += data.toString();
        });
        childProcess.stderr?.on('data', (data) => {
            stderr += data.toString();
        });
        childProcess.on('close', (code) => {
            backgroundProcesses.delete(processId);
            // Process completed but we've already returned
        });
        childProcess.on('error', (error) => {
            backgroundProcesses.delete(processId);
            // Process errored but we've already returned
        });
        // Return immediately for background processes
        resolve({
            success: true,
            data: {
                command,
                processId,
                status: 'running'
            },
            message: `Background process started with PID ${processId}`
        });
    });
}
// Utility function to get background process status
export function getBackgroundProcessStatus(processId) {
    const process = backgroundProcesses.get(processId);
    if (!process) {
        return { status: 'not_found' };
    }
    return {
        status: 'running',
        command: process.command,
        cwd: process.cwd,
        startTime: process.startTime
    };
}
// Utility function to kill background process
export function killBackgroundProcess(processId) {
    const processInfo = backgroundProcesses.get(processId);
    if (!processInfo) {
        return false;
    }
    try {
        processInfo.process.kill();
        backgroundProcesses.delete(processId);
        return true;
    }
    catch (error) {
        return false;
    }
}
