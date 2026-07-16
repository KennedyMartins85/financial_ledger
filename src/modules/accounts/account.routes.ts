import type { FastifyInstance } from "fastify";
import { makeAccountRepository } from "./account.repository.js";
import { makeAccountService } from "./account.service.js";
import { makeAccountController } from "./account.controller.js";

export const accountRoutes = async (fastify: FastifyInstance) => {
  const repository = makeAccountRepository(fastify);
  const service = makeAccountService(repository);
  const controller = makeAccountController(service);

  fastify.get("/", controller.getAll.bind(controller));
  fastify.get("/:id", controller.getById.bind(controller));
  fastify.post("/", controller.create.bind(controller));
};