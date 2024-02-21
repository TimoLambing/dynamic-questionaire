// Example in /server/api/answers/index.ts
import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.req.method === 'POST') {
    const body = await readBody(event);
    const answer = await prisma.answer.create({
      data: {
        content: body.content,
        questionId: body.questionId,
      },
    });
    return answer;
  }
});
