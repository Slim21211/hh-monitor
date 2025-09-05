import axios from 'axios';

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
      const params = Object.fromEntries(url.searchParams);

      let data;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        data = await req.json().catch(() => undefined);
      }

      const response = await axios({
        method: req.method,
        url: hhUrl,
        headers: {
          'User-Agent': env.USER_AGENT,
          'Referer': env.REFERER,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        params,
        data,
      });

      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      const status = err.response?.status || 500;
      const data = err.response?.data || { message: err.message };
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
