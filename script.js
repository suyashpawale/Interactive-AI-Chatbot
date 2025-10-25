let promptInput = document.querySelector(".prompt");
let container = document.querySelector(".container");
let chatContainer = document.querySelector(".chat-container");
let btn = document.querySelector(".btn");
let micBtn = document.querySelector(".mic-btn");
let userMessage = null;

// Replace with your valid Gemini API key
let Api_url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBdUWvYXExRVba1b5fL5thAcXHN0wfOH9A";

// Create chat box
function createChatBox(html, className) {
  const div = document.createElement("div");
  div.classList.add(className);
  div.innerHTML = html;
  return div;
}

// Generate AI response
async function generateApiResponse(aiChatBox) {
  const textElement = aiChatBox.querySelector(".text");
  try {
    const response = await fetch(Api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { text: userMessage }, // ✅ Correct prompt format
        temperature: 0.7,
        candidate_count: 1,
      }),
    });

    const data = await response.json();
    console.log("Full API Response:", data); // ✅ For debugging

    // Correctly extract text
    const apiResponse =
      data?.candidates?.[0]?.content
        ?.map((c) => c.text)
        .join("")
        .trim() || "Sorry, I couldn't understand that.";

    textElement.innerText = apiResponse;
    speakText(apiResponse);
  } catch (error) {
    console.error("Error fetching API response:", error);
    textElement.innerText = "Error: Unable to fetch response.";
  } finally {
    // Hide loading image
    const loadingImg = aiChatBox.querySelector(".loading");
    if (loadingImg) loadingImg.style.display = "none";
  }
}

// Show AI loading animation
function showLoading() {
  const html = `
        <div class="img">
            <img src="aipic.png" alt="AI">
        </div>
        <div class="text">Thinking...</div>
        <img src="loading.gif" alt="Loading" height="50" class="loading">
    `;

  let aiChatBox = createChatBox(html, "ai-chat-box");
  chatContainer.appendChild(aiChatBox);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll
  generateApiResponse(aiChatBox);
}

// Send user message
function sendMessage() {
  userMessage = promptInput.value.trim();
  if (userMessage === "") return;

  container.style.display = "none";

  const userHtml = `
        <div class="img">
            <img src="userpic.png" alt="User">
        </div>
        <div class="text">${userMessage}</div>
    `;

  let userChatBox = createChatBox(userHtml, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll

  promptInput.value = "";
  setTimeout(showLoading, 500);
}

// Text-to-speech
function speakText(text) {
  let speech = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(speech);
}

// Voice input
micBtn.addEventListener("click", () => {
  let recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    promptInput.value = event.results[0][0].transcript;
    sendMessage();
  };
  recognition.start();
});

// Event listeners
btn.addEventListener("click", sendMessage);
promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});
