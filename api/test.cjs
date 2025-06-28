module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({ 
    message: 'API работает!', 
    timestamp: Date.now(),
    environment: 'vercel',
    node_version: process.version
  });
};