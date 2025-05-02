// backend/server.js (using OpenAI Assistants API)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const config = require('./config');
const { getAssistantId, saveAssistantId } = require('./assistantConfig');

const app = express();
const port = config.port;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Retrieve assistant ID from config file
let assistantId = getAssistantId();

// Initialize the assistant (run once at startup)
async function initializeAssistant() {
  try {
    // Import the system prompt content
    const STATIC_SYSTEM_PROMPT = require('./static-prompt');
    const ASSISTANT_NAME = "Partner Assistant";
    
    // If we already have an assistant ID in our config, check if it's still valid
    if (assistantId) {
      try {
        console.log(`Checking existing assistant with ID: ${assistantId}`);
        const existingAssistant = await openai.beta.assistants.retrieve(assistantId);
        console.log(`Using existing assistant: ${existingAssistant.name}`);
        
        // Optionally update the assistant if needed
        // await openai.beta.assistants.update(assistantId, {
        //   instructions: STATIC_SYSTEM_PROMPT,
        //   model: config.model,
        // });
        
        return; // Assistant exists and is valid
      } catch (error) {
        // Assistant doesn't exist or can't be accessed
        console.log('Stored assistant ID is invalid, creating a new one');
        assistantId = null;
      }
    }
    
    // If no valid assistant ID exists, check for one by name or create new
    console.log('Looking for existing assistant by name...');
    const assistants = await openai.beta.assistants.list({
      limit: 100, // Adjust as needed
    });
    
    // Find an assistant with matching name
    const existingAssistant = assistants.data.find(
      assistant => assistant.name === ASSISTANT_NAME
    );
    
    if (existingAssistant) {
      // Use the existing assistant
      assistantId = existingAssistant.id;
      console.log(`Found existing assistant with ID: ${assistantId}`);
      saveAssistantId(assistantId);
    } else {
      // Create a new assistant if none exists
      console.log('Creating new assistant...');
      const assistant = await openai.beta.assistants.create({
        name: ASSISTANT_NAME,
        instructions: STATIC_SYSTEM_PROMPT,
        model: config.model,
        tools: [] // Add tools like retrieval if needed
      });
      
      assistantId = assistant.id;
      console.log(`Assistant created with ID: ${assistantId}`);
      saveAssistantId(assistantId);
    }
  } catch (error) {
    console.error('Error initializing assistant:', error);
  }
}

// Store user threads (in a real app, this would be in a database)
const userThreads = {};

// Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, userId = 'default-user' } = req.body;
    
    // Create or retrieve the user's thread
    if (!userThreads[userId]) {
      const thread = await openai.beta.threads.create();
      userThreads[userId] = thread.id;
      console.log(`New thread created for user ${userId}: ${thread.id}`);
    }
    
    const threadId = userThreads[userId];
    
    // Add the user message to the thread
    await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: message
      }
    );
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(
      threadId,
      {
        assistant_id: assistantId
      }
    );
    
    // Poll for the run to complete
    let completedRun;
    while (true) {
      completedRun = await openai.beta.threads.runs.retrieve(
        threadId,
        run.id
      );
      
      if (completedRun.status === 'completed' || 
          completedRun.status === 'failed' || 
          completedRun.status === 'cancelled') {
        break;
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (completedRun.status !== 'completed') {
      throw new Error(`Run failed with status: ${completedRun.status}`);
    }
    
    // Retrieve the assistant's messages
    const messages = await openai.beta.threads.messages.list(
      threadId
    );
    
    // Get the latest assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    const latestMessage = assistantMessages[0]; // Messages are returned in reverse chronological order
    
    // Extract the content from the message
    let responseContent = '';
    if (latestMessage && latestMessage.content && latestMessage.content.length > 0) {
      responseContent = latestMessage.content
        .filter(item => item.type === 'text')
        .map(item => item.text.value)
        .join('\n');
    }
    
    // Send the response
    res.json({ 
      response: responseContent 
    });
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Add a new endpoint to reset conversation history
app.post('/api/reset', async (req, res) => {
  try {
    const { userId = 'default-user' } = req.body;
    
    if (userThreads[userId]) {
      // Create a new thread
      const thread = await openai.beta.threads.create();
      userThreads[userId] = thread.id;
      console.log(`Reset thread for user ${userId}: ${thread.id}`);
    }
    
    res.json({ success: true, message: 'Conversation history reset successfully' });
  } catch (error) {
    console.error('Error resetting conversation:', error);
    res.status(500).json({ error: 'Failed to reset conversation' });
  }
});

// Initialize the assistant before starting the server
initializeAssistant().then(() => {
  // Start server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize assistant:', error);
  process.exit(1);
});