module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    url: req.url,
    timestamp: Date.now()
  });
};