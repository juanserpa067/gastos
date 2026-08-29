// Esta función vive en el servidor de Vercel, nunca en el navegador.
// Por eso puede usar tu llave de API sin exponerla a quien use la app.
// Usa Google Gemini (más barato, con nivel gratuito para este volumen).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { base64, mediaType, isPdf, rubro, categorias, fechaHoy } = req.body || {};

  if (!base64) {
    return res.status(400).json({ error: 'Falta el archivo (base64)' });
  }

  const mimeType = isPdf ? 'application/pdf' : (mediaType || 'image/jpeg');

  const prompt = `Analiza esta factura o recibo de compra (contexto de uso: "${rubro || 'general'}"). Identifica CADA producto o línea individual de la factura por separado (no los agrupes). Responde SOLO con un objeto JSON, sin texto adicional, sin markdown, con exactamente esta forma:
{"tienda": "nombre del lugar donde se compró", "fecha": "YYYY-MM-DD, usa ${fechaHoy} si no puedes leer la fecha", "items": [{"producto": "nombre breve de ESTE producto o línea", "categoria": "una de estas opciones exactas: ${(categorias || []).join(', ')}", "valor": precio_de_este_producto_como_numero}]}
Incluye un objeto dentro de "items" por cada producto distinto de la factura, con su propio valor individual (no el total de la factura).`;

  try {
    const model = 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64 } }
          ]
        }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({
        error: (data.error && data.error.message) || 'Error al llamar a la IA'
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(502).json({ error: 'La IA no devolvió un JSON reconocible' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}
