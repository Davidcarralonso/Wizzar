/**
 * Node.js Express backend proxy for Murf Text-to-Speech API
 * 
 * Usage:
 * - Run this server locally or deploy it
 * - Frontend will send text to /synthesize endpoint
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const MURF_API_KEY = 'ap2_84338f72-5e23-4009-ac10-ef31d117cfa2';
const MURF_API_URL = 'https://api.murf.ai/v1/tts/synthesize';

app.post('/synthesize', async (req, res) => {
  try {
    const { text, voice = 'en-US-Wavenet-D' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const murfRequestBody = {
      input: {
        text: text
      },
      voice: voice,
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };

    const response = await fetch(MURF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MURF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(murfRequestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Murf API error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    // Assuming Murf API returns audio content as base64 string in data.audioContent
    // Adjust according to actual Murf API response format
    const audioContent = data.audioContent;

    if (!audioContent) {
      return res.status(500).json({ error: 'No audio content received from Murf API' });
    }

    res.json({ audioContent });
  } catch (error) {
    console.error('Error synthesizing speech with Murf API:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Murf Text-to-Speech backend proxy listening at http://localhost:${port}`);
});
