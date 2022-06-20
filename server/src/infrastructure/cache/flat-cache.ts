import path from 'path'
import flatCache from 'flat-cache'
export let cache = flatCache.load('cache', path.resolve('./.cache/'));

/* FIND MORE INFORMATION AT: https://github.com/royriojas/flat-cache */

export function cacheMiddleware(req, res, next) {
    const key = req.params.url
    console.log(key)

    var cacheContent = cache.getKey(key);
    if (cacheContent) {
        console.log("ITEM FOUND IN CACHE!!")
        res.json(cacheContent);
    } else {
        // Set the send and json methods to update the cache before returning the request
        console.log("ITEM NOT FOUND")
        interceptSendAndJsonMethods(res)
        next()
    }
}

export function proxycacheUpdate(req, res, next) {
    const key: string = req.params.url
    if (!(res.statusCode == 200) && !(res.statusCode == 404))
        next()  // Only cache 200 and 404 responses

    if (!key || !key.startsWith('/proxy/'))
        next()

    cache.setKey(key, { status: res.statusCode, data: res.data });
    cache.save(true /* noPrune */)

    next()
}

function interceptSendAndJsonMethods(res) {
    let baseJsonMethod = res.json
    let baseSendMethod = res.send
    res.json = function (data) {

        console.log(data.toString()) // do something with the data
        
        res.json = baseJsonMethod // set function back to avoid the 'double-send'
        return res.json(data) // just call as normal with data
    }
    res.send = function (data) {
        console.log("PRINTING DATA FROM RESPONSE", data) // do something with the data
        res.send = baseSendMethod // set function back to avoid the 'double-send'
        return res.send(data) // just call as normal with data
    }
}
