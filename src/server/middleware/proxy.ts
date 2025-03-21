import { createError, defineEventHandler, proxyRequest, readBody } from 'h3';

export default defineEventHandler(async event => {
  const { req } = event.node;
  const url = req.url || '';

  // Lidar com requisições de autenticação
  if (url.startsWith('/oauth/token')) {
    console.log('[Proxy] Recebendo requisição para /oauth/token');

    try {
      // Se for uma requisição POST, precisamos encaminhá-la para o servidor de autenticação
      if (req.method === 'POST') {
        // Lendo o corpo da requisição para debug
        const body = await readBody(event);
        console.log('[Proxy] Corpo da requisição de autenticação:', {
          grant_type: body.grant_type,
          client_id: body.client_id,
          username: body.username,
        });

        // Configurando o proxy para o servidor de autenticação
        return await proxyRequest(event, 'http://localhost:8080/oauth/token', {
          fetchOptions: {
            headers: {
              Origin: 'http://localhost:3000',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          },
        });
      }

      // Para requisições OPTIONS (preflight CORS)
      if (req.method === 'OPTIONS') {
        return {
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        };
      }
    } catch (error: any) {
      console.error(
        '[Proxy] Erro ao processar requisição de autenticação:',
        error,
      );
      throw createError({
        statusCode: 500,
        statusMessage: `Erro no proxy: ${error.message}`,
      });
    }
  }

  // Proxy para outras requisições da API
  if (url.startsWith('/api/')) {
    const targetUrl = `http://localhost:8080${url.replace('/api', '')}`;
    console.log('[Proxy] Redirecionando requisição API para:', targetUrl);

    try {
      return await proxyRequest(event, targetUrl, {
        fetchOptions: {
          headers: {
            Origin: 'http://localhost:3000',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      });
    } catch (error: any) {
      console.error('[Proxy] Erro no proxy API:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Erro no servidor proxy: ${error.message}`,
      });
    }
  }
});
