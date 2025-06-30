# Partner Assistant Demo
This is an AI assistant demo for the Partner Portal using OpenAI's [Responses API](https://platform.openai.com/docs/api-reference/responses). Its purpose is to help us quickly explore, iterate, and design an AI assistance experience with realistic vendor data in a live environment. 

## Try it out
https://partner-assistant-demo.onrender.com

## Getting Started

To run this project locally, you'll need to start both the backend API server and the frontend React application.

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Running the Backend API
```bash
cd api
npm install
npm start
```
The API server will start on port 3001 (or the port specified in your environment).

### Running the Frontend
In a separate terminal:
```bash
npm install
npm start
```
The React app will start on http://localhost:3000 and automatically open in your browser.

### Development Mode
For development with auto-restart on file changes:
- Backend: `cd api && npm run dev` (uses nodemon)
- Frontend: `npm start` (already includes hot reload)

## Project Structure
- **Frontend:** `/src` — React app
- **Backend/API:** `/api` — Node.js Express server (OpenAI integration)
- **File Search Sources:** `/api/files/` — Markdown files used for vector search
- **System Prompt:** `/api/system-prompt.md` — Prompt that defines the assistant's behavior
