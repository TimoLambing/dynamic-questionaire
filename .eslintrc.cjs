module.exports = {
  parser: 'vue-eslint-parser', // Use the Vue parser
  rules: {
    "vue/multi-word-component-names": "off",
  },
  parserOptions: {
    parser: '@typescript-eslint/parser', // Use TypeScript parser for `<script>` blocks
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'plugin:vue/vue3-recommended', // Or 'plugin:vue/vue3-essential' for fewer rules
    'plugin:@typescript-eslint/recommended', // If using TypeScript
    // Other extends like 'eslint:recommended' or prettier configurations
  ],
  rules: {
    // Your custom rules
  },
}
