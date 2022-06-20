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
