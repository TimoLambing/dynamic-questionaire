<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
      <!-- Show the initial button to create the first question -->
      <div v-if="!showInput && !submittedQuestion">
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
  import { ref } from 'vue';
  
// Define a type for the question
type Question = {
  id: number;
  content: string;
};

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
    // Determine the API endpoint
  const apiEndpoint = isEditing.value && submittedQuestion.value
    ? `/api/questions/${submittedQuestion.value.id}`
    : '/api/questions';
    
    try {
      // Make a POST request to the server
      const response = await fetch(apiEndpoint, {
        method: isEditing.value ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputValue.value }),
      });
  
      // Check if the request was successful
      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();
        // Set the submitted question to the response data
        submittedQuestion.value = data;
        // Hide the input and show the submitted question with the edit button
        showInput.value = false;
        isEditing.value = false; // Reset editing state
      } else {
        // Handle HTTP errors
        console.error('HTTP error:', response.status);
        // Here you could set an error message in your state and display it in the template
      }
    } catch (error) {
      // Handle exceptions
      console.error('Fetch error:', error);
      // Here you could set an error message in your state and display it in the template
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

  
  </script>
  
  
  <style>
.text-white input {
  color: white !important; /* This makes the input text white */
}
</style>