export default function handler(req, res) {
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
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      url: req.url,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}