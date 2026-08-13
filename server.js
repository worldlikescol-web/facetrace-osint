const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Habilitar CORS para permitir peticiones desde cualquier origen
app.use(cors());
app.use(express.json());

const API_BASE = 'https://api.camgirlfinder.net';
const USER_AGENT = 'FaceTrace_OSINT_Recon/1.0';

// Ruta proxy para búsqueda por imagen (POST)
app.post('/search', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen.' });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, { filename: 'target.jpg' });

    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { ...formData.getHeaders(), 'User-Agent': USER_AGENT },
      body: formData
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Puerto asignado dinámicamente por Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy FaceTrace OSINT activo en puerto ${PORT}`));
