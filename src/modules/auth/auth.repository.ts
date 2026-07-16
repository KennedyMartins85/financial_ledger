import type { FastifyInstance } from 'fastify'

export const makeAuthRepository = (fastify: FastifyInstance) => {
  const prisma = fastify.prisma

  return {
    async findByEmail(email: string) {
      return prisma.user.findUnique({
        where: { email },
      })
    },

    async create(data: { name: string; email: string; passwordHash: string }) {
      return prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
        },
      })
    },
  }
}

export type AuthRepository = ReturnType<typeof makeAuthRepository>