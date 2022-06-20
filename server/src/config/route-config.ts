import express from 'express'
import proxyRoutes from '../proxy/proxy.routes'

let appRouter = express.Router()

appRouter.use('/proxy', proxyRoutes)

export default appRouter