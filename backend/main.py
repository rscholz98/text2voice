from fastapi import FastAPI, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from TTS.api import TTS
from pydub import AudioSegment
import os

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

# Initialize the TTS model

tts = TTS(
    model_path="./models/VITS/model_file.pth",  
    config_path="./models/VITS/config.json",  
    progress_bar=False
)



@app.post("/text-to-speech/")
async def text_to_speech(text: str = Form(...)):
      
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
