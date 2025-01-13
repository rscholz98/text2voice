from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import router_pdf_parsing, router_tts_generation, router_model_loading

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.tts_model = None
app.state.tts_model_name = None

# Include routers
app.include_router(router_pdf_parsing.router, tags=["PDF"])
app.include_router(router_tts_generation.router, tags=["Text-to-Speech"])
app.include_router(router_model_loading.router, tags=["Models"])
