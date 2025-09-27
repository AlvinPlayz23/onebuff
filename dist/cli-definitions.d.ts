export interface CliParam {
    flags: string;
    description: string;
    menuDescription?: string;
    menuDetails?: string[];
    hidden?: boolean;
}
export declare const cliArguments: CliParam[];
export declare const cliOptions: CliParam[];
