export interface ILoggerStrategy {
    error(messageObject: any): void
    info(messageObject: any): void
    verbose(messageObject: any): void
    log(messageObject: any): void
}