import express from "express";
import cors from "cors"
import appRoutes from "./config/route-config";

var PORT = process.env.PORT || 8080;

var app = express();
app.use(cors())

app.use(appRoutes)

app.listen(PORT, () => {
   console.log(`listen in port ${PORT}`)
})

// import { codes } from "./data";
// import { AsyncTask } from "./infrastructure/queue/types/fetching-queue.types";
// app.get('/:amt', function (req, res) {
//    let amt = Number(req.params.amt)
//    let urls = codes.slice(0, amt).map(code => `https://nhentai.net/api/gallery/${code}`)

//    let promises: any[] = []

//    urls.forEach((url) => {
//       let prom = queue.awaitQueueSpace(req, res, new AsyncTask(fetchAPI, [url]))
//       promises.push(prom)
//    })

//    Promise.allSettled(promises)
//       .then(response => {
//          // console.log(response)
//          res.send(`${response.length} requests completed!`)
//       })
//       .catch(error => console.log(error))

//    // let TEST_URL = 'https://nhentai.net/api/gallery/305071'
//    // fetchAPI(TEST_URL)
//    //    .then((responseData)=> res.json(responseData))
// })