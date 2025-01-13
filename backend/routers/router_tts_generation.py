from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.responses import FileResponse
from pydub import AudioSegment
from docling.chunking import HybridChunker
import os

router = APIRouter()

@router.post("/text-to-speech/")
async def text_to_speech(
    request: Request,
    text: str = Form(...),
    language: str = Form("en"),
    output_format: str = Form("mp3")
):
    """
    Generate audio from text using the currently loaded model.
    """
    print("Type of request.app.state.tts_model: ", type(request.app.state.tts_model))
    current_model = request.app.state.tts_model

    wav_file = "output.wav"
    output_file = f"output.{output_format}"

    try:
        current_model.tts_to_file(text=text, file_path=wav_file)

        sound = AudioSegment.from_wav(wav_file)
        sound.export(output_file, format=output_format)

    finally:
        if os.path.exists(wav_file):
            os.remove(wav_file)

    return FileResponse(output_file, media_type=f"audio/{output_format}", filename=output_file)
