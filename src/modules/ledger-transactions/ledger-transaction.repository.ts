import type { FastifyInstance } from 'fastify'
import type { TransactionType, EntryType } from '@prisma/client'

type CreateTransactionInput = {
  idempotencyKey: string
  description: string
  type: TransactionType
  occurredAt: Date
  entries: {
    accountId: string
    amount: bigint
    type: EntryType
    currency: string
  }[]
}

export const makeLedgerTransactionRepository = (fastify: FastifyInstance) => {
  const prisma = fastify.prisma

  return {
    async findById(id: string) {
      return prisma.ledgerTransaction.findUnique({
        where: { id },
        include: { entries: true },
      })
    },

    async findByIdempotencyKey(key: string) {
      return prisma.ledgerTransaction.findUnique({
        where: { idempotencyKey: key },
        include: { entries: true },
      })
    },

    async create(data: CreateTransactionInput) {
      return prisma.ledgerTransaction.create({
        data: {
          idempotencyKey: data.idempotencyKey,
          description: data.description,
          type: data.type,
          occurredAt: data.occurredAt,
          status: 'POSTED',
          entries: {
            create: data.entries,
          },
        },
        include: { entries: true },
      })
    },
  }
}

export type LedgerTransactionRepository = ReturnType<typeof makeLedgerTransactionRepository>