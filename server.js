// Proxy seguro para Gemini + CORS y logging
const express = require('express');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const app = express();

// Middleware
app.use(express.json());

// CORS básico — permite llamadas desde tu front-end (ajusta origen si lo necesitas)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // cambiar a origen específico en producción
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const GEN_KEY = process.env.GEN_API_KEY;
if (!GEN_KEY) console.warn('GEN_API_KEY no configurada. Proxy iniciará pero fallará al llamar a Gemini.');

app.post('/api/gemini', async (req, res) => {
  console.log(`[proxy] ${req.method} ${req.path} - body keys: ${Object.keys(req.body)}`);
  const prompt = String(req.body?.prompt ?? '');
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  try {
    const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEN_KEY // usar .env en producción
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    console.log(`[proxy->gemini] status: ${resp.status}`);
    const bodyText = await resp.text();
    // Si Gemini devuelve 405, lo veremos en console y en bodyText
    if (!resp.ok) return res.status(resp.status).json({ error: 'Gemini error', status: resp.status, detail: bodyText });

    const json = JSON.parse(bodyText);
    // Extrae texto de respuesta (ajusta según la respuesta real)
    let text = '';
    if (json?.candidates?.length) {
      try {
        text = json.candidates[0].content.map(c => c.text || '').join('\n').trim();
      } catch { text = JSON.stringify(json); }
    } else {
      text = JSON.stringify(json);
    }
    res.json({ text, raw: json });
  } catch (err) {
    console.error('[proxy] error interno:', err);
    res.status(500).json({ error: 'Internal proxy error', detail: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy API escuchando en http://localhost:${PORT}`));