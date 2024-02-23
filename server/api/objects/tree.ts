import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to recursively set the level of questions and answers
function setLevels(objects, currentLevel) {
  return objects.map(obj => {
    obj.level = currentLevel; // Set the current level
    // If it's a question with answers, recurse into the answers
    if (obj.answers && obj.answers.length > 0) {
      obj.answers = setLevels(obj.answers, currentLevel + 1);
    }
    // If it's an answer with a next question, recurse into the next question
    if (obj.nextQuestion) {
      obj.nextQuestion = setLevels([obj.nextQuestion], currentLevel + 1)[0];
    }
    return obj;
  });
}

export default defineEventHandler(async (event) => {
  try {
    // Fetch top-level questions
    let questions = await prisma.question.findMany({
      include: {
        answers: {
          include: {
            nextQuestion: {
              include: {
                answers: {
                  include: {
                    nextQuestion: {
                      include: {
                        answers: {
                          include: {
                            nextQuestion: {
                              include: {
                                answers: true, // This is three levels deep.
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform the data if necessary to match your desired JSON structure

    // Set levels starting from level 1 for top-level questions
   questions = setLevels(questions, 1);

   // Transform the data if necessary to match your desired JSON structure
    return questions;
  } catch (error) {
    console.error('Failed to fetch questions tree:', error);
    event.res.statusCode = 500;
    return { error: 'An error occurred while fetching the questions tree.' };
  }
});