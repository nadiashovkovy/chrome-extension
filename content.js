(async function() {
    // Step 1: Extract the YouTube video ID from the URL
    const videoId = getYouTubeVideoId();
    if (!videoId) {
      console.log('No video ID found');
      return;
    }
  
    // Step 2: Fetch the transcript using YouTube's captions URL or API
    const transcript = await fetchTranscript(videoId);
    
    if (!transcript) {
      console.log('Transcript not available.');
      return;
    }
  
    // Step 3: Send the transcript to the popup.js or background script for summarization
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "getTranscript") {
        sendResponse({ transcript });
      }
    });
  
    console.log('Transcript fetched and ready for summarization.');
  })();
  
  // Function to extract the video ID from YouTube URL
  function getYouTubeVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v'); // Gets the 'v' query parameter which contains the video ID
  }
  
  // Function to fetch the transcript from YouTube (subtitles/captions)
  async function fetchTranscript(videoId) {
    const captionsURL = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
    try {
      const response = await fetch(captionsURL);
      if (!response.ok) {
        return null; // Return null if captions are not available
      }
      const transcriptXML = await response.text();
      return parseTranscriptXML(transcriptXML);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  }
  
  // Function to parse the transcript XML and extract the text
  function parseTranscriptXML(transcriptXML) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(transcriptXML, "application/xml");
    const textElements = xmlDoc.getElementsByTagName("text");
  
    let transcript = "";
    for (let i = 0; i < textElements.length; i++) {
      transcript += textElements[i].textContent + " ";
    }
    return transcript.trim(); // Return the concatenated transcript text
  }
  