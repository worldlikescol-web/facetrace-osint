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

// Encabezados para imitar un navegador real y evitar bloqueos
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://camgirlfinder.net',
  'Referer': 'https://camgirlfinder.net/'
};

// Ruta de búsqueda por imagen (POST)
app.post('/search', upload.single('image'), async (req, res) => {
  console.log('>>> Petición recibida: Búsqueda por imagen (POST)');
  try {
    if (!req.file) return res.status(400).json({ error: 'Falta la imagen' });

    const formData = new FormData();
    formData.append('file', req.file.buffer, { filename: 'upload.jpg', contentType: req.file.mimetype });

    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { ...formData.getHeaders(), ...HEADERS },
      body: formData
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(403).json({ error: 'La API externa bloqueó la petición (devolvió HTML).' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta de búsqueda por texto (GET)
app.get('/search', async (req, res) => {
  console.log('>>> Petición recibida: Búsqueda por texto (GET)', req.query);
  try {
    const query = new URLSearchParams(req.query).toString();
    const response = await fetch(`${API_BASE}/search?${query}`, {
      headers: HEADERS
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(403).json({ error: 'La API externa bloqueó la petición (devolvió HTML).' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy listo en puerto ${PORT}`));
