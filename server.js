const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const API_BASE = 'https://api.camgirlfinder.net';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Ruta proxy para búsqueda por imagen (POST /search y /api/search)
const handleImageSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen.' });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, { filename: 'target.jpg', contentType: req.file.mimetype });

    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { ...formData.getHeaders(), 'User-Agent': USER_AGENT },
      body: formData
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `API externa respondió con status ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/search', upload.single('image'), handleImageSearch);
app.post('/api/search', upload.single('image'), handleImageSearch);

// Ruta proxy para búsqueda por Texto / URL (GET /search y /api/search)
const handleTextSearch = async (req, res) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const targetUrl = req.query.q 
      ? `${API_BASE}/models/search?${query}`
      : `${API_BASE}/search?${query}`;
    
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      return res.status(response.status).json([]);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get('/search', handleTextSearch);
app.get('/api/search', handleTextSearch);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy OSINT activo en puerto ${PORT}`));
