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

export class Logger {
    options: LoggerOptions = {
        outputs: [{
            output: LoggerOutputs.Console,
            level: LogLevel.Information
        }]
    }

    loggers = {
        console: new LoggerConsole(),
        default: new LoggerConsole()
    }

    constructor(options?) {
        // TODO: Configure parameters from constructor
    }

    error(messageObject) {
        let errorLevel = LogLevel.Error
        this.options.outputs.forEach((loggerOutput) => {
            if (this.shouldLog(errorLevel, loggerOutput.level)) {
                this.getLogStrategy(loggerOutput.output).log(messageObject)
            }
        })
    }

    info(messageObject) {
        let infoLevel = LogLevel.Information
        this.options.outputs.forEach((loggerOutput) => {
            if (this.shouldLog(infoLevel, loggerOutput.level)) {
                this.getLogStrategy(loggerOutput.output).log(messageObject)
            }
        })
    }

    verbose(messageObject: any) {
        let verboseLevel = LogLevel.Verbose
        this.options.outputs.forEach((loggerOutput) => {
            if (this.shouldLog(verboseLevel, loggerOutput.level)) {
                this.getLogStrategy(loggerOutput.output).log(messageObject)
            }
        })
    }

    log(messageObject: any) {
        let logLevel = LogLevel.Debug
        this.options.outputs.forEach((loggerOutput) => {
            if (this.shouldLog(logLevel, loggerOutput.level)) {
                this.getLogStrategy(loggerOutput.output).log(messageObject)
            }
        })
    }

    private shouldLog(methodLogLevel: LogLevel, configuredLogLevel: LogLevel): boolean {
        if (methodLogLevel <= configuredLogLevel)
            return true
        else
            return false
    }

    private getLogStrategy(loggerOutput: LoggerOutputs) {
        if (loggerOutput == LoggerOutputs.Console)
            return this.loggers.console
        else
            return this.loggers.default
    }
}

interface LoggerStrategy {
    error(messageObject: any): void
    info(messageObject: any): void
    verbose(messageObject: any): void
    log(messageObject: any): void
}

class LoggerConsole implements LoggerStrategy {
    error = (messageObject: any) => console.error(messageObject)
    info = (messageObject: any) => console.info(messageObject)
    verbose = (messageObject: any) => console.log(messageObject)
    log = (messageObject: any) => console.log(messageObject)
}