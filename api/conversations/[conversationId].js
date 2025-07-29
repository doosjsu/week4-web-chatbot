const { createClient } = require('@supabase/supabase-js');

// Individual conversation API endpoint for Vercel
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

  const { conversationId } = req.query;
  if (!conversationId) {
    res.status(400).json({ error: 'Missing conversationId parameter' });
    return;
  }

  try {
    console.log('Fetching conversation:', conversationId);
    
    const { data: conversation, error } = await supabase
      .from('Conversations')
      .select('conversation_id, messages, created_at')
      .eq('conversation_id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      console.error('Supabase fetch error:', error);
      res.status(500).json({ error: 'Database fetch failed' });
      return;
    }

    console.log('Conversation found:', conversation.conversation_id);
    res.status(200).json({ conversation });
  } catch (error) {
    console.error('General error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
}; 