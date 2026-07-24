import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase URL or KEY missing in .env file")


print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_KEY loaded successfully")


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)