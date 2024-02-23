// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/eslint-module',
  ],
  css: ['~/assets/main.css'],
  supabase: {
    redirect: false
  }
})
