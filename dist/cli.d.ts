export declare class InteractiveCLI {
    private rl;
    private configManager;
    private client;
    private agentSystem;
    constructor();
    start(): Promise<void>;
    private initializeClient;
    private setupEventListeners;
    private handleCommand;
    private showHelp;
    private handleTestTool;
    private showProjectInfo;
    private showTools;
    private showAgents;
    private showModels;
    private handleConfig;
    private handleChat;
    private showAccountInfo;
}
