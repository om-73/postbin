const express = require('express');
const router = express.Router();
const pasteService = require('../services/pasteService');

router.get('/:id', async (req, res) => {
  try {
    const paste = await pasteService.getPaste(req.params.id, req.now);

    if (!paste) {
      let errorHtml = '<h1>404 Paste Not Found</h1><p>The paste may have expired or reached its view limit.</p>';

      // Helpful hint for Vercel/Serverless users without real Redis
      const isMock = process.env.USE_REDIS_MOCK === 'true' || !process.env.REDIS_URL;
      if (isMock) {
        errorHtml += `
                    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-radius: 4px;">
                        <strong>Deployment Warning:</strong> You are using an in-memory database (Mock Redis). 
                        Pastes are lost when the serverless function restarts or sleeps. 
                        Please configure <code>REDIS_URL</code> for persistent storage.
                    </div>
                `;
      }
      return res.status(404).send(errorHtml);
    }

    // Basic HTML escaping helper
    const escapeHTML = (str) => {
      return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]);
    };

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pastebin-Lite</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background: #f4f4f9; color: #333; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          pre { background: #eee; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
          h1 { color: #2c3e50; }
          .meta { font-size: 0.8em; color: #777; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Paste Content</h1>
          <div class="meta">
            ${paste.expires_at ? `Expires: ${new Date(paste.expires_at).toLocaleString()}` : 'No expiry'} | 
            ${paste.max_views ? `Remaining views: ${paste.remaining_views}` : 'Unlimited views'}
          </div>
          <pre>${escapeHTML(paste.content)}</pre>
          <hr>
          <a href="/">Create New Paste</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
