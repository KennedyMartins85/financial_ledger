import type { FastifyRequest, FastifyReply } from 'fastify'
import type { LedgerTransactionService } from './ledger-transaction.service.js'
import type { TransactionType, EntryType } from '@prisma/client'

type CreateBody = {
  idempotencyKey: string
  description: string
  type: TransactionType
  occurredAt: string
  entries: {
    accountId: string
    amount: string
    type: EntryType
    currency: string
  }[]
}

export const makeLedgerTransactionController = (service: LedgerTransactionService) => {
  return {
    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const transaction = await service.getById(request.params.id)
      return reply.status(200).send(transaction)
    },

    async create(
      request: FastifyRequest<{ Body: CreateBody }>,
      reply: FastifyReply
    ) {
      const body = request.body

      const transaction = await service.create({
        idempotencyKey: body.idempotencyKey,
        description: body.description,
        type: body.type,
        occurredAt: new Date(body.occurredAt),
        entries: body.entries.map(e => ({
          accountId: e.accountId,
          amount: BigInt(e.amount),
          type: e.type,
          currency: e.currency,
        })),
      })

      return reply.status(201).send({
        ...transaction,
        entries: transaction.entries.map(e => ({
          ...e,
          amount: e.amount.toString(),
        })),
      })
    },
  }
}