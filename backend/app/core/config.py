import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv('SUPABASE_URL', " ")
    SUPABASE_KEY: str = os.getenv('SUPABASE_KEY', " ")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv('SUPABASE_SERVICE_ROLE_KEY', " ")
    GEMINI_API_KEY: str = os.getenv('GEMINI_API_KEY', "")
    EXA_API_KEY: str = os.getenv('EXA_API_KEY', "")
    GEMINI_MODEL: str = os.getenv('GEMINI_MODEL', "gemini-3.5-flash-lite")

settings = Settings()


