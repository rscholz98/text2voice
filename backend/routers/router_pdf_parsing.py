from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.chunking import HybridChunker
import os

# Define artifacts path for model storage
ARTIFACTS_PATH = "./artifacts"

#StandardPdfPipeline.download_models_hf( local_dir=ARTIFACTS_PATH)

# Configure pipeline options for DocumentConverter
pipeline_options = PdfPipelineOptions(artifacts_path=ARTIFACTS_PATH)
doc_converter = DocumentConverter(
    format_options={
        InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
    }
)

router = APIRouter()
chunker = HybridChunker(tokenizer="BAAI/bge-small-en-v1.5", max_tokens=512)

@router.post("/read-pdf/")
async def read_pdf(file: UploadFile = File(...)):
    """
    Reads the content of an uploaded PDF file using DocumentConverter and returns the extracted text.
    """
    temp_file_path = f"/tmp/{file.filename}"

    try:
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(await file.read())

        result = doc_converter.convert(temp_file_path)

        extracted_text = result.document.export_to_markdown()

        chunk_iter = chunker.chunk(dl_doc=result.document)

        for i, chunk in enumerate(chunk_iter):

            #print(f"chunk.text:\n{repr(f'{chunk}')}")

            enriched_text = chunk.document.export_to_markdown()

            print(f"chunk.text:\n{repr(f'{enriched_text}')}")

        return {"text": extracted_text}

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
