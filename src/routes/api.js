const express = require('express');
const router = express.Router();
const redis = require('../config/redis');
const pasteService = require('../services/pasteService');

// Health Check
router.get('/healthz', async (req, res) => {
    try {
        const status = await redis.ping();
        res.json({ ok: status === 'PONG' });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Redis connection failed' });
    }
});

// Create Paste
router.post('/pastes', async (req, res) => {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: 'content is required and must be a non-empty string' });
    }

    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
        return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
    }

    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
        return res.status(400).json({ error: 'max_views must be an integer >= 1' });
    }

    try {
        const paste = await pasteService.createPaste(content, ttl_seconds, max_views, req.now);
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

        res.status(201).json({
            id: paste.id,
            url: `${baseUrl}/p/${paste.id}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch Paste API
router.get('/pastes/:id', async (req, res) => {
    try {
        const paste = await pasteService.getPaste(req.params.id, req.now);

        if (!paste) {
            return res.status(404).json({ error: 'Paste not found or expired' });
        }

        res.json({
            content: paste.content,
            remaining_views: paste.remaining_views,
            expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
