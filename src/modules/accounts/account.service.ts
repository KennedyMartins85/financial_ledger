// src/modules/accounts/account.service.ts
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import type { AccountRepository } from "./account.repository.js";
import { AccountType } from "@prisma/client";



export const makeAccountService = (repository: AccountRepository) => {
  return {
    async getById(id: string) {
      const account = await repository.findById(id);

      if (!account) {
        throw new NotFoundError(`Conta ${id} não encontrada`);
      }

      return account;
    },

    async getAll() {
      return repository.findAll();
    },

    async create(data: { userId: string; name: string; type: AccountType }) {
      return repository.create(data);
    },
  };
};

export type AccountService = ReturnType<typeof makeAccountService>;