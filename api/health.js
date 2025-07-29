// Health check API endpoint
module.exports = async (req, res) => {
  console.log('Health check called');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development'
    },
    config: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  };

  res.status(200).json(health);
}; 