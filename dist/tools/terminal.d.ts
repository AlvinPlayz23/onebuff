import { ToolDefinition } from './types.js';
export declare const runTerminalCommandTool: ToolDefinition;
export declare function getBackgroundProcessStatus(processId: number): {
    status: string;
    command?: undefined;
    cwd?: undefined;
    startTime?: undefined;
} | {
    status: string;
    command: any;
    cwd: any;
    startTime: any;
};
export declare function killBackgroundProcess(processId: number): boolean;
