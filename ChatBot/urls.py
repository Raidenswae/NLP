from .views import *
from django.urls import path,include

urlpatterns = [
    #path("",RainDux_Bot ,name="chatbot"),
    #path("/chatbot-response",chatbot_responses, name="chatbot_response" ),
    # Endpoint for the chat AJAX request
    path('send_message/',get_chatbot_response_stream, name='send_message'),
    # View to render the main chat page
    path('', chat_home, name='chat_home'), 
]