import { ILoggerStrategy } from "./abstract-strategy"

export class LoggerConsole implements ILoggerStrategy {
    error = (messageObject: any) => console.error(messageObject)
    info = (messageObject: any) => console.info(messageObject)
    verbose = (messageObject: any) => console.log(messageObject)
    log = (messageObject: any) => console.log(messageObject)
}