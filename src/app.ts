import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'

export const buildApp = () => {
  const app = Fastify({ logger: true })

  app.register(helmet)
  app.register(cors, { origin: process.env.FRONTEND_URL })
  app.register(jwt, { secret: process.env.JWT_SECRET! })

  app.get('/', async () => {
    return { status: 'ok', message: 'Ledgerly API is running' }
  })

  return app
}