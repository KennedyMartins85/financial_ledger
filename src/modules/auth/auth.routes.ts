// src/modules/auth/auth.routes.ts
import type { FastifyInstance } from 'fastify'
import { makeAuthRepository } from './auth.repository.js'
import { makeAuthService } from './auth.service.js'
import { makeAuthController } from './auth.controller.js'

export const authRoutes = async (fastify: FastifyInstance) => {
  const repository = makeAuthRepository(fastify)
  const service = makeAuthService(repository, fastify)
  const controller = makeAuthController(service)

  fastify.post('/register', controller.register.bind(controller))
  fastify.post('/login', controller.login.bind(controller))
}