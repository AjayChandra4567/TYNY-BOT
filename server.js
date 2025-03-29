// server.js
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
app.use(express.json());

// Allow requests from your React app (assumed to run on localhost:3000)
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
// }));
app.use(cors({
  origin: true,
  credentials: true,
}));


// Set up session middleware
app.use(session({
  secret: 'tynybot-secret',
  resave: false,
  saveUninitialized: true,
}));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Global variable to store scraped content
let scrapedContent = '';

// Function to scrape content from default website URL from .env
async function scrapeDefaultContent() {
  const url = process.env.WEBSITE_URL;
  if (!url) {
    console.error("WEBSITE_URL not provided in .env");
    return;
  }
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    scrapedContent = $('body').text().replace(/\s+/g, ' ').trim();
    console.log("Default website content scraped successfully.");
  } catch (error) {
    console.error("Error scraping default website:", error.message);
  }
}

// Automatically scrape content on server startup
scrapeDefaultContent();
// Updated /ask endpoint with greeting detection
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (!scrapedContent) {
      return res.status(400).json({ error: 'No scraped content available. Please check your WEBSITE_URL in the .env file.' });
    }
    
    // Define common greetings
    const greetings = ["hi", "hello", "hey", "greetings"];
    let prompt = "";
    const trimmedQuestion = question.toLowerCase().trim();
    
    // Check if the question is a simple greeting
    if (greetings.includes(trimmedQuestion)) {
      prompt = `
You are TynyBot, an AI assistant that helps answer questions strictly related to the following website content:
      
Content: ${scrapedContent}

When a user greets you with "${question}", respond with a friendly introduction. Your reply should introduce yourself, mention that you can answer questions related to the content, and ask how you can help further.
      `;
    } else {
      // Regular prompt instructing the AI to stick to the content
      prompt = `
You are an AI assistant whose knowledge is strictly limited to the following website content.
If the question is off-topic, respond with "I'm sorry, but this question is not related to the provided content."

Content: ${scrapedContent}

Question: ${question}

Answer:
      `;
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    
    const reply = completion.choices[0].message.content.trim();
    
    // Store conversation in session
    if (!req.session.chat) {
      req.session.chat = [];
    }
    req.session.chat.push({ role: 'user', message: question });
    req.session.chat.push({ role: 'bot', message: reply });
    
    return res.json({ reply });
  } catch (error) {
    console.error('Ask Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
});


// Endpoint to retrieve the conversation history from session
app.get('/conversation', (req, res) => {
  res.json({ chat: req.session.chat || [] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TynyBot backend running on port ${PORT}`));
