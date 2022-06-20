// import path from 'path'
// import flatCache from 'flat-cache'
// export let cache = flatCache.load('cache', path.resolve('./.cache/'));

// /* FIND MORE INFORMATION AT: https://github.com/royriojas/flat-cache */

// export function proxyCacheFind(req, res, next) {
//     const key = req.params.url
//     console.log(key)

//     var cacheContent = cache.getKey(key);
//     if (cacheContent) {
//         console.log("ITEM FOUND IN CACHE!!")
//         res.json(cacheContent);
//     } else {
//         next()
//     }
// }

// export function proxycacheUpdate(req, res, next){
//     const key:string = req.params.url
//     if (!(res.statusCode == 200) && !(res.statusCode == 404))
//         next()  // Only cache 200 and 404 responses

//     if (!key || !key.startsWith('/proxy/'))
//         next()

//     cache.setKey(key, { status: res.statusCode, data: res.data });
//     cache.save(true /* noPrune */)

//     next()
// }


// // app.use((req, res, next) => {
// //     let oldSend = res.send
// //     res.send = function(data) {
// //         console.log(data) // do something with the data
// //         res.send = oldSend // set function back to avoid the 'double-send'
// //         return res.send(data) // just call as normal with data
// //     }
// //     next()
// // })

