<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div
      v-if="questionsTree.length > 0"
      class="flex-row"
    >
      <ul>
        <li
          v-for="question in questionsTree"
          :key="question.id"
          class="m-2"
        >
          <!-- Directly editing within the list -->
          <div
            v-if="editingQuestionId === question.id"
            class="flex flex-col border rounded-xl p-2"
          >
            <div class="flex flex-row">
              <UInput
                v-model="editInputValue"
                color="primary"
                variant="outline"
                placeholder="Muuda küsimust..."
                class="text-white mr-4"
              />
              <UButton
                label="Saada"
                class="mr-2"
                @click="handleSubmit"
              />
              <UButton
                label="Tühista"
                @click="cancelEdit"
              />
              <!-- "Kustuta" button display condition adjusted to also check for no answers -->
              <UButton
                v-if="question.children.length === 0 && question.answers.length === 0"
                label="Kustuta"
                class="ml-2"
                @click="deleteQuestion(question.id)"
              />
            </div>
          </div>
          <div
            v-else
            class="border rounded-xl p-2 flex flex-col"
          >
            <div class="flex flex-row">
              <span class="mr-4">( {{ question.id }} ) : {{ question.content }}</span>
              <UButton
                label="Muuda"
                @click="prepareEditQuestion(question)"
              />
              <!-- In the list displaying questions -->
              <UButton
                label="Lisa vastus"
                class="ml-2"
                @click="prepareAddAnswer(question.id)"
              />
            </div>
          </div>
          <div>
            <!-- Display answers -->
            <ul v-if="question.answers.length">
              <li
                v-for="answer in question.answers"
                :key="answer.id"
                class="flex flex-row border rounded-xl m-2 p-2"
              >
                <span class="mr-4">( {{ answer.id }} ) : {{ answer.content }}</span>
                <!-- Edit and Delete buttons for answers -->
                <UButton
                  label="Muuda"
                  class="ml-2"
                  @click="startEditAnswer(answer)"
                />
                <UButton
                  label="Kustuta"
                  class="ml-2"
                  @click="deleteAnswer(answer.id)"
                />
              </li>
            </ul>
          </div>
          <!-- Nested questions and answers -->
          <div
            v-if="addingAnswerToQuestionId === question.id"
            class="flex flex-col"
          >
            <div class="flex flex-row">
              <UInput
                v-model="newAnswerContent"
                placeholder="Sisesta vastus..."
                class="text-white mr-4"
              />
              <UButton
                label="Saada"
                @click="submitAnswer(addingAnswerToQuestionId, newAnswerContent)"
              />
              <UButton
                label="Tühista"
                @click="() => addingAnswerToQuestionId.value = null"
              />
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- Show the initial button to create the first question -->
    <div v-if="questionsTree.length === 0 && !editingQuestionId && !showInput">
      <UButton
        icon="i-heroicons-pencil-square"
        size="sm"
        color="primary"
        variant="solid"
        label="Loo esimene küsimus"
        :trailing="false"
        class="text-white"
        @click="() => { showInput = true; }"
      />
    </div>
    <!-- Show input and submit button if not yet submitted -->
    <div
      v-if="showInput"
      class="space-x-2 flex items-center"
    >
      <UInput
        v-model="inputValue"
        color="primary"
        variant="outline"
        placeholder="Sisesta esimene küsimus..."
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
    <div
      v-if="submittedQuestion"
      class="flex items-center space-x-2"
    >
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
const submittedQuestion = ref<Question | null>(null);
const showInput = ref(false);
const inputValue = ref('');
const isEditing = ref(false);
const addingAnswerToQuestionId = ref(null);
const newAnswerContent = ref('');

// Adjust fetchQuestionsTree to correctly set showInput only for adding new questions
const fetchQuestionsTree = async () => {
  try {
    const response = await fetch('/api/questions/tree');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    questionsTree.value = await response.json();
    // Only show the input for adding a new question if there are no questions
    showInput.value = false;
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

    // Clear the form and reset the state
    editingQuestionId.value = null;
    inputValue.value = '';
    editInputValue.value = '';
    showInput.value = false;
    isEditing.value = false;
    fetchQuestionsTree()
  } catch (error) {
    console.error('Error submitting question:', error);
  }
};

const submitAnswer = async (questionId, content) => {
  try {
    const response = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, content }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const newAnswer = await response.json();
    // Update UI accordingly...
    fetchQuestionsTree(); // Or specific logic to insert the answer in the client state
    addingAnswerToQuestionId.value = null; // Reset
  } catch (error) {
    console.error('Error submitting answer:', error);
  }
};


const editQuestion = () => {
  if (submittedQuestion.value) {
    inputValue.value = submittedQuestion.value.content;
    showInput.value = true;
    isEditing.value = true;
  }
};

const deleteQuestion = async (questionId) => {
  try {
    const response = await fetch(`/api/questions/${questionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    await fetchQuestionsTree(); // Refresh the list
  } catch (error) {
    console.error('Error deleting question:', error);
  }
};

// When preparing to edit a question:
const prepareEditQuestion = (question: Question) => {
  editingQuestionId.value = question.id;
  editInputValue.value = question.content; // For editing
  showInput.value = false; // Ensure this is false to not show the new question input
  isEditing.value = true; // You might not need this if `editingQuestionId` is sufficient to determine editing state
};

// Cancels the edit operation and resets the form
const cancelEdit = () => {
  editingQuestionId.value = null;
  editInputValue.value = '';
  showInput.value = false;
  isEditing.value = false;
};

const prepareAddAnswer = (questionId) => {
  addingAnswerToQuestionId.value = questionId;
  // Reset any existing content
  newAnswerContent.value = '';
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
