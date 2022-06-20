import queue from "../infrastructure/queue/fetching-queue"
import { AsyncTask } from "../infrastructure/queue/types/fetching-queue.types"
import { fetchAPI } from "./proxy.service"

export function getUrl(req, res) {
    let url = req.params.url
    
    queue.awaitQueueSpace(req, res, new AsyncTask(fetchAPI, [url]))
        .then((taskResult => {
            res.json(taskResult)
        }))
        .catch((error) => {
            // console.log(error)
            console.log("AN ERROR HAS OCURRED WHILE PERFORMING A FETCH")
            res.send(500)
        })
 }