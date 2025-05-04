// api/server.js (using OpenAI Responses API with streaming)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const config = require('./config');

const app = express();
const port = config.port;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import the system prompt content
const STATIC_SYSTEM_PROMPT = require('./static-prompt');

// Store user conversations (in a real app, this would be in a database)
const userConversations = {};

// Assistant endpoint with streaming
app.get('/api/assistant', async (req, res) => {
  try {
    const { message, userId = 'default-user' } = req.query;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Create or retrieve the user's conversation history
    if (!userConversations[userId]) {
      userConversations[userId] = {};
    }
    
    console.log('Making Responses API call with:', {
      model: config.model,
      input: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      previousResponseId: userConversations[userId].lastResponseId
    });
    
    try {
      const response = await openai.responses.create({
        model: config.model,
        stream: true,
        instructions: STATIC_SYSTEM_PROMPT,
        input: message,
        ...(userConversations[userId].lastResponseId ? 
          { previous_response_id: userConversations[userId].lastResponseId } : {})
      });
      
      let streamContent = '';
      let responseId = null;
      
      // Send an initial message to keep the connection alive
      res.write(`data: ${JSON.stringify({ init: true })}\n\n`);
      
      for await (const chunk of response) {
        // Log the full chunk structure for debugging
        console.log('Raw chunk:', JSON.stringify(chunk, null, 2));
        
        // Store response ID when available
        if (chunk.id && !responseId) {
          responseId = chunk.id;
          console.log('Response ID captured:', responseId);
        }
        
        // Try various ways to extract text content
        let textContent = null;
        
        // Method 1: Check if there's text directly on the chunk
        if (chunk.text) {
          textContent = chunk.text;
          console.log('Method 1 - Direct text property:', textContent);
        }
        // Method 2: Check output array with content array
        else if (chunk.output && Array.isArray(chunk.output) && chunk.output.length > 0) {
          for (const outputItem of chunk.output) {
            if (outputItem.content && Array.isArray(outputItem.content)) {
              for (const contentItem of outputItem.content) {
                if (contentItem.type === 'text' && contentItem.text) {
                  textContent = contentItem.text;
                  console.log('Method 2 - From output/content arrays:', textContent);
                  break;
                }
              }
              if (textContent) break;
            }
          }
        }
        // Method 3: Check for delta property (similar to Chat Completions)
        else if (chunk.delta && chunk.delta.text) {
          textContent = chunk.delta.text;
          console.log('Method 3 - Delta property:', textContent);
        }
        // Method 4: Check for choices array (similar to Chat Completions)
        else if (chunk.choices && chunk.choices.length > 0) {
          const choice = chunk.choices[0];
          if (choice.delta && choice.delta.text) {
            textContent = choice.delta.text;
            console.log('Method 4 - Choices array with delta:', textContent);
          } else if (choice.text) {
            textContent = choice.text;
            console.log('Method 4 - Choices array with text:', textContent);
          }
        }
        
        // If we found text content using any method, process it
        if (textContent) {
          streamContent += textContent;
          // Send content to client
          res.write(`data: ${JSON.stringify({ chunk: textContent })}\n\n`);
        } else {
          console.log('No text content found in this chunk');
        }
      }
      
      // Save response ID for future conversations if available
      if (responseId) {
        userConversations[userId].lastResponseId = responseId;
      }
      
      console.log('Stream complete. Total content length:', streamContent.length);
      console.log('Response ID saved:', responseId);
      
      // Send completion notification
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      
    } catch (error) {
      console.error('Error from OpenAI Responses API:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Send error as SSE
      res.write(`data: ${JSON.stringify({ 
        error: 'OpenAI API error', 
        details: error.message,
        status: error.status || 'unknown'
      })}\n\n`);
      res.end();
    }
    
  } catch (error) {
    console.error('General error in assistant endpoint:', error);
    res.write(`data: ${JSON.stringify({ error: 'Server error', details: error.message })}\n\n`);
    res.end();
  }
});

// Add a new endpoint to reset conversation history
app.post('/api/reset', async (req, res) => {
  try {
    const { userId = 'default-user' } = req.body;
    
    // Clear conversation history
    if (userConversations[userId]) {
      userConversations[userId] = {};
    }
    
    res.json({ success: true, message: 'Conversation history reset successfully' });
  } catch (error) {
    console.error('Error resetting conversation:', error);
    res.status(500).json({ error: 'Failed to reset conversation' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});