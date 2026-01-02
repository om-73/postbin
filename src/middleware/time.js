module.exports = (req, res, next) => {
    if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
        req.now = parseInt(req.headers['x-test-now-ms'], 10);
    } else {
        req.now = Date.now();
    }
    next();
};
