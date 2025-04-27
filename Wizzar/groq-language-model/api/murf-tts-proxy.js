/**
 * Vercel Serverless Function for Murf Text-to-Speech API Proxy
 * 
 * Usage:
 * - Deploy this file to Vercel under the /api directory
 * - Frontend calls /api/murf-tts-proxy with POST { text: string }
 * - This function forwards the request to Murf API securely
 */

const fetch = require('node-fetch');

const MURF_API_KEY = 'ap2_84338f72-5e23-4009-ac10-ef31d117cfa2';
const MURF_API_URL = 'https://api.murf.ai/v1/tts/synthesize';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { text, voice = 'en-US-Wavenet-D' } = req.body;

  if (!text) {
    res.status(400).json({ error: 'Text is required' });
    return;
  }

  try {
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
      res.status(response.status).json({ error: errorText });
      return;
    }

    const data = await response.json();

    // Assuming Murf API returns audio content as base64 string in data.audioContent
    const audioContent = data.audioContent;

    if (!audioContent) {
      res.status(500).json({ error: 'No audio content received from Murf API' });
      return;
    }

    res.status(200).json({ audioContent });
  } catch (error) {
    console.error('Error synthesizing speech with Murf API:', error);
    res.status(500).json({ error: error.message });
  }
};
