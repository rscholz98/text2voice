from fastapi import APIRouter, Form, Request
from fastapi.responses import JSONResponse
from TTS.api import TTS
import torch

router = APIRouter()
cuda_available = torch.cuda.is_available()
current_model = None
loaded_model_name = None

@router.get("/list-models/")
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

@router.post("/load-model/")
async def load_model( request: Request, model_name: str = Form(...)):
    """
    Load a specific TTS model into memory.
    """
    try:
         # Load the model
        tts_model = TTS(model_name=model_name, progress_bar=True).to("cuda" if cuda_available else "cpu")

        # Store the model and its name in the application state
        request.app.state.tts_model = tts_model
        request.app.state.tts_model_name = model_name
        return JSONResponse(content={"status": "success", "message": f"Model {model_name} loaded successfully."})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
