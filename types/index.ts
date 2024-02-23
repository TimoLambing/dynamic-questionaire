export interface Question {
  id: number;
  content: string;
  answers: Answer[];
  nextQuestion?: Question;
  level: number;
  parentId: number
  // ... any additional properties
}

export interface Answer {
  id: number;
  content: string;
  questionId: number;
  answers: Answer[];
  nextQuestionId?: number;
  nextQuestion?: Question;
  parentId: number
  // ... any additional properties
}