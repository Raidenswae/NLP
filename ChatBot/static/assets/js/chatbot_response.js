class ChatBot{// --- JavaScript Logic ---
        
        // Helper to get the CSRF token
        getCsrfToken() {
            return document.querySelector('[name="csrfmiddlewaretoken"]').value;
        }


        constructor() {
            this.chatMessages = document.getElementById('chat-history');
            this.chatInput = document.getElementById('user-input');
            this.sendButton = document.getElementById('send-Btn');
            this.typingIndicator = document.getElementById('typingIndicator');
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



        async sendMessage() {
            const userInputElement = document.getElementById('user-input');
            const chatHistoryElement = document.getElementById('chat-history');
            const userMessage = userInputElement.value.trim();

            if (!userMessage) return; // Don't send empty messages

            // 1. Display user message immediately
            //chatHistoryElement.innerHTML += `<p><b>You:</b> ${userMessage}</p>`;
            this.addMessage(userMessage, 'user');
            userInputElement.value = ''; // Clear input

            // Show typing indicator and respond
            this.showTypingIndicator();
            

            // Scroll to bottom
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
            
            //const bot_url = "{% url 'send_message' %}";
            
            try {
                // 2. Send message via POST request to Django view
                const response = await fetch(bot_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': this.getCsrfToken() // Send CSRF token
                    },
                    body: JSON.stringify({
                        'message': userMessage // The "message" payload
                    })
                });

                // Handle server errors
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.response || `HTTP Error ${response.status}`);
                }

                // 3. Receive and process the JSON response
                const data = response.json();
                const botResponse = await data.response;
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addBotResponse(botResponse);
                }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
                
            } catch (error) {
                console.error("Chatbot Error:", error);
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addBotResponse(error);
                }, 1000 + Math.random() * 2000);
            }
            
            // Scroll to bottom after receiving response
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
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




        addBotResponse(response) {
            console.log(response)
            this.addMessage(response, 'bot');
            return response
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
  
document.addEventListener('DOMContentLoaded', () => {
        new ChatBot();
    });