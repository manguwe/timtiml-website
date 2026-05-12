import os
from groq import Groq
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn
import sys

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
allowed_origin=os.getenv("ALLOWED_ORIGIN","*")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ChatRequest(BaseModel):
    message: str

SYSTEM_INSTRUCTIONS = (
    "You are timtiml-bot, a professional support consultant for timtiml innovatives. "
    "Expertise: website develpment , mobile application development, programming, tutoringand coding . "
    "Tone: Friendly, helpful, proffesional, lecturer, and informative. "
    "Goal: Answer questions about services."
    "location: Eden University, Barlastone Park, Lusaka, Zambia, and surrounding areas."
    "contact:https://wa.me/260768648291,Phone +260768648291,Email:anotida30manguwe12@gmail.com"
)

def ask_timtiml(user_message: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_INSTRUCTIONS},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7,
        max_completion_tokens=1024,
    )
    return response.choices[0].message.content

@app.post("/api/chat")
async def chat_with_timmtiml(request: ChatRequest):
    try:
        reply = ask_timtiml(request.message)
        print(f"\n[API] User: {request.message}")
        print(f"[API] timtiml: {reply}")
        return {"response": reply}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="timtiml is offline.")

def run_terminal_test():
    print("\n--- timtiml Terminal Test (Groq) ---")
    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ['exit', 'quit']:
            break
        try:
            reply = ask_timtiml(user_input)
            print(f"timtiml: {reply}\n")
        except Exception as e:
            print(f"[Error] {e}\n")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        run_terminal_test()
    else:
        uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
