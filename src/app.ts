import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import { env } from './config/env.js'
import { prismaPlugin } from './plugins/prisma.js'
import { errorHandlerPlugin } from './plugins/error-handler.js'
import { accountRoutes } from './modules/accounts/account.routes.js'
import { ledgerTransactionRoutes } from './modules/ledger-transactions/ledger-transaction.routes.js'

export const buildApp = () => {
  const app = Fastify({ logger: true })

  // segurança e infraestrutura
  app.register(helmet)
  app.register(cors, { origin: env.FRONTEND_URL })
  app.register(jwt, { secret: env.JWT_SECRET })

  // plugins internos
  app.register(prismaPlugin)
  app.register(errorHandlerPlugin)

  // rotas
  app.get('/', async () => {
    return { status: 'ok', message: 'Ledgerly API is running' }
  })

  app.register(accountRoutes, { prefix: '/accounts' })
  app.register(ledgerTransactionRoutes, { prefix: '/transactions' })

  return app
}