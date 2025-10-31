class ChatBot {
    // --- JavaScript Logic ---
    
    // Helper to get the CSRF token
    getCsrfToken() {
        // Ensure the token element exists before trying to access its value
        const tokenElement = document.querySelector('[name="csrfmiddlewaretoken"]');
        return tokenElement ? tokenElement.value : '';
    }

    // Pass the bot URL to the constructor, making the class reusable and robust
    constructor(botUrl) {
        if (!botUrl) {
            console.error("ChatBot requires a Django URL to be initialized.");
            return;
        }
        
        this.botUrl = botUrl;
        this.chatMessages = document.getElementById('chat-history');
        this.chatInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-Btn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.init();
    }

    init() {
        // Set welcome message time
        const welcomeTimeElement = document.getElementById('welcomeTime');
        if (welcomeTimeElement) {
            welcomeTimeElement.textContent = this.getCurrentTime();
        }
        
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Focus input on load
        this.chatInput.focus();
    }

    getCurrentTime() {
        const now = new Date();
        // Use 'en-US' or another locale for consistent 12-hour formatting
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Helper to create the initial message container for a streamed response
    startNewBotMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        // The content div is where the streamed text will be appended
        const messageContent = document.createElement('div');
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Return the content element so the streaming logic can update it directly
        return messageContent;
    }


    async sendMessage() {
        const userMessage = this.chatInput.value.trim();

        if (!userMessage) return; // Don't send empty messages

        // 1. Display user message immediately
        this.addMessage(userMessage, 'user');
        this.chatInput.value = ''; // Clear input

        // 2. Show typing indicator and prepare bot message container
        this.showTypingIndicator();
        const botMessageElement = this.startNewBotMessage();
        
        try {
            // 3. Send message via POST request to Django view
            const response = await fetch(this.botUrl, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken() 
                },
                body: JSON.stringify({
                    'message': userMessage
                })
            });

            // Handle server errors (e.g., 404, 500). If not OK, it's not a successful stream initiation.
            if (!response.ok) {
                let errorMessage = `HTTP Error ${response.status}: Failed to start stream.`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.response || errorData.detail || errorMessage;
                } catch (e) {
                    // response body wasn't JSON, use generic message
                }
                throw new Error(errorMessage);
            }

            // --- 4. STREAMING LOGIC START ---
            // Get a reader for the response body
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
                // Read the next chunk from the stream
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (value) {
                    // Decode the chunk (Uint8Array) into a string
                    const chunk = decoder.decode(value, { stream: true });
                    // Append the chunk directly to the dedicated bot message div
                    botMessageElement.textContent += chunk;
                    this.scrollToBottom();
                }
            }
            // The loop breaks when done is true, meaning the stream is complete.
            // --- STREAMING LOGIC END ---
            
        } catch (error) {
            console.error("Chatbot Streaming Error:", error);
            // Append the error message to the last message container
            botMessageElement.textContent += `\n\n❌ Error: ${error.message || 'Network request failed.'}`;
        }
        
        // 5. Hide indicator when streaming is complete
        this.hideTypingIndicator();
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Sanitize text if handling user input that might contain HTML
        const messageContent = document.createElement('div');
        messageContent.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    // Ensure scrolling happens after DOM updates are rendered
    scrollToBottom() {
        // Use requestAnimationFrame for slightly better performance/smoothness
        requestAnimationFrame(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        });
    }
}
  
document.addEventListener('DOMContentLoaded', () => {
    // NOTE: Replace 'your_django_bot_url' with the actual variable passed 
    // from your Django template, e.g., 'const CHAT_BOT_URL = "{% url 'send_message' %}";'url; // Example placeholder URL
    new ChatBot(bot_url); 
});
