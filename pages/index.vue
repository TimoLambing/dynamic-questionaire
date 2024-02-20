<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div v-if="questionsTree.length > 0">
        <ul>
          <li v-for="question in questionsTree" :key="question.id" class="m-2">
            <!-- Directly editing within the list -->
            <template v-if="editingQuestionId === question.id">
              <UInput
                color="primary"
                variant="outline"
                placeholder="Edit question..."
                v-model="editInputValue"
                class="text-white"
              />
              <UButton label="Saada" @click="handleSubmit" />
              <UButton label="Cancel" @click="cancelEdit" />
            </template>
            <template v-else>
              <span class="mr-4">( {{ question.id }} ) : {{ question.content }}</span>
              <UButton label="Edit" @click="prepareEditQuestion(question)" />
            </template>
            <!-- Nested questions and answers -->
          </li>
        </ul>
      </div>
      <!-- Show the initial button to create the first question -->
      <div v-else v-if="!showInput && !submittedQuestion">
        <UButton
          icon="i-heroicons-pencil-square"
          size="sm"
          color="primary"
          variant="solid"
          label="Loo esimene küsimus"
          :trailing="false"
          class="text-white"
          @click="showInput = true"
        />
      </div>
      <!-- Show input and submit button if not yet submitted -->
      <div v-if="showInput" class="space-x-2 flex items-center">
        <UInput
          color="primary"
          variant="outline"
          placeholder="Sisesta esimene küsimus..."
          v-model="inputValue"
          class="text-white"
        />
        <UButton
          color="primary"
          variant="solid"
          label="Saada"
          @click="handleSubmit"
        />
      </div>
      <!-- Show submitted question and edit button -->
      <div v-if="submittedQuestion" class="flex items-center space-x-2">
        <span>{{ submittedQuestion.id }}: {{ submittedQuestion.content }}</span>
        <UButton
          color="primary"
          variant="solid"
          label="Edit"
          @click="editQuestion"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';

// Assuming you have types for Question and Answer
interface Answer {
  id: number;
  content: string;
  // Include any other properties
}

interface Question {
  id: number;
  content: string;
  answers: Answer[];
  children: Question[];
  // Include any other properties
}

const questionsTree = ref<Question[]>([]);
  const editingQuestionId = ref<number | null>(null);
const editInputValue = ref('');

// Abstract the fetch logic into a separate method
const fetchQuestionsTree = async () => {
  try {
    const response = await fetch('/api/questions/tree');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    questionsTree.value = await response.json();
    showInput.value = questionsTree.value.length === 0;
  } catch (error) {
    console.error('Error fetching questions tree:', error);
  }
};

onMounted(fetchQuestionsTree);

// Recursive component for rendering questions and their children
const QuestionsTree = defineComponent({
  props: ['questions'],
  template: `
    <ul>
      <li v-for="question in questions" :key="question.id">
        {{ question.content }}
        <ul v-if="question.answers.length">
          <li v-for="answer in question.answers" :key="answer.id">
            Answer: {{ answer.content }}
          </ul>
        </ul>
        <!-- Recursive call for nested questions -->
        <QuestionsTree v-if="question.children.length" :questions="question.children" />
      </li>
    </ul>
  `,
});

// Use the Question type for the submittedQuestion ref
const submittedQuestion = ref<Question | null>(null);

  // Reactive state to control the visibility of the input field and the send button
  const showInput = ref(false);
  
  // Reactive state for the input's value
  const inputValue = ref('');

  // Flag to check if we are editing an existing question
const isEditing = ref(false);
  
  // Handle the submission of the input value
  const handleSubmit = async () => {
  const contentToSubmit = editingQuestionId.value ? editInputValue.value : inputValue.value;
  const apiEndpoint = editingQuestionId.value ? `/api/questions/${editingQuestionId.value}` : '/api/questions';

  try {
    const response = await fetch(apiEndpoint, {
      method: editingQuestionId.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: contentToSubmit }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    await fetchQuestionsTree(); // Refresh the list after successful add/edit
    
    // Clear the form and reset the state
    editingQuestionId.value = null;
    inputValue.value = '';
    editInputValue.value = '';
    showInput.value = false;
    isEditing.value = false;
  } catch (error) {
    console.error('Error submitting question:', error);
  }
};
  
  // Populate the input for editing and show it
  const editQuestion = () => {
  if (submittedQuestion.value) {
    inputValue.value = submittedQuestion.value.content;
    showInput.value = true;
    isEditing.value = true;
  }
};

// Prepares the selected question for editing
const prepareEditQuestion = (question: Question) => {
  editingQuestionId.value = question.id;
  editInputValue.value = question.content; // Bind the existing content to editInputValue
  showInput.value = true;
  isEditing.value = true;
};

// Cancels the edit operation and resets the form
const cancelEdit = () => {
  editingQuestionId.value = null;
  editInputValue.value = '';
  showInput.value = false;
  isEditing.value = false;
};
const startEdit = (question: Question) => {
  editingQuestionId.value = question.id;
  editInputValue.value = question.content;
};

const saveEdit = async () => {
  if (editingQuestionId.value === null) return;
  // Save logic here...
  // After saving, reset editing state and refresh the questions tree
  editingQuestionId.value = null;
  await fetchQuestionsTree();
};

  
  </script>
  
  
  <style>
.text-white input {
  color: white !important; /* This makes the input text white */
}
</style>