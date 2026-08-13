app.get('/search', async (req, res) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const response = await fetch(`${API_BASE}/search?${query}`, { headers: HEADERS });

    // Verificar si la respuesta es realmente JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('La API devolvió HTML (bloqueo anti-bot):', text.substring(0, 150));
      return res.status(403).json({ error: 'La API externa bloqueó la conexión por seguridad (IP de servidor).' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
