    # Recipe Chatbot Assistant

    A smart culinary assistant that helps you find recipe suggestions and ingredient substitutes using AI. This application combines a FastAPI backend with a React frontend and integrates with n8n workflows for intelligent recipe recommendations.

    ## Features

    - **Recipe Suggestions**: Get personalized recipe recommendations based on available ingredients
    - **Ingredient Substitution**: Find suitable substitutes for ingredients you don't have
    - **Context-Aware Recommendations**: Suggestions based on taste, texture, color, and cooking methods
    - **Conversational Interface**: Chat-based UI for natural interactions
    - **Hybrid Intelligence**: Combines local dataset with OpenAI GPT for comprehensive suggestions

    ## System Architecture

    The application consists of three main components:

    1. **Frontend (React)**: Interactive chat interface (`src/App.js`)
    2. **Backend (FastAPI)**: API server with ingredient and recipe services (`backend_api.py`)
    3. **n8n Workflow**: Orchestrates the chatbot logic and connects frontend to backend

    ## Prerequisites

    Before running the application, ensure you have:

    - **Python 3.8+** installed
    - **Node.js 14+** and npm installed
    - **n8n** installed and running
    - **OpenAI API Key** (for GPT-powered suggestions)

    ## Installation

    ### 1. Backend Setup

    ```bash
    # Navigate to the backend directory
    cd backend

    # Create a virtual environment
    python -m venv venv

    # Activate the virtual environment
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate

    # Install required Python packages
    pip install fastapi uvicorn pydantic openai python-dotenv

    # Create a .env file and add your OpenAI API key
    echo "OPENAI_API_KEY=your_api_key_here" > .env
    ```

    ### 2. Frontend Setup

    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install

    # Install required packages
    npm install lucide-react
    ```

    ### 3. n8n Setup

    ```bash
    # Install n8n globally (if not already installed)
    npm install -g n8n

    # Start n8n
    n8n start
    ```

    Then import the n8n workflow and configure the webhook URL in your workflow.

    ## Configuration

    ### Environment Variables

    Create a `.env` file in the backend directory with:

    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```

    ### n8n Webhook Configuration

    Update the webhook URL in `src/App.js` (line 31) to match your n8n chat trigger endpoint:

    ```javascript
    const res = await fetch("http://localhost:5678/webhook/YOUR_WEBHOOK_ID/chat", {
    ```

    ## Running the Application

    ### Start the Backend Server

    ```bash
    # From the backend directory with virtual environment activated
    uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000
    ```

    The API will be available at: `http://localhost:8000`

    ### Start the Frontend

    ```bash
    # From the frontend directory
    npm start
    ```

    The React app will open at: `http://localhost:3000`

    ### Ensure n8n is Running

    ```bash
    n8n start
    ```

    n8n will be available at: `http://localhost:5678`

    ## Usage

    1. Open the chat interface at `http://localhost:3000`
    2. Type your query in natural language:
    - **For recipes**: "Suggest recipes with chicken and rice"
    - **For substitutes**: "What can I use instead of butter in cookies?"
    - **For context-based suggestions**: "I need something crunchy and green"

    3. The chatbot will process your request and provide relevant suggestions

    ## API Endpoints

    ### POST `/substitute`
    Get ingredient substitutes for a specific recipe.

    **Request Body:**
    ```json
    {
    "ingredient": "butter",
    "recipe": "chocolate chip cookies"
    }
    ```

    **Response:**
    ```json
    {
    "substitutes": ["coconut oil", "margarine", "vegetable oil"],
    "source": "gpt"
    }
    ```

    ### POST `/suggest`
    Get recipe suggestions based on available ingredients.

    **Request Body:**
    ```json
    {
    "ingredients": ["chicken", "rice", "garlic"]
    }
    ```

    **Response:**
    ```json
    {
    "recipes": [
        {
        "name": "Garlic Chicken Rice",
        "ingredients": "chicken, rice, garlic, soy sauce, ginger"
        }
    ]
    }
    ```

    ## Project Structure

    ```
    recipe-chatbot/
    ├── backend/
    │   ├── backend_api.py           # FastAPI application
    │   ├── config.py                # Configuration settings
    │   ├── models.py                # Data models
    │   ├── services/
    │   │   ├── ingredient_service.py    # Ingredient operations
    │   │   ├── recipe_service.py        # Recipe operations
    │   │   ├── openai_service.py        # OpenAI API integration
    │   │   └── dataset_service.py       # Local dataset handling
    │   └── .env                     # Environment variables
    ├── frontend/
    │   └── src/
    │       └── App.js               # React chat interface
    └── README.md                    # This file
    ```

    ## Troubleshooting

    ### Backend Issues

    - **OpenAI API errors**: Verify your API key in the `.env` file
    - **Port already in use**: Change the port using `--port` flag
    - **Import errors**: Ensure all dependencies are installed in the virtual environment

    ### Frontend Issues

    - **Cannot connect to backend**: Verify the backend is running on port 8000
    - **n8n webhook errors**: Check the webhook URL matches your n8n configuration
    - **Session ID issues**: Clear browser cache and reload

    ### n8n Issues

    - **Workflow not triggering**: Ensure the webhook is active and the URL is correct
    - **Connection timeout**: Check if all services are running on the correct ports

    ## Features in Detail

    ### Ingredient Substitution
    The system uses a hybrid approach:
    1. First attempts to get substitutes from OpenAI GPT
    2. Falls back to context-based suggestions using dataset
    3. Returns the most suitable alternatives with source attribution

    ### Recipe Suggestions
    Provides multiple modes:
    - Suggestions based on available ingredients
    - Similar recipes to a given recipe
    - Recipes that must include specific ingredients
    - Context-aware recommendations

    ### Natural Language Processing
    The chatbot understands various phrasings:
    - "What can I use instead of X?"
    - "Give me recipes with Y and Z"
    - "I need something with [texture/taste/color]"

    ## Contributing

    To extend the functionality:

    1. Add new API endpoints in `backend_api.py`
    2. Implement service methods in the appropriate service files
    3. Update the frontend to handle new response types
    4. Modify n8n workflow to route new request types

    ## License

    This project is provided as-is for educational and personal use.

    ---

    **Note**: This application requires active internet connection for OpenAI API calls. Local dataset provides limited fallback functionality when API is unavailable.