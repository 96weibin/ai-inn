from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes import rooms, room_types, guests, bookings, platforms, ai

app = FastAPI(title="AI-Inn API", version="1.0.0", debug=True)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "exception_type": type(exc).__name__,
            "traceback": traceback.format_exc().split("\n"),
            "path": str(request.url)
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
app.include_router(room_types.router, prefix="/api/room_templates", tags=["room_templates"])
app.include_router(guests.router, prefix="/api/guests", tags=["guests"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(platforms.router, prefix="/api/platforms", tags=["platforms"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI-Inn API"}
