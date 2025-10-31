import speech_recognition as sr
import time
from chatbot_model import get_stream_response

def recognize_speech_from_mic(recognizer, microphone):
    """
    Records audio from the microphone, handles errors, and uses the 
    Google Speech Recognition API to convert the audio to text.
    
    :param recognizer: The SpeechRecognition Recognizer instance.
    :param microphone: The SpeechRecognition Microphone instance.
    :return: A dictionary containing success status, error message, and the transcribed text.
    """
    # Adjust for ambient noise and set the energy threshold dynamically
    with microphone as source:
        # We start by recognizing silence and noise in the environment
        print("Calibrating ambient noise (5 seconds)...")
        recognizer.adjust_for_ambient_noise(source, duration=5)
        print("Calibration complete. Current energy threshold set.")
    
    # Capture the audio input from the user
    with microphone as source:
        print("Say something now! (Listening for up to 5 seconds)")
        recognizer.pause_threshold = 1 # Seconds of non-speaking data before a phrase is considered complete
        try:
            # Listen to the source for up to 5 seconds
            audio = recognizer.listen(source, timeout=5)
        except sr.WaitTimeoutError:
            return {
                "success": False, 
                "error": "No speech detected within 5 seconds.", 
                "text": None
            }
        
    response = {
        "success": True,
        "error": None,
        "text": None
    }
    
    # Recognize speech using Google Speech Recognition
    try:
        # Use the default Google API (requires internet connection)
        print("Processing audio...")
        text = recognizer.recognize_google(audio)
        response["text"] = text
    except sr.RequestError:
        # Google API was unreachable or returned an error
        response["success"] = False
        response["error"] = "Google Speech Recognition service is unavailable. Check internet connection."
    except sr.UnknownValueError:
        # Speech was unintelligible
        response["success"] = False
        response["error"] = "Could not understand audio."
        
    return response

if __name__ == "__main__":
    # --- Setup ---
    # Create the Recognizer and Microphone instances
    r = sr.Recognizer()
    m = sr.Microphone()
    
    # You can inspect available microphones if needed:
    # print("Available microphones:", sr.Microphone.list_microphone_names())
    
    print("--- Python Voice Recognition Tool ---")
    print("Press Ctrl+C to stop the program.\n")
    
    # --- Main Loop ---
    while True:
        try:
            # Get the transcription
            result = recognize_speech_from_mic(r, m)
            
            # Display results
            if result["success"] and result["text"]:
                print("-" * 30)
                print(f"I heard: {result['text']}")
                answerss=get_stream_response(result)
                print(answerss)
            elif not result["success"] and result["error"]:
                print(f"[STATUS] {result['error']}")
                print("---")
            
        except KeyboardInterrupt:
            # Exit cleanly when Ctrl+C is pressed
            print("\nExiting voice recognition tool. Goodbye!")
            break
        except Exception as e:
            print(f"[FATAL ERROR] An unexpected error occurred: {e}")
            break
            
        # Wait a moment before listening again
        time.sleep(1)
