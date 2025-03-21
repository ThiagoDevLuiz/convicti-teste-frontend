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

  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
      apiAuthUrl: process.env.API_AUTH_URL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
  },

  ssr: false,

  build: {
    transpile: ['@pinia/nuxt'],
  },

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

  compatibilityDate: '2025-03-21',
});