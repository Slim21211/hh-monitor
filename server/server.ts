// server/server.ts
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Включаем CORS для всех запросов
app.use(cors({
  origin: '*',
}));

app.use(express.json());

// Прокси для API HeadHunter - используем более конкретные роуты
app.use('/api/hh', async (req, res) => {
  try {
    const hhPath = req.path;
    const hhUrl = `https://api.hh.ru${hhPath}`;
    
    console.log('Proxying request to:', hhUrl);
    console.log('Query params:', req.query);
    console.log('Method:', req.method);
    
    const response = await axios({
      method: req.method,
      url: hhUrl,
      params: req.query,
      data: req.body,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },

    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      res.status(error.response.status).json({
        error: error.response.data,
        message: 'Error from HeadHunter API'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Базовый маршрут для проверки работы сервера
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`HH API proxy: http://localhost:${PORT}/api/hh/*`);
});
