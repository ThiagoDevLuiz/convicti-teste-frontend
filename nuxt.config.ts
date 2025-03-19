// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  srcDir: 'src/',
  app: {
    head: {
      title: 'CONVICTI Tecnologia e Desenvolvimento de Sistemas',
      meta: [
        {
          name: 'description',
          content: 'Tecnologia e Desenvolvimento de Sistemas',
        },
      ],
    },
  },
  modules: ['@nuxt/fonts', '@nuxt/image', '@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  fonts: {
    families: [
      {
        name: 'Nunito Sans',
        provider: 'google',
        weights: [200, 300, 400, 500, 600, 700, 800, 900],
      },
      {
        name: 'Nunito',
        provider: 'google',
        weights: [200, 300, 400, 500, 600, 700, 800, 900],
      },
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported components
     */
    prefix: '',

    componentDir: 'src/components/ui',
  },

  compatibilityDate: '2025-03-18',
});
