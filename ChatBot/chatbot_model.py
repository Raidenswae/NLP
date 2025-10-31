import ollama
from typing import Iterator
RAINDUX_SYSTEM_PROMPT = """
Your name is 'RainDux Health Bot', a compassionate, general health information assistant powered by an AI model. 
Your primary goal is to provide general, educational, and diagnostic information about symptoms, common conditions, and first aid and doctor's recommendations. You are able to greet and respond to greetings.

You MUST adhere to the following safety rules:
IF YOU are ASKED YOUR NAME, your name is RainDux Health Bot.

You MUST End every response with a strong medical disclaimer stating that you are not a doctor.

You MUST NEVER offer a diagnosis or prescribe treatment.

You MUST NEVER recommend stopping prescribed medication.

Always advise the user to consult a doctor or emergency services for specific medical concerns.

Maintain a professional, empathetic, and clear tone.
You MUST NEVER answer questions THAT DO NOT relate to medical health or care.
Developers:
1. Your Developers are RainDux Developers a Newly Found Software Developing Company
2. Contact Details are +263789004832
3. Email is rainduxdev@gmail.com
4. Website is https://raindux.dev
"""

def get_stream_response(user_prompt: str) -> Iterator[str]:
    """
    Connects to the Ollama API, sends the user prompt along with the system
    instruction, and yields the response tokens as they are generated.

    Args:
        user_prompt: The message received from the Django view.

    Yields:
        str: A chunk of the generated text response.
    """
    
    # 1. Defining the full conversation context for the API call (System + User)
    messages = [
        {'role': 'system', 'content': RAINDUX_SYSTEM_PROMPT},
        {'role': 'user', 'content': user_prompt},
    ]

    try:
        # 2. Calling the Ollama chat API with streaming enabled
        # Using the user-specified model name 'tinyllama'
        stream = ollama.chat(
            model='tinyllama', 
            messages=messages,
            stream=True, # This is the crucial part for streaming
        )

        # 3. Iterate over the stream and yield content
        for chunk in stream:
            content = chunk['message']['content']
            if content:
                # Yield the raw text content chunk by chunk
                yield content

    except ollama.ResponseError as e:
        # Handle API connection errors, model not found errors, etc.
        error_message = f"ERROR: Ollama Response Error. Ensure 'raindux' model is available and Ollama is running: {e}"
        print(error_message)
        # Yield error message so it shows up in the client
        yield error_message
    except Exception as e:
        # Handle general errors (network issues, JSON parsing issues, etc.)
        error_message = f"An unexpected error occurred: {e}"
        print(error_message)
        yield error_message

if __name__ == '__main__':
    # Simple test case for local execution
    print("--- Testing get_stream_response locally ---")
    prompt = "I have a sore throat and a slight fever. What should I do?"
    print(f"User Prompt: {prompt}\n\nRainDux Health Bot:")

    full_response = ""
    for token in get_stream_response(prompt):
        print(token, end="", flush=True) # Print immediately as tokens arrive
        full_response += token
    
    print("\n\n--- Stream finished ---")
