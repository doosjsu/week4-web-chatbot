# Web Chatbot with Conversation Dashboard

A simple web-based chatbot with conversation history management and a dashboard to view all conversations.

## Features

- **Real-time Chat**: Interactive chatbot interface with AI responses
- **Conversation Management**: Automatic conversation ID generation and persistence
- **Conversation Dashboard**: View all conversations with timestamps and message history
- **Database Storage**: Conversations stored in Supabase for persistence
- **New Chat Functionality**: Start fresh conversations with new IDs

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Database Setup**:
   Create a `Conversations` table in Supabase with:
   - `conversation_id` (text, primary key)
   - `messages` (jsonb)
   - `created_at` (timestamp with time zone)
   - `updated_at` (timestamp with time zone)

4. **Run the Server**:
   ```bash
   npm start
   ```

5. **Access the Application**:
   - Main Chat: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard.html

## Usage

### Main Chat Interface
- Type messages in the input field and press Enter or click Send
- Click "New Chat" to start a fresh conversation
- Click "Dashboard" to view all conversations

### Conversation Dashboard
- View all conversations with timestamps
- Click on any conversation to see all messages
- Use "Back to Chat" to return to the main interface
- Conversations are sorted by creation date (newest first)

## API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/detail?conversationId=<id>` - Get specific conversation

## File Structure

```
├── index.html          # Main chat interface
├── dashboard.html      # Conversation dashboard
├── server.js           # Express server
├── api/
│   ├── chat.js         # Chat API endpoint
│   └── conversations.js # Dashboard API endpoints
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-3.5-turbo
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with modern design 