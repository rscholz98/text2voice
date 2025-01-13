from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
import os

# Define artifacts path for model storage
ARTIFACTS_PATH = "./artifacts"

# Configure pipeline options for DocumentConverter
pipeline_options = PdfPipelineOptions(artifacts_path=ARTIFACTS_PATH)
doc_converter = DocumentConverter(
    format_options={
        InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
    }
)

router = APIRouter()

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

        if not result.document:
            raise HTTPException(status_code=400, detail="The PDF contains no extractable text.")

        extracted_text = result.document.export_to_text()
        return {"text": extracted_text}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
