from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os

# ==========================================
# Load Environment Variables
# ==========================================

load_dotenv()

# ==========================================
# Initialize Groq Client
# ==========================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# ==========================================
# FastAPI App
# ==========================================

app = FastAPI()

# ==========================================
# Enable CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# REQUEST MODELS
# ==========================================

class ChatRequest(BaseModel):
    message: str
    monument: str


class NarrationRequest(BaseModel):
    monument: str


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():
    return {
        "message": "Heritage AI API Running 🚀"
    }


# ==========================================
# CHAT ENDPOINT
# ==========================================

@app.post("/chat")
def chat(request: ChatRequest):

    try:

        system_prompt = f"""
You are Heritage AI.

You are a friendly museum guide.

The visitor is currently viewing:

{request.monument}

Rules:

1. Whenever the user says:
- this
- this monument
- it
- this building

they ALWAYS mean {request.monument}.

2. Answer only about {request.monument} unless the user explicitly asks about another monument.

3. Keep answers concise but informative.

4. Maximum 120 words.

5. Speak naturally.
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ],
            temperature=0.4,
            max_tokens=250
        )

        return {
            "reply": response.choices[0].message.content
        }

    except Exception as e:

        return {
            "reply": f"Error: {str(e)}"
        }


# ==========================================
# AI NARRATION ENDPOINT
# ==========================================

@app.post("/narrate")
def narrate(request: NarrationRequest):

    try:

        if request.monument.lower() == "krishna statue":

            prompt = """
You are presenting a university project.

Explain that this is a 3D model of Lord Krishna created by students using photogrammetry and Blender.

Mention:
- Multiple photographs were captured from different angles.
- Photogrammetry generated the 3D model.
- Blender was used to optimize the model.
- The model is displayed in a Web-based AR application.
- Speak naturally.
- Around 100 words.
"""

        else:

            prompt = f"""
You are a professional museum guide.

Generate an engaging narration about {request.monument}.

Requirements:

- Around 100-120 words.
- Mention who built it.
- Mention when it was built.
- Mention its architecture.
- Mention why it is historically important.
- End with one interesting fact.
- Speak naturally like a real tour guide.
"""

        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content": "You are an expert heritage guide."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.6,
            max_tokens=300

        )

        return {
            "narration": response.choices[0].message.content
        }

    except Exception as e:

        return {
            "narration": f"Error: {str(e)}"
        }
