from supabase import create_client, Client, ClientOptions
from app.core.config import settings

client_options = ClientOptions(
    persist_session=False,
    auto_refresh_token=False,
)

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY,
    options=client_options,
)

supabase_admin: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_SERVICE_ROLE_KEY if settings.SUPABASE_SERVICE_ROLE_KEY else settings.SUPABASE_KEY,
    options=client_options,
)
