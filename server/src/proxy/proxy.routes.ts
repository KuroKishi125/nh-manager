import express from "express";
import { cacheMiddleware } from "../infrastructure/cache/flat-cache";
import { getUrl } from "./proxy.controller";

let proxyRoutes = express.Router()

proxyRoutes.get('/:url(*)', cacheMiddleware, getUrl)

export default proxyRoutes