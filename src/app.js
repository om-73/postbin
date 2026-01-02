const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const viewRoutes = require('./routes/view');
const timeMiddleware = require('./middleware/time');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files (for the UI to create pastes)
app.use(express.static(path.join(__dirname, '../public')));

// Global middleware for deterministic time
app.use(timeMiddleware);

// Routes
app.use('/api', apiRoutes);
app.use('/p', viewRoutes);

// Simple root route for creating pastes (frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
