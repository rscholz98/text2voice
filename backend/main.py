from fastapi import FastAPI, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from TTS.api import TTS
from pydub import AudioSegment
import os
import torch

# FastAPI application setup
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store local models
models_dir = "./models"
os.makedirs(models_dir, exist_ok=True)

# Check if CUDA is available
cuda_available = torch.cuda.is_available()

# TTS Initialization (default model for speech synthesis)
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")


class ModelResponse(BaseModel):
    model_name: str
    locally_available: bool


@app.get("/list-models/")
def list_models():
    """
    List available TTS models and indicate if they are stored locally.
    """
    all_models = TTS().list_models()
    response = {
        "models": [
            {"model_name": model, "locally_available": os.path.exists(os.path.join(models_dir, model))}
            for model in all_models
        ],
        "cuda_available": cuda_available,
    }
    return response


@app.post("/text-to-speech/")
async def text_to_speech(text: str = Form(...)):
    """
    Perform Text-to-Speech synthesis.
    """
    if not text.strip():
        return JSONResponse(content={"error": "Text is empty."}, status_code=400)

    # Output file paths
    wav_file = "output.wav"
    mp3_file = "output.mp3"

    # Generate TTS audio and save to a WAV file
    tts.tts_to_file(text=text, file_path=wav_file)

    # Convert WAV to MP3 for better compatibility
    sound = AudioSegment.from_wav(wav_file)
    sound.export(mp3_file, format="mp3")

    # Clean up the intermediate WAV file
    os.remove(wav_file)

    # Return the MP3 file as a response
    return FileResponse(mp3_file, media_type="audio/mpeg", filename="output.mp3")
