import type { FastifyInstance } from 'fastify'
import { makeLedgerTransactionRepository } from './ledger-transaction.repository.js'
import { makeLedgerTransactionService } from './ledger-transaction.service.js'
import { makeLedgerTransactionController } from './ledger-transaction.controller.js'

export const ledgerTransactionRoutes = async (fastify: FastifyInstance) => {
  const repository = makeLedgerTransactionRepository(fastify)
  const service = makeLedgerTransactionService(repository)
  const controller = makeLedgerTransactionController(service)

  fastify.get('/:id', controller.getById.bind(controller))
  fastify.post('/', controller.create.bind(controller))
}