import type { FastifyRequest, FastifyReply } from "fastify";
import type { AccountService } from "./account.service.js";
import { AccountType } from "@prisma/client";

export const makeAccountController = (service: AccountService) => {
  return {
    async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = request.params;
      const account = await service.getById(id);
      return reply.status(200).send(account);
    },

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
      const accounts = await service.getAll();
      return reply.status(200).send(accounts);
    },

    async create(
      request: FastifyRequest<{ Body: { userId: string; type: AccountType; name: string } }>,
      reply: FastifyReply
    ) {
      const account = await service.create(request.body);          
      return reply.status(201).send(account);
    },
  };
};