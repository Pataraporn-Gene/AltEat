#!/usr/bin/env python3
"""
Configuration Management for Recipe Suggestion System

Centralized configuration handling for the ingredient substitution and recipe suggestion system.
"""

import os
from dataclasses import dataclass
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # use service role key for insert ops

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@dataclass
class Config:
    """Centralized configuration for the ingredient system."""
    
    # Model settings
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Generation limits
    max_substitutes: int = 5
    max_recipes: int = 5
    max_ingredients: int = 5
    
    # API settings
    temperature: float = 0.3
    top_p: float = 0.9
    repetition_penalty: float = 1.1
    
    # Paths (relative to project root)
    base_dir: str = os.path.dirname(os.path.abspath(__file__))
    dataset_path: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset", "ingredients.json")
