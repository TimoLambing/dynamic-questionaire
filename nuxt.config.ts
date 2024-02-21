// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
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
