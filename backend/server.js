import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

dotenv.config();
connectDB();
const app = express();
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/gigs', gigRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body;
  const greetings = [
    'hello', 'hi', 'hey', 'help', 'help me', 'hello!', 'hi!', 'hey!', 'help!', 'help me!'
  ];
  if (greetings.some(greet => message.trim().toLowerCase() === greet)) {
    return res.json({ reply: 'How can I help you today? 😊' });
  }
  try {
    const openRouterRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for the SecureLance blockchain-based freelancing platform. Answer user questions based on the website's context, features, and how it works. If the question is about registration, gigs, escrow, payments, security, or support, answer step by step. If you don't know, say so.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        }
      }
    );
    const aiReply = openRouterRes.data.choices?.[0]?.message?.content || "Sorry, I couldn't find an answer.";
    return res.json({ reply: aiReply });
  } catch (err) {
    console.error('OpenRouter API error:', err?.response?.data || err.message || err);
    return res.json({ reply: "Sorry, I couldn't find an answer. Please try again later." });
  }
});

app.get('/', (req, res) => {
  res.send('SecureLance API Running');
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
