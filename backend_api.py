# backend_api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from config import Config, supabase
from services.ingredient_service import IngredientService
from services.recipe_service import RecipeService
from datetime import datetime


app = FastAPI(title="Recipe Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

config = Config()
ingredient_service = IngredientService(config)
recipe_service = RecipeService(config)

class SubstitutionRequest(BaseModel):
    ingredient: str
    recipe: str

class SuggestionRequest(BaseModel):
    session_id: str
    message_id: str
    user_message: str
    ingredients: list[str]

@app.post("/messages")
async def save_message(data: dict):
    """Save user or bot messages to Supabase."""
    await asyncio.to_thread(
        supabase.table("messages").insert({
            "message_id": data["message_id"],
            "session_id": data["session_id"],
            "sender_type": data["sender_type"],   # 'user' or 'bot'
            "message_text": data["message_text"],
            "created_at": datetime.utcnow().isoformat()
        }).execute
    )
    return {"status": "message stored"}


@app.post("/substitute")
def substitute(req: SubstitutionRequest):
    result = ingredient_service.get_substitutes(req.ingredient, req.recipe)
    return {"substitutes": result.items, "source": result.source}

@app.post("/suggest")
async def suggest(req: SuggestionRequest):
    await save_message({
        "message_id": req.message_id,
        "session_id": req.session_id,
        "sender_type": "user",
        "message_text": req.user_message
    })
    recipes = recipe_service.get_suggestions(req.ingredients)
    return {"recipes": [{"name": r.name, "ingredients": r.ingredients} for r in recipes]}

@app.post("/feedback")
async def submit_feedback(data: dict):
    supabase.table("feedback").insert({
        "message_id": data["message_id"],
        "is_helpful": data["is_helpful"],
        "comment": data.get("comment"),
        "submitted_at": datetime.utcnow().isoformat()
    }).execute()
    return {"status": "feedback stored"}