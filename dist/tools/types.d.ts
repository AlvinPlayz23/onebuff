import { z } from 'zod';
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: z.ZodSchema;
    handler: ToolHandler;
}
export interface ToolHandler {
    (params: any, context: ToolContext): Promise<ToolResult>;
}
export interface ToolContext {
    workingDirectory: string;
    projectRoot: string;
    agent?: {
        id: string;
        displayName: string;
    };
}
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}
export declare const FileContentSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
    modified: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    path: string;
    content: string;
    size?: number | undefined;
    modified?: Date | undefined;
}, {
    path: string;
    content: string;
    size?: number | undefined;
    modified?: Date | undefined;
}>;
export declare const ReadFilesSchema: z.ZodObject<{
    paths: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    paths: string[];
}, {
    paths: string[];
}>;
export declare const WriteFileSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
    instructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    content: string;
    instructions?: string | undefined;
}, {
    path: string;
    content: string;
    instructions?: string | undefined;
}>;
export declare const StrReplaceSchema: z.ZodObject<{
    path: z.ZodString;
    replacements: z.ZodArray<z.ZodObject<{
        old: z.ZodString;
        new: z.ZodString;
        allowMultiple: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        old: string;
        new: string;
        allowMultiple: boolean;
    }, {
        old: string;
        new: string;
        allowMultiple?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    path: string;
    replacements: {
        old: string;
        new: string;
        allowMultiple: boolean;
    }[];
}, {
    path: string;
    replacements: {
        old: string;
        new: string;
        allowMultiple?: boolean | undefined;
    }[];
}>;
export declare const RunTerminalCommandSchema: z.ZodObject<{
    command: z.ZodString;
    cwd: z.ZodOptional<z.ZodString>;
    timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    processType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["SYNC", "BACKGROUND"]>>>;
}, "strip", z.ZodTypeAny, {
    command: string;
    timeout: number;
    processType: "SYNC" | "BACKGROUND";
    cwd?: string | undefined;
}, {
    command: string;
    cwd?: string | undefined;
    timeout?: number | undefined;
    processType?: "SYNC" | "BACKGROUND" | undefined;
}>;
export declare const CodeSearchSchema: z.ZodObject<{
    pattern: z.ZodString;
    flags: z.ZodOptional<z.ZodString>;
    cwd: z.ZodOptional<z.ZodString>;
    maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    pattern: string;
    maxResults: number;
    cwd?: string | undefined;
    flags?: string | undefined;
}, {
    pattern: string;
    cwd?: string | undefined;
    flags?: string | undefined;
    maxResults?: number | undefined;
}>;
export declare const SpawnAgentsSchema: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        agentType: z.ZodString;
        prompt: z.ZodOptional<z.ZodString>;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        agentType: string;
        params?: Record<string, any> | undefined;
        prompt?: string | undefined;
    }, {
        agentType: string;
        params?: Record<string, any> | undefined;
        prompt?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    agents: {
        agentType: string;
        params?: Record<string, any> | undefined;
        prompt?: string | undefined;
    }[];
}, {
    agents: {
        agentType: string;
        params?: Record<string, any> | undefined;
        prompt?: string | undefined;
    }[];
}>;
export type FileContent = z.infer<typeof FileContentSchema>;
export type ReadFilesParams = z.infer<typeof ReadFilesSchema>;
export type WriteFileParams = z.infer<typeof WriteFileSchema>;
export type StrReplaceParams = z.infer<typeof StrReplaceSchema>;
export type RunTerminalCommandParams = z.infer<typeof RunTerminalCommandSchema>;
export type CodeSearchParams = z.infer<typeof CodeSearchSchema>;
export type SpawnAgentsParams = z.infer<typeof SpawnAgentsSchema>;
