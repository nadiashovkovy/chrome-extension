chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'summarize') {
      const summary = await summarizeVideo(message.transcript);
      sendResponse({ summary });
    }
    return true;
  });
  
  async function summarizeVideo(transcript) {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        prompt: `Summarize this text: ${transcript}`,
        max_tokens: 200,
      }),
    });
  
    const data = await response.json();
    return data.choices[0].text;
  }
  