// /api/hh/[...proxy].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // объединяем массив маршрутов в путь для HH API
    const hhPath = Array.isArray(req.query.proxy) ? req.query.proxy.join('/') : '';
    const hhUrl = `https://api.hh.ru/${hhPath}`;

    const response = await axios({
      method: req.method,
      url: hhUrl,
      params: req.query,
      data: req.body,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}
