module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    res.status(200).json({ 
      message: 'API работает!', 
      timestamp: Date.now(),
      environment: 'vercel',
      node_version: process.version,
      memory: process.memoryUsage()
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};