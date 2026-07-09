from database import supabase

response = supabase.table("contact_requests").select("*").execute()