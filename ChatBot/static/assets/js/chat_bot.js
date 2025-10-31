class ChatApp {

    // Function to get the CSRF token from the DOM
    getCsrfToken() {
        // Find the hidden input field created by {% csrf_token %}
        const tokenInput = document.querySelector('[name="csrfmiddlewaretoken"]');
        return tokenInput ? tokenInput.value : '';
    }

    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.responses = [
            "That's interesting! Tell me more about that.",
            "I understand what you mean. How does that make you feel?",
            "Thanks for sharing that with me!",
            "That sounds really cool! What happened next?",
            "I see! That's a great point.",
            "Wow, I hadn't thought of it that way before.",
            "That's fascinating! Can you elaborate?",
            "I appreciate you telling me about this.",
            "That makes a lot of sense to me.",
            "Interesting perspective! What do you think about it?"
        ];
        
        this.init();
    }
    
    init() {
        // Set welcome message time
        document.getElementById('welcomeTime').textContent = this.getCurrentTime();
        
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
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        // Show typing indicator and respond
        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addBotResponse(message);
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
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
    
    addBotResponse(userMessage) {
        let response;
        
        // Simple keyword-based responses
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = "Hello there! Nice to meet you! 👋";
        } else if (lowerMessage.includes('how are you')) {
            response = "I'm doing great, thank you for asking! How are you doing today?";
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            response = "Goodbye! It was nice chatting with you. Have a wonderful day! 👋";
        } else if (lowerMessage.includes('thank')) {
            response = "You're very welcome! Happy to help! 😊";
        } else if (lowerMessage.includes('help')) {
            response = "I'm here to chat with you! Just type anything and I'll respond. What would you like to talk about?";
        } else if (lowerMessage.includes('weather')) {
            response = "I wish I could check the weather for you! You might want to look outside or check a weather app. ☀️";
        } else if (lowerMessage.includes('time')) {
            response = `The current time is ${this.getCurrentTime()}! ⏰`;
        } else {
           
            response = this.responses[Math.floor(Math.random() * this.responses.length)];
        }
        
        this.addMessage(response, 'bot');
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});