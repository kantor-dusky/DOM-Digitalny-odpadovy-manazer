# api.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from waste_ocr import detect_waste_code_bytes, query_db_for_code

app = FastAPI(title="Waste OCR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"ok": True}

@app.post("/classify")
async def classify(request: Request, file: UploadFile | None = File(None)):
    # Robustné vyzdvihnutie súboru z multipart/form-data
    if file is None:
        form = await request.form()
        # Skús typické kľúče
        cand = form.get("file") or form.get("image") or form.get("photo")
        # Alebo prvý UploadFile v tele
        if not isinstance(cand, UploadFile):
            for v in form.values():
                if isinstance(v, UploadFile):
                    cand = v
                    break
        file = cand if isinstance(cand, UploadFile) else None

    if file is None:
        # Diagnostika pre teba v logu
        print("❌ Žiadny UploadFile v požiadavke. Headers:", dict(request.headers))
        raise HTTPException(status_code=422, detail="Očakávam multipart pole 'file' so súborom.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Prázdny súbor.")

    code = detect_waste_code_bytes(content)
    if code is None:
        raise HTTPException(status_code=422, detail="OCR nenašlo použiteľný EÚ kód.")

    result = query_db_for_code(code)
    return {"code": code, "result": result}
