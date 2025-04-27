const apiKey = "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";
const murfApiKey = "ap2_84338f72-5e23-4009-ac10-ef31d117cfa2";
const modelName = "Wizzard";

const submitBtn = document.getElementById('submit-btn');
const promptInput = document.getElementById('prompt-input');
const responseOutput = document.getElementById('response-output');

async function speakText(text) {
  try {
    const murfApiUrl = '/api/murf-tts-proxy';

    const murfRequestBody = {
      text: text
    };

    console.log('Sending TTS request to Murf TTS proxy...');
    const response = await fetch(murfApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(murfRequestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Murf TTS proxy error:', errorText);
      fallbackSpeak(text);
      return;
    }

    const data = await response.json();
    console.log('Murf TTS proxy response:', data);

    const audioContent = data.audioContent || null;
    if (!audioContent) {
      console.warn('No audio content in Murf TTS proxy response, using fallback TTS.');
      fallbackSpeak(text);
      return;
    }

    const audioSrc = 'data:audio/mp3;base64,' + audioContent;
    const audio = new Audio(audioSrc);
    audio.play();
  } catch (error) {
    console.error('Error calling Murf API:', error);
    fallbackSpeak(text);
  }
}

function fallbackSpeak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-Speech not supported in this browser.');
  }
}

submitBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert('Por favor, ingrese una pregunta.');
    return;
  }
  responseOutput.textContent = 'Cargando...';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant named Wizzard that responds in Spanish." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error('API error: ' + response.status + ' ' + response.statusText + ' - ' + errorBody);
    }

    const data = await response.json();
    const chatResponse = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    const finalResponse = modelName + ": " + (chatResponse || 'No hay respuesta del modelo AI.');
    responseOutput.textContent = finalResponse;
    speakText(finalResponse);
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      responseOutput.textContent = 'Error: No se pudo conectar. Esto puede deberse a restricciones CORS. Por favor, pruebe las llamadas API desde un entorno backend o use un servidor proxy.';
    } else {
      responseOutput.textContent = 'Error: ' + error.message;
    }
  }
});
