<template>
  <div class="p-2 justify-center">
    <!-- Check if we're in edit mode, and display InputComponent if true -->
    <div
      v-if="isEditing"
      class="flex flex-row items-center mb-2 whitespace-nowrap"
    >
      <InputComponent
        :id="id"
        :content="content"
        :is-question="isQuestion"
        :is-editing="isEditing"
        @update-success="handleUpdateSuccess"
        @cancel="handleCancelEdit"
        @parent-id="parentId"
      />
    </div>
    <!-- Display the current object if not in edit mode -->
    <div
      v-else
      class="flex flex-row items-center mb-2 whitespace-nowrap"
    >
      <!-- Display the current object -->
      <div class="flex flex-row items-center mb-2 whitespace-nowrap">
        <!-- Level Badge -->
        <span class="badge level-badge">L.{{ level }}</span>
        <!-- ID Badge -->
        <span class="badge id-badge">ID.{{ id }}</span>
        <span class="mr-0 text-sm whitespace-nowrap">{{ content }}</span>
        <UButton
          label="Muuda"
          class="ml-1"
          size="xs"
          @click="editObject"
        />
        <!-- Show "Add Answer" only if it's a question without a next question -->
        <UButton
          v-if="isQuestion && !hasNextQuestion"
          :label="'Lisa vastus'"
          class="ml-1"
          size="xs"
          @click="addObject"
        />
        <!-- Optionally, show "Add Follow-up Question" if it's an answer -->
        <UButton
          v-else-if="!isQuestion"
          :label="'Lisa järgnev küsimus'"
          class="ml-1"
          size="xs"
          @click="addObject"
        />
      </div>

      <!-- Display answers if it's a question -->
      <div v-if="isQuestion && answers.length">
        <DisplayComponent
          v-for="answer in answers"
          :id="answer.id"
          :key="answer.id"
          :content="answer.content"
          :is-question="false"
          :answers="answer.nextQuestion?.answers || []"
          :has-next-question="!!answer.nextQuestion"
          :next-question="answer.nextQuestion"
          :level="level + 1"
          :editing-id="editingId"
          @add="$emit('add', $event)"
          @edit="$emit('edit', $event)"
          @update-success="$emit('update-success', $event)"
          @cancel="$emit('cancel', $event)"
        />
      </div>

      <!-- Optionally display next question if it's an answer leading to one -->
      <div v-if="!isQuestion && hasNextQuestion">
        <DisplayComponent
          :id="nextQuestion.id"
          :content="nextQuestion.content"
          :is-question="true"
          :answers="nextQuestion.answers"
          :level="level + 1"
          :editing-id="editingId"
          @edit="$emit('edit', $event)"
          @add="$emit('add', $event)"
          @update-success="$emit('update-success', $event)"
          @cancel="$emit('cancel', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from 'vue';
import type { Answer, Question } from '~/types';

// Define the props, including a new isEditing prop
const props = defineProps<{
  id: number;
  content: string;
  answers: Answer[];
  isQuestion: boolean;
  nextQuestion?: Question;
  level: number;
  isEditing: boolean; // New prop to determine if the component is in edit mode
  editingId?: number,
  parentId: number
}>();

onMounted(() => {
  console.log(props.id, props.content);
});

// This computed property checks if there is a next question
const hasNextQuestion = computed(() => !!props.nextQuestion);

const emits = defineEmits(['update', 'cancel', 'edit', 'add', 'update-success']);

function editObject() {
  emits('edit', { id: props.id, content: props.content, isQuestion: props.isQuestion });
}

function addObject() {
  // Assuming "isQuestion" determines the current type, invert it for the addition
  // For a question component, adding an "answer" (thus isQuestion: false), and vice versa
  console.log(`Adding object for parentId: ${props.id}, isQuestion: ${!props.isQuestion}`);
  emits('add', { parentId: props.id, isQuestion: !props.isQuestion });
}

function handleUpdateSuccess(updatedContent: string) {
  // Emit an update event to notify the parent component
  emits('update', { id: props.id, content: updatedContent });
}

function handleCancelEdit() {
  // Emit a cancel event in case the parent component needs to react
  emits('cancel');
}
</script>

