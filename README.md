# Partner Assistant Demo
This is a demo of an AI assistant for the Partner Portal using OpenAI's [Responses API](https://platform.openai.com/docs/api-reference/responses). This project's goal is to help us quickly explore and iterate on AI assistance ideas and design the experience in a live environment with realistic data.

## Try it out
https://partner-assistant-demo.onrender.com

## Project Structure
- **Frontend:** `/src` — React app (Create React App)
- **Backend/API:** `/api` — Node.js Express server (OpenAI integration)
- **File Search Sources:** `/api/files/` — Markdown files used for vector search
- **System Prompt:** `/api/static-prompt.js` — The prompt that defines the assistant's behavior