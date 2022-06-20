import path from 'path'
import flatCache from 'flat-cache'
import crypto from 'crypto'
import { CacheItem } from './types/cache-item'
import { Logger } from '../logging/logger'
/* FIND MORE INFORMATION AT: https://github.com/royriojas/flat-cache */
let logger = new Logger()

export function cacheMiddleware(req, res, next) {
    const key = getKey(req)

    var cacheContent = cache.getKey(key);
    if (cacheContent) {
        logger.log(`retrieving response from cache: ${req.path}`)
        res.json(JSON.parse(cacheContent.data));
    } else {
        // Set the send and json methods to update the cache before returning the request
        interceptSendAndJsonMethods(req, res)
        next()
    }
}

function cacheUpdate(req, res, responseData): void {
    if (!(res.statusCode == 200) && !(res.statusCode == 404))
        return  // Only cache 200 and 404 responses

    let key = getKey(req)

    let cacheItem: CacheItem = {
        status: res.statusCode,
        data: responseData
    }
    
    cache.setKey(key, cacheItem);
    cache.save(true /* noPrune */)

    return
}

function interceptSendAndJsonMethods(req, res) {
    let baseJsonMethod = res.json
    let baseSendMethod = res.send

    res.json = function (data) {
        cacheUpdate(req, res, data) // Update cache before sending the data

        res.json = baseJsonMethod // set function back to avoid the 'double-send'
        return res.json(data) // just call as normal with data
    }
    res.send = function (data) {
        cacheUpdate(req, res, data) // Update cache before sending the data

        res.send = baseSendMethod // set function back to avoid the 'double-send'
        return res.send(data) // just call as normal with data
    }
}

function getKey(req): string {
    return createHash(req.path, 8)
}

function createHash(string, len) {
    return crypto.createHash("shake256", { outputLength: len })
        .update(string)
        .digest("hex");
}

export let cache = flatCache.load('cache.json', path.resolve('./.cache/'));