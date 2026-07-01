import type { FastifyInstance } from "fastify";
import { AccountType } from "@prisma/client";

export const makeAccountRepository = (fastify: FastifyInstance) => {
  const prisma = fastify.prisma;

  return {
    async findById(id: string) {
      return prisma.account.findUnique({
        where: { id },
      });
    },

    async findAll() {
      return prisma.account.findMany();
    },

async create(data: { userId: string; name: string; type: AccountType }) {
  return prisma.account.create({
    data: {
      userId: data.userId,
      name: data.name,   
      type: data.type,
      balance: 0,
    },
  });
},
  };
};

export type AccountRepository = ReturnType<typeof makeAccountRepository>;