export class AsyncTask {
    callback: CallbackFunction
    args: any[]
    startTime: Date | undefined = undefined

    constructor(callback: any, args: any[]) {
        this.callback = callback
        this.args = args
    }

    start(): Promise<any> {
        this.startTime = new Date()
        return this.callback(...this.args)
    }

    getStartTime(): Date | undefined {
        return this.startTime
    }
}

export interface QueueRequest {
    id: number,
    connection: {
        request,
        response
    },
    awaitPromise: {
        resolve,
        reject
    },
    task: AsyncTask
}

export type CallbackFunction = (...args: any[]) => Promise<any>;
