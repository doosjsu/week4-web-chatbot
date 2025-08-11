const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Chat API endpoint for Vercel
module.exports = async (req, res) => {
  console.log('Chat API called with method:', req.method);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check environment variables
  console.log('Environment check:');
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    res.status(500).json({ error: 'OpenAI API key not configured' });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials');
    res.status(500).json({ error: 'Database credentials not configured' });
    return;
  }

  // Initialize clients inside the function
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let supabase;
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (error) {
    console.error('Supabase client initialization error:', error);
    res.status(500).json({ error: 'Database connection failed' });
    return;
  }

  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  // Handle potential body parsing issues
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      res.status(400).json({ error: 'Invalid JSON in request body' });
      return;
    }
  }
  
  const { message, conversationId } = body;
  if (!message || !conversationId) {
    console.error('Missing required fields:', { message: !!message, conversationId: !!conversationId });
    res.status(400).json({ error: 'Missing message or conversationId' });
    return;
  }

  try {
    console.log('Processing message for conversation ID:', conversationId);
    
    // Get existing conversation from Supabase
    console.log('Fetching conversation from Supabase...');
    let { data: conversation, error: fetchError } = await supabase
      .from('Conversations')
      .select('messages')
      .eq('conversation_id', conversationId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase fetch error:', fetchError);
      res.status(500).json({ error: 'Database fetch failed: ' + fetchError.message });
      return;
    }
    console.log('Supabase fetch completed');

    let messages = [];
    if (conversation) {
      messages = conversation.messages;
    } else {
      // Initialize new conversation with system message
      console.log('Creating new conversation with ID:', conversationId);
      messages = [
        { role: 'system', content: "You are a helpful chatbot. Use the conversation history to maintain context and remember important information shared by the user, including their name, preferences, and any details they've mentioned. Be conversational and helpful while building on previous exchanges." }
      ];
    }

    // Add user message
    messages.push({ role: 'user', content: message });

    // Get AI response
    console.log('Calling OpenAI API...');
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      res.status(500).json({ error: 'OpenAI API failed: ' + openaiError.message });
      return;
    }
    const botMessage = completion.choices[0].message.content;
    console.log('OpenAI response received');
    messages.push({ role: 'assistant', content: botMessage });

    // Save/update conversation in Supabase
    console.log('Saving conversation to Supabase...');
    console.log('Conversation exists:', !!conversation);
    console.log('Messages count:', messages.length);
    
    try {
      if (conversation) {
        // Update existing conversation
        console.log('Updating existing conversation...');
        const { error: updateError } = await supabase
          .from('Conversations')
          .update({ 
            messages: messages
          })
          .eq('conversation_id', conversationId);
        
        if (updateError) {
          console.error('Supabase update error:', updateError);
          res.status(500).json({ error: 'Database update failed: ' + updateError.message });
          return;
        }
        console.log('Conversation updated successfully');
      } else {
        // Insert new conversation
        console.log('Creating new conversation...');
        const { error: insertError } = await supabase
          .from('Conversations')
          .insert({
            conversation_id: conversationId,
            messages: messages,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Supabase insert error:', insertError);
          res.status(500).json({ error: 'Database insert failed: ' + insertError.message });
          return;
        }
        console.log('New conversation created successfully');
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      res.status(500).json({ error: 'Database operation failed: ' + dbError.message });
      return;
    }

    res.status(200).json({ response: botMessage });
  } catch (error) {
    console.error('General error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message,
      stack: error.stack
    });
  }
}; 