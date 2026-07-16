import { NotFoundError } from '../../shared/errors/not-found-error.js'
import { ValidationError } from '../../shared/errors/validation-error.js'
import type { LedgerTransactionRepository } from './ledger-transaction.repository.js'
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

export const makeLedgerTransactionService = (repository: LedgerTransactionRepository) => {
  return {
    async getById(id: string) {
      const transaction = await repository.findById(id)

      if (!transaction) {
        throw new NotFoundError(`Transaction ${id} not found`)
      }

      return transaction
    },

    async create(data: CreateTransactionInput) {
      if (data.entries.length < 2) {
        throw new ValidationError('A transaction must have at least two entries')
      }

      
      const currencies = new Set(data.entries.map(e => e.currency))
      if (currencies.size > 1) {
        throw new ValidationError('All entries must have the same currency')
      }

      
      const totalDebits = data.entries
        .filter(e => e.type === 'DEBIT')
        .reduce((sum, e) => sum + e.amount, 0n)

      const totalCredits = data.entries
        .filter(e => e.type === 'CREDIT')
        .reduce((sum, e) => sum + e.amount, 0n)

      if (totalDebits !== totalCredits) {
        throw new ValidationError(
          `Debits (${totalDebits}) must equal credits (${totalCredits})`
        )
      }

     
      const existing = await repository.findByIdempotencyKey(data.idempotencyKey)
      if (existing) {
        return existing
      }

      return repository.create(data)
    },
  }
}

export type LedgerTransactionService = ReturnType<typeof makeLedgerTransactionService>