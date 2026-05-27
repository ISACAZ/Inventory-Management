from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
import uvicorn

from app.database import SessionLocal

app = FastAPI()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup — รันก่อน server พร้อมรับ request
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
    finally:
        db.close()
    
    yield 

        # shutdown — รันตอน server ปิด (ถ้ามีอะไรต้อง cleanup)

@app.get("/health", status_code=200)
def get_health():
    return {"status":"ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)