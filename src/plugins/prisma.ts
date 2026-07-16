import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { FastifyInstance } from 'fastify'
import * as dotenv from 'dotenv'

dotenv.config()

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export const prismaPlugin = fp(async (fastify: FastifyInstance) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  await prisma.$connect()
  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect()
  })
})