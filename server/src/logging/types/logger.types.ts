export enum LogLevel {
    None,
    Error,
    Information,
    Verbose,
    Debug
}

export enum LoggerOutputs {
    Console
}

export interface LoggerOptions {
    outputs: [OutputOption]
}

export interface OutputOption {
    output: LoggerOutputs
    level: LogLevel,
}