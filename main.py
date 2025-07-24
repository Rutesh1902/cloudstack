from fastapi import FastAPI
from api import files,auth
import uvicorn
app = FastAPI()
app.include_router(files.router)
app.include_router(auth.router)
# DATABASE_URL = "postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/cloudstackdb"
# app start from here
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True, workers=6)
