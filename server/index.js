const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config()
const OpenAI = require('openai');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('voice-input', async (message) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. When asked about weather, provide a general response based on typical weather patterns for that location and season. Make it clear that this is a general prediction, not real-time data."
          },
          { role: "user", content: message }
        ],
        model: "gpt-4",
      });

      const response = completion.choices[0].message.content;

      socket.emit('ai-response', response);
    } catch (error) {
      console.error('Error:', error);
      socket.emit('error', 'Sorry, there was an error processing your request.');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});