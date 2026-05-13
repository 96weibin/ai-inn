from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import rooms, guests, bookings, platforms, ai

app = FastAPI(title="AI-Inn API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
app.include_router(guests.router, prefix="/api/guests", tags=["guests"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(platforms.router, prefix="/api/platforms", tags=["platforms"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI-Inn API"}
