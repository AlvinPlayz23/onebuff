export interface ProjectContext {
    root: string;
    type: ProjectType;
    name: string;
    language: string[];
    frameworks: string[];
    packageManager: string | null;
    gitRepository: boolean;
    structure: ProjectStructure;
}
export interface ProjectStructure {
    directories: string[];
    importantFiles: string[];
    configFiles: string[];
    sourceDirectories: string[];
    testDirectories: string[];
}
export type ProjectType = 'nodejs' | 'python' | 'react' | 'nextjs' | 'vue' | 'angular' | 'rust' | 'go' | 'java' | 'cpp' | 'unknown';
export declare class ProjectContextDetector {
    static detectProjectRoot(startPath?: string): string;
    static analyzeProject(rootPath: string): ProjectContext;
    private static detectProjectType;
    private static detectProjectName;
    private static detectLanguages;
    private static detectFrameworks;
    private static detectPackageManager;
    private static analyzeStructure;
    private static isSourceDirectory;
    private static isTestDirectory;
    private static isImportantFile;
    private static isConfigFile;
    private static hasReactDependencies;
    private static hasVueDependencies;
    private static getDirectoryContents;
    private static walkDirectory;
    static generateProjectSummary(context: ProjectContext): string;
}
