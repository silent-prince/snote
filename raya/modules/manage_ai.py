import requests

from django.http import JsonResponse
import requests
from .import ai_db_ops,manage_ai_psuher

API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"
headers = {"Authorization": "Bearer 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"}

def handle_request(request):
    #send read push message to user
    raya=ai_db_ops.save_raya(request)# from user 
    if raya:
        manage_ai_psuher.makeAllSeen(request)
        manage_ai_psuher.notify_typing_status(request)
        reply=ai_reply(raya.message_body)
        raya_res=ai_db_ops.save_raya_response(request,reply)
        manage_ai_psuher.send_push_message(raya_res)

def ai_reply(message):
    #user_prompt = request.GET.get("prompt", "")
    prompt=f"User: {message}\nAI:"
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 60,     # Limit length
            "temperature": 0.2,       # Lower = more focused/accurate
            "top_p": 0.9,             # Keep top probability tokens
            "do_sample": False,        # Turn off randomness
            "return_full_text": False 
        }
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    reply = response.json()
    try:
        text = reply[0]["generated_text"]
    except:
        text = "No reply or model sleeping."

    return text