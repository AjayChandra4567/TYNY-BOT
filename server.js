const express = require('express');
const session = require('express-session');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

app.use(session({
  secret: 'tynybot-secret',
  resave: false,
  saveUninitialized: true,
}));

// Utility: Scrape site content
async function scrapeSiteContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $('body').text().replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Scraping failed:', error.message);
    return '';
  }
}

// Main /ask endpoint
app.post('/ask', async (req, res) => {
  try {
    const { question, siteURL, apiKey } = req.body;

    if (!question || !siteURL || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scrapedContent = await scrapeSiteContent(siteURL);

    if (!scrapedContent) {
      return res.status(400).json({ error: 'Could not extract site content' });
    }

    const openai = new OpenAI({ apiKey });

    const greetings = ["hi", "hello", "hey", "greetings"];
    let prompt = '';
    const trimmedQuestion = question.toLowerCase().trim();

    if (greetings.includes(trimmedQuestion)) {
      prompt = `
You are TynyBot, an AI assistant that helps answer questions strictly related to the following website content:

Content: ${scrapedContent}

When a user greets you with "${question}", respond with a friendly introduction and explain how you can help.
      `;
    } else {
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
      messages: [{ role: 'user', content: prompt }]
    });

    const reply = completion.choices[0].message.content.trim();

    if (!req.session.chat) req.session.chat = [];
    req.session.chat.push({ role: 'user', message: question });
    req.session.chat.push({ role: 'bot', message: reply });

    return res.json({ reply });
  } catch (err) {
    console.error('Error in /ask:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat history
app.get('/conversation', (req, res) => {
  res.json({ chat: req.session.chat || [] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TynyBot backend running on port ${PORT}`));