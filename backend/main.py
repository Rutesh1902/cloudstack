from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, files
from config import settings

app = FastAPI(title="CloudStack API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(files.router, prefix="/api/v1")


@app.get("/health", tags=["Operations"])
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=1111, reload=True)
