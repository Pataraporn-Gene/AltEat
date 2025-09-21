#!/usr/bin/env python3
"""
Recipe Service for Recipe Suggestion System

Service for recipe-related operations, delegating to OpenAI service for recipe suggestions.
"""

from typing import List, Optional

from config import Config
from models import RecipeSuggestion
from services.openai_service import OpenAIService


class RecipeService:
    """Service for recipe-related operations."""
    
    def __init__(self, config: Config):
        self.config = config
        self.openai_service = OpenAIService(config)
    
    def get_suggestions(self, ingredients: List[str],
                       max_results: Optional[int] = None) -> List[RecipeSuggestion]:
        """Get recipe suggestions based on available ingredients."""
        max_results = max_results or self.config.max_recipes
        
        if not self.openai_service.is_available:
            return []
        
        return self.openai_service.get_recipe_suggestions(ingredients, max_results)
    
    def get_similar_recipes(self, original_recipe: str, max_results: int = 4) -> List[RecipeSuggestion]:
        """Get recipes similar to the original recipe."""
        if not self.openai_service.is_available:
            return []
        
        return self.openai_service.get_similar_recipes(original_recipe, max_results)
    
    def get_recipe_with_ingredients(self, recipe_name: str, substitute_ingredients: List[str]) -> Optional[RecipeSuggestion]:
        """Get the original recipe with detailed ingredients, incorporating substitutes."""
        if not self.openai_service.is_available:
            return None
        
        return self.openai_service.get_recipe_with_ingredients(recipe_name, substitute_ingredients)
    
    def get_recipes_with_specific_ingredients(self, required_ingredients: List[str], 
                                            recipe_context: str = "", max_results: int = 5) -> List[RecipeSuggestion]:
        """Get recipe suggestions that MUST include the specified ingredients."""
        if not self.openai_service.is_available:
            return []
        
        return self.openai_service.get_recipes_with_specific_ingredients(required_ingredients, recipe_context, max_results)
