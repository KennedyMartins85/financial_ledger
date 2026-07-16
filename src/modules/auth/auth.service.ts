import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'
import { ValidationError } from '../../shared/errors/validation-error.js'
import { NotFoundError } from '../../shared/errors/not-found-error.js'
import type { AuthRepository } from './auth.repository.js'

const SALT_ROUNDS = 10

export const makeAuthService = (repository: AuthRepository, fastify: FastifyInstance) => {
  return {
    async register(data: { name: string; email: string; password: string }) {
      // verifica se email já está em uso
      const existing = await repository.findByEmail(data.email)
      if (existing) {
        throw new ValidationError('Email already in use')
      }

      // gera o hash da senha
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)

      // cria o usuário com o hash, nunca com a senha pura
      const user = await repository.create({
        name: data.name,
        email: data.email,
        passwordHash,
      })

      // devolve sem o passwordHash — nunca expõe isso
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }
    },

    async login(data: { email: string; password: string }) {
      // busca o usuário pelo email
      const user = await repository.findByEmail(data.email)
      if (!user) {
        throw new NotFoundError('Invalid email or password')
      }

      // compara a senha enviada com o hash salvo no banco
      const passwordMatch = await bcrypt.compare(data.password, user.passwordHash)
      if (!passwordMatch) {
        throw new ValidationError('Invalid email or password')
      }

      // gera o JWT com o id do usuário dentro
      const token = fastify.jwt.sign(
        { sub: user.id },
        { expiresIn: '7d' }
      )

      return { token }
    },
  }
}

export type AuthService = ReturnType<typeof makeAuthService>