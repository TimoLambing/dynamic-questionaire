<template>
  <div class="flex flex-row">
    <UInput
      v-model="inputValue"
      color="primary"
      variant="outline"
      :placeholder="placeholder"
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
    <!-- Adjusted "Kustuta" button display condition to check for children or next question -->
    <UButton
      v-if="canDelete"
      label="Kustuta"
      class="ml-2"
      @click="deleteObject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  id: { type: Number, required: true },
  content: { type: String, required: true },
  isQuestion: Boolean,
  parentId: { type: Number, required: true },
  hasChildren: Boolean,
  hasNextQuestion: Boolean // New prop to determine if an answer leads to another question
});

const emits = defineEmits(['submit', 'cancel', 'delete', 'updateSuccess']);

const inputValue = ref(props.content || '');

const placeholder = computed(() =>
  props.isQuestion ? 'Muuda küsimust...' : 'Muuda vastust...'
);

// Adjusted to consider both children and next question for delete capability
const canDelete = computed(() => !props.hasChildren && !props.hasNextQuestion);

const handleSubmit = async () => {
  const contentToSubmit = inputValue.value;
  // Initialize the API endpoint based on the context: Adding a question or an answer
  let apiEndpoint = `/api/${props.isQuestion ? 'questions' : 'answers'}`;

  // Extend the API endpoint for editing scenarios
  apiEndpoint += props.id ? `/${props.id}` : '';

 let bodyData: { content: string; parentId?: number; questionId?: number } = {
  content: contentToSubmit,
};

  // Dynamically adjust bodyData for adding questions or answers
  if (props.isQuestion) {
    // When adding a new question (either top-level or under another question)
    if (props.parentId) {
      // If there's a parentId, it means we're adding a sub-question
      bodyData.parentId = props.parentId;
    }
    // Note: No additional property needed for top-level questions
  } else {
    // When adding a new answer, associate it with its question via questionId
    bodyData.questionId = props.parentId; // Here, parentId actually refers to the questionId
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: props.id ? 'PUT' : 'POST', // Determine the method based on the editing or adding context
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Clear the input field upon successful submission
    inputValue.value = '';

    // Optionally, emit an event for successful submission to refresh data or update UI
    emits('updateSuccess');
  } catch (error) {
    console.error('Error submitting:', error);
  }
};



function cancelEdit() {
  emits('cancel');
  // Optional: Reset input value on cancel
  inputValue.value = props.content || '';
}

function deleteObject() {
  emits('delete', { id: props.id, isQuestion: props.isQuestion });
}
</script>