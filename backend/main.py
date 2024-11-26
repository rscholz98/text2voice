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

cuda_available = torch.cuda.is_available()
current_model = None
loaded_model_name = None


# Loaded
# tts_models/multilingual/multi-dataset/xtts_v2
# tts_models/de/thorsten/tacotron2-DCA 
# tts_models/de/thorsten/tacotron2-DDC



@app.get("/list-models/")
def list_models():
    """
    List available TTS models and indicate if they are stored locally.
    """
    all_models = TTS().list_models()
    response = {
        "models": all_models,
        "cuda_available": cuda_available,
    }
    return response


@app.post("/load-model/")
async def load_model(model_name: str = Form(...)):
    """
    Load a specific TTS model into memory.
    """
    global current_model, loaded_model_name
    try:
        current_model = TTS(model_name=model_name, progress_bar=True).to("cuda" if cuda_available else "cpu")
        loaded_model_name = model_name
        return JSONResponse(content={"status": "success", "message": f"Model {model_name} loaded successfully."})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@app.post("/text-to-speech/")
async def text_to_speech(text: str = Form(...)):
    """
    Generate audio from text using the currently loaded model.
    """
    global current_model
    if not current_model:
        return JSONResponse(content={"status": "error", "message": "No model is currently loaded."}, status_code=400)

    # Output file paths
    wav_file = "output.wav"

    # Generate TTS audio and save to a WAV file
    current_model.tts_to_file(text=text, file_path=wav_file)

    mp3_file = "output.mp3"
    sound = AudioSegment.from_wav(wav_file)
    sound.export(mp3_file, format="mp3")

    # Clean up the intermediate WAV file
    os.remove(wav_file)

    # Return the MP3 file as a response
    return FileResponse(mp3_file, media_type="audio/mpeg", filename="output.mp3")
