import type { FastifyRequest, FastifyReply } from "fastify";
import type { AccountService } from "./account.service.js";
import { AccountType } from "@prisma/client";

export const makeAccountController = (service: AccountService) => {
  return {
    async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = request.params;
      const account = await service.getById(id);
      return reply.status(200).send({
        ...account,
        balance: account.balance.toString(),
      });
    },

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
      const accounts = await service.getAll();
      return reply.status(200).send(
    accounts.map(account => ({
      ...account,
      balance: account.balance.toString(),
    }))
      );
    },

    async create(
<<<<<<< Updated upstream
      request: FastifyRequest<{ Body: { userId: string; type: AccountType; name: string, currency: string } }>,
=======
      request: FastifyRequest<{ Body: { userId: string; type: AccountType; name: string; currency: string } }>,
>>>>>>> Stashed changes
      reply: FastifyReply
    ) {
      const account = await service.create(request.body);          
      return reply.status(201).send({
        ...account,
        balance: account.balance.toString(),
      });

    },
  };
};