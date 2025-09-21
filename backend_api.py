# backend_api.py
from fastapi import FastAPI
from pydantic import BaseModel
from config import Config
from services.ingredient_service import IngredientService
from services.recipe_service import RecipeService

app = FastAPI(title="Recipe Chatbot API")

config = Config()
ingredient_service = IngredientService(config)
recipe_service = RecipeService(config)

class SubstitutionRequest(BaseModel):
    ingredient: str
    recipe: str

class SuggestionRequest(BaseModel):
    ingredients: list[str]

@app.post("/substitute")
def substitute(req: SubstitutionRequest):
    result = ingredient_service.get_substitutes(req.ingredient, req.recipe)
    return {"substitutes": result.items, "source": result.source}

@app.post("/suggest")
def suggest(req: SuggestionRequest):
    recipes = recipe_service.get_suggestions(req.ingredients)
    return {"recipes": [{"name": r.name, "ingredients": r.ingredients} for r in recipes]}
