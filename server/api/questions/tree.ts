// /server/api/questions/tree.ts

import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const questions = await prisma.question.findMany({
      where: { parentId: null }, // Fetch only top-level questions
      include: {
        answers: true, // Include answers
        children: {
          include: {
            answers: true,
            children: {
              include: {
                answers: true,
                // You can continue nesting as deep as needed
              },
            },
          },
        },
      },
    });
    return questions;
  } catch (error) {
    console.error('Failed to fetch questions tree:', error);
    event.res.statusCode = 500;
    return { error: 'An error occurred while fetching the questions tree.' };
  }
});
