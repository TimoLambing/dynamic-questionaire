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
            <!--<div class="flex flex-row">
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
              "Kustuta" button display condition adjusted to also check for no answers
              <UButton
                v-if="question.children.length === 0 && question.answers.length === 0"
                label="Kustuta"
                class="ml-2"
                @click="deleteQuestion(question.id)"
              />
            </div> -->
          </div>
          <!--  <div
            v-else
            class="border rounded-xl p-2 flex flex-col"
          >
            <div class="flex flex-row">
              <span class="mr-4">( {{ question.id }} ) : {{ question.content }}</span>
              <UButton
                label="Muuda"
                @click="prepareEditQuestion(question)"
              />
              In the list displaying questions
              <UButton
                label="Lisa vastus"
                class="ml-2"
                @click="prepareAddAnswer(question.id)"
              />
            </div>
          </div> -->
          <div>
            <!-- Display answers -->
            <ul v-if="question.answers.length">
              <li
                v-for="answer in question.answers"
                :key="answer.id"
                class="flex flex-row border rounded-xl m-2 p-2"
              >
                <div
                  v-if="editingAnswerId === answer.id"
                  class="flex flex-row items-center"
                >
                  <UInput
                    v-model="editAnswerInputValue"
                    color="primary"
                    variant="outline"
                    placeholder="Muuda vastust..."
                    class="text-white mr-4"
                  />
                  <UButton
                    label="Salvesta"
                    class="mr-2"
                    @click="saveEditAnswer(answer)"
                  />
                  <UButton
                    label="Tühista"
                    @click="cancelEditAnswer"
                  />
                </div>
                <div
                  v-else
                  class="flex flex-row items-center"
                >
                  <span class="mr-4">( {{ answer.id }} ) : {{ answer.content }}</span>
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
                  <UButton
                    label="Lisa küsimus"
                    class="ml-2"
                    @click="prepareAddnextQuestion(answer.id)"
                  />
                  <!-- Check if there is a nested question related to this answer -->
                  <div v-if="answer.nextQuestion && editingnextQuestionId !== answer.nextQuestion.id">
                    <!-- Display the nested question content -->
                    <div>{{ answer.nextQuestion.content }}</div>
                    <!-- Button to edit the nested question -->
                    <UButton
                      label="Muuda küsimust"
                      class="ml-2"
                      @click="prepareEditnextQuestion(answer.nextQuestion)"
                    />
                  </div>
                  <!-- Editing state for a nested question -->
                  <div
                    v-else-if="editingnextQuestionId === answer.nextQuestion.id"
                    class="flex flex-row items-center"
                  >
                    <UInput
                      v-model="editnextQuestionInputValue"
                      placeholder="Muuda küsimust..."
                      class="mr-4"
                    />
                    <UButton
                      label="Salvesta"
                      @click="saveEditnextQuestion"
                    />
                    <UButton
                      label="Tühista"
                      @click="cancelEditnextQuestion"
                    />
                  </div>
                  <!-- Button to add a new nested question if there isn't one already -->
                  <UButton
                    v-if="!answer.nextQuestion"
                    label="Lisa küsimus"
                    class="ml-2"
                    @click="prepareAddnextQuestion(answer.id)"
                  />
                </div>
              </li>
            </ul>
          </div>
          <!-- Nested questions and answers -->
          <div
            v-if="addingAnswerToQuestionId === question.id"
            class="flex flex-col"
          >
            <div class="flex flex-row border rounded-xl m-2 p-2">
              <UInput
                v-model="newAnswerContent"
                color="primary"
                variant="outline"
                placeholder="Sisesta vastus..."
                class="text-white mr-4"
              />
              <UButton
                label="Saada"
                class="mr-2"
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
    <!-- Show the initial button to create the first question
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
    </div> -->
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
/* import type { Question, Answer } from '~/types'; */

const questionsTree = ref<Question[]>([]);
const editingQuestionId = ref<number | null>(null);
const editInputValue = ref('');
const submittedQuestion = ref<Question | null>(null);
/* const showInput = ref(false); */
const inputValue = ref('');
const isEditing = ref(false);
const addingAnswerToQuestionId = ref<number | null>(null);
const newAnswerContent = ref('');
const editingAnswerId = ref<number | null>(null);
const editAnswerInputValue = ref('');
const preparingnextQuestionForAnswerId = ref(null);
const editingnextQuestionId = ref<number | null>(null); // Track nested question being edited
const editnextQuestionInputValue = ref(''); // Input for editing nested question

/* // Adjust fetchQuestionsTree to correctly set showInput only for adding new questions
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
}; */

/* onMounted(fetchQuestionsTree); */

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

// Add this inside your <script setup>
const deleteAnswer = async (answerId) => {
  try {
    const response = await fetch(`/api/answers/${answerId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    // Optionally, refresh the questions tree or handle the UI update directly
    fetchQuestionsTree();
  } catch (error) {
    console.error('Error deleting answer:', error);
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

const startEditAnswer = (answer: Answer) => {
  editingAnswerId.value = answer.id;
  editAnswerInputValue.value = answer.content; // Preset the current answer content for editing
};

// Function to save the edited answer
const saveEditAnswer = async () => {
  if (!editingAnswerId.value) return;
  try {
    const response = await fetch(`/api/answers/${editingAnswerId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editAnswerInputValue.value }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    editingAnswerId.value = null; // Reset editing state
    editAnswerInputValue.value = ''; // Clear edit input
    await fetchQuestionsTree(); // Refresh the list to show updated answer
  } catch (error) {
    console.error('Error saving edited answer:', error);
  }
};

// Function to cancel answer editing
const cancelEditAnswer = () => {
  editingAnswerId.value = null;
  editAnswerInputValue.value = '';
};

const prepareAddnextQuestion = (answerId) => {
  preparingnextQuestionForAnswerId.value = answerId;
  // Additional logic to show input for adding a nested question
};

// Function to prepare editing a nested question
const prepareEditnextQuestion = (nextQuestion) => {
  editingnextQuestionId.value = nextQuestion.id;
  editnextQuestionInputValue.value = nextQuestion.content;
};

// Function to save edited nested question
const saveEditnextQuestion = async () => {
  if (editingnextQuestionId.value === null) return;
  // Add logic to submit edit to backend
  console.log('Saving edited nested question', editingnextQuestionId.value, editnextQuestionInputValue.value);
  editingnextQuestionId.value = null; // Reset editing state
  editnextQuestionInputValue.value = ''; // Clear edit input
  // Mock refreshing the questions tree
  await fetchQuestionsTree();
};

// Function to cancel editing a nested question
const cancelEditnextQuestion = () => {
  editingnextQuestionId.value = null;
  editnextQuestionInputValue.value = '';
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
