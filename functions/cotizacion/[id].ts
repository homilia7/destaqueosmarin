interface Env {
  DB?: D1Database;
  ASSETS?: { fetch: (req: Request | string) => Promise<Response> };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  const id = params.id as string;
  const url = new URL(request.url);

  let clientName = 'Cliente Particular';
  let quoteNumber = 'COT-2026';
  let companyName = 'Destaqueos y Tanques Sépticos Mauricio Marín';
  let workReference = 'Limpieza de tanque séptico y destaqueo de tuberías';
  let totalAmountFormatted = '';

  if (env.DB && id) {
    try {
      const row: any = await env.DB.prepare(
        'SELECT quote_number, client_name, company_name, work_reference, total_amount FROM quotes WHERE id = ?'
      ).bind(id).first();

      if (row) {
        if (row.client_name) clientName = row.client_name.trim();
        if (row.quote_number) quoteNumber = row.quote_number.trim();
        if (row.company_name) companyName = row.company_name.trim();
        if (row.work_reference) workReference = row.work_reference.trim();
        if (row.total_amount) {
          totalAmountFormatted = ` • Total: ₡${Number(row.total_amount).toLocaleString('es-CR')}`;
        }
      }
    } catch (e) {
      console.warn('Error fetching quote for preview:', e);
    }
  }

  const ogTitle = `📋 Cotización Oficial: ${clientName} (${quoteNumber})`;
  const ogDescription = `Cotización formal emitida por ${companyName}.${totalAmountFormatted} Referencia: ${workReference}. Toque aquí para abrir y descargar su cotización en PDF.`;
  const ogImage = `${url.origin}/camion-destaqueos.png`;
  const canonicalUrl = `${url.origin}/cotizacion/${id}`;

  // Fetch index.html from static assets
  let html = '';
  if (env.ASSETS) {
    try {
      const assetRes = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
      if (assetRes.ok) {
        html = await assetRes.text();
      }
    } catch (e) {
      console.warn('ASSETS fetch error:', e);
    }
  }

  // Fallback if asset fetch failed
  if (!html) {
    html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ogTitle}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  }

  const metaTags = `
    <!-- Open Graph / WhatsApp Preview Tags -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${companyName}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${canonicalUrl}" />

    <!-- Twitter Card Meta -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />

    <!-- Meta Description -->
    <meta name="description" content="${ogDescription}" />
  `;

  // Clean any previous default og/twitter/description tags from template
  html = html.replace(/<meta property="og:[^>]*>/gi, '');
  html = html.replace(/<meta name="twitter:[^>]*>/gi, '');
  html = html.replace(/<meta name="description"[^>]*>/gi, '');

  // Replace title and inject specific Open Graph meta tags into head
  html = html.replace(/<title>.*?<\/title>/i, `<title>${ogTitle}</title>`);
  html = html.replace('</head>', `${metaTags}\n</head>`);

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300'
    }
  });
};
