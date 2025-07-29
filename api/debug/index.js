// Debug API endpoint to test environment variables
module.exports = async (req, res) => {
  console.log('Debug API called');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check all environment variables
  const envCheck = {
    OPENAI_API_KEY: {
      exists: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      preview: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT_SET'
    },
    SUPABASE_URL: {
      exists: !!process.env.SUPABASE_URL,
      length: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0,
      preview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) + '...' : 'NOT_SET'
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0,
      preview: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' : 'NOT_SET'
    }
  };

  res.status(200).json({
    message: 'Debug API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: envCheck,
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('OPENAI') || key.includes('SUPABASE') || key.includes('VERCEL')
    )
  });
}; 