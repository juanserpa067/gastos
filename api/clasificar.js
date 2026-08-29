// Esta función vive en el servidor de Vercel, nunca en el navegador.
// Por eso puede usar tu llave de API sin exponerla a quien use la app.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { base64, mediaType, isPdf, rubro, categorias, fechaHoy } = req.body || {};

  if (!base64) {
    return res.status(400).json({ error: 'Falta el archivo (base64)' });
  }

  const contentBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: base64 } };

  const prompt = `Analiza esta factura o recibo de un negocio del rubro "${rubro || 'general'}". Responde SOLO con un objeto JSON, sin texto adicional, sin markdown, con exactamente estas claves:
{"producto": "nombre breve del producto o compra principal", "categoria": "una de estas opciones exactas: ${(categorias || []).join(', ')}", "valor": numero_total_pagado_como_numero, "tienda": "nombre del lugar donde se compró", "fecha": "YYYY-MM-DD, usa ${fechaHoy} si no puedes leer la fecha"}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: [contentBlock, { type: 'text', text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
      return res.status(response.status || 500).json({
        error: (data.error && data.error.message) || 'Error al llamar a la IA'
      });
    }

    const rawText = (data.content || []).map(b => b.text || '').join('');
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
