from fastapi import FastAPI, Form, HTTPException, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from TTS.api import TTS
from pydub import AudioSegment
import os
import torch
import PyPDF2
import socket

import http.client
import sys

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

# Function to block internet access while allowing localhost
class LocalhostSocket(socket.socket):
    def connect(self, address):
        if address[0] not in ("127.0.0.1", "localhost"):
            raise RuntimeError("Internet access is disabled for this process.")
        super().connect(address)

# Override socket to use the restricted version
socket.socket = LocalhostSocket

def log_unexpected_requests(*args, **kwargs):
    print("Unexpected network request detected!")
    sys.exit(1)

http.client.HTTPConnection.request = log_unexpected_requests
http.client.HTTPSConnection.request = log_unexpected_requests

cuda_available = torch.cuda.is_available()
current_model = None
loaded_model_name = None

# Loaded
# tts_models/multilingual/multi-dataset/xtts_v2
# tts_models/de/thorsten/tacotron2-DCA 
# tts_models/de/thorsten/tacotron2-DDC


@app.post("/read-pdf/")
async def read_pdf(file: UploadFile = File(...)):
    """
    Reads the content of a PDF file and returns the extracted text.
    """
    try:
        # Read the uploaded PDF file
        pdf_reader = PyPDF2.PdfReader(file.file)
        extracted_text = ""

        # Extract text from each page
        for page in pdf_reader.pages:
            extracted_text += page.extract_text()

        return {"text": extracted_text}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)



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
async def text_to_speech(
    text: str = Form(...),
    language: str = Form("en"),
    output_format: str = Form("mp3")
):
    """
    Generate audio from text using the currently loaded model.
    """
    global current_model

    if not current_model:
        raise HTTPException(status_code=400, detail="No model is currently loaded.")

    # Temporary file paths
    wav_file = "output.wav"
    output_file = f"output.{output_format}"

    try:
        # Generate TTS audio with the specified language
        current_model.tts_to_file(text=text, file_path=wav_file)

        # Convert to the desired format (e.g., MP3, WAV)
        sound = AudioSegment.from_wav(wav_file)
        sound.export(output_file, format=output_format)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

    finally:
        # Ensure temporary WAV file is cleaned up
        if os.path.exists(wav_file):
            os.remove(wav_file)

    # Return the generated file
    return FileResponse(output_file, media_type=f"audio/{output_format}", filename=output_file)
