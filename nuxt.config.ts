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
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
      apiAuthUrl:
        process.env.API_AUTH_URL || 'http://localhost:8080/oauth/token',
      clientId: process.env.CLIENT_ID || '9e78719e-598a-417a-9ca0-2902c29b0e43',
      clientSecret:
        process.env.CLIENT_SECRET || 'FHu2Csyy7Wb2VdKDGKPOh8RkUOiugg1xIBBTvWSj',
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

  compatibilityDate: '2025-03-18',
});
