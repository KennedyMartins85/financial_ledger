import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthService } from './auth.service.js'

type RegisterBody = {
  name: string
  email: string
  password: string
}

type LoginBody = {
  email: string
  password: string
}

export const makeAuthController = (service: AuthService) => {
  return {
    async register(
      request: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply
    ) {
      const user = await service.register(request.body)
      return reply.status(201).send(user)
    },

    async login(
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply
    ) {
      const result = await service.login(request.body)
      return reply.status(200).send(result)
    },
  }
}