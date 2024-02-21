// /server/api/questions/[id].ts

import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { req, res } = event;
  const { id } = event.context.params;

  if (req.method === 'PUT') {
    const body = await readBody(event);
    try {
      const updatedQuestion = await prisma.question.update({
        where: { id: Number(id) },
        data: { content: body.content },
      });
      return updatedQuestion;
    } catch (error) {
      res.statusCode = 500;
      return { error: 'An error occurred while updating the question.' };
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.question.delete({
        where: { id: Number(id) },
      });
      // Return some success response
      return { success: true };
    } catch (error) {
      res.statusCode = 500;
      return { error: 'An error occurred while deleting the question.' };
    }
  }
});
