document.getElementById('summarize-btn').addEventListener('click', async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: summarizeVideo,
        },
        (results) => {
          const summaryDiv = document.getElementById('summary');
          summaryDiv.innerText = results[0].result;
        }
      );
    });
  });
  
  async function summarizeVideo() {
    const videoId = window.location.search.split('v=')[1].split('&')[0];
    const transcript = await getTranscript(videoId);
    
    if (!transcript) {
      return 'No transcript available for this video.';
    }
  
    // Use an external AI API to summarize the transcript
    const summary = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_OPENAI_API_KEY"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        prompt: `Summarize this video transcript: ${transcript}`,
        max_tokens: 200
      })
    })
    .then(response => response.json())
    .then(data => data.choices[0].text.trim());
  
    return summary || 'No summary available';
  }
  
  async function getTranscript(videoId) {
    // You can get captions via the YouTube API or if available on the video page
    const captionsURL = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
    const transcriptResponse = await fetch(captionsURL);
    if (transcriptResponse.ok) {
      const transcriptText = await transcriptResponse.text();
      // Parse and extract the transcript text from the XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(transcriptText, "text/xml");
      const transcript = Array.from(xmlDoc.getElementsByTagName("text"))
        .map(node => node.textContent)
        .join(" ");
      return transcript;
    }
    return null;
  }
  