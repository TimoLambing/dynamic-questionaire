// /server/api/questions/index.ts

import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.req.method === 'POST') {
    const body = await readBody(event);
    console.log(body)
    try {
      const newQuestion = await prisma.question.create({
        data: {
          content: body.content,
          parentId: body.parentId || null, // This might be null for top-level questions
        },
      });
      return newQuestion; // This includes the auto-incremented id
    } catch (error) {
      console.error("Prisma error creating question:", error);
      event.res.statusCode = 500;
      return { error: error.message || 'An error occurred while creating the question.' };
    }
  }
  // Handle other HTTP methods or return a 405 Method Not Allowed error
});
