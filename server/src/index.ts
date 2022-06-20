import express from "express";
import axios from "axios"
import cors from "cors"
import { FetchingQueue } from "./queue/fetching-queue";
import { codes } from "./data";
import { AsyncTask } from "./queue/types/fetching-queue.types";


var PORT = process.env.PORT || 8080;
var MAX_PARALLEL_REQUESTS = 5

var app = express();
app.use(cors())
var queue = new FetchingQueue(MAX_PARALLEL_REQUESTS)

function fetchAPI(url: string): Promise<any> {
   return new Promise((resolve, reject) => {
      axios
         .get(url)
         .then(fetchResponse => {
            resolve(fetchResponse.data)
         })
         .catch(error => {
            console.log("AN ERROR OCURRED: " + new Date())
            reject(error)
         });
   })
}

app.get('/proxy/:url(*)', function (req, res) {
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
})


app.get('/:amt', function (req, res) {
   let amt = Number(req.params.amt)
   let urls = codes.slice(0, amt).map(code => `https://nhentai.net/api/gallery/${code}`)

   let promises: any[] = []

   urls.forEach((url) => {
      let prom = queue.awaitQueueSpace(req, res, new AsyncTask(fetchAPI, [url]))
      promises.push(prom)
   })

   Promise.allSettled(promises)
      .then(response => {
         // console.log(response)
         res.send(`${response.length} requests completed!`)
      })
      .catch(error => console.log(error))

   // let TEST_URL = 'https://nhentai.net/api/gallery/305071'
   // fetchAPI(TEST_URL)
   //    .then((responseData)=> res.json(responseData))
})

app.listen(PORT, () => {
   console.log(`listen in port ${PORT}`)
})