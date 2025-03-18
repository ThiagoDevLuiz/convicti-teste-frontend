// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  srcDir: 'src/',

  app: {
    head: {
      title: 'Meu Projeto Nuxt 3',
      meta: [
        { name: 'description', content: 'Um projeto Nuxt 3 bem organizado' },
      ],
    },
  },

  modules: ['@nuxt/fonts', '@nuxt/image', '@nuxtjs/tailwindcss', 'shadcn-nuxt'],

  shadcn: {
    /**
     * Prefix for all the imported components
     */
    prefix: '',

    componentDir: 'src/components/ui',
  },

  compatibilityDate: '2025-03-18',
});