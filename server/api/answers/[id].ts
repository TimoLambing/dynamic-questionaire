// /server/api/answers/[id].ts

import { defineEventHandler, useBody, createError } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.req.method;
  const { id } = event.context.params;
  const answerId = parseInt(id, 10);

  if (!Number.isInteger(answerId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid answer ID' });
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    try {
      const updatedAnswer = await prisma.answer.update({
        where: { id: answerId },
        data: { content: body.content },
      });
      return updatedAnswer;
    } catch (error) {
      throw createError({ statusCode: 500, message: 'An error occurred while updating the answer.' });
    }
  }

  if (method === 'DELETE') {
    try {
      await prisma.answer.delete({
        where: { id: answerId },
      });
      return { success: true };
    } catch (error) {
      throw createError({ statusCode: 500, message: 'An error occurred while deleting the answer.' });
    }
  }
});
