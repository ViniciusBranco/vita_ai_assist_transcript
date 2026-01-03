from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import router as api_router
from api.webhook import router as webhook_router
from api import integrations
# Import graph to trigger model preloading
# import agent.graph

app = FastAPI(title="Vita.AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # Alternative frontend port
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(api_router, prefix="/api")
app.include_router(webhook_router, prefix="/api")
app.include_router(integrations.router, prefix="/api/v1/integrations", tags=["integrations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Vita.AI Transcript API"}
