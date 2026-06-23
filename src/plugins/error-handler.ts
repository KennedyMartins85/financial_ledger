// src/plugins/error-handler.ts
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyError } from "fastify"; 
import { AppError } from "../shared/errors/app-error.js";

export const errorHandlerPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => { 
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        error: "BadRequest",
        message: "Requisição inválida",
        details: error.validation,
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      error: "InternalServerError",
      message: "Algo deu errado",
    });
  });
});