import json
from django.http import StreamingHttpResponse, JsonResponse, HttpResponse # Added HttpResponse for robustness in exception handling
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt 
from django.views.decorators.clickjacking import xframe_options_exempt # <-- CRITICAL IMPORT
from django.shortcuts import render 
# Assuming chatbot_model.py contains a function that returns a generator/stream
from .chatbot_model import get_stream_response 

# View 1: Renders the main chat interface (remains the same)
def chat_home(request):
    """Renders the HTML template containing the chat interface."""
    return render(request, 'chatbot_final.html')

# View 2: Handles the AJAX POST request for streaming
@require_http_methods(["POST"])
@csrf_exempt 
@xframe_options_exempt # <-- This decorator prevents the AttributeError on StreamingHttpResponse
def get_chatbot_response_stream(request):
    """
    Receives a message, processes it, and returns a StreamingHttpResponse 
    to send the response chunk-by-chunk.
    """
    
    # 1. Receive and parse the message from the JavaScript POST request
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'response': 'Invalid data format.'}, status=400)

    if not user_message:
        return JsonResponse({'status': 'error', 'response': 'Message cannot be empty.'}, status=400)
        
    # 2. Get the streaming generator from your LLM logic
    try:
        # The get_stream_response function must return a Python generator that yields strings (text chunks)
        response_stream = get_stream_response(user_message)
            
        # 3. Send the StreamingHttpResponse back to the client
        # content_type='text/plain' is correct for a streaming text response
        return StreamingHttpResponse(response_stream, content_type='text/plain')
    
    except Exception as e:
        # This handles errors like Ollama not running (preventing a 500 HTML page)
        print(f"Error initializing or running stream: {e}")
        # Return a 503 (Service Unavailable) error for clean client-side handling.
        # This JsonResponse is a standard HttpResponse and should not cause the generator error.
        return JsonResponse({
            'status': 'error', 
            'response': f'Server stream failed. Check if LLM service is running. Error details: {e}'
        }, status=503) 
