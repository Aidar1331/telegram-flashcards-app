module.exports = (req, res) => {
  res.json({
    status: 'OK',
    timestamp: Date.now(),
    version: '1.0.0'
  });
};