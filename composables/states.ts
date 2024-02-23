import type { Question } from "~/types";

// export const showInput = useState<boolean>('showInput', () => false);
// export const objectsTree = useState<Question[]>('objectsTree', () => []);
export const objectsTreeState = () => useState<Question[]>('objectsTree', () => [])
export const showInputState = () => useState<boolean>('showInput', () => false)