from fastapi import FastAPI
from api import files, auth
from db.connection import engine
from db.models import Base  # 👈 import your real Base that includes the models
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # ✅ Add this
# Create the tables
Base.metadata.create_all(bind=engine)

import uvicorn

app = FastAPI()

# ✅ Mount your media directory (adjust 'cloudstack' to your actual folder)
app.mount("/preview", StaticFiles(directory="C:/cloudtstack"), name="preview")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files.router)
app.include_router(auth.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True, workers=6)
