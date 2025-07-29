const { createClient } = require('@supabase/supabase-js');

// Conversations API endpoint for Vercel
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials');
    res.status(500).json({ error: 'Database credentials not configured' });
    return;
  }

  // Initialize Supabase client inside the function
  let supabase;
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  } catch (error) {
    console.error('Supabase client initialization error:', error);
    res.status(500).json({ error: 'Database connection failed' });
    return;
  }

  try {
    console.log('Fetching all conversations from database');
    
    const { data: conversations, error } = await supabase
      .from('Conversations')
      .select('conversation_id, messages, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      res.status(500).json({ error: 'Database fetch failed' });
      return;
    }

    console.log(`Found ${conversations.length} conversations`);
    res.status(200).json({ conversations: conversations || [] });
  } catch (error) {
    console.error('General error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}; 