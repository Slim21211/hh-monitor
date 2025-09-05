export interface Env {
  USER_AGENT: string;
  REFERER: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // Обрабатываем preflight запросы
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      const url = new URL(req.url);
      const hhPath = url.pathname.replace('/hh/', '');
      const hhUrl = `https://api.hh.ru/${hhPath}`;

      // Получаем query params
      const params = url.searchParams.toString();
      const finalUrl = params ? `${hhUrl}?${params}` : hhUrl;

      // Получаем тело запроса, если не GET/HEAD
      let body: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await req.text().catch(() => undefined);
      }

      // Делаем fetch к HH API
      const response = await fetch(finalUrl, {
        method: req.method,
        headers: {
          'User-Agent': env.USER_AGENT,
          'Referer': env.REFERER,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body,
      });

      const data = await response.text();

      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  },
};
