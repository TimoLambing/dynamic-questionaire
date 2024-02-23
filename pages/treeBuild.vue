<template>
  <div class="flex items-center min-h-screen">
    <InitialButton v-if="!objectsTree.length && !showInput" />
    <InputComponent 
      v-if="showInput || isEditing || isAdding"
      :id="editingId || 0" 
      :content="editingContent"
      :is-question="editingIsQuestion"
      :parent-id="newParentId || 0"
      @update-success="handleUpdateSuccess" 
      @cancel="handleCancel"
    />
    <DisplayComponent 
      v-if="objectsTree.length" 
      :id="objectsTree[0].id" 
      :content="objectsTree[0].content"
      :answers="objectsTree[0].answers" 
      :is-question="true"
      :level="objectsTree[0].level"
      :editing-id="editingId || 0"
      :is-editing="editingId === objectsTree[0].id"
      @edit="handleEdit"
      @add="handleAdd"
      @update-success="handleUpdateSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Question } from '~/types';

// States imprted
const objectsTreeState = () => useState<Question[]>('objectsTree', () => [])
const showInputState = () => useState<boolean>('showInput', () => false)

// Variables to be declared
const objectsTree = objectsTreeState()
const showInput = showInputState()
const editingId = ref<number | undefined>(undefined);
const editingContent = ref('');
const editingIsQuestion = ref(false);
const isEditing = ref(false);
const isAdding = ref(false); // Controls visibility of InputComponent
const newParentId = ref<number | undefined>(undefined);

const fetchObjectsTree = async () => {
  try {
    const response = await fetch('/api/objects/tree');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const treeData = await response.json();
    addLevelToTree(treeData, 1); // Start from level 1 for top-level questions
    objectsTree.value = treeData;
    showInput.value = false;
  } catch (error) {
    console.error('Error fetching objects tree:', error);
  }
};

function addLevelToTree(nodes: Question[], level: number) {
  nodes.forEach(node => {
    node.level = level; // Set the level for each node
    if (node.answers && node.answers.length > 0) {
      node.answers.forEach(answer => {
        if (answer.nextQuestion) {
          addLevelToTree([answer.nextQuestion], level + 1); // Recursively set levels for nested questions
        }
      });
    }
  });
}

onMounted(fetchObjectsTree);

function handleEdit(event: { id: number; content: string; isQuestion: boolean; }) {
  const { id, content, isQuestion } = event;
  editingId.value = id;
  editingContent.value = content;
  editingIsQuestion.value = isQuestion;
  isEditing.value = true;
  isAdding.value = false; // Ensure we're not in adding mode
  showInput.value = true;
}

function handleUpdateSuccess() {
  fetchObjectsTree(); // Refresh the list to include the new item
  isEditing.value = false;
  isAdding.value = false; // Reset adding state
  editingId.value = undefined; // Clear any selection
  // Optionally, reset other state variables as needed
}

function handleCancel() {
  isEditing.value = false;
  isAdding.value = false;
  showInput.value = false; // Optionally show the initial input button again
  // Reset editing and adding state
  editingId.value = undefined;
  editingContent.value = '';
  newParentId.value = undefined;
}

function handleAdd({ parentId, isQuestion }: { parentId: number; isQuestion: boolean }) {
  // If adding under an answer, we're actually adding a question related to the answer's question
  const addingQuestionUnderAnswer = !isQuestion;

  if (addingQuestionUnderAnswer) {
    // Logic to handle adding a new question under an answer
    isAdding.value = true;
    editingIsQuestion.value = true; // Now we're adding a question
    newParentId.value = parentId; // The parentId for the new question is the id of the parent question of the answer
    showInput.value = true; // Show input component for adding new question
  } else {
    // Your existing logic for adding an answer under a question
    isAdding.value = true;
    editingIsQuestion.value = false; // Adding an answer, so this stays false
    newParentId.value = parentId; // The parentId for the new answer is the id of the question
    showInput.value = true; // Show input component for adding new answer
  }
}


</script>
