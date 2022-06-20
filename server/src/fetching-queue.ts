import { CallbackFunction, QueueRequest } from "./@types/fetching-queue"
import { Logger } from "./utils/logger"

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

export class FetchingQueue {

    private queues = {
        pending: [] as QueueRequest[],
        delayed: [] as QueueRequest[],
        processing: [] as QueueRequest[],
        finished: [] as QueueRequest[]
    }

    // 5 | 2.5 | 4 => Possibly the best as it also matches the number of chrome threads
    private restrictions = {
        MAX_PARALLEL_REQUESTS: 5,
        MAX_REQUEST_RATE: 2.5,     // [Requests per second]
        RATE_SAMPLE_SIZE: 4
    }

    
    private logger

    constructor(queueSize: number) {
        this.restrictions.MAX_PARALLEL_REQUESTS = queueSize
        this.logger = new Logger()
    }

    requestId: number = 1
    getRequestId(): number {
        if (this.requestId >= 1_000_000)
            this.requestId = 0

        return this.requestId++
    }

    awaitQueueSpace(request, response, task: AsyncTask) {
        return new Promise((resolve, reject) => {
            let requestId = this.getRequestId()

            let queueRequest: QueueRequest = {
                id: requestId,
                connection: { request, response },
                awaitPromise: { resolve, reject },
                task
            }

            this.queues.pending.push(queueRequest)

            if (requestId == 1) {
                this.logger.info("First request started at: " + new Date())
            }
            
            if (this.freeThreadExists()) {
                let delay = this.getMilisecondsUntilRequestQuota()
                if (delay > 0) {
                    this.logger.info(`RequestId-${requestId} - Delay request with id: ${this.queues.pending[0].id} by ${delay} ms`)
    
                    this.moveTaskFromQueue(this.queues.pending, this.queues.delayed, requestId)
                    setTimeout(() => { resolve(requestId) }, delay)
                } else {
                    resolve(requestId)
                }
            }           
        }).then((requestId) => {
            return this.fireById(requestId)
        })
    }

    fireById(requestId): Promise<any> {
        // First search for the request in the delayed requests queue. If not found in there, search in the pending queue 
        let request = this.moveTaskFromQueue(this.queues.delayed, this.queues.processing, requestId)
        if (request == undefined) {
            request = this.moveTaskFromQueue(this.queues.pending, this.queues.processing, requestId)
        }

        if (request == undefined)
            return new Promise((_, reject) => {
                reject("Invalid request Id")
            })

        return new Promise((resolve, reject) => {
            this.logger.log(`RequestId-${requestId} - Start task`)
            request!.task.start()
                .then((taskResult) => {
                    this.logger.log(`RequestId-${requestId} - Task finished`)
                    this.moveTaskFromQueue(this.queues.processing, this.queues.finished, requestId)

                    this.printStatistics(requestId)

                    if (this.queues.pending.length > 0) {
                        this.logger.log(`RequestId-${requestId} - Moving pending request with id: ${this.queues.pending[0].id}`)

                        // Run next pending task straightaway if possible, otherwise run it after the necessary delay
                        let delay = this.getMilisecondsUntilRequestQuota()
                        if (delay > 0) {
                            this.logger.verbose(`RequestId-${requestId} - Delay request with id: ${this.queues.pending[0].id} by ${delay} ms`)
                            let nextRequestId = this.queues.pending[0].id
                            let requestReference = this.moveTaskFromQueue(this.queues.pending, this.queues.delayed, nextRequestId)

                            setTimeout(() => { requestReference?.awaitPromise.resolve(requestReference.id) }, delay)
                        } else {
                            this.queues.pending[0].awaitPromise.resolve(this.queues.pending[0].id)
                        }
                    }

                    if(this.queues.pending.length + this.queues.delayed.length + this.queues.processing.length == 0){
                        this.logger.info("Batch finished at " + new Date())
                        this.queues.finished = [] // Clear the finished queue after each batch of requests to not polute the statistics
                    }
                    resolve(taskResult)
                })
                .catch((error) => {
                    this.logger.error(`RequestId-${requestId} - An error occurred, code: ${error.response.status}, request path: ${error.request?.path}`)
                    reject(requestId)
                })
        })
    }

    // Return the task or undefined if no task was found with the specified id
    private moveTaskFromQueue(queueFrom: QueueRequest[], queueTo: QueueRequest[], taskId: number): QueueRequest | undefined {
        let task = queueFrom.find(task => task.id == taskId)
        if (task == undefined) {
            return undefined
        }

        let taskIndexFrom = queueFrom.indexOf(task)
        queueFrom.splice(taskIndexFrom, 1)
        queueTo.push(task)

        return task
    }

    stats = {
        intervalStartTime: new Date()
    }
    private printStatistics(requestId) {
        let INTERVAL = 25 // Calculate and print statistics every 25 request
        this.logger.verbose(`Pending Req. | Req. Delayed | Req. in progress | Tot. processed: ${this.queues.pending.length}|${this.queues.delayed.length}|${this.queues.processing.length}|${this.queues.finished.length}`)
        
        if (requestId % INTERVAL != 0) {
            return
        }

        let intervalDurationInSeconds = Math.abs((new Date().getTime() - this.stats.intervalStartTime.getTime()) / 1000);
        let requestInInterval = INTERVAL
        let requestPerSecond = INTERVAL / intervalDurationInSeconds

        this.stats.intervalStartTime = new Date()

        this.logger.info(`Interval | Interval Duration | Req/sec:  ${INTERVAL}|${intervalDurationInSeconds}|${requestPerSecond}`)
    }

    private freeThreadExists(): boolean {
        return this.queues.processing.length + this.queues.delayed.length < this.restrictions.MAX_PARALLEL_REQUESTS
    }

    private getMilisecondsUntilRequestQuota(): number {
        let minAvgTimeBetweenRequest = 1 / this.restrictions.MAX_REQUEST_RATE
        let milisecondsBetweenNRequests = minAvgTimeBetweenRequest * this.restrictions.RATE_SAMPLE_SIZE * 1000

        // We can ensure that the start time between each request N and N-'RATE_SAMPLE_SIZE' differs
        // by at least 'timeBetweenNRequests' seconds in order to keep the request rate
        // below the 'MAX_REQUEST_RATE'. To accomplish this, we should delay the following request if necessary

        this.logger.verbose([this.queues.pending.length, this.queues.delayed.length, this.queues.processing.length, this.queues.finished.length, this.queues.finished.length < this.restrictions.RATE_SAMPLE_SIZE])
        if (this.queues.finished.length < this.restrictions.RATE_SAMPLE_SIZE)
            return ( this.queues.delayed.length + this.queues.processing.length) * 200 + 1 // if we can't calculate yet, add a safety delay of 200ms base between requests (1ms base to not escape the if)

        // Find the N-'RATE_SAMPLE_SIZE' request        TODO: Filter out distant requests
        let requestToCompare = this.queues.finished.at(-this.restrictions.RATE_SAMPLE_SIZE)

        let currentTime = new Date().getTime()
        let timeNMinusSampleSizeRequest = requestToCompare!.task.getStartTime().getTime()
        let timeUntilRequestQuota = milisecondsBetweenNRequests - (currentTime - timeNMinusSampleSizeRequest)

        this.logger.verbose([minAvgTimeBetweenRequest, milisecondsBetweenNRequests, timeUntilRequestQuota])
        return Math.max(timeUntilRequestQuota, 0)
    }
}

