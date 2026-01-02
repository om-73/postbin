const app = require('./app');

const PORT = process.env.PORT || 3000;

// Only listen if run directly (e.g., node src/index.js)
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

// Export for Vercel
module.exports = app;

