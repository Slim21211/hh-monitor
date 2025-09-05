export interface Env {
  USER_AGENT: string;
  REFERER: string;
}

export default {
  async fetch(req: Request, env: Env) {
    try {
      const url = new URL(req.url);
      const hhPath = url.pathname.replace('/hh/', '');
      const hhUrl = `https://api.hh.ru/${hhPath}`;
      const params = url.searchParams.toString();
      const finalUrl = params ? `${hhUrl}?${params}` : hhUrl;

      const init: RequestInit = {
        method: req.method,
        headers: {
          'User-Agent': env.USER_AGENT,
          'Referer': env.REFERER,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        init.body = await req.text(); // fetch ожидает string или ReadableStream
      }

      const response = await fetch(finalUrl, init);
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
